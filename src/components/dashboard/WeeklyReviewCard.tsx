// src/components/dashboard/WeeklyReviewCard.tsx
// [AI MOD] 週日命盤回顧卡：每週日顯示一週的打卡回顧（記錄數、連續天數、
// 吻合度、感受最好的領域），把「每日記錄」升級成「每週回頭看」的節奏。
import { useMemo } from 'react';
import type { DailyLog } from '../../storage';
import { calculateStreak, formatDateKey } from '../../lib/streak';
import { buildAccuracyReport } from '../../lib/accuracyReport';
import { calculateCategoryAccuracy } from '../../calibration';
import { useCheckInStats } from '../../hooks/useCheckInStats';

interface WeeklyReviewCardProps {
  logs: DailyLog[];
}

export default function WeeklyReviewCard({ logs }: WeeklyReviewCardProps) {
  const { today } = useCheckInStats();
  const weekLogCount = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const startKey = formatDateKey(start.getTime());
    return logs.filter((l) => l.date >= startKey && l.date <= today).length;
  }, [logs, today]);

  const streak = useMemo(() => calculateStreak(logs, today), [logs, today]);
  const report = useMemo(() => buildAccuracyReport(logs), [logs]);
  const categoryAccuracy = useMemo(() => calculateCategoryAccuracy(logs), [logs]);

  const bestCategory = useMemo(() => {
    const sorted = [...categoryAccuracy].sort((a, b) => b.accuracy - a.accuracy);
    const best = sorted.find((c) => c.total > 0);
    return best ? { label: best.label, accuracy: best.accuracy } : null;
  }, [categoryAccuracy]);

  return (
    <div className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up" aria-label="本週回顧">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-white">本週命盤回顧</h2>
        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">週日特供</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/5 border border-white/10 py-2">
          <div className="text-lg font-bold text-white">{weekLogCount}</div>
          <div className="text-[10px] text-zinc-400">本週記錄</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 py-2">
          <div className="text-lg font-bold text-orange-300">🔥 {streak.current}</div>
          <div className="text-[10px] text-zinc-400">連續打卡</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 py-2">
          <div className="text-lg font-bold text-indigo-300">{report.samples >= 3 ? `${report.accuracy}%` : '—'}</div>
          <div className="text-[10px] text-zinc-400">吻合度</div>
        </div>
      </div>

      {bestCategory && (
        <p className="mt-2.5 text-xs text-zinc-300">
          這週感受最准的領域是「<span className="text-amber-300 font-bold">{bestCategory.label}</span>」（{bestCategory.accuracy}% 同方向）。
        </p>
      )}
      <p className="mt-1.5 text-[10px] text-zinc-500">
        回顧不是打分，是让你看见自己的節奏。下週同一時間，這裡會換新一期。
      </p>
    </div>
  );
}
