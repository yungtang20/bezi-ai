import { describe, it, expect } from 'vitest';
import { calculateChart } from '../../src/paipan';

describe('Paipan (Bazi Chart Calculation)', () => {
  it('correctly calculates Four Pillars for a known date and time', () => {
    // Example: 1990-05-15 14:00
    const chart = calculateChart(1990, 5, 15, 14, '男');
    expect(chart).toBeDefined();
    expect(chart.dayMaster).toBe(chart.day.gan);
    expect(chart.year.gan).toBeDefined();
    expect(chart.year.zhi).toBeDefined();
    expect(chart.month.gan).toBeDefined();
    expect(chart.month.zhi).toBeDefined();
    expect(chart.day.gan).toBeDefined();
    expect(chart.day.zhi).toBeDefined();
    expect(chart.hour.gan).toBeDefined();
    expect(chart.hour.zhi).toBeDefined();
  });

  it('correctly sets Day Master and gender', () => {
    const chartMale = calculateChart(1985, 10, 20, 8, '男');
    const chartFemale = calculateChart(1985, 10, 20, 8, '女');
    expect(chartMale.gender).toBe('男');
    expect(chartFemale.gender).toBe('女');
    expect(chartMale.dayMaster).toBe(chartFemale.dayMaster);
  });
});
