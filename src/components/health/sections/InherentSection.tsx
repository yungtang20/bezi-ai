// src/components/health/sections/InherentSection.tsx
// 先天健康弱項 — 健康頁第二區塊。
// 內容僅用 src/data 僅讀引用，不改動邏輯。
import React from "react";
import { ShieldAlert } from "lucide-react";
import { getHealthRemedy, HEALTH_DATA } from "../../../data";

interface InherentSectionProps {
  targetWeakest: string[];
}

export default function InherentSection({ targetWeakest }: InherentSectionProps) {
  const wxColors: Record<string, string> = {
    木: "#22C55E",
    火: "#EF4444",
    土: "#F59E0B",
    金: "#94A3B8",
    水: "#3B82F6",
  };

  return (
    <div id="congenital" className="scroll-mt-20 glass-card relative overflow-hidden">
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-emerald-400 font-mono">02.</span> 先天健康弱項
      </h2>

      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
          <ShieldAlert size={18} />
          <span>命理觀察：較需留意的五行</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-3">
          {targetWeakest.map(el => (
            <span key={el} className="px-3 py-1 rounded-lg text-xs font-black text-white" style={{ backgroundColor: `${wxColors[el]}40`, border: `1px solid ${wxColors[el]}` }}>
              {el} 氣
            </span>
          ))}
        </div>
        <p className="text-xs text-zen-text leading-relaxed">
          經由五行個數盤點，以下是命理規則建議優先觀察的部位與生活面向，不代表醫療診斷或疾病預測。
        </p>
      </div>

      <div className="space-y-4">
        {targetWeakest.map(el => {
          const remedy = getHealthRemedy(el);
          const weakDetails = HEALTH_DATA.WEAK_ADVICE[el as keyof typeof HEALTH_DATA.WEAK_ADVICE];

          return (
            <div key={el} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-serif" style={{ color: wxColors[el] }}>
                  {el}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-zen-muted font-mono">先天較弱觀察點</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zen-muted block">對應器官與系統：</span>
                  <strong className="text-zen-text text-sm block">
                    {weakDetails?.organs || remedy?.organs || HEALTH_DATA.ORGANS[el as keyof typeof HEALTH_DATA.ORGANS]}
                  </strong>
                </div>
                <div className="space-y-1">
                  <span className="text-zen-muted block">命理資料列出的可能感受：</span>
                  <p className="text-zen-text leading-relaxed font-semibold">
                    {weakDetails?.symptoms || remedy?.weakSymptoms}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
