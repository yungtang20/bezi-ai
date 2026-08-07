// src/utils/validation.ts — 核心資料與表單驗證模組
import { ValidationError } from '../errors';

export interface BirthInput {
  name?: string;
  gender: '男' | '女';
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm or empty string
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
  if (input.birthTime && input.birthTime.trim() !== '') {
    const trimmed = input.birthTime.trim();
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':').map(Number);
      if (h < 0 || h > 23 || m < 0 || m > 59) {
        return { valid: false, error: '時分超出範圍（時：0-23，分：0-59）' };
      }
    } else if (/^\d{1,2}$/.test(trimmed)) {
      const h = Number(trimmed);
      if (h < 0 || h > 23) {
        return { valid: false, error: '小時超出範圍（0-23）' };
      }
    } else {
      return { valid: false, error: '出生時間格式無效（應為 HH:mm 或小時 0-23）' };
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
