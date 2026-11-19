import { describe, it, expect } from 'vitest';
import { recomputePatternScores } from '../../src/lib/calibrationLedger';
import { type DailyLog } from '../../src/storage';
import type { CalibrationBaseRecord } from '../../src/storage';
import type { PatternScores } from '../../src/pattern';

const baseScores: PatternScores = {
  strong: 50,
  weak: 30,
  followStrong: 10,
  followWeak: 10,
};

function baseRecord(
  overrides: Partial<CalibrationBaseRecord> = {}
): CalibrationBaseRecord {
  return {
    id: 'calibration-base',
    provenance: 'chart_derived',
    exact: true,
    scores: { ...baseScores },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function log(
  date: string,
  feedback: Record<string, 'good' | 'bad' | null>,
  dayTenGodType = '財星',
  createdAt = `${date}T10:00:00Z`
): DailyLog {
  return {
    date,
    health: feedback.health ?? null,
    career: feedback.career ?? null,
    romance: feedback.romance ?? null,
    wealth: feedback.wealth ?? null,
    family: null,
    friends: null,
    note: '',
    theoreticalOutcome: '平穩',
    dayTenGodType,
    createdAt,
  };
}

describe('recomputePatternScores', () => {
  it('applies daily logs in date order and reports exact recompute', () => {
    const base = baseRecord();
    const logs = [
      log('2026-08-05', { health: 'good' }),
      log('2026-08-01', { wealth: 'bad' }),
    ];
    const today = '2026-08-10';
    const result = recomputePatternScores(base, logs, today);

    expect(result.exact).toBe(true);
    expect(result.appliedDates).toEqual(['2026-08-01', '2026-08-05']);
    expect(result.skippedFutureDates).toEqual([]);
    expect(result.legacyCoveredDates).toEqual([]);
    // 結果不得等於基準（回饋已疊加）
    expect(result.scores).not.toEqual(baseScores);
  });

  it('skips future dates without mutating them', () => {
    const base = baseRecord();
    const logs = [
      log('2026-08-01', { health: 'good' }),
      log('2026-08-20', { health: 'bad' }), // 未來
    ];
    const result = recomputePatternScores(base, logs, '2026-08-10');

    expect(result.skippedFutureDates).toEqual(['2026-08-20']);
    expect(result.appliedDates).toEqual(['2026-08-01']);
  });

  it('only keeps the latest revision per date', () => {
    const base = baseRecord();
    const logs = [
      log('2026-08-01', { wealth: 'good' }, '財星', '2026-08-01T10:00:00Z'),
      log('2026-08-01', { wealth: 'bad' }, '財星', '2026-08-01T12:00:00Z'),
    ];
    const result = recomputePatternScores(base, logs, '2026-08-10');

    expect(result.appliedDates).toEqual(['2026-08-01']);
    expect(result.scores).not.toEqual(
      recomputePatternScores(base, [logs[0]], '2026-08-10').scores
    );
  });

  it('legacy_anchor skips covered dates and marks non-exact', () => {
    const base = baseRecord({
      provenance: 'legacy_anchor',
      exact: false,
      coveredDates: ['2026-08-01'],
    });
    const logs = [
      log('2026-08-01', { health: 'good' }), // 已涵蓋：不應再重算
      log('2026-08-05', { wealth: 'bad' }), // 新日期：應重算
    ];
    const result = recomputePatternScores(base, logs, '2026-08-10');

    expect(result.exact).toBe(false);
    expect(result.legacyCoveredDates).toEqual(['2026-08-01']);
    expect(result.appliedDates).toEqual(['2026-08-05']);
  });

  it('legacy covered date edits do not change scores (no double count)', () => {
    const base = baseRecord({
      provenance: 'legacy_anchor',
      exact: false,
      coveredDates: ['2026-08-01'],
      scores: { strong: 80, weak: 10, followStrong: 5, followWeak: 5 },
    });
    const before = recomputePatternScores(
      base,
      [
        log('2026-08-01', { health: 'good' }),
        log('2026-08-05', { wealth: 'bad' }),
      ],
      '2026-08-10'
    );
    const after = recomputePatternScores(
      base,
      [
        log('2026-08-01', { health: 'bad' }),
        log('2026-08-05', { wealth: 'bad' }),
      ],
      '2026-08-10'
    );

    expect(after.scores).toEqual(before.scores);
    expect(after.legacyCoveredDates).toEqual(['2026-08-01']);
  });

  it('idempotent: identical repeated submission gives identical scores', () => {
    const base = baseRecord();
    const l = log('2026-08-01', { health: 'good' });
    const r1 = recomputePatternScores(base, [l], '2026-08-10');
    const r2 = recomputePatternScores(base, [l, l], '2026-08-10');

    expect(r1.scores).toEqual(r2.scores);
  });
});
