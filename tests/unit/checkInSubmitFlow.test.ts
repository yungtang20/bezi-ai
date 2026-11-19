import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitCheckIn } from '../../src/lib/checkInSubmit';
import {
  saveDailyLog,
  savePatternScores,
  getCalibrationBase,
} from '../../src/storage';
import { adjustScores, checkAutoSwitch } from '../../src/calibration';
import type { PatternScores } from '../../src/pattern';
import type { DailyLog } from '../../src/storage';

const scores: PatternScores = {
  strong: 60,
  weak: 20,
  followStrong: 10,
  followWeak: 10,
};

const input = {
  date: '2026-11-25',
  theoreticalOutcome: '平穩',
  dayTenGodType: '財星',
  feedback: { health: 'good', career: null, romance: null, wealth: null },
};

const capturedLogs: DailyLog[] = [];

vi.mock('../../src/storage', () => ({
  getAllLogs: vi
    .fn()
    .mockImplementation(() => Promise.resolve([...capturedLogs])),
  getCalibrationBase: vi.fn(),
  saveDailyLog: vi.fn().mockImplementation((log: DailyLog) => {
    capturedLogs.push(log);
    return Promise.resolve();
  }),
  savePatternScores: vi.fn(),
  saveNotification: vi.fn(),
}));

vi.mock('../../src/calibration', () => ({
  adjustScores: vi.fn((s) => ({ ...s })),
  checkAutoSwitch: vi.fn(() => null),
}));

beforeEach(() => {
  capturedLogs.length = 0;
  vi.clearAllMocks();
});

describe('submitCheckIn', () => {
  it('rejects future dates without writing anything', async () => {
    const result = await submitCheckIn(scores, input, {
      now: new Date('2026-11-20T08:00:00Z'),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('FUTURE_DATE');
    }
    expect(saveDailyLog).not.toHaveBeenCalled();
    expect(savePatternScores).not.toHaveBeenCalled();
  });

  it('saves log and recomputes for today when no base exists', async () => {
    vi.mocked(getCalibrationBase).mockResolvedValue(null);

    const result = await submitCheckIn(scores, {
      ...input,
      date: '2026-11-20',
    });

    expect(result.ok).toBe(true);
    expect(saveDailyLog).toHaveBeenCalledTimes(1);
    expect(savePatternScores).toHaveBeenCalledTimes(1);
    if (result.ok) {
      expect(result.autoSwitched).toBeNull();
      expect(result.recomputed.appliedDates).toEqual(['2026-11-20']);
    }
  });

  it('recomputes from calibration base when present', async () => {
    vi.mocked(getCalibrationBase).mockResolvedValue({
      id: 'calibration-base',
      provenance: 'chart_derived',
      exact: true,
      scores,
      coveredDates: undefined,
      residual: undefined,
      adjustments: undefined,
      createdAt: '2026-11-20T00:00:00Z',
      updatedAt: '2026-11-20T00:00:00Z',
    });

    const result = await submitCheckIn(scores, {
      ...input,
      date: '2026-11-20',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.recomputed.exact).toBe(true);
      expect(result.recomputed.appliedDates).toEqual(['2026-11-20']);
    }
    expect(savePatternScores).toHaveBeenCalledTimes(1);
  });
});
