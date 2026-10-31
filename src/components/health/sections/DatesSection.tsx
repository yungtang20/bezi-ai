// src/components/health/sections/DatesSection.tsx
// 最弱五行被剋流日 — 健康頁第八區塊。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import React from 'react';
import { HEALTH_DATA } from '../../../data';

interface DatesSectionProps {
  targetWeakest: string[];
  weakControlDaysList: { date: string; ganZhi: string; comment: string }[];
}

export default function DatesSection({
  targetWeakest,
  weakControlDaysList,
}: DatesSectionProps) {
  const wxColors: Record<string, string> = {
    木: '#22C55E',
    火: '#EF4444',
    土: '#F59E0B',
    金: '#94A3B8',
    水: '#3B82F6',
  };

  return (
    <div
      id="clashed"
      className="scroll-mt-20 glass-card relative overflow-hidden"
    >
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-emerald-400 font-mono">08.</span> 最弱五行被剋流日
      </h2>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依命理規則觀察原局較少的五行。當流日天干與地支形成相剋組合時，以下項目可作為生活記錄提醒，不代表器官受損或疾病預測。
      </p>

      {/* Meticulous rendering of weak control combinations from lecture notes */}
      <div className="space-y-4 mb-4">
        {targetWeakest.map((el) => {
          const weakDetails =
            HEALTH_DATA.WEAK_ADVICE[el as keyof typeof HEALTH_DATA.WEAK_ADVICE];
          if (!weakDetails) return null;

          return (
            <div
              key={`weak-detail-${el}`}
              className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-bold"
                  style={{ color: wxColors[el] }}
                >
                  先天缺 {el} 能量：
                </span>
                <span className="text-[11px] text-red-400 font-bold">
                  怕 {weakDetails.avoidElement}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-lg space-y-1">
                  <strong className="text-red-400 block">
                    {' '}
                    禁忌流日干支：
                  </strong>
                  <p>
                    <span className="text-zen-muted">天干忌：</span>
                    {weakDetails.avoidGans.join('、')}
                  </p>
                  <p>
                    <span className="text-zen-muted">地支忌：</span>
                    {weakDetails.avoidZhis.join('、')}
                  </p>
                </div>

                <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-lg space-y-1">
                  <strong className="text-red-400 block">
                    {' '}
                    最凶流日干支組合：
                  </strong>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {weakDetails.avoidDays.map((day) => (
                      <span
                        key={day}
                        className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 font-mono text-[10px]"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-black/30 p-3 rounded-lg border border-white/5">
                <p>
                  <span className="text-emerald-400 font-bold">
                    {' '}
                    易致病防守器官：
                  </span>
                  {weakDetails.organs}
                </p>
                <p>
                  <span className="text-amber-400 font-bold font-sans">
                    {' '}
                    突發警訊症狀：
                  </span>
                  {weakDetails.symptoms}
                </p>
                <p>
                  <span className="text-blue-400 font-bold">
                    {' '}
                    講義養護對策：
                  </span>
                  {weakDetails.advice}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic scanned dates visualizer for clashed days */}
      <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4">
        <strong className="text-xs text-zen-text block mb-2">
          {' '}
          預測推算：未來 120 天內您「最弱被剋流日」警示：
        </strong>
        {weakControlDaysList.length === 0 ? (
          <p className="text-xs text-zen-muted">
            未來 120 天內沒有明顯的被剋流日，請常規保持即可。
          </p>
        ) : (
          <div className="space-y-2.5">
            {weakControlDaysList.map((item, idx) => (
              <div
                key={`weak-date-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {item.ganZhi}日
                  </span>
                  <span className="text-xs font-bold text-zen-text">
                    {item.date}
                  </span>
                </div>
                <span className="text-[11px] text-zen-muted font-medium text-right">
                  {item.comment}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
