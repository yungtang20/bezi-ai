// tests/unit/streak.test.ts — 連續打卡計算
import { describe, it, expect } from 'vitest';
import { calculateStreak, formatDateKey } from '../../src/lib/streak';

const log = (date: string) => ({ date });

describe('calculateStreak', () => {
  it('無記錄時全部為零', () => {
    const result = calculateStreak([], '2026-10-21');
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
    expect(result.totalDays).toBe(0);
    expect(result.checkedToday).toBe(false);
    expect(result.lastCheckIn).toBeNull();
  });

  it('今天已打卡時連續天數從今天起算', () => {
    const result = calculateStreak(
      [log('2026-10-19'), log('2026-10-20'), log('2026-10-21')],
      '2026-10-21',
    );
    expect(result.current).toBe(3);
    expect(result.checkedToday).toBe(true);
    expect(result.longest).toBe(3);
    expect(result.totalDays).toBe(3);
  });

  it('今天還沒打卡時，連續天數從昨天起算（不會在打卡前歸零）', () => {
    const result = calculateStreak(
      [log('2026-10-19'), log('2026-10-20')],
      '2026-10-21',
    );
    expect(result.current).toBe(2);
    expect(result.checkedToday).toBe(false);
  });

  it('中斷後重新接續只算連續段', () => {
    const result = calculateStreak(
      [log('2026-10-01'), log('2026-10-02'), log('2026-10-03'), log('2026-10-10'), log('2026-10-11')],
      '2026-10-11',
    );
    expect(result.current).toBe(2);
    expect(result.longest).toBe(3);
    expect(result.totalDays).toBe(5);
  });

  it('跨月連續天數正確計算', () => {
    const result = calculateStreak(
      [log('2026-09-30'), log('2026-10-01'), log('2026-10-02')],
      '2026-10-02',
    );
    expect(result.current).toBe(3);
  });

  it('跨年連續天數正確計算', () => {
    const result = calculateStreak(
      [log('2025-12-31'), log('2026-01-01')],
      '2026-01-01',
    );
    expect(result.current).toBe(2);
  });

  it('重複日期只算一次', () => {
    const result = calculateStreak(
      [log('2026-10-20'), log('2026-10-20'), log('2026-10-21')],
      '2026-10-21',
    );
    expect(result.current).toBe(2);
    expect(result.totalDays).toBe(2);
  });

  it('回報最近一次打卡日', () => {
    const result = calculateStreak([log('2026-10-19'), log('2026-10-20')], '2026-10-21');
    expect(result.lastCheckIn).toBe('2026-10-20');
  });
});

describe('formatDateKey', () => {
  it('輸出 YYYY-MM-DD 並補零', () => {
    expect(formatDateKey(Date.UTC(2026, 0, 5))).toBe('2026-01-05');
    expect(formatDateKey(Date.UTC(2026, 9, 21))).toBe('2026-10-21');
  });
});
