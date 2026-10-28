// src/components/career/sections/RemedySection.tsx
// 個人事業五行補運 — ElementRemedyCard 包裝。
import React from "react";
import { ContentSection, ReasoningCard, UncertaintyNotice, SectionGrammar } from "../../../components/shared";
import ElementRemedyCard from "../../ElementRemedyCard";
import { CAREER_REMEDIES_DATA } from "../../../data";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface RemedySectionProps {
  chart: { dayMaster: string };
  primaryPattern: string;
  weakestElements: string[];
  dmElement: string;
}

export function RemedySection({
  chart,
  primaryPattern,
  weakestElements,
  dmElement,
}: RemedySectionProps) {
  const primaryWeak = weakestElements[0] || dmElement;

  const sections: SectionGrammar[] = [
    section(
      "個人事業五行補運",
      2,
      `依據日主「${chart.dayMaster}」(${dmElement}) 與最弱五行「${primaryWeak}」，針對事業宮位（官殺方位）進行補運。`,
      {
        evidence: (
          <ReasoningCard label="命盤依據">
            <p>日主五行：{chart.dayMaster}（{dmElement}）</p>
            <p>首要補足五行：{primaryWeak}</p>
            <p>補運類別：事業（官殺方位補運）</p>
          </ReasoningCard>
        ),
        timeWindow: "以當前大運與流年為主，建議每三年複盤一次強弱變化。",
        actions: ["確認日主五行屬性", "對照最弱五行補強方向", "佈置事業官殺方位"].slice(0, MAX_ACTIONS),
        uncertainty:
          "補運為參考建議，實際效果仍隨大運、流年與個人行為而異；不構成絕對財務或人生指導。",
      },
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-blue-400 font-mono">06.</span> 個人事業五行補運
        </h2>
      </div>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <ElementRemedyCard
        chart={chart as any}
        primaryPattern={primaryPattern}
        weakestElements={weakestElements}
        category="career"
        accentColor="text-blue-400"
        accentBg="bg-blue-500/10"
        accentBorder="border-blue-500/20"
        categoryLabel="事業"
      />
      <UncertaintyNotice>
        事業補運依八字五行生剋推斷，實際效果仍隨大運、流年與個人行為而異，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}
