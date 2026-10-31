// src/components/WealthPage.tsx
// 財富深度解析 — 薄協調層：邏輯交由 useWealthLogic，呈現交由 sections。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import { BaziChart } from "../paipan";
import { useWealthLogic } from "./wealth/useWealthLogic";
import CategoryPageTemplate from "./CategoryPageTemplate";
import { Compass, Coins, Briefcase, Calendar, Sparkles, Layers, Sparkle } from "lucide-react";
import JudgmentSection from "./wealth/sections/JudgmentSection";
import { InherentSection } from "./wealth/sections/InherentSection";
import JobsSection from "./wealth/sections/JobsSection";
import { TimelineSection } from "./wealth/sections/TimelineSection";
import { RemedySection } from "./wealth/sections/RemedySection";
import { SpaceSection } from "./wealth/sections/SpaceSection";
import DatesSection from "./wealth/sections/DatesSection";
import { GAN_TO_ELEMENT } from "../constants";
import { type FiveElement } from "../data/core/types";
import { PartnerInfo } from "../types";

interface Props {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];
  partners?: PartnerInfo[];
  onNavigate?: (step: number) => void;
}

export default function WealthPage({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElements,
}: Props) {
  const {
    tenGodCounts,
    sortedTenGods,
    topGod1,
    topCount1,
    topGod2,
    topCount2,
    isStrong,
    isWeak,
    patternLabel,
    isContinuum,
    zhiCount,
    dominantZhiType,
  } = useWealthLogic({ chart, primaryPattern, favorable, unfavorable, weakestElements });

  const menuItems = [
    { id: "judgment", label: "1. 我是怎麼判斷的", labelShort: "判斷依據", icon: Compass },
    { id: "inherent", label: "2. 先天財富特質", labelShort: "先天特質", icon: Coins },
    { id: "jobs", label: "3. 專屬十神合適工作", labelShort: "合適工作", icon: Briefcase },
    { id: "timeline", label: "4. 歲運推演與化解", labelShort: "歲運推演", icon: Calendar },
    { id: "remedy", label: "5. 個人財富補運指南", labelShort: "補運指南", icon: Sparkles },
    { id: "space", label: "6. 2026財星催旺配置", labelShort: "風水佈置", icon: Layers },
    { id: "dates", label: "7. 專屬得財日預報", labelShort: "得財預報", icon: Sparkle },
  ];

  return (
    <CategoryPageTemplate
      title="財富深度解析"
      subtitle="Wealth Code & Financial Feng Shui"
      icon={Compass}
      accentColor="amber"
      menuItems={menuItems}
    >
      <div className="space-y-8">
        <JudgmentSection
          tenGodCounts={tenGodCounts}
          sortedTenGods={sortedTenGods}
          topGod1={topGod1}
          topCount1={topCount1}
          topGod2={topGod2}
          topCount2={topCount2}
          isContinuum={isContinuum}
          patternLabel={patternLabel}
          isStrong={isStrong}
          isWeak={isWeak}
        />
        <InherentSection
          tenGodCounts={tenGodCounts}
          sortedTenGods={sortedTenGods}
          topGod1={topGod1}
          topCount1={topCount1}
          topGod2={topGod2}
          topCount2={topCount2}
          isContinuum={isContinuum}
          patternLabel={patternLabel}
          isStrong={isStrong}
          isWeak={isWeak}
        />
        <JobsSection
          tenGodCounts={tenGodCounts}
          sortedTenGods={sortedTenGods}
          topGod1={topGod1}
          topCount1={topCount1}
          topGod2={topGod2}
          topCount2={topCount2}
          isContinuum={isContinuum}
          patternLabel={patternLabel}
          isStrong={isStrong}
          isWeak={isWeak}
          zhiCount={zhiCount}
          dominantZhiType={dominantZhiType}
        />
        <TimelineSection
          tenGodCounts={tenGodCounts}
          sortedTenGods={sortedTenGods}
          topGod1={topGod1}
          topCount1={topCount1}
          topGod2={topGod2}
          topCount2={topCount2}
          isContinuum={isContinuum}
          patternLabel={patternLabel}
          isStrong={isStrong}
          isWeak={isWeak}
        />
        <RemedySection
          weakestElements={weakestElements}
          dayMaster={chart.dayMaster}
          isStrong={isStrong}
          isWeak={isWeak}
        />
        <SpaceSection dayMaster={GAN_TO_ELEMENT[chart.dayMaster] as FiveElement} />
        <DatesSection
          tenGodCounts={tenGodCounts}
          sortedTenGods={sortedTenGods}
          topGod1={topGod1}
          topCount1={topCount1}
          topGod2={topGod2}
          topCount2={topCount2}
          isContinuum={isContinuum}
          patternLabel={patternLabel}
          isStrong={isStrong}
          isWeak={isWeak}
        />
      </div>
    </CategoryPageTemplate>
  );
}
