// src/components/dashboard/TodayEnergyCard.tsx
// [AI MOD] 今日能量首屏卡：每日鉤子 — 讓使用者每天打開都有新理由（留存機制）
// 資料來源：getDailyEnergy（packages/core/dailyAnalysis），僅唯讀呈現，不含新領域規則。
import { useMemo } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { BaziChart } from '../../paipan';
import { PatternScores, getPrimaryPattern, determinePattern } from '../../pattern';
import { getDailyEnergy, type DailyEnergy } from '../../dailyAnalysis';

interface TodayEnergyCardProps {
  chart: BaziChart;
  scores: PatternScores;
  onNavigate?: (view: string | number) => void;
}

interface OutcomeMeta {
  label: string;
  tone: string;
  advice: string;
}

const OUTCOME_META: Record<string, OutcomeMeta> = {
  '大好': { label: '大吉', tone: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/40', advice: '今日能量高峰，重要的事放心推進。' },
  '順利': { label: '吉', tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30', advice: '諸事平順，穩中有進，適合主動出擊。' },
  '小吉': { label: '小吉', tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30', advice: '運勢溫和向上，把小事做好就是進帳。' },
  '平穩': { label: '平', tone: 'text-zinc-300 bg-white/5 border-white/15', advice: '平常心過日子，宜守成、蓄積能量。' },
  '較差': { label: '注意', tone: 'text-amber-300 bg-amber-500/10 border-amber-400/30', advice: '今日阻力較大，重大決定緩一緩。' },
  '不順': { label: '宜靜', tone: 'text-red-300 bg-red-500/10 border-red-400/30', advice: '宜靜不宜動，多休息、少爭執。' },
  '不佳': { label: '宜靜', tone: 'text-red-300 bg-red-500/10 border-red-400/30', advice: '宜靜不宜動，多休息、少爭執。' },
};

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export default function TodayEnergyCard({ chart, scores, onNavigate }: TodayEnergyCardProps) {
  const energy: DailyEnergy = useMemo(() => {
    const primaryPattern = getPrimaryPattern(scores);
    const patternResult = determinePattern(chart);
    return getDailyEnergy(chart, patternResult.weakestElement, patternResult.favorable, patternResult.unfavorable, primaryPattern, new Date());
  }, [chart, scores]);

  const meta = OUTCOME_META[energy.theoreticalOutcome] || OUTCOME_META['平穩'];
  const now = new Date();
  const dateLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 星期${WEEK_LABELS[now.getDay()]}`;
  const explanation = energy.theoreticalExplanation.replace(/^。$/, '').trim();

  return (
    <div
      className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up"
      style={{ animationDelay: '0.05s' }}
      aria-label="今日能量"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] md:text-xs text-zinc-400 tracking-widest">
            今日 · {dateLabel}
          </span>
          <div className="flex items-center gap-1.5">
            {energy.isWeaknessDay && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-400/25">
                弱五行受剋
              </span>
            )}
            {energy.isExtremeDay && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Zap size={10} /> 極端能量日
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className={`shrink-0 px-2.5 py-1 rounded-lg border text-base md:text-lg font-bold ${meta.tone}`}>
            {meta.label}
          </span>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-bold text-white font-serif">
              {energy.lunarDate}
            </div>
            <div className="text-[11px] text-zinc-500">
              {energy.dayGanZhi} · 日主十神屬「{energy.dayTenGodType}」
            </div>
          </div>
        </div>

        {explanation && explanation !== '。' && (
          <p className="text-[11px] text-zinc-500 mb-2 line-clamp-2">{explanation}</p>
        )}

        <p className="text-sm text-zinc-300 mb-3">{meta.advice}</p>

        <button
          onClick={() => onNavigate?.(8)}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-300 transition-colors"
        >
          查看今日詳解與打卡 <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
