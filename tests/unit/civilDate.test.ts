import { describe, it, expect } from 'vitest';
import {
  addDaysToDateKey,
  compareDateKeys,
  dateKeyWeekday,
  dateKeyWeekdayLabel,
  enumerateDateKeys,
  fixedClock,
  formatFullDateLabel,
  formatMonthDay,
  isFutureDateKey,
  isPastOrTodayDateKey,
  isValidDateKey,
  parseDateKey,
  systemClock,
  taipeiDateKey,
  todayKey,
  TAIPEI_TIME_ZONE,
} from '../../src/lib/civilDate';

describe('taipeiDateKey', () => {
  it('uses Asia/Taipei date even when UTC is a different day', () => {
    // 2026-01-01 23:30 UTC = 2026-01-02 07:30 Taipei
    const instant = new Date('2026-01-01T23:30:00Z');
    expect(taipeiDateKey(instant)).toBe('2026-01-02');
    expect(utcKey(instant)).toBe('2026-01-01');
  });

  it('midnight UTC boundary stays same Taipei date in the morning', () => {
    const instant = new Date('2026-06-15T00:30:00Z'); // 08:30 Taipei same day
    expect(taipeiDateKey(instant)).toBe('2026-06-15');
  });

  it('honours the injected clock for todayKey', () => {
    const clock = fixedClock('2026-11-20T03:00:00Z'); // 11:00 Taipei
    expect(todayKey(clock)).toBe('2026-11-20');
  });

  it('systemClock is usable', () => {
    expect(typeof systemClock()).toBe('object');
  });
});

describe('parseDateKey / isValidDateKey', () => {
  it('parses valid keys and rejects fake dates', () => {
    expect(parseDateKey('2026-02-28')).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    // 2026 is not a leap year
    expect(parseDateKey('2026-02-29')).toBeNull();
    expect(parseDateKey('2024-02-29')).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    expect(parseDateKey('2026-13-01')).toBeNull();
    expect(parseDateKey('not-a-date')).toBeNull();
    expect(isValidDateKey('2026-01-01')).toBe(true);
    expect(isValidDateKey('2026-02-30')).toBe(false);
  });
});

describe('compareDateKeys / isFutureDateKey / isPastOrTodayDateKey', () => {
  const today = '2026-11-20';

  it('compares chronologically', () => {
    expect(compareDateKeys('2026-11-19', today)).toBe(-1);
    expect(compareDateKeys(today, today)).toBe(0);
    expect(compareDateKeys('2026-11-21', today)).toBe(1);
  });

  it('future detection', () => {
    expect(isFutureDateKey('2026-11-21', today)).toBe(true);
    expect(isFutureDateKey(today, today)).toBe(false);
    expect(isFutureDateKey('2026-11-19', today)).toBe(false);
  });

  it('past or today detection', () => {
    expect(isPastOrTodayDateKey('2026-11-19', today)).toBe(true);
    expect(isPastOrTodayDateKey(today, today)).toBe(true);
    expect(isPastOrTodayDateKey('2026-11-21', today)).toBe(false);
  });
});

describe('addDaysToDateKey', () => {
  it('adds/subtracts days across month and year boundaries', () => {
    expect(addDaysToDateKey('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysToDateKey('2026-02-01', -1)).toBe('2026-01-31');
    expect(addDaysToDateKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToDateKey('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('enumerateDateKeys', () => {
  it('returns N consecutive keys from start', () => {
    const keys = enumerateDateKeys('2026-11-20', 7);
    expect(keys).toEqual([
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
      '2026-11-26',
    ]);
  });
});

describe('weekday labels', () => {
  it('2026-11-20 is Friday', () => {
    expect(dateKeyWeekday('2026-11-20')).toBe(5);
    expect(dateKeyWeekdayLabel('2026-11-20')).toBe('星期五');
  });
});

describe('formatting', () => {
  it('formatMonthDay / formatFullDateLabel', () => {
    expect(formatMonthDay('2026-11-20')).toBe('11/20');
    expect(formatFullDateLabel('2026-11-20')).toBe(
      '2026 年 11 月 20 日（星期五）'
    );
  });
});

function utcKey(instant: Date): string {
  return `${instant.getUTCFullYear()}-${String(instant.getUTCMonth() + 1).padStart(2, '0')}-${String(instant.getUTCDate()).padStart(2, '0')}`;
}

describe('timezone constant', () => {
  it('TAIPEI_TIME_ZONE is Asia/Taipei', () => {
    expect(TAIPEI_TIME_ZONE).toBe('Asia/Taipei');
  });
});
