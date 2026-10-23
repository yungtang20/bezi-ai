// src/hooks/useCheckInStats.ts
// [AI MOD] 打卡統計（連續天數 + 準確率報告）— 讓「持續回來」有回饋
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllLogs } from '../storage';
import { calculateStreak, formatDateKey, type StreakInfo } from '../lib/streak';
import { buildAccuracyReport, type AccuracyReport } from '../lib/accuracyReport';

export interface CheckInStats {
  streak: StreakInfo;
  report: AccuracyReport;
  today: string;
}

function todayKey(): string {
  const now = new Date();
  return formatDateKey(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

const EMPTY_STREAK: StreakInfo = {
  current: 0,
  longest: 0,
  totalDays: 0,
  checkedToday: false,
  lastCheckIn: null,
};

export function useCheckInStats() {
  const [logs, setLogs] = useState<import('../storage').DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const today = useMemo(todayKey, []);

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

  const streak = useMemo(() => (logs.length > 0 ? calculateStreak(logs, today) : EMPTY_STREAK), [logs, today]);
  const report = useMemo(() => buildAccuracyReport(logs), [logs]);

  return { streak, report, logs, loading, refresh, today };
}
