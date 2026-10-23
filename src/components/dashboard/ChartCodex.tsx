// src/components/dashboard/ChartCodex.tsx
// [AI MOD] 命盤圖鑑：把「打卡過的每一天的十神 × 五行」做成可收集的印章。
// 25 格（十神 5 × 五行 5），隨打卡累積解鎖，讓每日記錄有「收集」的動機。
// 純推導自打卡 log（不另存狀態），離線、可回歸測試。
import { useMemo } from 'react';
import type { BaziChart } from '../../paipan';
import type { PatternResult } from '../../pattern';
import type { PatternScores } from '../../pattern';
import type { DailyLog } from '../../storage';
import { getDailyEnergy } from '../../dailyAnalysis';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../../constants';
import { getPrimaryPattern } from '../../pattern';
import { calculateStreak, formatDateKey } from '../../lib/streak';

export const CODEX_TEN_GODS = ['財星', '官殺', '食傷', '比劫', '印星'] as const;
export const CODEX_ELEMENTS = ['木', '火', '土', '金', '水'] as const;

const ELEMENT_TINT: Record<string, string> = {
  '木': 'from-emerald-500/30 to-emerald-500/10 text-emerald-200',
  '火': 'from-red-500/30 to-red-500/10 text-red-200',
  '土': 'from-amber-500/30 to-amber-500/10 text-amber-200',
  '金': 'from-zinc-400/30 to-zinc-400/10 text-zinc-100',
  '水': 'from-blue-500/30 to-blue-500/10 text-blue-200',
};

/** 依打卡日推導「十神×五行」印章集合（動態成員，用 Set 判 exists + size）。 */
export function computeStamps(
  chart: BaziChart,
  pattern: PatternResult,
  primaryPattern: string,
  logs: DailyLog[],
): Set<string> {
  const stamps = new Set<string>();
  for (const log of logs) {
    const [y, m, d] = log.date.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
    const energy = getDailyEnergy(chart, pattern.weakestElement, pattern.favorable, pattern.unfavorable, primaryPattern, date);
    const element = ZHI_TO_ELEMENT[energy.dayZhi] || GAN_TO_ELEMENT[energy.dayGan] || '';
    if (energy.dayTenGodType && element) stamps.add(`${energy.dayTenGodType}:${element}`);
  }
  return stamps;
}

interface ChartCodexProps {
  chart: BaziChart;
  pattern: PatternResult;
  scores: PatternScores;
  logs: DailyLog[];
}

export default function ChartCodex({ chart, pattern, scores, logs }: ChartCodexProps) {
  const primaryPattern = getPrimaryPattern(scores);
  const stamps = useMemo(
    () => computeStamps(chart, pattern, primaryPattern, logs),
    [chart, pattern, primaryPattern, logs],
  );
  const today = formatDateKey(Date.now());
  const streakInfo = useMemo(() => calculateStreak(logs, today), [logs, today]);
  const total = CODEX_TEN_GODS.length * CODEX_ELEMENTS.length;

  return (
    <div className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up" aria-label="命盤圖鑑">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-white">命盤圖鑑</h2>
        <span className="text-[11px] text-zinc-400">{stamps.size}/{total} 章 · 打卡解鎖</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {CODEX_TEN_GODS.map((god) =>
          CODEX_ELEMENTS.map((element) => {
            const isUnlocked = stamps.has(`${god}:${element}`);
            return (
              <div
                key={`${god}:${element}`}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center border ${
                  isUnlocked ? `bg-gradient-to-br ${ELEMENT_TINT[element]} border-white/20` : 'bg-white/5 border-white/10'
                }`}
                title={`${god}·${element}${isUnlocked ? '（已收集）' : ''}`}
              >
                <span className={`text-[10px] md:text-xs font-bold ${isUnlocked ? '' : 'text-zinc-600'}`}>{god}</span>
                <span className="text-[9px] opacity-70">{element}</span>
                {isUnlocked && <span className="absolute top-0.5 right-0.5 text-[8px]">✓</span>}
              </div>
            );
          }),
        )}
      </div>

      <p className="mt-2 text-[10px] text-zinc-500">
        每個打卡日的「十神 × 五行」會蓋成一章。集滿 {total} 章，就集齊命理的一整套日型。
        {streakInfo.current > 0 && ` 目前連續 ${streakInfo.current} 天。`}
      </p>
    </div>
  );
}
