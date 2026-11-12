/**
 * Evidence-gated candidate scan for 本命四柱.
 *
 * Source: user-provided 天干地支含刑沖破害.docx, 天干地支合化條件.docx,
 * 定格局.docx (P2 notes; teacher audio NOT independently verified).
 * This module deliberately never awards points, ranks competing rules or
 * turns a pairing into 合化/合絆/health/event predictions.
 */
import type { BaziChart } from './paipan';
import { GAN_TO_ELEMENT } from './constants';

export type NatalPosition = 'year' | 'month' | 'day' | 'hour';
export type PairKind = '刑' | '沖' | '破' | '害' | '六合' | '自刑';
export type FormationKind = '半合' | '暗拱' | '三合' | '三會';
export interface PairCandidate {
  kind: PairKind;
  positions: [NatalPosition, NatalPosition];
  branches: [string, string];
  adjacent: boolean;
  evidence: 'P2_CANDIDATE_ONLY';
}
export interface FormationCandidate {
  kind: FormationKind;
  positions: NatalPosition[];
  branches: string[];
  element: string;
  evidence: 'P2_CANDIDATE_ONLY';
}
export interface LiuheGate {
  positions: [NatalPosition, NatalPosition];
  branches: [string, string];
  element: string | null;
  checks: {
    adjacent: boolean;
    elementExposed: boolean | null;
    elementStrong: null;
    unrestrained: null;
  };
  status: 'BLOCKED' | 'UNRESOLVED';
  reason: string;
}
export interface TombCandidate {
  position: NatalPosition;
  branch: string;
  exposedElements: string[];
  status: 'REVIEW_REQUIRED';
}
export interface InteractionTrace {
  status: 'INCOMPLETE' | 'REVIEW_REQUIRED';
  finalPattern: null;
  adjustment: 'NEVER_AUTOMATIC';
  sourceGrade: 'P2_NOTES_AUDIO_UNVERIFIED';
  pairs: PairCandidate[];
  formations: FormationCandidate[];
  gates: LiuheGate[];
  tombs: TombCandidate[];
  conflicts: Array<{ positions: [NatalPosition, NatalPosition]; kinds: PairKind[] }>;
  notes: string[];
}

const ORDER: NatalPosition[] = ['year', 'month', 'day', 'hour'];
const KEYS = {
  六合: ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'],
  沖: ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'],
  害: ['子未', '午丑', '寅巳', '卯辰', '申亥', '酉戌'],
  破: ['子酉', '丑辰', '寅亥', '卯午', '巳申', '未戌'],
  刑: ['子卯', '寅巳', '巳申', '寅申', '丑未', '未戌', '戌丑'],
} as const;
const validBranches = new Set('子丑寅卯辰巳午未申酉戌亥'.split(''));
const SELF_PUNISHMENT = new Set(['辰', '午', '酉', '亥']);
const pairKey = (a: string, b: string) => [a, b].sort().join('');
const pairLists: Array<{ kind: PairKind; keys: Set<string> }> = Object.entries(KEYS)
  .map(([kind, values]) => ({ kind: kind as PairKind, keys: new Set(values.map(v => pairKey(v[0], v[1]))) }));
const LIUHE_ELEMENTS: Array<{ branches: string; element: string | null }> = [
  { branches: '子丑', element: '土' }, { branches: '寅亥', element: '木' },
  { branches: '卯戌', element: '火' }, { branches: '辰酉', element: '金' },
  { branches: '巳申', element: '水' },
  // 午未化神在整理資料中有「燥火／土」混稱：不能逕定其中之一。
  { branches: '午未', element: null },
];
const TRIADS: Array<{ branches: string[]; element: string }> = [
  { branches: ['申', '子', '辰'], element: '水' },
  { branches: ['寅', '午', '戌'], element: '火' },
  { branches: ['亥', '卯', '未'], element: '木' },
  { branches: ['巳', '酉', '丑'], element: '金' },
];
const MEETINGS: Array<{ branches: string[]; element: string }> = [
  { branches: ['寅', '卯', '辰'], element: '木' },
  { branches: ['巳', '午', '未'], element: '火' },
  { branches: ['申', '酉', '戌'], element: '金' },
  { branches: ['亥', '子', '丑'], element: '水' },
];
// These are merely exposure clues; they do not certify actual 庫啟動。
const TOMB_STEMS: Record<string, Array<{ element: string; stems: string[] }>> = {
  辰: [{ element: '水', stems: ['壬', '癸'] }, { element: '木', stems: ['甲', '乙'] }],
  未: [{ element: '火', stems: ['丙', '丁'] }, { element: '木', stems: ['甲', '乙'] }],
  戌: [{ element: '火', stems: ['丙', '丁'] }, { element: '土', stems: ['戊', '己'] }],
  丑: [{ element: '金', stems: ['庚', '辛'] }],
};

function scanFormation(
  group: { branches: string[]; element: string },
  branches: string[],
  allPositions: NatalPosition[],
  meeting: boolean
): FormationCandidate[] {
  const presence = group.branches.map(b => branches.includes(b));
  const count = presence.filter(Boolean).length;
  if (count < 2) return [];
  const matching = allPositions.filter((_, i) => group.branches.includes(branches[i]));
  if (count === 3) {
    return [{ kind: meeting ? '三會' : '三合', positions: matching,
      branches: [...group.branches], element: group.element, evidence: 'P2_CANDIDATE_ONLY' }];
  }
  if (meeting) return []; // 半會的轉分資料不足，不推導。
  const center = group.branches[1];
  const kind: FormationKind = presence[1] ? '半合' : '暗拱';
  // Each non-centre branch may pair with the centre; preserve double 半合 separately.
  const result: FormationCandidate[] = [];
  for (let i = 0; i < allPositions.length; i++) {
    for (let j = i + 1; j < allPositions.length; j++) {
      if (j !== i + 1) continue; // 現有覆寫證據只限本命相鄰半合
      const a = branches[i], b = branches[j];
      if (!group.branches.includes(a) || !group.branches.includes(b) || a === b) continue;
      if (kind === '半合' && a !== center && b !== center) continue;
      if (kind === '暗拱' && (a === center || b === center)) continue;
      result.push({ kind, positions: [allPositions[i], allPositions[j]],
        branches: [a, b], element: group.element, evidence: 'P2_CANDIDATE_ONLY' });
    }
  }
  return result;
}

/** Candidate-only; any subsequent score transition requires separate case-level evidence. */
export function inspectBaziInteractions(chart: BaziChart): InteractionTrace {
  const branches = ORDER.map(p => chart[p]?.zhi || '');
  const stems = ORDER.map(p => chart[p]?.gan || '');
  const complete = branches.every(b => validBranches.has(b))
    && stems.every(g => Boolean(GAN_TO_ELEMENT[g]));
  const pairs: PairCandidate[] = [];
  const formations: FormationCandidate[] = [];
  const gates: LiuheGate[] = [];
  const tombs: TombCandidate[] = [];
  const notes: string[] = [
    '僅檢出關係候選；刑沖破害不計固定扣分，合化／合絆不直接成立。',
    '刑沖拆合、三會、三合、暗拱、庫、貪生忘剋優先序無完整跨案例獨立驗證。',
    '與大運流年的跨時間層互動必須另外依時間與位置驗證；不可當本命同層配對。',
  ];
  if (!complete) {
    return { status: 'INCOMPLETE', finalPattern: null,
      adjustment: 'NEVER_AUTOMATIC', sourceGrade: 'P2_NOTES_AUDIO_UNVERIFIED',
      pairs, formations, gates, tombs, conflicts: [], notes: [...notes, '四柱不完整，不得自動補值'] };
  }
  for (let i = 0; i < ORDER.length; i++) {
    for (let j = i + 1; j < ORDER.length; j++) {
      const a = branches[i], b = branches[j], key = pairKey(a, b);
      for (const def of pairLists) {
        if (def.keys.has(key)) {
          pairs.push({ kind: def.kind, positions: [ORDER[i], ORDER[j]],
            branches: [a, b], adjacent: j === i + 1,
            evidence: 'P2_CANDIDATE_ONLY' });
        }
      }
      if (a === b && SELF_PUNISHMENT.has(a)) {
        pairs.push({ kind: '自刑', positions: [ORDER[i], ORDER[j]],
          branches: [a, b], adjacent: j === i + 1,
          evidence: 'P2_CANDIDATE_ONLY' });
      }
    }
  }
  for (const group of TRIADS) formations.push(...scanFormation(group, branches, ORDER, false));
  for (const group of MEETINGS) formations.push(...scanFormation(group, branches, ORDER, true));

  for (const relation of pairs.filter(p => p.kind === '六合')) {
    const [p1, p2] = relation.positions;
    const i = ORDER.indexOf(p1), j = ORDER.indexOf(p2);
    const element = LIUHE_ELEMENTS.find(x => pairKey(x.branches[0], x.branches[1])
      === pairKey(...relation.branches))?.element ?? null;
    const exposed = element === null ? null :
      [stems[i], stems[j]].some(g => GAN_TO_ELEMENT[g] === element);
    const blocked = !relation.adjacent || exposed === false;
    gates.push({
      positions: relation.positions, branches: relation.branches, element,
      checks: {
        adjacent: relation.adjacent, elementExposed: exposed,
        elementStrong: null, unrestrained: null,
      },
      status: blocked ? 'BLOCKED' : 'UNRESOLVED',
      reason: blocked
        ? '不符相鄰或化神透干必要條件；不能宣告成功合化，亦不代表合絆已成立'
        : '尚未證實化神旺與不受剋；不能宣告合化或合絆',
    });
  }
  for (let i = 0; i < ORDER.length; i++) {
    const zhi = branches[i], options = TOMB_STEMS[zhi];
    if (!options) continue;
    tombs.push({ position: ORDER[i], branch: zhi,
      exposedElements: options.filter(x => x.stems.some(s => stems.includes(s))).map(x => x.element),
      status: 'REVIEW_REQUIRED' });
  }
  const conflicts: InteractionTrace['conflicts'] = [];
  for (let i = 0; i < ORDER.length; i++) {
    for (let j = i + 1; j < ORDER.length; j++) {
      const found = pairs.filter(r => r.positions[0] === ORDER[i] && r.positions[1] === ORDER[j]);
      if (found.length > 1) conflicts.push({
        positions: [ORDER[i], ORDER[j]], kinds: found.map(r => r.kind),
      });
    }
  }
  return { status: 'REVIEW_REQUIRED', finalPattern: null, adjustment: 'NEVER_AUTOMATIC',
    sourceGrade: 'P2_NOTES_AUDIO_UNVERIFIED',
    pairs, formations, gates, tombs, conflicts, notes };
}
