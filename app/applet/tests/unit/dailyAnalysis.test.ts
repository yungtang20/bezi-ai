import { describe, it, expect } from 'vitest';
import { getDailyEnergy, getUpcomingDatesForCategory } from '../../src/dailyAnalysis';
import { calculateChart } from '../../src/paipan';

describe('DailyAnalysis Module (daily energy calculation and forecast)', () => {
  it('calculates daily energy correctly for a specific target date', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const targetDate = new Date('2026-08-01');
    const energy = getDailyEnergy(
      chart,
      '木',
      ['火', '土'],
      ['金', '水'],
      '身強',
      targetDate
    );

    expect(energy).toBeDefined();
    expect(typeof energy.isExtremeDay).toBe('boolean');
    expect(energy.dayGanZhi).toBeDefined();
    expect(energy.dayGanZhi.length).toBe(2);
    expect(['順利', '平穩', '不順']).toContain(energy.theoreticalOutcome);
    expect(energy.theoreticalExplanation).toBeDefined();
    expect(Array.isArray(energy.dayTypes)).toBe(true);
  });

  it('calculates upcoming dates for a category correctly', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const upcoming = getUpcomingDatesForCategory(
      'wealth',
      chart,
      ['火', '土'],
      ['金', '水'],
      '身強'
    );

    expect(Array.isArray(upcoming)).toBe(true);
    if (upcoming.length > 0) {
      const first = upcoming[0];
      expect(first.date).toBeDefined();
      expect(first.ganZhi).toBeDefined();
    }
  });
});
