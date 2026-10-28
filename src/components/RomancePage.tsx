// src/components/RomancePage.tsx
// 姻緣深度解析 — 薄協調層：邏輯交由 useRomanceLogic，呈現交由 sections。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import { useRomanceLogic } from "./romance/useRomanceLogic";
import CategoryPageTemplate from "./CategoryPageTemplate";
import type { PatternScores } from "../pattern";
import { BaziChart } from "../paipan";
import { Heart, ShieldAlert, Sparkles, Calendar, Compass, Sparkle } from "lucide-react";
import JudgmentSection from "./romance/sections/JudgmentSection";
import InherentSection from "./romance/sections/InherentSection";
import TimelineSection from "./romance/sections/TimelineSection";
import TripleSection from "./romance/sections/TripleSection";
import SynastrySection from "./romance/sections/SynastrySection";
import ObservationSection from "./romance/sections/ObservationSection";
import CrisisSection from "./romance/sections/CrisisSection";
import FengShuiSection from "./romance/sections/FengShuiSection";
import DatesSection from "./romance/sections/DatesSection";
import { PartnerInfo } from "../types";

interface Props {
  chart: BaziChart;
  scores: PatternScores;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];
  onNavigate?: (step: number) => void;
  partners?: PartnerInfo[];
}

export default function RomancePage({
  chart,
  scores,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElement,
  weakestElements,
  partners,
  onNavigate,
}: Props) {
  const {
    patternResult,
    patternLabel,
    isContinuum,
    isMale,
    dayZhi,
    dayZhiType,
    tenGodCounts,
    maxGodInfo,
    selfCompatibility,
    spouseStarScan,
    spouseTrait,
    spouseTenGodForTraits,
    tenGodTraitInfo,
    monthZhi,
    hourZhi,
    yearZhi,
    dayBranch,
    hasClash,
    hasPunishment,
    hasHarm,
    spouseStarHasClash,
    spouseStarHasPunishment,
    currentYear,
    currentAge,
    daYunList,
    currentDaYun,
    currentLiuNian,
    remedyKey,
    romanceRemedy,
    isCrisis,
    isGoodForBreakup,
    dayMasterElement,
    userFengShuiDetail,
  } = useRomanceLogic({ chart, primaryPattern, favorable, unfavorable, weakestElements });

  const menuItems = [
    { id: "judgment", label: "1. 我是怎麼判斷的", labelShort: "判斷依據", icon: Compass },
    { id: "congenital", label: "2. 先天姻緣特質", labelShort: "先天特質", icon: Heart },
    { id: "timeline", label: "3. 歲運推與化解", labelShort: "歲運推演", icon: Calendar },
    { id: "triple", label: "4. 三合桃花旺年", labelShort: "桃花旺年", icon: Sparkles },
    { id: "synastry", label: "5. 合盤適配判定", labelShort: "合盤適配", icon: Calendar },
    { id: "observation", label: "6. 姻緣觀測分析", labelShort: "姻緣觀測", icon: Compass },
    { id: "crisis", label: "7. 桃花危機與預警", labelShort: "危機預警", icon: ShieldAlert },
    { id: "fengshui", label: "8. 2026桃花催旺位", labelShort: "2026方位", icon: Sparkle },
    { id: "dates", label: "9. 近期專屬桃花日", labelShort: "桃花吉日", icon: Calendar },
  ];

  return (
    <CategoryPageTemplate
      title="姻緣深度解析"
      subtitle="Peach Blossom & Relationship Dynamics"
      icon={Heart}
      accentColor="rose"
      menuItems={menuItems}
    >
      <div className="space-y-8">
        <JudgmentSection
          tenGodCounts={tenGodCounts}
          maxGodInfo={maxGodInfo}
          selfCompatibility={selfCompatibility}
          isMale={isMale}
          dayZhi={dayZhi}
          dayZhiType={dayZhiType}
        />
        <InherentSection
          tenGodCounts={tenGodCounts}
          maxGodInfo={maxGodInfo}
          selfCompatibility={selfCompatibility}
          spouseStarScan={spouseStarScan}
          spouseTrait={spouseTrait}
          spouseTenGodForTraits={spouseTenGodForTraits}
          tenGodTraitInfo={tenGodTraitInfo}
          monthZhi={monthZhi}
          hourZhi={hourZhi}
          yearZhi={yearZhi}
          dayBranch={dayBranch}
          hasClash={hasClash}
          hasPunishment={hasPunishment}
          hasHarm={hasHarm}
          spouseStarHasClash={spouseStarHasClash}
          spouseStarHasPunishment={spouseStarHasPunishment}
        />
        <TimelineSection
          patternResult={patternResult}
          patternLabel={patternLabel}
          isContinuum={isContinuum}
          isMale={isMale}
          currentYear={currentYear}
          currentAge={currentAge}
          daYunList={daYunList}
          currentDaYun={currentDaYun}
          currentLiuNian={currentLiuNian}
          remedyKey={remedyKey}
          romanceRemedy={romanceRemedy}
          isCrisis={isCrisis}
          isGoodForBreakup={isGoodForBreakup}
          dayMasterElement={dayMasterElement}
        />
        <TripleSection chart={chart} />
        <SynastrySection chart={chart} primaryPattern={primaryPattern} partners={partners || []} />
        <ObservationSection
          chart={chart}
          monthZhi={monthZhi}
          hourZhi={hourZhi}
          yearZhi={yearZhi}
          dayBranch={dayBranch}
          hasClash={hasClash}
          hasPunishment={hasPunishment}
          hasHarm={hasHarm}
          spouseStarHasClash={spouseStarHasClash}
          spouseStarHasPunishment={spouseStarHasPunishment}
          dayMasterElement={dayMasterElement}
          isMale={isMale}
        />
        <CrisisSection
          chart={chart}
          isMale={isMale}
          currentDaYun={currentDaYun}
          currentLiuNian={currentLiuNian}
          primaryPattern={primaryPattern}
          patternLabel={patternLabel}
          isContinuum={isContinuum}
          romanceRemedy={romanceRemedy}
          weakestElements={weakestElements}
        />
        <FengShuiSection chart={chart} dayMasterElement={dayMasterElement} isMale={isMale} userFengShuiDetail={userFengShuiDetail} />
        <DatesSection chart={chart} category="romance" />
      </div>
    </CategoryPageTemplate>
  );
}
