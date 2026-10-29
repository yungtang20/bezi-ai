// src/components/family/sections/DecorSection.tsx
// 2026年子息宮催旺及佈置指南。
// 單一數據來源：src/data/charts/homeDecorGuide.ts 的 GENDER_PALACE_DECOR；不改動邏輯。
import React from "react";
import {
  ContentSection,
  SectionGrammar,
  makeSection,
} from "../../../components/shared";
import { Layers } from "lucide-react";
import { Gift } from "lucide-react";

const MAX_ACTIONS = 3;

interface DecorSectionProps {
  dayElement: string;
  isMale: boolean;
  childPalaceDecor: {
    palace: string;
    location: string;
    colors: string;
    items: string[];
    material: string;
    directions: string[];
    zodiac: string;
    zodiacMaterial: string;
  } | undefined;
}

export default function DecorSection({
  dayElement,
  isMale,
  childPalaceDecor,
}: DecorSectionProps) {
  return (
    <div className="space-y-6">
      <div className="glass-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
          <Layers size={80} />
        </div>
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-pink-400 font-mono">06.</span> 2026年 子息宮催旺與方位佈置指南
        </h2>
        <p className="text-sm text-zen-muted mb-4 leading-relaxed">
          依據學術講義<strong>《軟裝添運對照表》</strong>，不同日主命格對應子嗣與繁衍的子息位催旺。以下爲您命格天生五行屬性：<span className="text-pink-400 font-bold">{dayElement}命 ({isMale ? "男命" : "女命"})</span> 之專屬佈置，極其推薦在繁衍或求孕期於宅主臥鋪設：
        </p>

        {!childPalaceDecor ? (
          <p className="text-sm text-amber-500 font-bold">
            暫無適配之子息宮軟裝佈置，請與老師諮詢。
          </p>
        ) : (
          <ContentSection
            defaultOpen
            grammar={makeSection(
              "子息宮佈置核心",
              2,
              `${childPalaceDecor.location} 為子息宮佈置核心空間，2026年催旺方位：${childPalaceDecor.directions.join("、")}方。`,
              {
                evidence: (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                        <span className="text-xs text-pink-400 font-bold uppercase tracking-wider block mb-1">
                          📍 佈置核心空間
                        </span>
                        <p className="text-base text-zinc-100 font-semibold">
                          {childPalaceDecor.location}
                        </p>
                      </div>
                      <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                        <span className="text-xs text-pink-400 font-bold uppercase tracking-wider block mb-1">
                          🧭 2026年 催旺方位（宮位）
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {childPalaceDecor.directions.map((dir) => (
                            <span
                              key={dir}
                              className="px-2.5 py-1 text-xs font-extrabold bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded-full"
                            >
                              {dir}方
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4.5 bg-zinc-950/50 rounded-xl border border-white/5 space-y-3">
                      <span className="text-xs text-pink-400 font-bold block border-b border-white/5 pb-2">
                        📦 2026年 子息位軟裝添運擺設
                      </span>
                      <ul className="text-xs text-zinc-300 space-y-2">
                        {childPalaceDecor.items.map((item, index) => (
                          <li
                            key={index}
                            className="flex gap-2.5 leading-relaxed items-start"
                          >
                            <span
                              className="text-pink-400 text-[10px] bg-pink-500/10 px-1.5 py-0.5 rounded-full shrink-0 font-bold"
                            >
                              {index + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                      <Gift className="text-emerald-400 shrink-0" size={24} />
                      <div className="space-y-0.5">
                        <span className="text-xs text-emerald-400 font-bold block">
                          🧸 催旺開運生肖擺件：
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          生肖擺件：{childPalaceDecor.zodiac}（{childPalaceDecor.zodiacMaterial}）
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                      <span className="text-xs text-zinc-400 font-bold block">
                        🌊 財位/水缸佈局高階細節：
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        若本佈局配有小玻璃缸裝水<br />
                        （1） 勿加蓋，水不可帶死寂之氣，保持清新鮮爽，水量以容器 8 ~ 9 分滿爲宜。<br />
                        （2） 如使用馬達水桶，請維持一週更換一次水質，不帶雜質；如使用小水杯代替，務必每日晨起更換裝水。
                      </p>
                    </div>
                  </div>
                ),
                timeWindow: "依據《軟裝添運對照表》，2026年子息宮催旺佈置，長期適用。",
                actions: [
                  "確認佈置核心空間",
      "擺放催旺方位擺件",
      "依生肖擺件材質選擇",
                ].slice(0, MAX_ACTIONS),
              }
            )}
          />
        )}
      </div>
    </div>
  );
}
