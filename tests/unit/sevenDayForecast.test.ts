import { describe, it, expect } from 'vitest';
import {
  buildSevenDayForecast,
  forecastSummary,
} from '../../src/lib/sevenDayForecast';
import type { BaziChart } from '../../packages/core/src/paipan';
import { determinePattern } from '../../src/pattern';
import { initPatternScoresFromPattern } from '../../packages/core/src/pattern';

function makeChart(): BaziChart {
  return {
    year: {
      gan: '甲',
      zhi: '子',
      hiddenGan: [],
      tenGod: '',
      hiddenTenGods: [],
    },
    month: {
      gan: '丙',
      zhi: '寅',
      hiddenGan: [],
      tenGod: '',
      hiddenTenGods: [],
    },
    day: { gan: '戊', zhi: '子', hiddenGan: [], tenGod: '', hiddenTenGods: [] },
    hour: {
      gan: '庚',
      zhi: '申',
      hiddenGan: [],
      tenGod: '',
      hiddenTenGods: [],
    },
    dayMaster: '戊',
    gender: '男',
    birthYear: 1984,
    birthMonth: 11,
    birthDay: 20,
    birthHour: 8,
    zodiac: '鼠',
  };
}

function makeScores(chart: BaziChart): {
  strong: number;
  weak: number;
  followStrong: number;
  followWeak: number;
} {
  const pattern = determinePattern(chart);
  return initPatternScoresFromPattern(pattern.pattern);
}

describe('buildSevenDayForecast', () => {
  it('returns exactly seven days starting from startDateKey', () => {
    const chart = makeChart();
    const scores = makeScores(chart);
    const forecast = buildSevenDayForecast({
      chart,
      scores,
      startDateKey: '2026-11-20',
      days: 7,
    });

    expect(forecast).toHaveLength(7);
    expect(forecast.map((d) => d.dateKey)).toEqual([
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
      '2026-11-26',
    ]);
  });

  it('every day has required evidence and rulesVersion', () => {
    const chart = makeChart();
    const scores = makeScores(chart);
    const forecast = buildSevenDayForecast({
      chart,
      scores,
      startDateKey: '2026-11-20',
    });

    for (const day of forecast) {
      expect(day.rulesVersion).toBe('r7-2026-11-20');
      expect(day.evidence.length).toBeGreaterThan(0);
      for (const ref of day.evidence) {
        expect([
          'SOURCE_VERIFIED',
          'RULE_COMPUTED',
          'USER_CALIBRATED',
          'REVIEW_REQUIRED',
          'UNKNOWN',
        ]).toContain(ref.kind);
      }
      expect(['favorable', 'unfavorable', 'steady', 'mixed']).toContain(
        day.trend
      );
      expect(['computed', 'limited', 'insufficient']).toContain(day.confidence);
      expect(day.domains.length).toBeLessThanOrEqual(2);
    }
  });

  it('domains are capped at two per day', () => {
    const chart = makeChart();
    const scores = makeScores(chart);
    const forecast = buildSevenDayForecast({
      chart,
      scores,
      startDateKey: '2026-11-20',
    });

    for (const day of forecast) {
      expect(day.domains.length).toBeLessThanOrEqual(2);
    }
  });

  it('user logs influence evidence but not determinism', () => {
    const chart = makeChart();
    const scores = makeScores(chart);
    const logs = [{ date: '2026-11-20', health: 'good' as const }];
    const forecast = buildSevenDayForecast({
      chart,
      scores,
      startDateKey: '2026-11-20',
      logs,
    });
    const today = forecast[0];
    expect(today.evidence.some((e) => e.kind === 'USER_CALIBRATED')).toBe(true);
  });

  it('is deterministic: same inputs → same outputs', () => {
    const chart = makeChart();
    const scores = makeScores(chart);
    const a = buildSevenDayForecast({
      chart,
      scores,
      startDateKey: '2026-11-20',
    });
    const b = buildSevenDayForecast({
      chart,
      scores,
      startDateKey: '2026-11-20',
    });
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it('forecastSummary categorises trends', () => {
    const chart = makeChart();
    const scores = makeScores(chart);
    const forecast = buildSevenDayForecast({
      chart,
      scores,
      startDateKey: '2026-11-20',
    });
    const summary = forecastSummary(forecast);
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });
});
