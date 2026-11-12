/**
 * 七字生扶分與半合「逐位置覆寫」的可稽核計算。
 *
 * 證據：定格局講義（七字及三合/半合只取加分）；課堂 1-2-2 [19:26–19:45]
 * 酉丑半合金；課堂 1-3 [36:55–37:54] 卯未木半合使未支 0→20；
 * 官網 2026-11-12 截圖 甲子/丁丑/癸酉/癸丑：45→90。
 *
 * 限制：此模組只處理相鄰、以三合局中央支為核心的半合加分。
 * 暗拱、三會、刑沖拆合、合絆及特殊從格資格仍待額外來源驗證；
 * 不可把單一案例視為網站全套演算法已被重現。
 */
import type { BaziChart } from './paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT, ELEMENT_GENERATES } from './constants';

export type ChartPosition = 'year' | 'month' | 'day' | 'hour';
export type ElementSlot = 'stem' | 'branch';

export const HANDOUT_SEVEN_WEIGHTS = {
  year: { stem: 5, branch: 20 },
  month: { stem: 5, branch: 35 },
  day: { stem: 0, branch: 20 },
  hour: { stem: 5, branch: 10 },
} as const;

export interface ScorePosition {
  position: ChartPosition;
  slot: ElementSlot;
  symbol: string;
  weight: number;
  beforeElement: string;
  afterElement: string;
  beforePoints: number;
  afterPoints: number;
}

export interface HalfCombinationPair {
  positions: [ChartPosition, ChartPosition];
  symbols: [string, string];
  resultElement: string;
  rule: '半合';
}

export interface HandoutStrengthTrace {
  status: 'READY' | 'REVIEW_REQUIRED' | 'INCOMPLETE';
  baseline: number;
  score: number | null;
  delta: number | null;
  positions: ScorePosition[];
  pairs: HalfCombinationPair[];
  changes: ScorePosition[];
  notes: string[];
}

const ORDER: ChartPosition[] = ['year', 'month', 'day', 'hour'];
const TRIADS = [
  { branches: ['申', '子', '辰'], element: '水' },
  { branches: ['寅', '午', '戌'], element: '火' },
  { branches: ['亥', '卯', '未'], element: '木' },
  { branches: ['巳', '酉', '丑'], element: '金' },
] as const;

function supports(dayElement: string, otherElement: string, source: string): boolean {
  // 講義金日主遇濕土可視為印；天干「己」的濕土判別維持原專案口徑。
  if (dayElement === '金' && otherElement === '土') {
    return source === '丑' || source === '辰' || source === '己';
  }
  return otherElement === dayElement || ELEMENT_GENERATES[otherElement] === dayElement;
}

/**
 * 只計一次每個「位置」，避免重複地支共用單一中心時被漏算／重複加分。
 * 本函式是教學證據範圍內的部分演算，並非網站後端完整判斷器。
 */
export function calculateHandoutStrength(chart: BaziChart): HandoutStrengthTrace {
  const dayElement = GAN_TO_ELEMENT[chart.dayMaster];
  const positions: ScorePosition[] = [];
  const notes: string[] = [];
  if (!dayElement || !chart.hour.gan || !chart.hour.zhi) {
    return { status: 'INCOMPLETE', baseline: 0, score: null, delta: null,
      positions, pairs: [], changes: [], notes: ['缺日主或時柱，不能視為完整100分七字盤'] };
  }

  for (const position of ORDER) {
    const pillar = chart[position];
    for (const slot of ['stem', 'branch'] as const) {
      const symbol = slot === 'stem' ? pillar.gan : pillar.zhi;
      const element = slot === 'stem' ? GAN_TO_ELEMENT[symbol] : ZHI_TO_ELEMENT[symbol];
      const weight = HANDOUT_SEVEN_WEIGHTS[position][slot];
      if (!element) {
        return { status: 'INCOMPLETE', baseline: 0, score: null, delta: null,
          positions, pairs: [], changes: [], notes: ['無法辨識的天干地支：' + symbol] };
      }
      const points = supports(dayElement, element, symbol) ? weight : 0;
      positions.push({ position, slot, symbol, weight, beforeElement: element,
        afterElement: element, beforePoints: points, afterPoints: points });
    }
  }
  const baseline = positions.reduce((sum, p) => sum + p.beforePoints, 0);
  const zhis = ORDER.map(position => chart[position].zhi);
  const pairs: HalfCombinationPair[] = [];
  const effects = new Map<number, string>();
  let conflict = false;

  for (const triad of TRIADS) {
    // 半合只檢查三合局中間支與兩側之一（如酉丑、卯未）。
    // 「巳丑」等兩側暗拱不在這個已驗證的覆寫集合。
    for (let i = 0; i < 3; i++) {
      for (const j of [0, 2]) {
        const a = triad.branches[1];
        const b = triad.branches[j];
        if (zhis[i] !== a || zhis[i + 1] !== b) {
          if (zhis[i] !== b || zhis[i + 1] !== a) continue;
        }
        const candidate: HalfCombinationPair = {
          positions: [ORDER[i], ORDER[i + 1]],
          symbols: [zhis[i], zhis[i + 1]],
          resultElement: triad.element,
          rule: '半合',
        };
        pairs.push(candidate);
        for (const idx of [i, i + 1]) {
          const old = effects.get(idx);
          if (old && old !== triad.element) conflict = true;
          effects.set(idx, triad.element);
        }
      }
    }
  }

  if (conflict) {
    notes.push('同一柱被不同半合結果指向不同五行，須人工查核優先序');
    return { status: 'REVIEW_REQUIRED', baseline, score: null, delta: null,
      positions, pairs, changes: [], notes };
  }

  // 只有半合對本日主的印比加分才覆寫（不將扣分半合倒扣）。
  for (const [idx, element] of effects) {
    if (!supports(dayElement, element, '')) continue;
    const p = positions.find(item => item.position === ORDER[idx] && item.slot === 'branch');
    if (!p) continue;
    p.afterElement = element;
    p.afterPoints = p.weight;
  }
  const changes = positions.filter(p => p.afterPoints !== p.beforePoints);
  const score = positions.reduce((sum, p) => sum + p.afterPoints, 0);
  notes.push('半合只按證據範圍內的相鄰配對覆寫有效五行，每個柱位最多取分一次');
  notes.push('本結果未包含其他規則交互；正式從格及流年體感定盤須另核對');

  // 唯一有完整網站步驟截圖的四柱個案。不得以相同的半合字面配對
  // 就推論不同四柱必然得到相同的覆寫分數（參見 skill 的 site-case.json）。
  const observedSiteCase = chart.dayMaster === '癸'
    && chart.year.gan === '甲' && chart.year.zhi === '子'
    && chart.month.gan === '丁' && chart.month.zhi === '丑'
    && chart.day.gan === '癸' && chart.day.zhi === '酉'
    && chart.hour.gan === '癸' && chart.hour.zhi === '丑';
  if (pairs.length > 0 && !observedSiteCase) {
    notes.push('本盤半合覆寫未經跨盤驗證；位置變化僅是待核查候選，不得作為已確定的格局、喜忌或最終分數');
    return { status: 'REVIEW_REQUIRED', baseline, score: null, delta: null,
      positions, pairs, changes, notes };
  }

  return { status: 'READY', baseline, score, delta: score - baseline,
    positions, pairs, changes, notes };
}
