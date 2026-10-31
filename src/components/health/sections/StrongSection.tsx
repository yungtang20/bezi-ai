// src/components/health/sections/StrongSection.tsx
// 能量過旺觀察 — 健康頁第五區塊。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import { Inbox } from 'lucide-react';
import { getHealthRemedy } from '../../../data';

interface StrongSectionProps {
  excessElements: string[];
  elementCount: Record<string, number>;
}

export default function StrongSection({
  excessElements,
  elementCount,
}: StrongSectionProps) {
  const wxColors: Record<string, string> = {
    木: '#22C55E',
    火: '#EF4444',
    土: '#F59E0B',
    金: '#94A3B8',
    水: '#3B82F6',
  };

  return (
    <div
      id="excess"
      className="scroll-mt-20 glass-card relative overflow-hidden"
    >
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-emerald-400 font-mono">05.</span> 能量過旺觀察
      </h2>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        探究原局中能量過剩的五行「純個數 ≥
        3」。氣過旺亦可能克害其他五行、造成病理病變：
      </p>

      <div className="space-y-4">
        {excessElements.length === 0 ? (
          <div className="text-center p-6 text-xs text-zen-muted bg-white/[0.01] border border-white/5 rounded-xl">
            <Inbox className="mx-auto mb-2 opacity-30" size={32} />
            您的五行分佈溫和，無純個數大於等於 3 個的過旺元素。
          </div>
        ) : (
          excessElements.map((el) => {
            const remedy = getHealthRemedy(el);
            let excessComment = '';
            if (el === '火')
              excessComment =
                '※火神太旺：「發炎」重症，體內燥熱，易引發發燒、黏膜紅腫、上火發炎障礙。';
            if (el === '土')
              excessComment =
                '※土神太旺：辰戌丑未太多引發「堆積物」淤塞、結石、瘜肉、腫瘤、癰疽，需極力疏導。';

            return (
              <div
                key={`exc-obs-${el}`}
                className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="text-lg font-bold"
                    style={{ color: wxColors[el] }}
                  >
                    {el} 氣亢盛 ({elementCount[el]}個)
                  </span>
                  <span className="text-xs text-red-400 font-bold px-2 py-0.5 bg-red-400/10 rounded">
                    防亢進與積壓
                  </span>
                </div>
                <div className="text-xs space-y-2">
                  <p className="text-zen-text font-semibold">
                    <strong className="text-zen-muted">亢進病變表現：</strong>
                    {remedy?.excessSymptoms}
                  </p>
                  {excessComment && (
                    <div className="p-3 rounded-lg bg-red-950/10 border border-red-900/15 text-red-300 font-semibold leading-relaxed text-[11px]">
                      {excessComment}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
