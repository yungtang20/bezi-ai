import { describe, it, expect } from 'vitest';
import { calculateChart } from '../../src/paipan';
import { calculateDaYun, getLiuNian, getFutureLiuNian } from '../../src/dayun';

describe('Da Yun & Liu Nian Calculations', () => {
  it('correctly calculates Da Yun list for a chart', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const daYuns = calculateDaYun(chart);
    expect(Array.isArray(daYuns)).toBe(true);
    expect(daYuns.length).toBeGreaterThan(0);
    expect(daYuns[0].startYear).toBeLessThan(daYuns[0].endYear);
  });

  it('correctly retrieves Liu Nian for a specific year', () => {
    const liuNian = getLiuNian(2026, '甲');
    expect(liuNian).toBeDefined();
    expect(liuNian.year).toBe(2026);
    expect(liuNian.ganZhi).toBeDefined();
    expect(liuNian.relation).toBeDefined();
  });

  it('correctly lists future Liu Nian years', () => {
    const future = getFutureLiuNian(2025, 5, '甲');
    expect(future).toHaveLength(5);
    expect(future[0].year).toBe(2025);
    expect(future[4].year).toBe(2029);
  });
});
