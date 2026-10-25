// tests/unit/validation.test.ts — 出生輸入驗證（回歸測試）
// 背景：主表單的時辰 canonical 格式為「HH（小時）」，過去驗證只接受 HH:mm，
// 導致「有填出生時辰的使用者無法送出表單」——此測試守住兩種格式皆可通過。
import { describe, it, expect } from 'vitest';
import { validateBirthInput, assertBirthInput } from '../../src/utils/validation';
import { ValidationError } from '../../src/errors';

const base = { gender: '男' as const, birthDate: '1984-03-25' };

describe('validateBirthInput', () => {
  it('接受時辰未知（空字串）', () => {
    expect(validateBirthInput({ ...base, birthTime: '' }).valid).toBe(true);
    expect(validateBirthInput({ ...base }).valid).toBe(true);
  });

  it('接受 HH 小時格式（主表單 canonical）', () => {
    for (const t of ['0', '9', '10', '23']) {
      const res = validateBirthInput({ ...base, birthTime: t });
      expect(res.valid, `hour ${t} 應通過`).toBe(true);
    }
  });

  it('接受 HH:mm 格式（合盤頁格式）', () => {
    for (const t of ['00:00', '10:30', '23:59']) {
      expect(validateBirthInput({ ...base, birthTime: t }).valid, t).toBe(true);
    }
  });

  it('接受 HHmm 緊湊格式', () => {
    for (const t of ['1030', '2359']) {
      expect(validateBirthInput({ ...base, birthTime: t }).valid, t).toBe(true);
    }
  });

  it('拒絕非法時辰格式', () => {
    for (const t of ['abc', '25', '10:99', '1:2:3', '24:00']) {
      expect(validateBirthInput({ ...base, birthTime: t }).valid, t).toBe(false);
    }
  });

  it('拒絕非法出生日期', () => {
    expect(validateBirthInput({ gender: '男', birthDate: '1984/03/25' }).valid).toBe(false);
    expect(validateBirthInput({ gender: '男', birthDate: '1800-01-01' }).valid).toBe(false);
    expect(validateBirthInput({ gender: '男', birthDate: '1984-13-01' }).valid).toBe(false);
  });

  it('拒絕非法性別與過長姓名', () => {
    expect(validateBirthInput({ gender: 'X' as unknown as '男', birthDate: '1984-03-25' }).valid).toBe(false);
    expect(validateBirthInput({ ...base, name: '名'.repeat(31) }).valid).toBe(false);
  });
});

describe('assertBirthInput', () => {
  it('通過時不拋錯', () => {
    expect(() => assertBirthInput({ ...base, birthTime: '10' })).not.toThrow();
  });

  it('失敗時拋 ValidationError', () => {
    expect(() => assertBirthInput({ ...base, birthTime: 'abc' })).toThrow(ValidationError);
  });
});
