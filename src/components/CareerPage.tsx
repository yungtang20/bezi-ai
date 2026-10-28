// src/components/CareerPage.tsx
// 事業深度解析 — 薄協調層。所有計算邏輯已抽出至 useCareerLogic，呈現層僅渲染內容區塊。
import { useMemo } from "react";
import { Compass, Target, Shuffle, Sparkles, Users, Sparkle, Layers, Calendar, Briefcase } from "lucide-react";
import CategoryPageTemplate from "./CategoryPageTemplate";
import { BaziChart } from "../paipan";
import { useCareerLogic } from "./career/useCareerLogic";
import JudgmentSection from "./career/sections/JudgmentSection";
import { InherentSection } from "./career/sections/InherentSection";
import { WuxingSection } from "./career/sections/WuxingSection";
import { GodsSection } from "./career/sections/GodsSection";
import { CollabSection } from "./career/sections/CollabSection";
import { RemedySection } from "./career/sections/RemedySection";
import { DecorSection } from "./career/sections/DecorSection";
import DatesSection from "./career/sections/DatesSection";
import { TimelineSection } from "./career/sections/TimelineSection";
import { SynastrySection } from "./career/sections/SynastrySection";

interface Props {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];
  onNavigate?: (step: number) => void;
  partners?: Array<{
    id?: string;
    name?: string;
    relationship?: string;
    gender?: string;
    birthDate?: string;
    birthTime?: string;
  }>;
}

export default function CareerPage({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElement,
  weakestElements,
  onNavigate,
  partners,
}: Props) {
  const logic = useCareerLogic({ chart, primaryPattern, favorable, unfavorable, weakestElements });

  const menuItems = useMemo(
    () => [
      { id: "judgment", labelShort: "判斷依據", icon: Compass },
      { id: "inherent", labelShort: "職場角色", icon: Target },
      { id: "wuxing", labelShort: "日主轉職", icon: Shuffle },
      { id: "gods", labelShort: "十神開運", icon: Sparkles },
      { id: "collab", labelShort: "分工戰略", icon: Users },
      { id: "remedy", labelShort: "五行補運", icon: Sparkle },
      { id: "decor", labelShort: "軟裝佈局", icon: Layers },
      { id: "timeline", labelShort: "歲運推演", icon: Calendar },
      { id: "dates", labelShort: "工作旺日", icon: Briefcase },
      { id: "synastry", labelShort: "合盤觀測", icon: Users },
    ],
    [],
  );

  return (
    <CategoryPageTemplate
      title="事業深度解析"
      subtitle="Empirical Ten Gods Career Navigation & Feng Shui Optimizer"
      icon={Briefcase}
      accentColor="blue"
      menuItems={menuItems}
    >
      <div className="space-y-8">
        <JudgmentSection
          tenGodCount={logic.tenGodCount}
          sortedTenGods={logic.sortedTenGods}
          topGod1={logic.topGod1}
          topCount1={logic.topCount1}
          topGod2={logic.topGod2}
          topCount2={logic.topCount2}
          isContinuum={logic.isContinuum}
          patternLabel={logic.patternLabel}
          isStrong={logic.isStrong}
          isWeak={logic.isWeak}
          dmElement={logic.dmElement}
        />
        <InherentSection
          maxGod={logic.maxGod}
          secGod={logic.secGod}
          roleData={logic.roleData}
          careerInfo={logic.careerInfo}
          chartYearZhi={chart.year.zhi}
          dmElement={logic.dmElement}
          isContinuum={logic.isContinuum}
          patternLabel={logic.patternLabel}
        />
        <WuxingSection
          jobChangeAdvice={logic.jobChangeAdvice}
          dmElement={logic.dmElement}
          chartYearZhi={chart.year.zhi}
          chartMonthZhi={chart.month.zhi}
          chartDayZhi={chart.day.zhi}
          chartHourZhi={chart.hour.zhi}
        />
        <GodsSection
          maxGod={logic.maxGod}
          secGod={logic.secGod}
          topCount1={logic.topCount1}
          topCount2={logic.topCount2}
        />
        <CollabSection maxGod={logic.maxGod} secGod={logic.secGod} />
        <RemedySection
          chart={chart}
          primaryPattern={primaryPattern}
          weakestElements={weakestElements}
          dmElement={logic.dmElement}
        />
        <DecorSection dmElement={logic.dmElement} customCareerFengShui={logic.customCareerFengShui} />
        <TimelineSection
          chart={chart}
          primaryPattern={primaryPattern}
          favorable={favorable}
          unfavorable={unfavorable}
          currentYear={logic.currentYear}
          currentAge={logic.currentAge}
          daYunList={logic.daYunList}
          currentDaYun={logic.currentDaYun}
        />
        <DatesSection chart={chart} category="career" categoryName="事業" />
        <SynastrySection
          chart={{
            dayMaster: chart.dayMaster,
            year: { zhi: chart.year.zhi },
            month: { zhi: chart.month.zhi },
            day: { zhi: chart.day.zhi },
            hour: { zhi: chart.hour.zhi },
          }}
          partners={partners || []}
        />
      </div>
    </CategoryPageTemplate>
  );
}
