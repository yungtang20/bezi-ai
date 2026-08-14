import { describe, expect, it } from 'vitest';
import {
  getHiddenStemNames,
  getHiddenStemWeights,
  PATTERN_WEIGHTS,
} from '../../src/domain/baziRules';

describe('source-backed Bazi rule tables', () => {
  it('preserves the lecture order and rounded values for hidden stems', () => {
    expect(getHiddenStemNames('丑')).toEqual(['己', '癸', '辛']);
    expect(getHiddenStemWeights('丑').map(({ percent }) => percent)).toEqual([33, 33, 33]);
    expect(getHiddenStemNames('戌')).toEqual(['戊', '丁', '辛']);
    expect(getHiddenStemWeights('戌').map(({ percent }) => percent)).toEqual([45, 45, 10]);
  });

  it('keeps printed rounding instead of inventing a normalized percentage', () => {
    const roundedTotal = getHiddenStemWeights('辰')
      .reduce((total, { percent }) => total + percent, 0);
    expect(roundedTotal).toBe(99);
  });

  it('maps the lecture columns into year-month-day-hour chart order', () => {
    expect(PATTERN_WEIGHTS.stems).toEqual([5, 5, 0, 5]);
    expect(PATTERN_WEIGHTS.branches).toEqual([20, 35, 20, 10]);
    expect(
      [...PATTERN_WEIGHTS.stems, ...PATTERN_WEIGHTS.branches]
        .reduce((total, weight) => total + weight, 0),
    ).toBe(100);
  });
});
