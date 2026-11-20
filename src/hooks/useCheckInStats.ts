// src/hooks/useCheckInStats.ts
// [AI MOD] 打卡統計（連續天數 + 準確率報告）— 讓「持續回來」有回饋
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllLogs } from '../storage';
import { calculateStreak, formatDateKey, type StreakInfo } from '../lib/streak';
import {
  buildAccuracyReport,
  type AccuracyReport,
} from '../lib/accuracyReport';
import { todayKey } from '../lib/civilDate';
import type { DailyLog } from '../storage';

export interface CheckInStats {
  streak: StreakInfo;
  report: AccuracyReport;
  today: string;
}

const EMPTY_STREAK: StreakInfo = {
  current: 0,
  longest: 0,
  totalDays: 0,
  checkedToday: false,
  lastCheckIn: null,
};

export function useCheckInStats() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  // [R7 P0-3] 以 Asia/Taipei 民用日期作為「今天」，不再用瀏覽器本地 UTC 日期鍵。
  const [today, setToday] = useState(todayKey());

  const refresh = useCallback(async () => {
    try {
      const all = await getAllLogs();
      setLogs(all);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // [R7 P0-3] 應用程式跨過午夜後，日期鍵應自動更新；否則 streak 與 checkedToday
  // 會停留在舊日。每分鐘檢查一次，發生跨日則重算。
  useEffect(() => {
    const timer = setInterval(() => {
      const next = todayKey();
      if (next !== today) setToday(next);
    }, 60_000);
    return () => clearInterval(timer);
  }, [today]);

  const streak = useMemo(
    () => (logs.length > 0 ? calculateStreak(logs, today) : EMPTY_STREAK),
    [logs, today]
  );
  const report = useMemo(() => buildAccuracyReport(logs), [logs]);

  return { streak, report, logs, loading, refresh, today };
}
