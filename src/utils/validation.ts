// src/utils/validation.ts — 核心資料與表單驗證模組
import { ValidationError } from '../errors';

export interface BirthInput {
  name?: string;
  gender: '男' | '女';
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH / HH:mm / HHmm / 空字串（時辰未知時為空）
}

export function validateBirthInput(input: BirthInput): { valid: boolean; error?: string } {
  if (input.name && input.name.trim().length > 30) {
    return { valid: false, error: '姓名長度不得超過 30 個字元' };
  }
  if (input.gender !== '男' && input.gender !== '女') {
    return { valid: false, error: '性別必須為「男」或「女」' };
  }
  if (!input.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    return { valid: false, error: '出生日期格式無效（應為 YYYY-MM-DD）' };
  }
  const [year, month, day] = input.birthDate.split('-').map(Number);
  if (year < 1900 || year > 2100) {
    return { valid: false, error: '出生年份需介於 1900 至 2100 年之間' };
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { valid: false, error: '出生月日數值無效' };
  }

  // [AI MOD] 時辰格式：主表單以「HH（小時）」為 canonical（localStorage 亦存小時），
  // 合盤頁則可能傳 HH:mm。兩者皆需通過驗證，否則填了時辰的使用者無法送出表單。
  const time = (input.birthTime || '').trim();
  if (time) {
    const isHourOnly = /^\d{1,2}$/.test(time);
    const isWithMinutes = /^\d{1,2}:\d{2}$/.test(time);
    const isCompact = /^\d{3,4}$/.test(time);
    if (!isHourOnly && !isWithMinutes && !isCompact) {
      return { valid: false, error: '出生時間格式無效（應為 HH 或 HH:mm）' };
    }
    let hour = 0;
    let minute = 0;
    if (isWithMinutes) {
      [hour, minute] = time.split(':').map(Number);
    } else if (isCompact) {
      hour = Number(time.slice(0, time.length - 2));
      minute = Number(time.slice(-2));
    } else {
      hour = Number(time);
    }
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return { valid: false, error: '出生時間超出範圍（時：0-23）' };
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      return { valid: false, error: '出生時間超出範圍（分：0-59）' };
    }
  }
  return { valid: true };
}

export function assertBirthInput(input: BirthInput): void {
  const res = validateBirthInput(input);
  if (!res.valid && res.error) {
    throw new ValidationError(res.error);
  }
}
