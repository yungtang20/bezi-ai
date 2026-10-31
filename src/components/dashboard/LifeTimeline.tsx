// src/components/dashboard/LifeTimeline.tsx
// [AI MOD] 人生大運色帶：把 calculateDaYun 的十年段畫成一條可掃視的色帶，
// 標出「你在此」與「下次交運倒數」，讓大運從抽象數字變成看得見的位置感。
import type { BaziChart } from '../../paipan';
import type { DaYun } from '../../dayun';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../../constants';

const ELEMENT_BG: Record<string, string> = {
  木: 'bg-emerald-500/70',
  火: 'bg-red-500/70',
  土: 'bg-amber-500/70',
  金: 'bg-zinc-400/70',
  水: 'bg-blue-500/70',
};
const ELEMENT_TEXT: Record<string, string> = {
  木: 'text-emerald-300',
  火: 'text-red-300',
  土: 'text-amber-300',
  金: 'text-zinc-200',
  水: 'text-blue-300',
};

interface LifeTimelineProps {
  chart: BaziChart;
  daYuns: DaYun[];
}

export default function LifeTimeline({ chart, daYuns }: LifeTimelineProps) {
  if (!daYuns.length) return null;
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;

  // 目前所在的大運段（依 birthYear + startAge 換算真實年份，避免歲數誤差）
  const current = daYuns.find(
    (dy) =>
      currentYear >= chart.birthYear + dy.startAge &&
      currentYear <= chart.birthYear + dy.endAge
  );
  const next = daYuns.find((dy) => chart.birthYear + dy.startAge > currentYear);
  const nextTransitionYear = next ? chart.birthYear + next.startAge : null;
  const daysToNext = nextTransitionYear
    ? Math.ceil(
        (new Date(
          nextTransitionYear,
          new Date().getMonth(),
          new Date().getDate()
        ).getTime() -
          Date.now()) /
          86400000
      )
    : null;

  return (
    <div
      className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up"
      aria-label="人生大運"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-white">人生大運</h2>
        {current && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
            {current.ganZhi} · {current.tenGod}
          </span>
        )}
      </div>

      {/* 色帶：每段等寬視覺，當前段加亮 + 標記 */}
      <div className="flex gap-0.5 h-12 overflow-x-auto scrollbar-none">
        {daYuns.map((dy) => {
          const startYear = chart.birthYear + dy.startAge;
          const element =
            GAN_TO_ELEMENT[dy.gan] || ZHI_TO_ELEMENT[dy.zhi] || '土';
          const isCurrent = current === dy;
          const isPast = startYear + 10 <= currentYear;
          return (
            <div
              key={dy.ganZhi}
              className={`relative flex-1 min-w-[54px] rounded ${ELEMENT_BG[element] || 'bg-zinc-600'} ${isPast ? 'opacity-40' : 'opacity-100'} ${isCurrent ? 'ring-2 ring-white/70' : ''} flex flex-col items-center justify-center`}
              title={`${startYear}–${startYear + 9} ${dy.ganZhi} ${dy.tenGod}`}
            >
              <span
                className={`text-[11px] md:text-xs font-bold ${ELEMENT_TEXT[element] || 'text-white'} ${isPast ? 'text-zinc-500' : ''}`}
              >
                {dy.ganZhi}
              </span>
              <span className="text-[9px] text-white/70">{dy.startAge}歲</span>
              {isCurrent && (
                <span className="absolute -top-1.5 text-[9px] px-1 rounded bg-amber-400 text-zinc-950 font-bold">
                  你在此
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 倒數列 */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
        {current && (
          <span>
            現行大運{' '}
            <span className="text-white font-bold">{current.ganZhi}</span>（
            {current.tenGod}）
          </span>
        )}
        {daysToNext != null && (
          <span>
            下次交運{' '}
            <span className={ELEMENT_TEXT[GAN_TO_ELEMENT[next!.gan] || '土']}>
              {next!.ganZhi}
            </span>
            <span className="text-zinc-500">
              {' '}
              · 約 {daysToNext > 0 ? `${daysToNext} 天後` : '進行中'}
            </span>
          </span>
        )}
      </div>
      {currentAge > 0 && (
        <p className="mt-1 text-[10px] text-zinc-600">你今年 {currentAge} 歲</p>
      )}
    </div>
  );
}
