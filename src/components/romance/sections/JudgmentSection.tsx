// src/components/romance/sections/JudgmentSection.tsx
// 命盤十神分布 — 我是怎麼判斷的。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../../../components/shared";
import { TEN_GOD_TRAITS, getCompatibilityRule } from "../../../data";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface JudgmentSectionProps {
  tenGodCounts: Record<string, number>;
  maxGodInfo: { name: string; count: number };
  selfCompatibility: ReturnType<typeof getCompatibilityRule>;
  isMale: boolean;
  dayZhi: string;
  dayZhiType: string;
}

export default function JudgmentSection({
  tenGodCounts,
  maxGodInfo,
  selfCompatibility,
  isMale,
  dayZhi,
  dayZhiType,
}: JudgmentSectionProps) {
  const sortedTenGods = Object.entries(tenGodCounts).sort(([, a], [, b]) => b - a);
  const total = Object.values(tenGodCounts).reduce((a, b) => a + b, 0);
  const topGod = sortedTenGods[0]?.[0] || "—";
  const topCount = sortedTenGods[0]?.[1] || 0;
  const secondGod = sortedTenGods[1]?.[0] || "—";
  const secondCount = sortedTenGods[1]?.[1] || 0;
  const topTrait = TEN_GOD_TRAITS[topGod];
  const compatibility = selfCompatibility;

  return (
    <div className="space-y-6">
      <ContentSection
        defaultOpen
        grammar={section(
          "命盤十神分布總覽",
          2,
          `命盤共 ${total} 位十神，${topGod} 出現 ${topCount} 次為最多，${secondGod} 出現 ${secondCount} 次為次多。`,
          {
            evidence: (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {sortedTenGods.map(([god, count]) => {
                  const t = TEN_GOD_TRAITS[god];
                  return (
                    <ReasoningCard
                      key={god}
                      label={`${god}（${count} 位，${((count / total) * 100).toFixed(0)}%）`}
                      variant="default"
                    >
                      {t ? (
                        <p className="text-xs text-zen-text leading-relaxed">{t.trait}</p>
                      ) : (
                        <p className="text-xs text-zen-muted">無特質說明</p>
                      )}
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "先天命盤固定，長期適用；大運與流年臨旺時效果更明顯。",
            actions: [
              "確認主星十神類型",
              "對照各十神特質",
              "評估強弱與格局",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <ContentSection
        grammar={section(
          "主星十神與自我相容",
          3,
          `主星 ${topGod}（${topCount} 位）為您最慣用的能量模式；${compatibility?.tenGodName} 類型的自我相容傾向：${compatibility?.traits ?? "—"}`,
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="主星十神" variant="accent">
                  <p className="text-xs text-zen-text">
                    {topGod} 出現 {topCount} 次，為命盤最強勢的十神，代表您最習慣、最常使用的能量模式。
                  </p>
                  {topTrait ? (
                    <p className="text-xs text-zen-muted mt-1">特質：{topTrait.trait}</p>
                  ) : null}
                </ReasoningCard>
                <ReasoningCard label="次要十神" variant="muted">
                  <p className="text-xs text-zen-text">
                    {secondGod} 出現 {secondCount} 次，為次要輔助能量，與主星共同塑造性格與行事風格。
                  </p>
                </ReasoningCard>
                {compatibility ? (
                  <ReasoningCard label="自我相容策略" variant="default">
                    <p className="text-xs text-zen-text leading-relaxed">
                      {compatibility.strategy}
                    </p>
                  </ReasoningCard>
                ) : null}
              </div>
            ),
            timeWindow: "先天格局固定，以大運流年透出主次十神時效果更明顯。",
            actions: [
              "確認主次十神類型",
              "對照自我相容策略",
              "觀察大運流年透出",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <ContentSection
        grammar={section(
          "日支夫妻宮特質",
          3,
          `日支 ${dayZhi} 屬 ${dayZhiType} 群組，夫妻宮呈現對應的伴侶外貌與性格傾向。`,
          {
            evidence: (
              <ReasoningCard label="夫妻宮地支" variant="default">
                <p className="text-xs text-zen-text leading-relaxed">
                  日支為夫妻宮，{dayZhi} 所屬的 {dayZhiType} 群組決定了伴侶的整體氣質與外貌傾向，也是感情穩定性的重要觀測點。
                </p>
              </ReasoningCard>
            ),
            timeWindow: "先天命盤固定，長期適用。",
            actions: [
              "確認日支地支屬性",
              "對照夫妻宮特質描述",
              "觀察夫妻宮與鄰近柱位互動",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <UncertaintyNotice>
        十神分布與自我相容判斷依命盤先天結構推斷，實際人生走向尚受後天大運、流年與個人選擇影響，僅供參考，非絕對斷語。
      </UncertaintyNotice>
    </div>
  );
}
