// src/components/health/sections/JudgmentSection.tsx
// 命盤五行分佈 — 健康頁第一區塊。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import React from "react";
import { Activity } from "lucide-react";

interface JudgmentSectionProps {
  elementCount: Record<string, number>;
  weakElements: string[];
  excessElements: string[];
}

export default function JudgmentSection({
  elementCount,
  weakElements,
  excessElements,
}: JudgmentSectionProps) {
  const wxColors: Record<string, string> = {
    木: "#22C55E",
    火: "#EF4444",
    土: "#F59E0B",
    金: "#94A3B8",
    水: "#3B82F6",
  };

  return (
    <div id="distribution" className="scroll-mt-20 glass-card relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
        <Activity size={80} />
      </div>
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-emerald-400 font-mono">01.</span> 命盤五行分佈
      </h2>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依據講義核心健康準則：<strong>「健康不看合化、身強身弱，直接看命盤中最少或沒有的五行。」</strong> 命盤中的八字，純個數盤點，不數地支藏干。
      </p>

      {/* Counts Visualizer */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {Object.entries(elementCount).map(([el, count]) => (
          <div key={el} className="p-4 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col justify-between">
            <span className="text-xs text-zen-muted font-bold mb-1">屬{el}個數</span>
            <span className="text-3xl font-extrabold" style={{ color: wxColors[el] }}>
              {count}
            </span>
            <span className="text-[10px] text-zen-muted mt-2">
              {count === 0 ? "⚠️ 完全缺失" : count === 1 ? "⚡ 偏弱易克" : count >= 3 ? "🔥 過旺亢盛" : "穩定"}
            </span>
          </div>
        ))}
      </div>

      {/* Principles Details */}
      <div className="bg-zen-surface/30 p-3 rounded-xl border border-zen-border space-y-2 text-xs text-zen-muted leading-relaxed">
        <div className="flex gap-2">
          <span className="text-amber-400 font-mono">規則一：</span>
          <p>
            <strong>五行為 0 個</strong>：依命理規則列為長期觀察重點，可留意相關生活習慣與身體感受。
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-amber-400 font-mono">規則二：</span>
          <p>
            <strong>五行各 1 個</strong>：依命理規則列為較弱觀察點。若原局同時有某一強旺五行（個數 ≥ 3），可特別留意被剋五行所對應的生活與身體狀態。
          </p>
        </div>
      </div>
    </div>
  );
}
