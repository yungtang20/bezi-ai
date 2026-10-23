// src/lib/streak.ts — 連續打卡計算（純函式）
// 設計：今天還沒打卡時，連續天數從「昨天」往回算，讓使用者不會在打卡前就看到歸零。

export interface StreakInfo {
  current: number;        // 目前連續打卡天數
  longest: number;        // 歷史最長連續天數
  totalDays: number;      // 累計打卡天數
  checkedToday: boolean;  // 今天是否已打卡
  lastCheckIn: string | null; // 最近一次打卡日
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD → UTC timestamp（避免時區造成跨日誤差） */
function toUtc(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y || 1970, (m || 1) - 1, d || 1);
}

/** UTC timestamp → YYYY-MM-DD */
export function formatDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateStreak(
  logs: Array<{ date: string }>,
  today: string,
): StreakInfo {
  const dates = Array.from(new Set(logs.map(log => log.date).filter(Boolean))).sort();
  const checkedToday = dates.includes(today);

  if (dates.length === 0) {
    return { current: 0, longest: 0, totalDays: 0, checkedToday: false, lastCheckIn: null };
  }

  // —— 最長連續 ——
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i += 1) {
    const diff = toUtc(dates[i]) - toUtc(dates[i - 1]);
    if (diff === DAY_MS) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // —— 目前連續 ——
  const todayTs = toUtc(today);
  // 今天已打卡則從今天起算；否則從昨天起算（保留至當日結束）
  let cursor = checkedToday ? todayTs : todayTs - DAY_MS;
  const dateSet = new Set(dates);
  let current = 0;
  while (dateSet.has(formatDateKey(cursor))) {
    current += 1;
    cursor -= DAY_MS;
  }

  return {
    current,
    longest,
    totalDays: dates.length,
    checkedToday,
    lastCheckIn: dates[dates.length - 1],
  };
}
