// src/lib/evidenceStatus.ts
// [R7 P1-4] 每日建議的證據追溯分類：讓使用者知道「哪些判斷已過教材核實，哪些僅是系統估算」。
// 不得把任何命理判斷包裝成已獲科學驗證的預測能力。

export type EvidenceStatus =
  | 'SOURCE_VERIFIED'
  | 'RULE_COMPUTED'
  | 'USER_CALIBRATED'
  | 'REVIEW_REQUIRED'
  | 'UNKNOWN';

export interface EvidenceRef {
  kind: EvidenceStatus;
  /** 對使用者可讀的說明。 */
  label: string;
  /** 來源：講義章節、規則名稱、或「系統估算」。 */
  source?: string;
  /** 細節（可選）。 */
  detail?: string;
}

/** 來源於講義與既有規則的引數。 */
export function sourceVerified(label: string, source?: string): EvidenceRef {
  return { kind: 'SOURCE_VERIFIED', label, source };
}

/** 由命理規則（DAY_TYPE_FIELDS、十神、流日類型）確定性計算得出。 */
export function ruleComputed(label: string, source?: string): EvidenceRef {
  return { kind: 'RULE_COMPUTED', label, source };
}

/** 來自使用者打卡回饋。 */
export function userCalibrated(label: string): EvidenceRef {
  return { kind: 'USER_CALIBRATED', label };
}

/** 需要人工複核（無充足依據）。 */
export function reviewRequired(label: string): EvidenceRef {
  return { kind: 'REVIEW_REQUIRED', label };
}

/** 無依據。 */
export function unknownStatus(label: string): EvidenceRef {
  return { kind: 'UNKNOWN', label };
}

export function evidenceStatusText(kind: EvidenceStatus): string {
  switch (kind) {
    case 'SOURCE_VERIFIED':
      return '教材核實';
    case 'RULE_COMPUTED':
      return '規則計算';
    case 'USER_CALIBRATED':
      return '使用者回饋';
    case 'REVIEW_REQUIRED':
      return '待複核';
    case 'UNKNOWN':
      return '系統估算';
  }
}
