// src/components/career/sections/SynastrySection.tsx
// 職場人際與合盤觀測 — 十神團隊搭配與合盤觀察。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../../../components/shared";
import CategorySynastry from "../../CategorySynastry";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface SynastrySectionProps {
  chart: {
    dayMaster: string;
    year: { zhi: string };
    month: { zhi: string };
    day: { zhi: string };
    hour: { zhi: string };
  };
  partners: Array<{
    id?: string;
    name?: string;
    relationship?: string;
    gender?: string;
    birthDate?: string;
    birthTime?: string;
    chart?: {
      dayMaster: string;
      year: { zhi: string };
      month: { zhi: string };
      day: { zhi: string };
      hour: { zhi: string };
    };
  }>;
}

export function SynastrySection({ chart, partners }: SynastrySectionProps) {
  const sections: SectionGrammar[] = [
    section(
      "職場人際與合盤觀測",
      2,
      `與 ${partners.length} 位合作夥伴進行合盤觀測，分析職場人際互補與對撞。`,
      {
        evidence: (
          <ReasoningCard label="合盤依據" variant="default">
            <p className="text-xs text-zen-text leading-relaxed">
              依日主五行與地支關係，觀察您與合作夥伴的十神互補與能量場關係。{" "}
              {partners.length === 0 && "目前未設定合作夥伴，請新增夥伴資料以啟用合盤觀測。"}
            </p>
          </ReasoningCard>
        ),
        timeWindow: "依命盤先天結構與夥伴八字推斷，長期適用。",
        actions: [
          "新增合作夥伴八字資料",
          "對照十神互補關係",
          "評估職場合作適配度",
        ].slice(0, MAX_ACTIONS),
      },
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-blue-400 font-mono">10.</span> 職場人際與合盤觀測
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
        職場並非單打獨鬥。依命盤十神與地支關係，觀察您與合作夥伴的互補與對撞，找出最適合的團隊搭配與分工方式。
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <CategorySynastry
        chart={chart as Parameters<typeof CategorySynastry>[0]["chart"]}
        partners={partners as Parameters<typeof CategorySynastry>[0]["partners"]}
        category="career"
      />
      <UncertaintyNotice>
        職場人際與合盤觀測依八字五行生剋與十神關係推斷，實際合作關係仍受個人行為與環境影響，僅供參考，非絕對斷言。
      </UncertaintyNotice>
    </div>
  );
}
