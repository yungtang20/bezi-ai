import { describe, it, expect } from 'vitest';
import { calculateChart } from '../../src/paipan';
import { determinePattern } from '../../src/pattern';

describe('Pattern Determination (Ge Ju)', () => {
  it('correctly determines pattern and favorable elements for a Bazi chart', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const result = determinePattern(chart);
    expect(result).toBeDefined();
    expect(result.pattern).toBeDefined();
    expect(Array.isArray(result.favorable)).toBe(true);
    expect(result.favorable.length).toBeGreaterThan(0);
  });
});
