// src/components/FamilyPage.tsx
// 家人深度解析 — 薄協調層。邏輯交由 useFamilyLogic，呈現交由 sections。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import { useMemo } from "react";
import { Compass, Users, Home, Calendar, Sparkles, Layers, Sparkle, Baby } from "lucide-react";
import { BaziChart } from "../paipan";
import { useFamilyLogic } from "./family/useFamilyLogic";
import CategoryPageTemplate from "./CategoryPageTemplate";
import JudgmentSection from "./family/sections/JudgmentSection";
import InherentSection from "./family/sections/InherentSection";
import GodsSection from "./family/sections/GodsSection";
import TimelineSection from "./family/sections/TimelineSection";
import RemedySection from "./family/sections/RemedySection";
import DecorSection from "./family/sections/DecorSection";
import DatesSection from "./family/sections/DatesSection";
import CategorySynastry from "./CategorySynastry";
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

export default function FamilyPage({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElement,
  weakestElements,
  partners,
  onNavigate,
}: Props) {
  const {
    isMale,
    dayElement,
    tenGodCount,
    sortedTenGods,
    maxGod,
    maxCount,
    familyRole,
    childStar,
    childLocation,
    childZhi,
    childZhiType,
    childTrait,
    isCesareanRisk,
    relations,
    hasSiblingStar,
    siblingFortune,
    catCounts,
    maxCat,
    matchingSiblingTrait,
    foodCount,
    hurtingCount,
    childPalaceDecor,
    upcomingMoveInDays,
    topGod,
    secondGod,
  } = useFamilyLogic({
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
      { id: "judgment", label: "1. 我是怎麼判斷的", labelShort: "判斷依據", icon: Compass },
      { id: "inherent", label: "2. 先天命盤特質", labelShort: "先天特質", icon: Users },
      { id: "guide", label: "3. 專屬家宅開運", labelShort: "家宅開運", icon: Home },
      { id: "timeline", label: "4. 歲運推演化解", labelShort: "歲運推演", icon: Calendar },
      { id: "remedy", label: "5. 家人補運指南", labelShort: "補運指南", icon: Sparkles },
      { id: "childpalace", label: "6. 2026子息催旺", labelShort: "子息催旺", icon: Layers },
      { id: "forecast", label: "7. 專屬入宅吉日", labelShort: "入宅預報", icon: Sparkle },
    ],
    [],
  );

  const partnerNames = partners?.map((p) => ({ name: p.name ?? "" })) ?? [];

  return (
    <CategoryPageTemplate
      title="家人深度解析"
      subtitle="Family Dynamics & Parenting Guide"
      icon={Baby}
      accentColor="rose"
      menuItems={menuItems}
    >
      <div className="space-y-8">
        {/* Section 1: 我是怎麼判斷的 */}
        <div id="judgment" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
            <Compass size={80} />
          </div>
          <JudgmentSection
            tenGodCount={tenGodCount}
            maxGod={maxGod}
            maxCount={maxCount}
          />
        </div>

        {/* Section 2: 先天命盤特質 */}
        <div id="inherent" className="scroll-mt-20 glass-card relative overflow-hidden">
          <InherentSection
            dayElement={dayElement}
            isMale={isMale}
            relations={relations}
            childStar={childStar}
            childLocation={childLocation}
            childZhi={childZhi}
            childZhiType={childZhiType}
            childTrait={childTrait}
            isCesareanRisk={isCesareanRisk}
            tenGodCount={tenGodCount}
          />
        </div>

        {/* Section 3: 專屬十神家宅開運指南 */}
        <div id="guide" className="scroll-mt-20">
          <GodsSection
            tenGodCount={tenGodCount}
            sortedTenGods={sortedTenGods}
            topGod={topGod}
            secondGod={secondGod || ""}
          />
        </div>

        {/* Section 4: 歲運推演與化解(家人) */}
        <div id="timeline" className="scroll-mt-20">
          <TimelineSection
            chart={chart}
            primaryPattern={primaryPattern}
            favorable={favorable}
            unfavorable={unfavorable}
          />
        </div>

        {/* Section 5: 家人補運指南 */}
        <div id="remedy" className="scroll-mt-20">
          <RemedySection
            chart={chart}
            primaryPattern={primaryPattern}
            weakestElements={weakestElements}
          />
        </div>

        {/* Section 6: 2026年 子息宮催旺及佈置指南 */}
        <div id="childpalace" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <DecorSection
            dayElement={dayElement}
            isMale={isMale}
            childPalaceDecor={childPalaceDecor}
          />
        </div>

        {/* Section 7: 流日專屬入宅吉日預報 */}
        <div id="forecast" className="scroll-mt-20">
          <DatesSection
            chart={chart}
            upcomingMoveInDays={upcomingMoveInDays}
            partners={partnerNames}
          />
        </div>

        {/* 合盤觀測 - 保留在最下方作爲家人輔助分析 */}
        <div className="border-t border-zen-border/50 pt-8">
          <CategorySynastry chart={chart} partners={partners || []} category="family" />
        </div>
      </div>
    </CategoryPageTemplate>
  );
}
