// src/components/wealth/sections/DatesSection.tsx
// 專屬得財日預報 — 判斷依據（命盤十神分布）。
// 使用 ContentSection 固定文法：結論先行 → 依據 → 時間窗 → 3 個可執行動作 → 不確定處。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  type SectionGrammar,
  makeSection,
} from "../../../components/shared";
import { WEALTH_GUIDELINES } from "../../../data";

interface DatesSectionProps {
  tenGodCounts: Record<string, number>;
  sortedTenGods: [string, number][];
  topGod1: string;
  topCount1: number;
  topGod2: string;
  topCount2: number;
  isContinuum: boolean;
  patternLabel: string;
  isStrong: boolean;
  isWeak: boolean;
}

const WEALTH_RELATED_TEN_GODS: string[] = ["正財", "偏財", "食神", "傷官"];

export default function DatesSection({
  tenGodCounts,
  sortedTenGods,
  topGod1,
  topCount1,
  topGod2,
  topCount2,
  isContinuum,
  patternLabel,
  isStrong,
  isWeak,
}: DatesSectionProps) {
  // 命盤中與財星相關的十神分佈（作為得財日判斷的依據）。
  const wealthRelated = sortedTenGods.filter(([god]) =>
    WEALTH_RELATED_TEN_GODS.includes(god),
  );
  const totalWealthRelated = wealthRelated.reduce(
    (sum, [, count]) => sum + count,
    0,
  );

    const grammar: SectionGrammar = makeSection(
    "我是怎麼判斷的：命盤十神分布",
    2,
    `得財日依您日主五行與命盤十神分布判斷：以正財／偏財（我剋）與食神／傷官（生財）交會的流日為開運日，避開財星被沖、被合之日。`,
    {
      evidence: (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReasoningCard label="第一強十神" variant="default">
            <p className="text-xs text-zen-text">
              {topGod1}{topCount1 > 0 ? `（${topCount1}）` : ""}
            </p>
            <p className="text-xs text-zen-muted">
              {WEALTH_RELATED_TEN_GODS.includes(topGod1)
                ? "與財星相關，財氣較為直接。"
                : "非直接財星十神，得財需依食傷生財或外部來源。"}
            </p>
          </ReasoningCard>
          <ReasoningCard label="第二強十神" variant="muted">
            <p className="text-xs text-zen-text">
              {topGod2}{topCount2 > 0 ? `（${topCount2}）` : ""}
            </p>
            <p className="text-xs text-zen-muted">
              {WEALTH_RELATED_TEN_GODS.includes(topGod2)
                ? "亦與財星相關，可疊加判斷。"
                : "輔助判斷，以第一強十神為主。"}
            </p>
          </ReasoningCard>
          <ReasoningCard
            label="財星相關十神總計"
            variant={totalWealthRelated > 0 ? "accent" : "default"}
          >
            <p className="text-xs text-zen-text">{totalWealthRelated} 個</p>
            <p className="text-xs text-zen-muted">
              {wealthRelated.map(([god, count]) => `${god}×${count}`).join("、") ||
                "無"}
            </p>
          </ReasoningCard>
          <ReasoningCard label="格局與強弱" variant="default">
            <p className="text-xs text-zen-text">
              {patternLabel}
              {isContinuum ? "（連續體／偏平衡）" : ""}
            </p>
            <p className="text-xs text-zen-muted">
              {isStrong
                ? "身強，可擔財，宜順勢行動。"
                : isWeak
                  ? "身弱，財星為養命之源，宜謹慎選日、勿過度投機。"
                  : "偏平衡（連續體），宜以流年財星透出為最終依據。"}
            </p>
          </ReasoningCard>
          <ReasoningCard label="各日主好財日參考大綱" variant="muted">
            <ul className="text-[10px] text-zen-text list-disc pl-4 space-y-1">
              {Object.entries(WEALTH_GUIDELINES).map(([el, g]) => (
                <li key={el}>
                  {el}：{g.goodWealthDays.combinationsDetail.join("、")}
                </li>
              ))}
            </ul>
          </ReasoningCard>
        </div>
      ),
      timeWindow:
        "動態掃描未來 120 天流日，對照日主五行好財日干支大綱（依 WEALTH_GUIDELINES 與 ROMANCE_DAYS / CAREER_DAYS）。",
      actions: [
        "確認日主五行與對應財星天干地支",
        "對照未來 120 天得財日干支大綱擇日",
        "優先選正財／偏財或食傷生財交會之流日行動",
      ],
    },
  );

  return (
    <>
      <ContentSection grammar={grammar} defaultOpen />
      <UncertaintyNotice>
        得財日僅為命理參考，不構成投資或財務建議；實際簽約、投資仍應獨立評估風險與契約條款。
      </UncertaintyNotice>
    </>
  );
}
