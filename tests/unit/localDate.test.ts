import { describe, expect, it } from 'vitest';
import { addLocalDays, addLocalMonths, formatLocalDate, parseLocalDate } from '../../src/utils/localDate';

describe('local date utilities', () => {
  it('moves between months without overflowing a day near month end', () => {
    expect(addLocalMonths('2026-03-31', -1)).toBe('2026-02-01');
    expect(addLocalMonths('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('moves across year boundaries using local calendar dates', () => {
    expect(addLocalDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addLocalDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('round-trips a local calendar date without UTC conversion', () => {
    expect(formatLocalDate(parseLocalDate('2026-08-13'))).toBe('2026-08-13');
  });
});
