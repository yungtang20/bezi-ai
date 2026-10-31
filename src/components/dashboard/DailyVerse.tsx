// src/components/dashboard/DailyVerse.tsx
// [AI MOD] 首頁「每日一句」hero + 3-tap 快速打卡。
// verse 用 src/lib/dailyVerse 規則引擎（deterministic、離線）；
// 打卡走 src/lib/checkInSubmit 共用邏輯（與 DailyForecastPage 同一套存 log/調分）。
import { useState } from 'react';
import type { PatternScores } from '../../pattern';
import type { DailyEnergy } from '../../dailyAnalysis';
import type { DailyLog } from '../../storage';
import { buildDailyVerse } from '../../lib/dailyVerse';
import { submitCheckIn } from '../../lib/checkInSubmit';
import { isGoodOutcome, isBadOutcome } from '../../calibration';
import { trackProductEvent } from '../../lib/productEvents';

/** 十神日型 → 快速打卡寫入的領域（與 calibration.adjustScores 的主/次領域一致）。 */
export const QUICK_FIELDS: Record<
  string,
  Array<'wealth' | 'career' | 'romance' | 'health'>
> = {
  財星: ['wealth'],
  官殺: ['career'],
  食傷: ['romance', 'health'],
  比劫: ['wealth', 'romance'],
  印星: ['career'],
};

/** 從既有 log 推斷該日的整體方向（給每日一句鉤子用）。 */
export function deriveLogOutcome(
  log: DailyLog | undefined,
  dayTenGodType: string
): 'good' | 'bad' | null {
  if (!log) return null;
  const fields = QUICK_FIELDS[dayTenGodType] ?? [];
  for (const f of fields) {
    const v = log[f];
    if (v === 'good' || v === 'bad') return v;
  }
  const any = [
    log.health,
    log.career,
    log.romance,
    log.wealth,
    log.family,
    log.friends,
  ].find((v) => v !== null);
  return any === 'good' || any === 'bad' ? any : null;
}

interface VerseHeroProps {
  today: DailyEnergy;
  tomorrow: DailyEnergy;
  pattern: string;
  checkedToday: boolean;
  recentOutcome: 'good' | 'bad' | null;
}

/** 「每日一句」hero：生活語言的當日敘事 + 明日預告 + 留到明天的鉤子。 */
export function DailyVerseHero({
  today,
  tomorrow,
  pattern,
  checkedToday,
  recentOutcome,
}: VerseHeroProps) {
  const verse = buildDailyVerse({
    dayTenGodType: today.dayTenGodType,
    dayBranchElement: '',
    pattern,
    checkedToday,
    recentOutcome,
    isSteady:
      !isGoodOutcome(today.theoreticalOutcome) &&
      !isBadOutcome(today.theoreticalOutcome),
  });
  const tomorrowSteady =
    !isGoodOutcome(tomorrow.theoreticalOutcome) &&
    !isBadOutcome(tomorrow.theoreticalOutcome);

  return (
    <div
      className="mb-3 rounded-xl border border-amber-400/20 bg-amber-500/5 px-3 py-2.5"
      aria-label="每日一句"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-widest text-amber-300/80">
          每日一句 · {today.dayTenGodType}日
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
          {today.dayGan}
          {today.dayZhi}日
        </span>
      </div>
      <p className="mt-1.5 text-sm font-bold leading-snug text-white">
        {verse.headline}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-300">
        {verse.context}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-amber-200/70 italic">
        ↻ {verse.hook}
      </p>
      <p className="mt-1.5 text-[10px] text-zinc-500">
        明日預告：{tomorrow.dayTenGodType}日 ·{' '}
        {tomorrowSteady
          ? '方向偏平穩，先觀察'
          : `命理方向偏「${tomorrow.theoreticalOutcome}」`}
      </p>
    </div>
  );
}

interface QuickCheckInProps {
  scores: PatternScores;
  energy: DailyEnergy;
  logs: DailyLog[];
  today: string;
  checkedToday: boolean;
  onSubmitted: () => void;
}

/** 首頁 3-tap 快速打卡：方向（順利/不順）→ 一次寫入該日型對應領域。 */
export function QuickCheckIn({
  scores,
  energy,
  logs,
  today,
  checkedToday,
  onSubmitted,
}: QuickCheckInProps) {
  const [outcome, setOutcome] = useState<'good' | 'bad' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayLog = logs.find((l) => l.date === today);
  const savedOutcome = deriveLogOutcome(todayLog, energy.dayTenGodType);

  const handleSubmit = async (choice: 'good' | 'bad') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fields = QUICK_FIELDS[energy.dayTenGodType] ?? [];
      const feedback: Record<string, 'good' | 'bad' | null> = {};
      for (const f of fields) feedback[f] = choice;
      const { autoSwitched } = await submitCheckIn(scores, {
        date: today,
        theoreticalOutcome: energy.theoreticalOutcome,
        dayTenGodType: energy.dayTenGodType,
        feedback,
      });
      trackProductEvent('quick_checkin_saved');
      onSubmitted();
      if (autoSwitched) window.location.reload();
    } catch (e) {
      console.error('[AI MOD] quick check-in failed:', e);
      setIsSubmitting(false);
    }
  };

  if (checkedToday) {
    return (
      <div
        className="mb-3 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-3 py-2"
        aria-label="今日打卡狀態"
      >
        <span className="text-xs text-emerald-300">
          今天已記錄：
          {savedOutcome === 'good'
            ? '順利'
            : savedOutcome === 'bad'
              ? '不順'
              : '已打卡'}
        </span>
        <button
          onClick={() =>
            setOutcome((prev) =>
              prev === 'good' ? null : prev === 'bad' ? 'good' : 'bad'
            )
          }
          className="text-[10px] px-2 py-0.5 rounded border border-white/15 text-zinc-300 hover:bg-white/10"
        >
          修改
        </button>
      </div>
    );
  }

  return (
    <div
      className="mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
      aria-label="快速打卡"
    >
      <p className="text-[11px] text-zinc-400 mb-1.5">
        今天「{energy.dayTenGodType}」的方向，實際感覺如何？（10 秒）
      </p>
      {outcome === null ? (
        <div className="flex gap-2">
          <button
            onClick={() => setOutcome('good')}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors disabled:opacity-50"
          >
            順利
          </button>
          <button
            onClick={() => setOutcome('bad')}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 transition-colors disabled:opacity-50"
          >
            不順
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-300 flex-1">
            {outcome === 'good' ? '順利' : '不順'}
          </span>
          <button
            onClick={() => setOutcome(null)}
            className="text-[10px] px-2 py-1 rounded border border-white/15 text-zinc-400 hover:bg-white/10"
          >
            取消
          </button>
          <button
            onClick={() => void handleSubmit(outcome)}
            disabled={isSubmitting}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '記錄中' : '記錄'}
          </button>
        </div>
      )}
    </div>
  );
}
