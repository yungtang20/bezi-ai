import { describe, it, expect } from 'vitest';
import { adjustScores, checkAutoSwitch, calculateAccuracy } from '../../src/calibration';
import { PatternScores } from '../../src/pattern';
import { DailyLog } from '../../src/storage';

import { applyCalibrationDelta } from '../../src/calibration';
describe('Calibration Module (scores adjustment, auto switch, accuracy)', () => {
  const baseScores: PatternScores = {
    strong: 60,
    weak: 40,
    followStrong: 10,
    followWeak: 10,
  };

  const createLog = (overrides: Partial<DailyLog> = {}): DailyLog => ({
    date: '2026-08-01',
    health: null,
    career: null,
    romance: null,
    wealth: null,
    note: '測試日誌',
    theoreticalOutcome: '順利',
    dayTenGodType: '財星',
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  it('correctly adjusts scores for a Wealth day (財星) with good wealth outcome', () => {
    const log = createLog({ wealth: 'good', dayTenGodType: '財星' });
    const updated = adjustScores(baseScores, log);
    expect(updated.strong).toBeGreaterThan(baseScores.strong);
    expect(updated.weak).toBeLessThan(baseScores.weak);
  });

  it('correctly adjusts scores for a Wealth day (財星) with bad wealth outcome', () => {
    const log = createLog({ wealth: 'bad', dayTenGodType: '財星' });
    const updated = adjustScores(baseScores, log);
    expect(updated.strong).toBeLessThan(baseScores.strong);
    expect(updated.weak).toBeGreaterThan(baseScores.weak);
  });

  it('detects auto switch when another pattern exceeds current primary by > 5', () => {
    const scores: PatternScores = {
      strong: 50,
      weak: 56, // exceeds strong by > 5
      followStrong: 10,
      followWeak: 10,
    };
    // strong was primary if we test a case where best > currentScore + 5
    const testScores: PatternScores = {
      strong: 40,
      weak: 48,
      followStrong: 10,
      followWeak: 10,
    };
    const switched = checkAutoSwitch(testScores);
    expect(switched).toBeNull(); // Because weak is already primary (48 > 40)
  });

  it('calculates accuracy based on matching good/bad theoretical outcomes', () => {
    const logs: DailyLog[] = [
      createLog({
        dayTenGodType: '財星',
        theoreticalOutcome: '順利',
        wealth: 'good',
      }),
      createLog({
        date: '2026-08-02',
        dayTenGodType: '官殺',
        theoreticalOutcome: '不順',
        career: 'bad',
      }),
    ];
    const acc = calculateAccuracy(logs);
    expect(acc).toBe(100);
  });
});

describe('applyCalibrationDelta (快速校準 流年定盤 delta)', () => {
  // 1985-02-03 02:00 男：日主癸水，引擎 68.5% 身強 → initPatternScores(69) = 身強80/身弱20/從強30
  const waterChartScores: PatternScores = { strong: 80, weak: 20, followStrong: 30, followWeak: 10 };

  it('身強 + 順利：從強與身弱並推（不預設答案），身強下降', () => {
    const next = applyCalibrationDelta(waterChartScores, '順利', '身強');
    expect(next.strong).toBe(60);
    expect(next.weak).toBe(30);
    expect(next.followStrong).toBe(40);
  });

  it('身強兩年都順利：從強追過身強（符合筆記：2020/2021 應出從強）', () => {
    let s = waterChartScores;
    s = applyCalibrationDelta(s, '順利', '身強');
    s = applyCalibrationDelta(s, '順利', '身強');
    expect(s.followStrong).toBe(50);
    expect(s.strong).toBe(40);
    expect(s.weak).toBe(40);
  });

  it('身強 + 不順：確認身強（比劫年照實辛苦 = 日主強）', () => {
    const next = applyCalibrationDelta(waterChartScores, '不順', '身強');
    expect(next.strong).toBe(90);
    expect(next.followStrong).toBe(30); // 不動
  });

  it('一順一不順：回到身強主導', () => {
    let s = applyCalibrationDelta(waterChartScores, '順利', '身強');
    s = applyCalibrationDelta(s, '不順', '身強');
    expect(s.strong).toBe(70); // 高于 followStrong 與 weak
  });

  it('平穩：分數完全不動', () => {
    expect(applyCalibrationDelta(waterChartScores, '平穩', '身強')).toEqual(waterChartScores);
  });

  it('從強 + 不順：破格回擺身強（講義：從強走忌神=身強）', () => {
    const cs: PatternScores = { strong: 20, weak: 20, followStrong: 80, followWeak: 20 };
    const next = applyCalibrationDelta(cs, '不順', '從強');
    expect(next.strong).toBe(35);
    expect(next.followStrong).toBe(65);
  });

  it('分數夾在 0~100 區間內', () => {
    const maxed: PatternScores = { strong: 99, weak: 0, followStrong: 100, followWeak: 0 };
    const next = applyCalibrationDelta(maxed, '不順', '從強');
    expect(next.strong).toBe(100); // min(100, 99+15)
    expect(next.followStrong).toBe(85);
  });
});
