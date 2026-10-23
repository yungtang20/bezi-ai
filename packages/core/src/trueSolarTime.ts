// packages/core/src/trueSolarTime.ts
// [AI MOD] 真太陽時（地方視時）調整。
// 命理排盤傳統上以「出生地的太陽時」為準：
//   mean = (longitude − standardMeridian) × 4 分鐘/度
//   apparent = mean + 均時差(Equation of Time)
// 本模組只做「輸入小時 → 調整後分鐘」的純計算，不碰排盤引擎，
// 讓引擎保持單一職責；呼叫端把調整後的小時/分鐘傳進 calculateChart。

/** 由經度計算「平均太陽時差」(分鐘)：東經 120° 為基準，每度 4 分鐘。 */
export function meanSolarOffsetMinutes(longitude: number, standardMeridian: number): number {
  return (longitude - standardMeridian) * 4;
}

/**
 * 簡化均時差（Equation of Time）近似：以年度 sinusoid 建模，
 * 誤差 < ~2 分鐘，對「時辰邊界」判斷足夠（時辰 = 2 小時）。
 * 參考：EoT ≈ 9.87 sin(2B) − 7.53 cos(B) − 1.5 sin(B)，B = 360(N−81)/364
 * @param month 1-12
 * @param day 1-31
 */
export function equationOfTimeMinutes(month: number, day: number): number {
  const n = dayOfMonthToN(month, day);
  const b = (360 * (n - 81)) / 364;
  const rad = Math.PI / 180;
  return 9.87 * Math.sin(2 * b * rad) - 7.53 * Math.cos(b * rad) - 1.5 * Math.sin(b * rad);
}

function dayOfMonthToN(month: number, day: number): number {
  const cumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return (cumulative[month - 1] || 0) + day;
}

export interface TrueSolarInput {
  hour: number;            // 本地標準時小時 0-23
  minute: number;          // 0-59
  longitude: number;       // 出生地經度（東經正）
  month: number;           // 1-12
  day: number;             // 1-31
  standardMeridian: number;// 時區基準經度，如台北 120
}

export interface TrueSolarResult {
  hour: number;     // 0-23
  minute: number;   // 0-59
  dayDelta: number; // -1(前一日) / 0 / 1(下一日)，跨午夜時由呼叫端位移出生日期
}

/** 回傳調整後的小時/分鐘 + 跨天位移（標準經度由 input.standardMeridian 指定，如台北 120）。 */
export function toTrueSolarTime(input: TrueSolarInput): TrueSolarResult {
  const total = input.hour * 60 + input.minute
    + meanSolarOffsetMinutes(input.longitude, input.standardMeridian)
    + equationOfTimeMinutes(input.month, input.day);
  const dayDelta = Math.floor(total / 1440);
  const clamped = ((Math.round(total) % 1440) + 1440) % 1440;
  return { hour: Math.floor(clamped / 60), minute: clamped % 60, dayDelta };
}
