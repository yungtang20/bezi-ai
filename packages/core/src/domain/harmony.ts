import {
  ELEMENT_CONTROLS,
  GAN_TO_ELEMENT,
  ZHI_TO_ELEMENT,
} from '../constants';
import { getHiddenStemNames } from './baziRules';

export type FiveElement = '木' | '火' | '土' | '金' | '水';
export type HarmonyKind = 'stem' | 'branch';
export type HarmonyStatus = 'transformed' | 'bound';

export interface HarmonyInteraction {
  kind: HarmonyKind;
  status: HarmonyStatus;
  pillars: readonly [number, number];
  pair: readonly [string, string];
  resultElements: readonly FiveElement[];
  reasons: readonly string[];
  description: string;
}

export interface HarmonyChart {
  /** Chart order: year, month, day, hour. */
  gans: readonly string[];
  /** Chart order: year, month, day, hour. */
  zhis: readonly string[];
}

export interface HarmonyEvaluation {
  interactions: readonly HarmonyInteraction[];
  stemTransformations: ReadonlyMap<number, readonly FiveElement[]>;
  branchTransformations: ReadonlyMap<number, readonly FiveElement[]>;
}

interface StemHarmonyRule {
  pair: readonly [string, string];
  result: FiveElement;
  seasonBranches: readonly string[];
  alternativeBranchPair?: readonly [string, string];
  supportBranches: readonly string[];
  interferingGans?: readonly string[];
}

interface BranchHarmonyRule {
  pair: readonly [string, string];
  resultElements: readonly FiveElement[];
}

const ADJACENT_PILLAR_PAIRS = [
  [0, 1],
  [1, 2],
  [2, 3],
] as const;

/** Source: SRC-HARMONY-1, table columns for the five stem harmonies. */
const STEM_HARMONY_RULES: readonly StemHarmonyRule[] = [
  {
    pair: ['甲', '己'],
    result: '土',
    seasonBranches: ['辰', '戌', '丑', '未'],
    supportBranches: ['辰', '戌', '丑', '未', '巳', '午'],
    interferingGans: ['乙'],
  },
  {
    pair: ['乙', '庚'],
    result: '金',
    seasonBranches: ['申', '酉'],
    alternativeBranchPair: ['巳', '丑'],
    supportBranches: ['申', '酉', '辰', '戌', '丑', '未'],
  },
  {
    pair: ['丙', '辛'],
    result: '水',
    seasonBranches: ['亥', '子'],
    alternativeBranchPair: ['申', '辰'],
    supportBranches: ['亥', '子', '申', '酉'],
  },
  {
    pair: ['丁', '壬'],
    result: '木',
    seasonBranches: ['寅', '卯'],
    alternativeBranchPair: ['亥', '未'],
    supportBranches: ['寅', '卯', '亥', '子', '申'],
  },
  {
    pair: ['戊', '癸'],
    result: '火',
    seasonBranches: ['巳', '午'],
    alternativeBranchPair: ['寅', '戌'],
    supportBranches: ['巳', '午', '寅', '卯'],
  },
];

/** Source: SRC-HARMONY-1, "地支六合". */
const BRANCH_HARMONY_RULES: readonly BranchHarmonyRule[] = [
  { pair: ['子', '丑'], resultElements: ['土'] },
  { pair: ['寅', '亥'], resultElements: ['木'] },
  { pair: ['卯', '戌'], resultElements: ['火'] },
  { pair: ['辰', '酉'], resultElements: ['金'] },
  { pair: ['巳', '申'], resultElements: ['水'] },
  // The lecture explicitly labels 午未 as both fire and earth. Preserve both
  // instead of silently collapsing the result to a single element.
  { pair: ['午', '未'], resultElements: ['火', '土'] },
];

export function getPillarPairKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function isPair(
  expected: readonly [string, string],
  a: string,
  b: string,
): boolean {
  return (
    (expected[0] === a && expected[1] === b)
    || (expected[0] === b && expected[1] === a)
  );
}

function asElement(value: string | undefined): FiveElement | null {
  return value === '木' || value === '火' || value === '土' || value === '金' || value === '水'
    ? value
    : null;
}

function branchContainsElement(zhi: string, element: FiveElement): boolean {
  if (ZHI_TO_ELEMENT[zhi] === element) return true;
  return getHiddenStemNames(zhi).some((gan) => GAN_TO_ELEMENT[gan] === element);
}

function stemHasRoot(gan: string, zhis: readonly string[]): boolean {
  const element = asElement(GAN_TO_ELEMENT[gan]);
  return element !== null && zhis.some((zhi) => branchContainsElement(zhi, element));
}

function controllingElements(results: readonly FiveElement[]): FiveElement[] {
  const controllers = results
    .map((result) => Object.entries(ELEMENT_CONTROLS)
      .find(([, controlled]) => controlled === result)?.[0])
    .map(asElement)
    .filter((element): element is FiveElement => element !== null);
  return [...new Set(controllers)];
}

function resultLabel(results: readonly FiveElement[]): string {
  return results.join('/');
}

function evaluateBranchHarmony(
  chart: HarmonyChart,
  pillars: readonly [number, number],
  rule: BranchHarmonyRule,
): HarmonyInteraction {
  const [i, j] = pillars;
  const pair = [chart.zhis[i], chart.zhis[j]] as const;
  const localGanElements = [chart.gans[i], chart.gans[j]]
    .map((gan) => asElement(GAN_TO_ELEMENT[gan]));
  const failures: string[] = [];

  if (!rule.resultElements.every((element) =>
    chart.zhis.some((zhi) => branchContainsElement(zhi, element)))) {
    failures.push('合化五行在地支無根');
  }

  if (!localGanElements.every((element) =>
    element !== null && rule.resultElements.includes(element))) {
    failures.push('配對兩柱未同時透出化神');
  }

  const controllers = controllingElements(rule.resultElements);
  const hasController = chart.gans.some((gan, index) => {
    if (index === i || index === j) return false;
    const element = asElement(GAN_TO_ELEMENT[gan]);
    return element !== null && controllers.includes(element);
  });
  if (hasController) failures.push('化神被其他天干剋制');

  const status: HarmonyStatus = failures.length === 0 ? 'transformed' : 'bound';
  const label = resultLabel(rule.resultElements);
  return {
    kind: 'branch',
    status,
    pillars,
    pair,
    resultElements: rule.resultElements,
    reasons: failures,
    description: status === 'transformed'
      ? `${pair[0]}${pair[1]}合化${label}`
      : `${pair[0]}${pair[1]}合絆（${failures.join('、')}）`,
  };
}

function evaluateStemHarmony(
  chart: HarmonyChart,
  pillars: readonly [number, number],
  rule: StemHarmonyRule,
): HarmonyInteraction {
  const [i, j] = pillars;
  const pair = [chart.gans[i], chart.gans[j]] as const;
  const failures: string[] = [];
  const monthBranch = chart.zhis[1];

  const hasSeason = rule.seasonBranches.includes(monthBranch);
  const hasAlternativeCombination = rule.alternativeBranchPair?.every((zhi) =>
    chart.zhis.includes(zhi)) ?? false;
  if (!hasSeason && !hasAlternativeCombination) {
    failures.push('月令不符');
  }
  if (!chart.zhis.some((zhi) => rule.supportBranches.includes(zhi))) {
    failures.push('化神缺少地支根氣或生扶');
  }
  if (!stemHasRoot(pair[0], chart.zhis) || !stemHasRoot(pair[1], chart.zhis)) {
    failures.push('參與天干自身無根');
  }

  const controller = controllingElements([rule.result]);
  const hasNearbyController = chart.gans.some((gan, index) => {
    if (index === i || index === j) return false;
    const distance = Math.min(Math.abs(index - i), Math.abs(index - j));
    const element = asElement(GAN_TO_ELEMENT[gan]);
    return distance === 1 && element !== null && controller.includes(element);
  });
  if (hasNearbyController) failures.push('化神被鄰近天干剋制');

  const hasDuplicateParticipant = rule.pair.some((gan) =>
    chart.gans.filter((candidate) => candidate === gan).length !== 1);
  const hasNamedInterference = (rule.interferingGans ?? [])
    .some((gan) => chart.gans.includes(gan));
  if (hasDuplicateParticipant || hasNamedInterference) {
    failures.push('出現爭合、妒合或干擾');
  }

  const status: HarmonyStatus = failures.length === 0 ? 'transformed' : 'bound';
  return {
    kind: 'stem',
    status,
    pillars,
    pair,
    resultElements: [rule.result],
    reasons: failures,
    description: status === 'transformed'
      ? `${pair[0]}${pair[1]}合化${rule.result}`
      : `${pair[0]}${pair[1]}合絆（${failures.join('、')}）`,
  };
}

/**
 * Evaluate source-backed stem and branch harmonies through one interface.
 * Branch pairs already consumed by a higher-priority punishment or clash can
 * be supplied through blockedBranchPairs.
 */
export function evaluateHarmonies(
  chart: HarmonyChart,
  blockedBranchPairs: ReadonlySet<string> = new Set(),
): HarmonyEvaluation {
  const interactions: HarmonyInteraction[] = [];
  const stemTransformations = new Map<number, readonly FiveElement[]>();
  const branchTransformations = new Map<number, readonly FiveElement[]>();

  for (const pillars of ADJACENT_PILLAR_PAIRS) {
    const [i, j] = pillars;
    const zhiA = chart.zhis[i];
    const zhiB = chart.zhis[j];
    if (!zhiA || !zhiB || blockedBranchPairs.has(getPillarPairKey(i, j))) continue;

    const rule = BRANCH_HARMONY_RULES.find((candidate) =>
      isPair(candidate.pair, zhiA, zhiB));
    if (!rule) continue;

    const interaction = evaluateBranchHarmony(chart, pillars, rule);
    interactions.push(interaction);
    if (interaction.status === 'transformed') {
      branchTransformations.set(i, interaction.resultElements);
      branchTransformations.set(j, interaction.resultElements);
    }
  }

  for (const pillars of ADJACENT_PILLAR_PAIRS) {
    const [i, j] = pillars;
    const ganA = chart.gans[i];
    const ganB = chart.gans[j];
    if (!ganA || !ganB) continue;

    const rule = STEM_HARMONY_RULES.find((candidate) =>
      isPair(candidate.pair, ganA, ganB));
    if (!rule) continue;

    const interaction = evaluateStemHarmony(chart, pillars, rule);
    interactions.push(interaction);
    if (interaction.status === 'transformed') {
      stemTransformations.set(i, interaction.resultElements);
      stemTransformations.set(j, interaction.resultElements);
    }
  }

  return {
    interactions,
    stemTransformations,
    branchTransformations,
  };
}
