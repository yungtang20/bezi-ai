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

  const healthGood = log.health === 'good';
  const healthBad = log.health === 'bad';
  const careerGood = log.career === 'good';
  const careerBad = log.career === 'bad';
  const romanceGood = log.romance === 'good';
  const romanceBad = log.romance === 'bad';
  const wealthGood = log.wealth === 'good';
  const wealthBad = log.wealth === 'bad';

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

// [AI MOD] 十神日型 → 可評估領域（單一真實來源，供整體與分領域準確率共用）
export const DAY_TYPE_FIELDS: Record<string, CategoryKey[]> = {
  '財星': ['wealth'],
  '官殺': ['career'],
  '食傷': ['romance', 'health'],
  '比劫': ['wealth', 'romance', 'friends', 'family'],
  '印星': ['career'],
};

export type CategoryKey = 'health' | 'career' | 'romance' | 'wealth' | 'family' | 'friends';

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  health: '健康',
  career: '事業',
  romance: '感情',
  wealth: '財運',
  family: '家庭',
  friends: '人際',
};

export const CATEGORY_ORDER: CategoryKey[] = ['wealth', 'career', 'romance', 'health', 'family', 'friends'];

/** 理論好壞判定（單一真實來源） */
export function isGoodOutcome(outcome: string): boolean {
  return outcome === '順利' || outcome.includes('吉') || outcome.includes('好');
}

export function isBadOutcome(outcome: string): boolean {
  return outcome === '不順'
    || outcome === '較差'
    || outcome === '不佳'
    || outcome.includes('凶')
    || outcome.includes('壞');
}

export interface CategoryAccuracy {
  key: CategoryKey;
  label: string;
  match: number;
  total: number;
  accuracy: number; // 0-100
}

/** 分領域準確率：依十神日型評估對應領域的實際回饋 */
export function calculateCategoryAccuracy(logs: DailyLog[]): CategoryAccuracy[] {
  const acc: Record<string, { match: number; total: number }> = {};

  for (const log of logs) {
    const fields = DAY_TYPE_FIELDS[log.dayTenGodType || ''];
    if (!fields) continue;
    const good = isGoodOutcome(log.theoreticalOutcome || '');
    const bad = isBadOutcome(log.theoreticalOutcome || '');
    // 實際回饋只有「順利／不順」兩值，理論為平穩時沒有可比較的同義選項。
    if (!good && !bad) continue;
    for (const field of fields) {
      const actual = log[field];
      if (!actual) continue;
      if (!acc[field]) acc[field] = { match: 0, total: 0 };
      acc[field].total += 1;
      if ((actual === 'good' && good) || (actual === 'bad' && bad)) acc[field].match += 1;
    }
  }

  return CATEGORY_ORDER.map(key => {
    const stat = acc[key] || { match: 0, total: 0 };
    return {
      key,
      label: CATEGORY_LABELS[key],
      match: stat.match,
      total: stat.total,
      accuracy: stat.total > 0 ? Math.round((stat.match / stat.total) * 100) : 0,
    };
  });
}

export function calculateAccuracy(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;

  const categories = calculateCategoryAccuracy(logs);
  const total = categories.reduce((sum, item) => sum + item.total, 0);
  const match = categories.reduce((sum, item) => sum + item.match, 0);

  return total > 0 ? Math.round((match / total) * 100) : 0;
}
