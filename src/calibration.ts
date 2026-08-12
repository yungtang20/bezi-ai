// src/calibration.ts
import { PatternScores, getPrimaryPattern } from './pattern';
import { DailyLog } from './storage';

const ADJUST = {
  PRIMARY_MATCH: 2,
  PRIMARY_MISMATCH: -3,
  FOLLOW_MATCH: 4,
  FOLLOW_MISMATCH: -5,
  NEUTRAL: 0,
};

/**
 * 根据一天的打卡记录，调整格局分数
 * 
 * 核心逻辑：
 * - 财星日 → 只看 wealth 回馈
 * - 官杀日 → 只看 career 回馈
 * - 食伤日 → 关联 romance / health
 * - 比劫日 → 关联 wealth（比劫克财）/ romance（竞争）
 * - 印星日 → 关联 career（印星为贵人、学习）
 */
export function adjustScores(scores: PatternScores, log: DailyLog, dayTenGodType?: string): PatternScores {
  const newScores = { ...scores };
  const primary = getPrimaryPattern(scores);

  const dayType = dayTenGodType || log.dayTenGodType || '';

  // Maps each day type to the relevant feedback fields: [goodField, badField]
  const dayTypeFields: Record<string, ('wealth' | 'career' | 'romance' | 'health')[]> = {
    '財星': ['wealth', 'wealth'],
    '官殺': ['career', 'career'],
    '食傷': ['romance', 'romance'],
    '比劫': ['wealth', 'wealth'],
    '印星': ['career', 'career'],
  };

  // Secondary fields for types that span multiple categories
  const secondaryGood: Record<string, ('wealth' | 'career' | 'romance' | 'health')[]> = {
    '食傷': ['health'],
    '比劫': ['romance'],
  };
  const secondaryBad: Record<string, ('wealth' | 'career' | 'romance' | 'health')[]> = {
    '食傷': ['health'],
    '比劫': ['romance'],
  };

  let totalAdjust = 0;
  const fields = dayTypeFields[dayType];
  if (fields) {
    const [goodField, badField] = fields;
    if (log[goodField] === 'good') totalAdjust += ADJUST.PRIMARY_MATCH;
    if (log[badField] === 'bad') totalAdjust += ADJUST.PRIMARY_MISMATCH;
    for (const f of secondaryGood[dayType] || []) {
      if (log[f] === 'good') totalAdjust += ADJUST.PRIMARY_MATCH;
    }
    for (const f of secondaryBad[dayType] || []) {
      if (log[f] === 'bad') totalAdjust += ADJUST.PRIMARY_MISMATCH;
    }
  }

  const isPrimaryFrom = primary === '從強' || primary === '從弱';
  if (isPrimaryFrom) {
    totalAdjust = totalAdjust > 0 ? ADJUST.FOLLOW_MATCH : totalAdjust < 0 ? ADJUST.FOLLOW_MISMATCH : 0;
  }

  if (totalAdjust !== 0) {
    adjustByPattern(newScores, primary, totalAdjust);
  }

  const keys: (keyof PatternScores)[] = ['strong', 'weak', 'followStrong', 'followWeak'];
  for (const key of keys) {
    newScores[key] = Math.max(0, Math.min(100, newScores[key]));
  }

  return newScores;
}

function adjustByPattern(scores: PatternScores, pattern: string, amount: number): void {
  const map: Record<string, { inc: keyof PatternScores, dec: keyof PatternScores }> = {
    '身強': { inc: 'strong', dec: 'weak' },
    '身弱': { inc: 'weak', dec: 'strong' },
    '從強': { inc: 'followStrong', dec: 'followWeak' },
    '從弱': { inc: 'followWeak', dec: 'followStrong' }
  };
  const target = map[pattern];
  if (!target) return;
  scores[target.inc] += amount;
  scores[target.dec] -= amount;
}

export function checkAutoSwitch(scores: PatternScores): string | null {
  const primary = getPrimaryPattern(scores);
  const patterns = ['身強', '身弱', '從強', '從弱'];
  const currentScore = getScoreByPattern(scores, primary);
  
  const best = patterns
    .filter(p => p !== primary)
    .map(p => ({ pattern: p, score: getScoreByPattern(scores, p) }))
    .reduce((max, cur) => cur.score > max.score ? cur : max, { pattern: '', score: -1 });

  return best.score > currentScore + 5 ? best.pattern : null;
}

function getScoreByPattern(scores: PatternScores, pattern: string): number {
  const map: Record<string, keyof PatternScores> = {
    '身強': 'strong',
    '身弱': 'weak',
    '從強': 'followStrong',
    '從弱': 'followWeak'
  };
  const key = map[pattern];
  return key ? scores[key] : 0;
}

export function calculateAccuracy(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;
  
  const stats = logs.reduce((acc, log) => {
    const dayType = log.dayTenGodType || '';
    const isGoodTheory = log.theoreticalOutcome === '順利' || ['吉', '好'].some(k => log.theoreticalOutcome.includes(k));
    const isBadTheory = log.theoreticalOutcome === '不順' || ['凶', '壞'].some(k => log.theoreticalOutcome.includes(k));
    
    const evaluate = (actual: 'good' | 'bad' | null | undefined) => {
       if (!actual) return;
       acc.total++;
       if ((actual === 'good' && isGoodTheory) || (actual === 'bad' && isBadTheory)) {
         acc.match++;
       }
    };

    const map: Record<string, () => void> = {
      '財星': () => evaluate(log.wealth),
      '官殺': () => evaluate(log.career),
      '食傷': () => { evaluate(log.romance); evaluate(log.health); },
      '比劫': () => { evaluate(log.wealth); evaluate(log.romance); evaluate(log.friends); evaluate(log.family); },
      '印星': () => evaluate(log.career),
    };

    map[dayType]?.();
    return acc;
  }, { total: 0, match: 0 });

  return stats.total > 0 ? Math.round((stats.match / stats.total) * 100) : 0;
}
