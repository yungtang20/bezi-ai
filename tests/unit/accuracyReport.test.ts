// tests/unit/accuracyReport.test.ts — 準確率報告
import { describe, it, expect } from 'vitest';
import { buildAccuracyReport } from '../../src/lib/accuracyReport';
import { calculateAccuracy, calculateCategoryAccuracy } from '../../src/calibration';
import type { DailyLog } from '../../src/storage';

function makeLog(overrides: Partial<DailyLog>): DailyLog {
  return {
    date: '2026-10-01',
    health: null,
    career: null,
    romance: null,
    wealth: null,
    note: '',
    theoreticalOutcome: '順利',
    dayTenGodType: '財星',
    createdAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateCategoryAccuracy', () => {
  it('財星日只評估財運領域', () => {
    const categories = calculateCategoryAccuracy([makeLog({ wealth: 'good' })]);
    const wealth = categories.find(item => item.key === 'wealth');
    const career = categories.find(item => item.key === 'career');
    expect(wealth?.total).toBe(1);
    expect(wealth?.accuracy).toBe(100);
    expect(career?.total).toBe(0);
  });

  it('好日子實際順利即命中', () => {
    const categories = calculateCategoryAccuracy([
      makeLog({ theoreticalOutcome: '小吉', wealth: 'good' }),
    ]);
    expect(categories.find(item => item.key === 'wealth')?.accuracy).toBe(100);
  });

  it('好日子實際不順即未命中', () => {
    const categories = calculateCategoryAccuracy([
      makeLog({ theoreticalOutcome: '大吉', wealth: 'bad' }),
    ]);
    expect(categories.find(item => item.key === 'wealth')?.accuracy).toBe(0);
  });

  it('壞日子實際不順即命中', () => {
    const categories = calculateCategoryAccuracy([
      makeLog({ theoreticalOutcome: '不順', wealth: 'bad' }),
    ]);
    expect(categories.find(item => item.key === 'wealth')?.accuracy).toBe(100);
  });

  it('食傷日同時評估感情與健康', () => {
    const categories = calculateCategoryAccuracy([
      makeLog({ dayTenGodType: '食傷', romance: 'good', health: 'good' }),
    ]);
    expect(categories.find(item => item.key === 'romance')?.total).toBe(1);
    expect(categories.find(item => item.key === 'health')?.total).toBe(1);
  });

  it('比劫日評估四個領域', () => {
    const categories = calculateCategoryAccuracy([
      makeLog({ dayTenGodType: '比劫', wealth: 'good', romance: 'good', friends: 'good', family: 'good' }),
    ]);
    expect(categories.find(item => item.key === 'wealth')?.total).toBe(1);
    expect(categories.find(item => item.key === 'family')?.total).toBe(1);
  });

  it('未回饋的領域不列入樣本', () => {
    const categories = calculateCategoryAccuracy([makeLog({ wealth: null })]);
    expect(categories.every(item => item.total === 0)).toBe(true);
  });
});

describe('calculateAccuracy（既有行為維持）', () => {
  it('無記錄時為 0', () => {
    expect(calculateAccuracy([])).toBe(0);
  });

  it('全部命中為 100%', () => {
    expect(calculateAccuracy([makeLog({ wealth: 'good' })])).toBe(100);
  });

  it('全部未命中為 0%', () => {
    expect(calculateAccuracy([makeLog({ wealth: 'bad' })])).toBe(0);
  });

  it('混合命中取百分比（四捨五入）', () => {
    const logs = [
      makeLog({ date: '2026-10-01', wealth: 'good' }),
      makeLog({ date: '2026-10-02', wealth: 'bad' }),
      makeLog({ date: '2026-10-03', wealth: 'good' }),
    ];
    expect(calculateAccuracy(logs)).toBe(67);
  });
});

describe('buildAccuracyReport', () => {
  it('無記錄時為未開始狀態', () => {
    const report = buildAccuracyReport([]);
    expect(report.level).toBe('未開始');
    expect(report.samples).toBe(0);
    expect(report.accuracy).toBe(0);
    expect(report.categories).toHaveLength(0);
  });

  it('高吻合度提升等級', () => {
    const logs = Array.from({ length: 5 }, (_, i) =>
      makeLog({ date: `2026-10-0${i + 1}`, wealth: 'good', theoreticalOutcome: '順利' }),
    );
    const report = buildAccuracyReport(logs);
    expect(report.accuracy).toBe(100);
    expect(report.level).toBe('心有靈犀');
    expect(report.headline).toBe('AI 已經懂你了');
    expect(report.samples).toBe(5);
  });

  it('摘要會指出最準的領域', () => {
    const logs = [makeLog({ wealth: 'good', theoreticalOutcome: '順利' })];
    const report = buildAccuracyReport(logs);
    expect(report.summary).toContain('財運');
  });

  it('打卡天數會被記錄', () => {
    const logs = [
      makeLog({ date: '2026-10-01', wealth: 'good' }),
      makeLog({ date: '2026-10-02', wealth: 'good' }),
    ];
    expect(buildAccuracyReport(logs).checkedDays).toBe(2);
  });

  it('有紀錄但非對應領域時，提示當天該記錄的領域', () => {
    // 官殺日只評估事業；打卡的是健康 → 無可評估樣本
    const logs = [makeLog({ dayTenGodType: '官殺', career: null, health: 'good' })];
    const report = buildAccuracyReport(logs);
    expect(report.samples).toBe(0);
    expect(report.checkedDays).toBe(1);
    expect(report.summary).toContain('官殺');
    expect(report.summary).toContain('事業');
  });
});
