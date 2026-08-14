import { describe, it, expect } from 'vitest';
import { validateBirthInput, assertBirthInput, parseBirthHour } from '../../src/utils/validation';

describe('Validation Module (validateBirthInput & assertBirthInput)', () => {
  it('passes valid input with HH:mm time format like 02:00', () => {
    const result = validateBirthInput({
      name: '張三',
      gender: '男',
      birthDate: '1990-05-15',
      birthTime: '02:00',
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('passes valid input with single/double digit hour number', () => {
    const res1 = validateBirthInput({
      gender: '女',
      birthDate: '1995-10-20',
      birthTime: '2',
    });
    expect(res1.valid).toBe(true);

    const res2 = validateBirthInput({
      gender: '男',
      birthDate: '1988-01-01',
      birthTime: '23',
    });
    expect(res2.valid).toBe(true);
  });

  it('passes when birthTime is empty (hour unknown)', () => {
    const result = validateBirthInput({
      gender: '女',
      birthDate: '2000-06-01',
      birthTime: '',
    });
    expect(result.valid).toBe(true);
  });

  it('fails when hour is out of range (> 23)', () => {
    const result = validateBirthInput({
      gender: '男',
      birthDate: '1990-05-15',
      birthTime: '25:00',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('時分超出範圍');
  });

  it('fails when minute is out of range (> 59)', () => {
    const result = validateBirthInput({
      gender: '男',
      birthDate: '1990-05-15',
      birthTime: '12:60',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('時分超出範圍');
  });

  it('fails on invalid date format', () => {
    const result = validateBirthInput({
      gender: '男',
      birthDate: '1990/05/15',
      birthTime: '02:00',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('出生日期格式無效');
  });

  it.each(['2023-02-29', '2024-02-30', '2026-04-31'])('rejects impossible calendar date %s', (birthDate) => {
    const result = validateBirthInput({ gender: '女', birthDate, birthTime: '' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('出生日期不存在');
  });

  it('accepts a leap day in a leap year', () => {
    expect(validateBirthInput({ gender: '男', birthDate: '2024-02-29', birthTime: '7:30' }).valid).toBe(true);
  });

  it('parses both supported time formats and preserves an unknown hour', () => {
    expect(parseBirthHour('7')).toBe(7);
    expect(parseBirthHour('07:30')).toBe(7);
    expect(parseBirthHour('')).toBeNull();
  });

  it('assertBirthInput throws ValidationError on invalid input', () => {
    expect(() => {
      assertBirthInput({
        gender: '男',
        birthDate: '1800-01-01', // Year < 1900
        birthTime: '02:00',
      });
    }).toThrow('出生年份需介於 1900 至 2100 年之間');
  });
});
