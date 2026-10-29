// src/components/romance/sections/DatesSection.tsx
// 近期專屬桃花日 — 依日主五行與性別推演出專屬桃花流日。
// 使用 ContentSection 固定文法：結論先行 → 依據 → 時間窗 → 3 個可執行動作 → 不確定處。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from "../../../components/shared";
import { LECTURE_DATA } from "../../../data";
import type { BaziChart } from "@bezi/core";
import { GAN_TO_ELEMENT } from "../../../constants";

const MAX_ACTIONS = 3;

interface DatesSectionProps {
  chart: BaziChart;
  category: string;
}

export default function DatesSection({ chart, category }: DatesSectionProps) {
  const dayMasterElement = GAN_TO_ELEMENT[chart.dayMaster] || "金";
  const gender = chart.gender;
  const romanceDays = LECTURE_DATA.ROMANCE_DAYS[gender as "男" | "女"]?.[
    dayMasterElement as keyof typeof LECTURE_DATA.ROMANCE_DAYS["男"]
  ];

  const combos = romanceDays?.combos ?? [];
  const gans = romanceDays?.gans ?? [];
  const zhis = romanceDays?.zhis ?? [];

  return (
    <div className="space-y-6">
      <ContentSection
        defaultOpen
        grammar={makeSection(
          "近期專屬桃花日",
          2,
          `日主 ${chart.dayMaster}（${dayMasterElement} ${gender}命），${combos.length} 個專屬桃花流日組合。`,
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="桃花流日" variant="default">
                  <p className="text-xs text-zen-text">
                    適用天干：{gans.join("、") || "—"}。
                  </p>
                  <p className="text-xs text-zen-text">
                    適用地支：{zhis.join("、") || "—"}。
                  </p>
                  <p className="text-xs text-zen-text">
                    推薦組合：{combos.join("、") || "—"}。
                  </p>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "依日主五行與性別對照 ROMANCE_DAYS 表，適用於近期選桃花日。",
            actions: [
              "確認日主五行與性別",
              "對照桃花流日天干地支",
              "選擇推薦組合作為桃花日",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <UncertaintyNotice>
        桃花流日依日主五行與性別對照表推斷，實際約會或表白成功仍受對方命盤與雙方大運流年影響，僅供參考。
      </UncertaintyNotice>
    </div>
  );
}
