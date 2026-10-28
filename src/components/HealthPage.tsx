// src/components/HealthPage.tsx
// 健康深度解析 — 薄協調層。邏輯交由 useHealthLogic，呈現交由 sections。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import { useMemo } from "react";
import { Activity, Heart, Calendar, Sparkle, TrendingUp, Sparkles, Info, Compass } from "lucide-react";
import { BaziChart } from "../paipan";
import { useHealthLogic } from "./health/useHealthLogic";
import CategoryPageTemplate from "./CategoryPageTemplate";
import JudgmentSection from "./health/sections/JudgmentSection";
import InherentSection from "./health/sections/InherentSection";
import TimelineSection from "./health/sections/TimelineSection";
import WeakSection from "./health/sections/WeakSection";
import StrongSection from "./health/sections/StrongSection";
import RemedySection from "./health/sections/RemedySection";
import ExtremeSection from "./health/sections/ExtremeSection";
import DatesSection from "./health/sections/DatesSection";
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

export default function HealthPage({
  chart,
  primaryPattern,
  weakestElement,
  weakestElements,
  favorable,
  unfavorable,
  partners,
  onNavigate,
}: Props) {
  const {
    dmEl,
    elementCount,
    weakElements,
    excessElements,
    currentYear,
    currentDaYun,
    currentLiuNian,
    targetWeakest,
    daYunHealthDetails,
    combinedYearlyAnalysis,
    scannedDates,
  } = useHealthLogic({
    chart,
    primaryPattern,
    favorable,
    unfavorable,
    weakestElement,
    weakestElements,
    partners,
  });

  const menuItems = useMemo(
    () => [
      { id: "distribution", label: "1. 命盤五行分佈", labelShort: "五行分佈", icon: Activity },
      { id: "congenital", label: "2. 先天健康弱項", labelShort: "先天弱項", icon: Heart },
      { id: "timeline", label: "3. 歲運推演分析", labelShort: "歲運分析", icon: Calendar },
      { id: "weakness", label: "4. 能量偏弱觀察", labelShort: "能量偏弱", icon: Sparkle },
      { id: "excess", label: "5. 能量過旺防範", labelShort: "能量過旺", icon: TrendingUp },
      { id: "remedy", label: "6. 健康補運指南", labelShort: "補運指南", icon: Sparkles },
      { id: "extreme", label: "7. 極端能量流日", labelShort: "極端流日", icon: Info },
      { id: "clashed", label: "8. 最弱被剋流日", labelShort: "被剋流日", icon: Compass },
    ],
    [],
  );
  return (
    <CategoryPageTemplate
      title="健康深度解析"
      subtitle="Bazi Constitution & Wellness Guide"
      icon={Activity}
      accentColor="emerald"
      menuItems={menuItems}
    >
      <div className="space-y-8">

        {/* Section 1: 命盤五行分佈 */}
        <div id="distribution" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <JudgmentSection
            elementCount={elementCount}
            weakElements={weakElements}
            excessElements={excessElements}
          />
        </div>

        {/* Section 2: 先天健康弱項 */}
        <div id="congenital" className="scroll-mt-20 glass-card relative overflow-hidden">
          <InherentSection targetWeakest={targetWeakest} />
        </div>

        {/* Section 3: 歲運推演分析 */}
        <div id="timeline" className="scroll-mt-20 glass-card relative overflow-hidden">
          <TimelineSection
            currentYear={currentYear}
            currentDaYun={currentDaYun}
            currentLiuNian={currentLiuNian}
            targetWeakest={targetWeakest}
            daYunHealthDetails={daYunHealthDetails}
            combinedYearlyAnalysis={combinedYearlyAnalysis}
          />
        </div>

        {/* Section 4: 能量偏弱觀察 */}
        <div id="weakness" className="scroll-mt-20 glass-card relative overflow-hidden">
          <WeakSection weakElements={weakElements} />
        </div>

        {/* Section 5: 能量過旺觀察 */}
        <div id="excess" className="scroll-mt-20 glass-card relative overflow-hidden">
          <StrongSection excessElements={excessElements} elementCount={elementCount} />
        </div>

        {/* Section 6: 健康補運指南 */}
        <div id="remedy" className="scroll-mt-20 glass-card relative overflow-hidden">
          <RemedySection />
        </div>

        {/* Section 7: 極端能量流日 */}
        <div id="extreme" className="scroll-mt-20 glass-card relative overflow-hidden">
          <ExtremeSection dmEl={dmEl} extremeDaysList={scannedDates.extremeDaysList} />
        </div>

        {/* Section 8: 最弱五行被剋流日 */}
        <div id="clashed" className="scroll-mt-20 glass-card relative overflow-hidden">
          <DatesSection targetWeakest={targetWeakest} weakControlDaysList={scannedDates.weakControlDaysList} />
        </div>

      </div>
    </CategoryPageTemplate>
  );
}
