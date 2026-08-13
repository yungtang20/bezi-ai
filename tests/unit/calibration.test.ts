import { describe, it, expect } from 'vitest';
import { adjustScores, checkAutoSwitch, calculateAccuracy } from '../../src/calibration';
import { PatternScores } from '../../src/pattern';
import { DailyLog } from '../../src/storage';

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

  it('detects auto switch when another pattern exceeds the current pattern by > 5', () => {
    const scores: PatternScores = {
      strong: 40,
      weak: 48,
      followStrong: 10,
      followWeak: 10,
    };

    expect(checkAutoSwitch(scores, '身強')).toBe('身弱');
  });

  it('does not switch when the current pattern is already the leader', () => {
    expect(checkAutoSwitch(baseScores, '身強')).toBeNull();
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
