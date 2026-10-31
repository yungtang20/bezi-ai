// src/components/family/sections/GodsSection.tsx
// 3. 專屬十神家宅開運指南 — 依主次十神定制家族相處與軟裝佈置建議。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from 'react';

interface GodsSectionProps {
  tenGodCount: Record<string, number>;
  sortedTenGods: [string, number][];
  topGod: string;
  secondGod: string;
}

const GOD_FAMILY_ADVICE: Record<
  string,
  { title: string; advice: string; homeTip: string }
> = {
  比肩: {
    title: '比肩能量',
    advice:
      '命盤比肩能量強，家人間講求平等與獨立。適合營造「各自有獨立空間、共享公共區域」的居家格局。',
    homeTip: '建議在客廳設置開放式交流區，臥室則保留個人隱私空間。',
  },
  劫財: {
    title: '劫財能量',
    advice:
      '劫財旺者，家庭資源易有競爭感。需建立透明的家庭財務溝通機制，避免因金錢產生嫌隙。',
    homeTip: '家中財物擺放宜整齊有序，避免雜亂引發煩躁情緒。',
  },
  食神: {
    title: '食神能量',
    advice:
      '食神代表享受與表達，家庭成員重視生活品質與美食。廚房與餐廳是家的核心，適合投資在烹飪設備與餐桌氛圍。',
    homeTip: '餐桌圓形為佳，促進家人圍坐交流；廚房保持明亮整潔。',
  },
  傷官: {
    title: '傷官能量',
    advice:
      '傷官旺者，家人想法多、創意豐富，但也易有口角。需要建立「尊重差異、理性溝通」的家庭文化。',
    homeTip: '家中可設置創意工作區或閱讀角，讓成員有獨立思考空間。',
  },
  偏財: {
    title: '偏財能量',
    advice:
      '偏財代表流動之財，家庭財運有意外之財機會。但需注意理財風險，避免投機心態影響家庭和諧。',
    homeTip: '家中財位宜保持乾淨，可擺放流動水景或招財擺件。',
  },
  正財: {
    title: '正財能量',
    advice:
      '正財穩健，家庭財務規劃宜保守務實。適合建立長期儲蓄與投資計畫，為家人打造安穩的經濟基礎。',
    homeTip: '家中宜有固定財庫位置，如保險櫃或收納盒，象徵財有歸宿。',
  },
  七殺: {
    title: '七殺能量',
    advice:
      '七殺帶權威與壓力，家庭中可能有較强势的成員。需要學習柔性溝通，避免權威式管教造成隔閡。',
    homeTip: '家中色調宜柔和，避免過於冷硬；可多用木質家具增添溫暖。',
  },
  正官: {
    title: '正官能量',
    advice:
      '正官代表規矩與責任，家庭重視紀律與傳統。適合建立明確的家規與分工，讓每位成員都有角色與責任。',
    homeTip: '家中宜有明確的功能分區，各司其序，井然有序。',
  },
  偏印: {
    title: '偏印能量',
    advice:
      '偏印旺者，家人直覺敏銳、精神世界豐富。適合營造有文化氣息的居家環境，鼓勵學習與心靈成長。',
    homeTip: '家中可設書房或閱讀區，摆放書籍與藝術品，提升精神能量。',
  },
  正印: {
    title: '正印能量',
    advice:
      '正印代表智慧與包容，家庭重視教育與傳承。適合打造充滿書香與溫暖的居家氛圍，鼓勵家人共同學習。',
    homeTip: '客廳可懸掛字畫或家庭照片，強化家的凝聚力與記憶。',
  },
};

export default function GodsSection({
  tenGodCount,
  sortedTenGods,
  topGod,
  secondGod,
}: GodsSectionProps) {
  const sortedGods = Object.entries(tenGodCount).sort((a, b) => b[1] - a[1]);
  const topTwoGods = sortedGods.slice(0, 2);

  const topAdvice = GOD_FAMILY_ADVICE[topGod];
  const secondAdvice = GOD_FAMILY_ADVICE[secondGod];

  return (
    <div id="guide" className="scroll-mt-20">
      <div className="glass-card relative overflow-hidden">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-pink-400 font-mono">03.</span>{' '}
          專屬十神家宅開運與軟裝指南
        </h2>
        <p className="text-sm text-zen-muted mb-6 leading-relaxed">
          結合您天生十神格局排名名列前茅的<strong>「{topGod}」</strong>與
          <strong>「{secondGod}」</strong>
          星宿，爲您定制最適配、更利於家族良性互動與和諧的居家開運佈置：
        </p>

        {/* 前兩名十神統計 */}
        <div className="flex gap-4 mb-6">
          {topTwoGods.map(([god, count], idx) => (
            <div
              key={god}
              className="flex-1 p-4 rounded-xl bg-zen-surface/60 border border-zen-border text-center"
            >
              <p className="text-xs text-zen-muted mb-1">
                十神最旺第 {idx + 1} 順位
              </p>
              <p className="text-lg font-bold text-pink-400">{god}</p>
              <p className="text-2xl font-bold text-zen-text font-mono mt-1">
                {count} <span className="text-xs text-zen-muted">主星</span>
              </p>
            </div>
          ))}
        </div>

        {/* 主要十神建議 */}
        {topAdvice && (
          <div className="p-5 rounded-2xl bg-zinc-950/45 border border-white/5 space-y-4 shadow-inner mb-4">
            <h4 className="text-sm font-bold text-pink-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <span className="animate-pulse"></span> 1. 主導家宅氣場：
              {topAdvice.title}
            </h4>
            <div className="space-y-3 text-xs text-zen-text leading-relaxed">
              <p>
                <strong className="text-pink-300">‍‍‍ 家族相處建議：</strong>
                <br />
                {topAdvice.advice}
              </p>
              <p className="border-t border-white/5 pt-3">
                <strong className="text-pink-300"> 家宅軟裝佈置：</strong>
                <br />
                {topAdvice.homeTip}
              </p>
            </div>
          </div>
        )}

        {/* 次要十神建議 */}
        {secondAdvice && (
          <div className="p-5 rounded-2xl bg-zinc-900/20 border border-white/5 space-y-4 shadow-inner">
            <h4 className="text-sm font-bold text-amber-500 flex items-center gap-1.5 border-b border-white/5 pb-2">
              2. 輔助調和磁場：{secondAdvice.title}
            </h4>
            <div className="space-y-3 text-xs text-zen-text leading-relaxed">
              <p>
                <strong className="text-amber-300">‍‍‍ 家族相處建議：</strong>
                <br />
                {secondAdvice.advice}
              </p>
              <p className="border-t border-white/5 pt-3">
                <strong className="text-amber-300"> 家宅軟裝佈置：</strong>
                <br />
                {secondAdvice.homeTip}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
