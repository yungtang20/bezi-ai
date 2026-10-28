// src/components/romance/sections/InherentSection.tsx
// 先天姻緣特質 — 夫妻星位置、伴侶特質、夫妻宮衝刑害。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../../../components/shared";
import { TEN_GOD_TRAITS, getSpouseTrait, ZHI_TO_ZODIAC, getCompatibilityRule } from "../../../data";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface InherentSectionProps {
  tenGodCounts: Record<string, number>;
  maxGodInfo: { name: string; count: number };
  selfCompatibility: ReturnType<typeof getCompatibilityRule>;
  spouseStarScan: {
    star: string;
    location: string;
    pillarGanZhi: string;
    tenGod: string;
    index: number;
  } | null;
  spouseTrait: ReturnType<typeof getSpouseTrait>;
  spouseTenGodForTraits: string;
  tenGodTraitInfo: typeof TEN_GOD_TRAITS[keyof typeof TEN_GOD_TRAITS] | null;
  monthZhi: string;
  hourZhi: string;
  yearZhi: string;
  dayBranch: string;
  hasClash: boolean;
  hasPunishment: boolean;
  hasHarm: boolean;
  spouseStarHasClash: boolean;
  spouseStarHasPunishment: boolean;
}

export default function InherentSection({
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
}: InherentSectionProps) {
  const zodiac = ZHI_TO_ZODIAC[dayBranch];
  const spouseStarTrait = TEN_GOD_TRAITS[spouseTenGodForTraits];

  const sections = [
    section(
      "夫妻星位置與身分",
      2,
      spouseStarScan
        ? `夫妻星 ${spouseStarScan.star} 位於 ${spouseStarScan.location}（${spouseStarScan.pillarGanZhi}），${spouseStarScan.tenGod} 為您的配偶星。`
        : "命盤中未發現明顯夫妻星，配偶星可能隱伏於地支藏干中。",
      {
        evidence: spouseStarScan ? (
          <ReasoningCard label="夫妻星" variant="accent">
            <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
              <li>星位：{spouseStarScan.star}</li>
              <li>位置：{spouseStarScan.location}</li>
              <li>干支：{spouseStarScan.pillarGanZhi}</li>
              <li>十神：{spouseStarScan.tenGod}</li>
            </ul>
          </ReasoningCard>
        ) : (
          <ReasoningCard label="夫妻星" variant="muted">
            <p className="text-xs text-zen-text">
              未在天干或地支主氣中發現明顯夫妻星，需進一步檢視地支藏干。
            </p>
          </ReasoningCard>
        ),
        timeWindow: "先天命盤固定，長期適用。",
        actions: [
          "確認夫妻星所在柱位",
          "對照夫妻星十神特質",
          "觀察夫妻星與其他柱位互動",
        ].slice(0, MAX_ACTIONS),
      },
    ),
    section(
      "伴侶性格與外貌特質",
      3,
      `配偶星 ${spouseTenGodForTraits} 的特質：${tenGodTraitInfo?.trait ?? "—"}`,
      {
        evidence: (
          <div className="space-y-2">
            {spouseTrait ? (
              <ReasoningCard label="伴侶性格" variant="default">
                <p className="text-xs text-zen-text">{spouseTrait.personality}</p>
              </ReasoningCard>
            ) : null}
            {spouseTrait ? (
              <ReasoningCard label="伴侶外貌" variant="muted">
                <p className="text-xs text-zen-text">{spouseTrait.appearance}</p>
              </ReasoningCard>
            ) : null}
            {spouseStarTrait ? (
              <ReasoningCard label="配偶星特質" variant="default">
                <p className="text-xs text-zen-text">
                  {spouseStarTrait.trait}
                  {spouseStarTrait.category ? `（類別：${spouseStarTrait.category}）` : ""}
                </p>
              </ReasoningCard>
            ) : null}
          </div>
        ),
        timeWindow: "先天固定，長期適用。",
        actions: [
          "確認配偶星十神類型",
          "對照伴侶性格與外貌描述",
          "評估與自身十神的互動模式",
        ].slice(0, MAX_ACTIONS),
      },
    ),
    section(
      "夫妻宮衝刑害檢視",
      3,
      `夫妻宮 ${dayBranch}（${zodiac ? zodiac + "年" : "—"}${
        hasClash || hasPunishment || hasHarm ? "，存在衝刑害互動" : "，無明顯衝刑害"
      }。`,
      {
        evidence: (
          <div className="space-y-2">
            <ReasoningCard label="夫妻宮地支" variant="default">
              <p className="text-xs text-zen-text">
                {dayBranch} 作為夫妻宮，對應生肖 {zodiac ?? "—"}，是感情宮位的核心指標。
              </p>
            </ReasoningCard>
            {hasClash ? (
              <ReasoningCard label="相沖" variant="accent">
                <p className="text-xs text-zen-text">
                  夫妻宮與鄰近地支發生相沖，易晚婚或對象在外地認識，感情易有變動。
                </p>
              </ReasoningCard>
            ) : null}
            {hasPunishment ? (
              <ReasoningCard label="相刑" variant="accent">
                <p className="text-xs text-zen-text">
                  夫妻宮與鄰近地支相刑，易口角爭執，需多磨合相處。
                </p>
              </ReasoningCard>
            ) : null}
            {hasHarm ? (
              <ReasoningCard label="相害" variant="muted">
                <p className="text-xs text-zen-text">
                  夫妻宮與鄰近地支相害，影響夫妻關係，易產生摩擦與情緒不悅。
                </p>
              </ReasoningCard>
            ) : null}
            {!hasClash && !hasPunishment && !hasHarm ? (
              <ReasoningCard label="無明顯衝刑害" variant="default">
                <p className="text-xs text-zen-text">
                  夫妻宮與鄰近地支無明顯衝、刑、害關係，感情宮位相對穩定。
                </p>
              </ReasoningCard>
            ) : null}
          </div>
        ),
        timeWindow: "先天命盤固定，大運流年臨沖刑害年份時效果更明顯。",
        actions: [
          "確認夫妻宮地支屬性",
          "檢視衝刑害與鄰近柱位",
          "評估感情穩定性與變動時機",
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          hasClash || hasPunishment || hasHarm
            ? "夫妻宮衝刑害代表感情可能有波動，但實際影響仍需結合大運流年與個人經營判斷，非絕對斷言。"
            : "夫妻宮特質僅供參考，實際感情關係仍受後天運勢與個人選擇影響。",
      },
    ),
    section(
      "夫妻星衝刑檢視",
      3,
      `夫妻星所在柱位與鄰近地支${
        spouseStarHasClash || spouseStarHasPunishment ? "存在衝刑互動" : "無明顯衝刑"
      }。`,
      {
        evidence: (
          <div className="space-y-2">
            {spouseStarHasClash ? (
              <ReasoningCard label="夫妻星相沖" variant="accent">
                <p className="text-xs text-zen-text">
                  夫妻星與鄰近地支相沖，易遠距離戀愛或感情變動較大。
                </p>
              </ReasoningCard>
            ) : null}
            {spouseStarHasPunishment ? (
              <ReasoningCard label="夫妻星相刑" variant="accent">
                <p className="text-xs text-zen-text">
                  夫妻星與鄰近地支相刑，感情易產生爭執與糾紛。
                </p>
              </ReasoningCard>
            ) : null}
            {!spouseStarHasClash && !spouseStarHasPunishment ? (
              <ReasoningCard label="夫妻星穩定" variant="default">
                <p className="text-xs text-zen-text">
                  夫妻星與鄰近地支無明顯衝刑關係，配偶星表現相對穩定。
                </p>
              </ReasoningCard>
            ) : null}
          </div>
        ),
        timeWindow: "先天命盤固定，大運流年臨沖刑年份時效果更明顯。",
        actions: [
          "確認夫妻星柱位與地支",
          "檢視夫妻星與鄰近柱位互動",
          "評估感情穩定性風險",
        ].slice(0, MAX_ACTIONS),
      },
    ),
    section(
      "先天姻緣特質綜合",
      3,
      `綜合 ${maxGodInfo.name} 主星與配偶星 ${spouseTenGodForTraits}，您的先天姻緣特質傾向於 ${
        selfCompatibility ? selfCompatibility.traits : "—"
      }。`,
      {
        evidence: (
          <ReasoningCard label="綜合判斷" variant="default">
            <p className="text-xs text-zen-text leading-relaxed">
              命盤以 {maxGodInfo.name} 為主星，配偶星為 {spouseTenGodForTraits}。
              先天姻緣特質應順應命盤原始結構，勿強求不合之緣。
            </p>
          </ReasoningCard>
        ),
        timeWindow: "先天固定，長期適用。",
        actions: [
          "確認主星與配偶星類型",
          "對照適合的相處模式",
          "避免與命盤忌神衝突",
        ].slice(0, MAX_ACTIONS),
      },
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-rose-400 font-mono">02.</span> 先天姻緣特質
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依據命盤夫妻星位置、伴侶特質與夫妻宮衝刑害，推演出您的<strong>先天姻緣特質</strong>：
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        先天姻緣特質依命盤夫妻星與夫妻宮地支推斷，實際感情關係尚受大運、流年與個人選擇影響，僅供參考，非絕對斷言。
      </UncertaintyNotice>
    </div>
  );
}
