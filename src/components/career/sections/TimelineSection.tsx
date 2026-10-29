// src/components/career/sections/TimelineSection.tsx
// 歲運推演與化解 — 大運流年好壞運與化解建議（依命盤十神類別與格局強弱）。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import { ContentSection, ReasoningCard, UncertaintyNotice, type SectionGrammar, makeSection } from "../../../components/shared";
import CategoryTimelineRemedy from "../../CategoryTimelineRemedy";

const MAX_ACTIONS = 3;

interface TimelineSectionProps {
  chart: {
    dayMaster: string;
    birthYear: number;
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    hour: { gan: string; zhi: string };
  };
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  currentYear: number;
  currentAge: number;
  daYunList: Array<{
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
    ganZhi: string;
    gan: string;
    zhi: string;
    tenGod: string;
    element: string;
  }>;
  currentDaYun: {
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
    ganZhi: string;
    gan: string;
    zhi: string;
    tenGod: string;
    element: string;
  } | undefined;
}

export function TimelineSection({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  currentYear,
  currentAge,
  daYunList,
  currentDaYun,
}: TimelineSectionProps) {
  const sections: SectionGrammar[] = [
    makeSection(
      "當前大運與流年品質",
      2,
      `目前大運 ${currentDaYun?.ganZhi ?? "—"}，今年流年 ${currentYear} 年。`,
      {
        evidence: (
          <ReasoningCard label="大運推演" variant="default">
            <p className="text-xs text-zen-text leading-relaxed">
              當前年齡 {currentAge} 歲，處於大運
              <strong className="text-blue-400">
                {currentDaYun?.ganZhi ?? "未知"}
              </strong>
              （{currentDaYun?.startAge ?? 0}～{currentDaYun?.endAge ?? 0} 歲）。
            </p>
          </ReasoningCard>
        ),
        timeWindow: "以當前大運與流年為主，建議每三年複盤一次強弱變化。",
        actions: [
          "確認當前大運宮位",
          "對照流年好壞運",
          "擇定化解與行動方向",
        ].slice(0, MAX_ACTIONS),
      },
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-blue-400 font-mono">08.</span> 歲運推演與化解
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
        依命盤十神類別與格局強弱，推演出當前大運與流年的好壞運，並給出化解建議。
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <CategoryTimelineRemedy
        chart={chart as Parameters<typeof CategoryTimelineRemedy>[0]["chart"]}
        primaryPattern={primaryPattern}
        favorable={favorable}
        unfavorable={unfavorable}
        category="career"
        categoryTitle="事業"
      />
      <UncertaintyNotice>
        歲運推演依命盤五行生剋與大運流年推斷，實際走勢仍受個人選擇與環境影響，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}
