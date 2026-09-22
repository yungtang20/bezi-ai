import { describe, expect, it } from 'vitest';
import { calculateChart } from '../../src/paipan';
import { getFiveElementData, getTenGodData } from '../../src/lib/chartTransform';

describe('chartTransform', () => {
  it('normalizes five element data and returns ten god counts', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const elements = getFiveElementData(chart);
    expect(elements).toHaveLength(5);
    expect(Math.max(...elements.map(item => item.value))).toBe(100);
    expect(getTenGodData(chart).every(item => item.value > 0)).toBe(true);
  });
});
