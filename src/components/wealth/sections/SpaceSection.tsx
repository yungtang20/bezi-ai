// src/components/wealth/sections/SpaceSection.tsx
// 2026財星催旺配置 — 依日主五行推演出專屬財位風水與空間軟裝對策（不論身強身弱，專為招商催旺）。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import { Compass } from "lucide-react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../../../components/shared";
import { GAN_TO_ELEMENT } from "../../../constants";
import { WEALTH_GUIDELINES } from "../../../data";
import type { FiveElement } from "../../../data/core/types";

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface SpaceSectionProps {
  /** 日主天干，用於查表對應的理致富財星與佈置建議。 */
  dayMaster: FiveElement;
}

export function SpaceSection({ dayMaster }: SpaceSectionProps) {
  const dmElement = GAN_TO_ELEMENT[dayMaster] || dayMaster;
  const guide = WEALTH_GUIDELINES[dayMaster];
  const { wealthElement, fengShui } = guide;

  const sections: SectionGrammar[] = [
    section(
      "2026年 財星催旺空間佈置指南",
      2,
      `日主${dayMaster}（${dmElement}命）的理致富財星為 ${wealthElement} 氣，2026年宜在住家客廳、個人辦公桌與辦公室強化 ${wealthElement} 氣場以招商催旺。`,
      {
        evidence: (
          <ReasoningCard label="財星五行與佈置場域">
            日主 <strong>{dayMaster}</strong> 對應的理致富財星五行為{" "}
            <strong>{wealthElement}</strong> 氣；建議重點佈置住家客廳、個人辦公桌與辦公室，不論身強或身弱皆適用。
          </ReasoningCard>
        ),
        timeWindow: "2026年（丙午年）全年佈置。",
        actions: fengShui.boostActions.slice(0, 3),
        uncertainty:
          "風水佈置為象徵性調整，與命理斷應分開；實際財務狀況仍憑個人經營、經驗與市場，僅供參考，非投資建議。",
      },
    ),
    section(
      "旺財色系與空間配置",
      3,
      `依 ${wealthElement} 氣屬性選用對應色系，強化財位空間磁場。`,
      {
        evidence: (
          <ReasoningCard label="旺財色系">{fengShui.colors}</ReasoningCard>
        ),
        actions: [
          `主要牆面或擺設採用 ${fengShui.colors}`,
          "財位保持明亮、不堆積雜物",
        ],
      },
    ),
    section(
      "專屬得財方位",
      3,
      `朝向 fengShui 所列方位擺設財星物品，催旺正財與偏財氣場。`,
      {
        evidence: (
          <ReasoningCard label="得財方位">
            {fengShui.directions.join("、")}
          </ReasoningCard>
        ),
        actions: ["在得財方位擺放財星五行對應物品", "保持該處通風與採光"],
      },
    ),
    section(
      "招財軟裝吉品與生肖開運物",
      3,
      "擺放對應五行的軟裝與生肖開運物，以土氣/木氣等媒介引動財星。",
      {
        evidence: (
          <>
            <ReasoningCard label="招財軟裝吉品">{fengShui.setup.join("、")}</ReasoningCard>
            <ReasoningCard label="攜身生肖開運物">{fengShui.luckyItems}</ReasoningCard>
          </>
        ),
        actions: ["依財星五行選擇對應擺件", "避免與剋泄財星之五行色系混擾"],
      },
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <Compass size={16} className="text-yellow-400" />
          <span className="text-yellow-400 font-mono">06.</span> 2026年 財星催旺配置
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依據日命主五行生剋關係，推演出您專屬的<strong>財位風水與空間軟裝加強對策</strong>（不論身強或身弱，專為招商催旺）：
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        財星催旺配置依日主五行與 2026 年飛星佈置推斷，實際效果仍受住宅格局與個人選擇影響，僅供文化參考，非風水實勘或投資建議。
      </UncertaintyNotice>
    </div>
  );
}
