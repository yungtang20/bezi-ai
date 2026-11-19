// src/lib/civilDate.ts
// [R7 P0-3] 台灣民用日期（Asia/Taipei）單一真實來源。
// 設計原則：
// - 「日期字串」(YYYY-MM-DD) 是民用日曆鍵，不是時區瞬間；比較與加減一律在 key 上做，
//   不再用 `toISOString().split('T')[0]` 把 UTC 日期混進來。
// - Asia/Taipei 的判定交給 Intl + IANA 時區資料（含歷史偏移），不以固定 UTC+8 加減取代。
// - 所有需要「今天」的函式都可注入 Clock，測試不依賴執行環境時區。

export const TAIPEI_TIME_ZONE = 'Asia/Taipei';

/** 可注入時鐘：回傳當下瞬間。 */
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();

const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const dateKeyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TAIPEI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const hourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TAIPEI_TIME_ZONE,
  hour: '2-digit',
  hourCycle: 'h23',
});

/** 以 Asia/Taipei 民用日曆，把瞬間格式化為 YYYY-MM-DD。 */
export function taipeiDateKey(instant: Date = new Date()): string {
  const parts = dateKeyFormatter.formatToParts(instant);
  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

/** Asia/Taipei 當下的小時（0–23）。 */
export function taipeiHour(instant: Date = new Date()): number {
  const part = hourFormatter
    .formatToParts(instant)
    .find((p) => p.type === 'hour');
  return Number(part?.value ?? '0');
}

/** 可注入時鐘版的「今天」日期鍵。 */
export function todayKey(clock: Clock = systemClock): string {
  return taipeiDateKey(clock());
}

export function hourInTaipei(clock: Clock = systemClock): number {
  return taipeiHour(clock());
}

/** 測試用固定時鐘。 */
export function fixedClock(isoInstant: string): Clock {
  const instant = new Date(isoInstant);
  if (Number.isNaN(instant.getTime()))
    throw new Error(`invalid instant: ${isoInstant}`);
  return () => instant;
}

export interface DateKeyParts {
  year: number;
  month: number;
  day: number;
}

/** 嚴格解析 YYYY-MM-DD；非真實日期（如 2026-02-30）回傳 null。 */
export function parseDateKey(key: string): DateKeyParts | null {
  const m = DAY_KEY_PATTERN.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // 以 UTC 日曆回繞驗證真實性（閏年 2/29 included）
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function isValidDateKey(key: unknown): key is string {
  return typeof key === 'string' && parseDateKey(key) !== null;
}

/** 日期鍵 → UTC 午夜毫秒（純日曆運算用，不代表台灣當天的瞬間）。 */
export function dateKeyToUtcMs(key: string): number {
  const p = parseDateKey(key);
  if (!p) throw new Error(`invalid date key: ${key}`);
  return Date.UTC(p.year, p.month - 1, p.day);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** 日期鍵加減天數（民用日曆運算；可跨月、跨年、閏年）。 */
export function addDaysToDateKey(key: string, days: number): string {
  const ms = dateKeyToUtcMs(key) + days * DAY_MS;
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 字串序即可代表日期先後（YYYY-MM-DD 定長且補零）。 */
export function compareDateKeys(a: string, b: string): -1 | 0 | 1 {
  if (!isValidDateKey(a) || !isValidDateKey(b)) {
    throw new Error(`invalid date key: ${a} vs ${b}`);
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** key 是否晚於 todayKey（未來日期）。 */
export function isFutureDateKey(key: string, today: string): boolean {
  return compareDateKeys(key, today) > 0;
}

/** key 是否為今天或過去。 */
export function isPastOrTodayDateKey(key: string, today: string): boolean {
  return compareDateKeys(key, today) <= 0;
}

/** 日期鍵的星期（0=週日 … 6=週六）。 */
export function dateKeyWeekday(key: string): number {
  return new Date(dateKeyToUtcMs(key)).getUTCDay();
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export function dateKeyWeekdayLabel(key: string): string {
  return `星期${WEEKDAY_LABELS[dateKeyWeekday(key)]}`;
}

/** 連續 N 個日期鍵（含起始日），預設從今天起算的七日。 */
export function enumerateDateKeys(startKey: string, count: number): string[] {
  const out: string[] = [];
  let cursor = startKey;
  for (let i = 0; i < count; i += 1) {
    out.push(cursor);
    cursor = addDaysToDateKey(cursor, 1);
  }
  return out;
}

/** '2026-11-20' → '11/20' 顯示用。 */
export function formatMonthDay(key: string): string {
  const p = parseDateKey(key);
  if (!p) return key;
  return `${p.month}/${p.day}`;
}

/** 顯示用完整日期：2026 年 11 月 20 日（星期五）。 */
export function formatFullDateLabel(key: string): string {
  const p = parseDateKey(key);
  if (!p) return key;
  return `${p.year} 年 ${p.month} 月 ${p.day} 日（${dateKeyWeekdayLabel(key)}）`;
}
