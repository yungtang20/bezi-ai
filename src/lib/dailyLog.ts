// src/lib/dailyLog.ts
// [R7 ARCH-02] 每日打卡紀錄「latest per date」去重：純函數，可測試，不碰 IndexedDB。
// 單一實作來源，供 calibrationLedger 與 sevenDayForecast 共用，避免重複邏輯分歧。
import type { DailyLog } from '../storage';

export function latestPerDate(logs: DailyLog[]): DailyLog[] {
  // 依 createdAt 順序穩定排序；同一天的多筆紀錄取最後一筆（數值變更視為新修訂）。
  const ordered = [...logs].sort((a, b) =>
    (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
  );
  const byDate = new Map<string, DailyLog>();
  for (const log of ordered) {
    if (log.date) byDate.set(log.date, log);
  }
  return [...byDate.values()].sort((a, b) =>
    (a.date ?? '').localeCompare(b.date ?? '')
  );
}
