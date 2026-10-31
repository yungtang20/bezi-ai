// src/components/career/sections/DecorSection.tsx
// 學術級事業風水佈局 — customCareerFengShui。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import {
  ContentSection,
  UncertaintyNotice,
  type SectionGrammar,
  makeSection,
} from '../../../components/shared';
import { BookOpen } from 'lucide-react';

const MAX_ACTIONS = 3;

interface DecorSectionProps {
  dmElement: string;
  customCareerFengShui: {
    element: string;
    directions: string[];
    colors: string[];
    items: string;
  };
}

export function DecorSection({
  dmElement,
  customCareerFengShui,
}: DecorSectionProps) {
  const sections: SectionGrammar[] = [
    makeSection(
      '您的日主專屬事業五行',
      2,
      `您的日主五行屬「${dmElement}」— 專屬事業五行屬 ${customCareerFengShui.element}。`,
      {
        evidence: (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-black border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0 text-xl shadow-glow"></div>
              <div>
                <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">
                  My Day Master Feng Shui
                </span>
                <strong className="text-base text-blue-400 font-serif">
                  您的日主五行屬「{dmElement}」— 專屬事業五行屬{' '}
                  {customCareerFengShui.element}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">
                  {' '}
                  開運黃金方位：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {customCareerFengShui.directions.map((dir, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10.5px] px-2 py-0.5 font-bold rounded"
                    >
                      {dir}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  建議將您的辦公桌、主椅安置在上述方位。如空間受限，可在此方位擺置您的提案報告、筆記型電腦。
                </p>
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">
                  {' '}
                  旺運色系：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {customCareerFengShui.colors.map((col, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-500/10 text-white border border-white/10 text-[10.5px] px-2 py-0.5 font-bold rounded"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  建議辦公室裝潢細節、桌墊、日常服飾配件可大幅融入上述顏色起烘生助作用。
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/80 rounded-xl border border-white/5 space-y-2 font-sans text-xs">
              <span className="text-amber-400 font-black flex items-center gap-1">
                特製生肖軟裝擺飾與催旺法：
              </span>
              <p className="text-zinc-200 leading-relaxed font-medium">
                {customCareerFengShui.items}
              </p>
              <div className="p-2.5 bg-amber-950/20 rounded border border-amber-500/20 text-[10.5px] text-amber-300 leading-relaxed font-semibold">
                <strong>催運提點：</strong>
                整理事業方位的佈置、務必保持潔淨。書寫簽約、開會研究、策劃大決策時，誠坐此「官殺方位」，能大幅加持理智、提振權重！
              </div>
            </div>
          </div>
        ),
        timeWindow: '先天命盤固定，長期適用。',
        actions: [
          '辦公桌安置於開運方位',
          '融入旺運色系佈置',
          '擺放對應生肖擺飾',
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          '事業風水佈局依日主五行與講義第 9 & 10 頁推斷，實際效果仍隨環境與個人行為而異，僅供參考，非斷言。',
      }
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-5 select-none">
          <BookOpen size={100} />
        </div>
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-mono">07.</span>{' '}
            學術級事業風水軟裝佈局
          </div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/20 border border-blue-500/20 px-2 py-0.5 rounded">
            徐玉蘭風水磁場順心術
          </span>
        </h2>
        <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
          講義明示：<strong>補事業風水不須考慮身強或身弱</strong>
          ，僅須根據日主，調理自身「事業官殺」位。在辦公室或書房的專屬官殺方位擺放生旺色彩和軟裝，或坐於此方位書寫公章、商談，具有極強的添載磁場妙用：
        </p>
        {sections.map((s) => (
          <ContentSection
            key={s.title}
            grammar={s}
            defaultOpen={s.level === 2}
          />
        ))}
      </div>
      <UncertaintyNotice>
        事業風水佈局依日主五行與講義推斷，實際效果仍隨環境與個人行為而異，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}
