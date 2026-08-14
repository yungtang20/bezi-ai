import {
  ELEMENT_GENERATES,
  GAN_TO_ELEMENT,
  ZHI_TO_ELEMENT,
} from '../constants';
import { PATTERN_WEIGHTS } from './baziRules';
import type { FiveElement } from './harmony';

export interface PatternScoreInput {
  dayElement: string;
  /** Chart order: year, month, day, hour. */
  gans: readonly string[];
  /** Chart order: year, month, day, hour. */
  zhis: readonly string[];
  stemTransformations?: ReadonlyMap<number, readonly FiveElement[]>;
  branchTransformations?: ReadonlyMap<number, readonly FiveElement[]>;
}

export interface ScoreContribution {
  source: 'stem' | 'branch';
  pillarIndex: number;
  weight: number;
  elements: readonly string[];
  supporting: boolean;
}

export interface PatternScoreBreakdown {
  score: number;
  rawSupport: number;
  capacity: number;
  contributions: readonly ScoreContribution[];
}

function isSupporting(dayElement: string, candidate: string): boolean {
  return candidate === dayElement || ELEMENT_GENERATES[candidate] === dayElement;
}

function candidatesSupportDayMaster(
  dayElement: string,
  elements: readonly string[],
): boolean {
  // A source that gives more than one possible transformed element (午未) is
  // counted only when every stated outcome supports the day master.
  return elements.length > 0
    && elements.every((element) => isSupporting(dayElement, element));
}

function scoreContribution(
  source: 'stem' | 'branch',
  pillarIndex: number,
  weight: number,
  baseElement: string | undefined,
  transformations: ReadonlyMap<number, readonly FiveElement[]>,
  dayElement: string,
): ScoreContribution {
  const elements = transformations.get(pillarIndex)
    ?? (baseElement ? [baseElement] : []);
  return {
    source,
    pillarIndex,
    weight,
    elements,
    supporting: candidatesSupportDayMaster(dayElement, elements),
  };
}

/**
 * Calculate the source-defined support percentage. The score is the weighted
 * share of 生我/同我; draining elements receive zero rather than an additional,
 * unsourced penalty. Missing hour data is normalized from the documented
 * 85-point known-pillar capacity back to a 0-100 scale.
 */
export function calculatePatternSupportScore(
  input: PatternScoreInput,
): PatternScoreBreakdown {
  const stemTransformations = input.stemTransformations ?? new Map();
  const branchTransformations = input.branchTransformations ?? new Map();
  const hasHour = Boolean(input.gans[3] && input.zhis[3]);
  const capacity = hasHour ? 100 : 85;
  const contributions: ScoreContribution[] = [];

  for (let pillarIndex = 0; pillarIndex < 4; pillarIndex += 1) {
    if (pillarIndex === 3 && !hasHour) continue;

    const stemWeight = PATTERN_WEIGHTS.stems[pillarIndex];
    if (stemWeight > 0) {
      contributions.push(scoreContribution(
        'stem',
        pillarIndex,
        stemWeight,
        GAN_TO_ELEMENT[input.gans[pillarIndex]],
        stemTransformations,
        input.dayElement,
      ));
    }

    const branchWeight = PATTERN_WEIGHTS.branches[pillarIndex];
    contributions.push(scoreContribution(
      'branch',
      pillarIndex,
      branchWeight,
      ZHI_TO_ELEMENT[input.zhis[pillarIndex]],
      branchTransformations,
      input.dayElement,
    ));
  }

  const rawSupport = contributions.reduce(
    (total, contribution) => total + (contribution.supporting ? contribution.weight : 0),
    0,
  );
  const score = Math.max(0, Math.min(100, (rawSupport / capacity) * 100));

  return { score, rawSupport, capacity, contributions };
}
