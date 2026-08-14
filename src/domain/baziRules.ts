/**
 * Source-backed tables used by the chart and pattern modules.
 *
 * Provenance IDs are documented in docs/domain-sources.md. Keep the rounded
 * percentages exactly as printed; do not silently force each branch to 100.
 */

export interface HiddenStemWeight {
  gan: string;
  percent: number;
}

export const HIDDEN_STEMS: Readonly<Record<string, readonly HiddenStemWeight[]>> = {
  '子': [{ gan: '癸', percent: 100 }],
  '丑': [
    { gan: '己', percent: 33 },
    { gan: '癸', percent: 33 },
    { gan: '辛', percent: 33 },
  ],
  '寅': [
    { gan: '甲', percent: 50 },
    { gan: '丙', percent: 40 },
    { gan: '戊', percent: 10 },
  ],
  '卯': [{ gan: '乙', percent: 100 }],
  '辰': [
    { gan: '戊', percent: 33 },
    { gan: '乙', percent: 33 },
    { gan: '癸', percent: 33 },
  ],
  '巳': [
    { gan: '丙', percent: 50 },
    { gan: '戊', percent: 40 },
    { gan: '庚', percent: 10 },
  ],
  '午': [
    { gan: '丁', percent: 50 },
    { gan: '己', percent: 50 },
  ],
  '未': [
    { gan: '己', percent: 40 },
    { gan: '丁', percent: 40 },
    { gan: '乙', percent: 20 },
  ],
  '申': [
    { gan: '庚', percent: 50 },
    { gan: '壬', percent: 40 },
    { gan: '戊', percent: 10 },
  ],
  '酉': [{ gan: '辛', percent: 100 }],
  '戌': [
    { gan: '戊', percent: 45 },
    { gan: '丁', percent: 45 },
    { gan: '辛', percent: 10 },
  ],
  '亥': [
    { gan: '壬', percent: 60 },
    { gan: '甲', percent: 40 },
  ],
};

export const ZHI_HIDDEN: Readonly<Record<string, readonly string[]>> =
  Object.fromEntries(
    Object.entries(HIDDEN_STEMS).map(([zhi, stems]) => [
      zhi,
      stems.map(({ gan }) => gan),
    ]),
  );

/**
 * Pattern support weights in chart order: year, month, day, hour.
 * The day stem is the day master itself and is therefore not scored.
 */
export const PATTERN_WEIGHTS = {
  stems: [5, 5, 0, 5],
  branches: [20, 35, 20, 10],
} as const;

export function getHiddenStemWeights(zhi: string): readonly HiddenStemWeight[] {
  return HIDDEN_STEMS[zhi] ?? [];
}

export function getHiddenStemNames(zhi: string): readonly string[] {
  return ZHI_HIDDEN[zhi] ?? [];
}
