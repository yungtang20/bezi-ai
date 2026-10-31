// src/components/health/sections/WeakSection.tsx
// 能量偏弱觀察 — 健康頁第四區塊。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import { Inbox } from 'lucide-react';
import { getHealthRemedy, HEALTH_PRESERVATION_GUIDE } from '../../../data';

interface WeakSectionProps {
  weakElements: string[];
}

export default function WeakSection({ weakElements }: WeakSectionProps) {
  const wxColors: Record<string, string> = {
    木: '#22C55E',
    火: '#EF4444',
    土: '#F59E0B',
    金: '#94A3B8',
    水: '#3B82F6',
  };

  return (
    <div
      id="weakness"
      className="scroll-mt-20 glass-card relative overflow-hidden"
    >
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-emerald-400 font-mono">04.</span>{' '}
        能量偏弱觀察（日常保健）
      </h2>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        針對本命盤中純個數小於等於 1
        的弱五行，進行生理衰疲觀察，並給予最精確的食物和起居調養建議。
      </p>

      <div className="space-y-4">
        {weakElements.length === 0 ? (
          <div className="text-center p-6 text-xs text-zen-muted">
            <Inbox className="mx-auto mb-2 opacity-30" size={32} />
            您的五行分佈極為平衡，無純個數小於等於 1 個的薄弱能量。
          </div>
        ) : (
          weakElements.map((el) => {
            const remedies = HEALTH_PRESERVATION_GUIDE[el] || [];
            const rData = getHealthRemedy(el);
            return (
              <div
                key={`weak-obs-${el}`}
                className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xl font-bold"
                    style={{ color: wxColors[el] }}
                  >
                    {el} 氣薄弱
                  </span>
                  <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5">
                    防衰竭退化
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <p className="text-zen-text font-semibold">
                    <strong className="text-zen-muted">疲虛表現：</strong>
                    {rData?.weakSymptoms}
                  </p>
                  <div className="p-3 rounded-lg bg-emerald-950/10 border border-emerald-900/10 mt-2 space-y-1.5">
                    <strong className="text-emerald-400 block mb-1">
                      {' '}
                      生理與飲食日常保健：
                    </strong>
                    {remedies.map((tip, i) => (
                      <p
                        key={i}
                        className="text-[11px] text-zen-text leading-relaxed font-medium"
                      >
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
