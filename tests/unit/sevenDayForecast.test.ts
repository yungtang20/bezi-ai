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

  it('兩張不同命盤不應產出完全相同的預報', () => {
    const chartA = makeChart(); // 戊土日主
    const chartB: BaziChart = {
      ...makeChart(),
      day: {
        gan: '甲',
        zhi: '子',
        hiddenGan: [],
        tenGod: '',
        hiddenTenGods: [],
      },
      dayMaster: '甲',
    }; // 甲木日主，喜忌不同

    const forecastA = buildSevenDayForecast({
      chart: chartA,
      startDateKey: '2026-11-20',
      days: 30,
    });
    const forecastB = buildSevenDayForecast({
      chart: chartB,
      startDateKey: '2026-11-20',
      days: 30,
    });

    const same = forecastA.every(
      (d, i) => d.trendLabel === forecastB[i].trendLabel
    );
    expect(same, '兩張命盤預報完全一致，代表喜忌未傳入引擎').toBe(false);
  });

  it('evidence 帶出引擎的喜忌判定說明', () => {
    const chart = makeChart();
    const forecast = buildSevenDayForecast({
      chart,
      startDateKey: '2026-11-20',
      days: 30,
    });

    // 引擎的 theoreticalExplanation 會寫「喜用神(+n)」「忌神(-n)」。
    // evidence 必須帶上，否則使用者看不到判定依據。
    const evidenceText = forecast
      .flatMap((d) => d.evidence.map((e) => e.label))
      .join(' ');
    expect(evidenceText).toMatch(/喜用神|忌神/);
  });
});
