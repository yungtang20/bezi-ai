// src/components/wealth/sections/TimelineSection.tsx
// 歲運推演與化解 — 大運流年好壞運與化解建議（依命盤十神類別與格局強弱）。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../../../components/shared";
import {
  TIMELINE_GUIDELINES,
  getTimelineGuideline,
  getTenGodCategory,
} from "../../../data";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface TimelineSectionProps {
  tenGodCounts: Record<string, number>;
  sortedTenGods: [string, number][];
  topGod1: string;
  topCount1: number;
  topGod2: string;
  topCount2: number;
  isContinuum: boolean;
  patternLabel: string;
  isStrong: boolean;
  isWeak: boolean;
}

/** 依格局強弱判斷單一十神在當前命盤下屬好神還是忌神。 */
function timelineQuality(
  god: string,
  { isContinuum, isStrong, isWeak }: { isContinuum: boolean; isStrong: boolean; isWeak: boolean },
): "good" | "bad" | "neutral" {
  if (!god) return "neutral";
  if (isContinuum) return "neutral"; // 從格求順勢，不以好壞斷
  const cat = getTenGodCategory(god);
  const weakening = ["財星", "官殺", "食傷"];
  const strengthening = ["印星", "比劫"];
  if (isStrong) return weakening.includes(cat) ? "good" : "bad";
  if (isWeak) return strengthening.includes(cat) ? "good" : "bad";
  return "neutral";
}

function qLabel(q: "good" | "bad" | "neutral") {
  return q === "good" ? "好神（喜見）" : q === "bad" ? "忌神（宜謹慎）" : "從格順勢（不以好壞斷）";
}

export function TimelineSection({
  tenGodCounts,
  sortedTenGods,
  topGod1,
  topCount1,
  topGod2,
  topCount2,
  isContinuum,
  patternLabel,
  isStrong,
  isWeak,
}: TimelineSectionProps) {
  const q1 = timelineQuality(topGod1, { isContinuum, isStrong, isWeak });
  const q2 = timelineQuality(topGod2, { isContinuum, isStrong, isWeak });
  const strengthLabel = isContinuum
    ? patternLabel
    : isStrong
      ? "身強"
      : isWeak
        ? "身弱"
        : "中和";

  const sections: SectionGrammar[] = [
    section(
      "命盤主星十神與歲運走向",
      2,
      `主星十神 ${topGod1}（${topCount1} 個）為 ${qLabel(q1)}，次要十神 ${topGod2 || "—"}（${topCount2} 個）為 ${qLabel(q2)}；整體格局 ${strengthLabel}，歲運以此為喜忌基準。`,
      {
        evidence: (
          <div className="grid gap-3 sm:grid-cols-2">
            <ReasoningCard label={`${topGod1} × ${topCount1}`} variant="default">
              <p className="text-xs text-zen-text">
                類別：{getTenGodCategory(topGod1) ?? "—"}，當前格局下為{" "}
                <span className={q1 === "good" ? "text-emerald-400" : q1 === "bad" ? "text-red-400" : "text-zen-muted"}>
                  {qLabel(q1)}
                </span>
                。
              </p>
              {q1 !== "neutral" && (
                <p className="text-xs text-zen-muted mt-1">
                  {getTimelineGuideline(topGod1, strengthLabel, q1)?.impact ?? "—"}
                </p>
              )}
            </ReasoningCard>
            {topGod2 ? (
              <ReasoningCard label={`${topGod2} × ${topCount2}`} variant="muted">
                <p className="text-xs text-zen-text">
                  類別：{getTenGodCategory(topGod2) ?? "—"}，當前格局下為{" "}
                  <span className={q2 === "good" ? "text-emerald-400" : q2 === "bad" ? "text-red-400" : "text-zen-muted"}>
                    {qLabel(q2)}
                  </span>
                  。
                </p>
                {q2 !== "neutral" && (
                  <p className="text-xs text-zen-muted mt-1">
                    {getTimelineGuideline(topGod2, strengthLabel, q2)?.impact ?? "—"}
                  </p>
                )}
              </ReasoningCard>
            ) : null}
          </div>
        ),
        timeWindow: "依命盤十神類別與格局強弱，配合大運與流年判斷。",
        actions: [
          "確認主星與次要十神類別",
          "對照格局喜忌與好壞運",
          "關注相應大運流年段",
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          "好壞運依十神類別與格局推斷，不同流派有差異，實際吉凶需結合整體命盤與用神綜合判斷，僅供參考。",
      },
    ),

    section(
      "十神好壞運與化解建議",
      3,
      "依十神類別與目標格局，列出對應的好運影響與壞運風險，並附化解建議。",
      {
        evidence: (
          <div className="space-y-2">
            {[topGod1, topGod2].filter(Boolean).map((god) => {
              const cat = getTenGodCategory(god);
              const good = TIMELINE_GUIDELINES.find(
                (g) => g.type === "good" && g.tenGodCategory === cat && (g.targetPattern === "all" || g.targetPattern === strengthLabel),
              );
              const bad = TIMELINE_GUIDELINES.find(
                (g) => g.type === "bad" && g.tenGodCategory === cat && g.targetPattern === strengthLabel,
              );
              return (
                <ReasoningCard key={god} label={`${god}（${cat}）`} variant="default">
                  {good ? (
                    <>
                      <p className="text-xs text-emerald-400 mb-1">好運：{good.impact}</p>
                      <p className="text-xs text-zen-accent mt-1">建議：{good.remedy}</p>
                    </>
                  ) : null}
                  {bad ? (
                    <>
                      <p className="text-xs text-red-400 mb-1 mt-2">壞運：{bad.impact}</p>
                      <p className="text-xs text-zen-accent mt-1">化解：{bad.remedy}</p>
                    </>
                  ) : null}
                </ReasoningCard>
              );
            })}
          </div>
        ),
        timeWindow: "依十神類別與目標格局判斷，配合流年。",
        actions: ["統計命盤十神類別", "對照好壞運影響", "採取化解建議"].slice(0, MAX_ACTIONS),
        uncertainty:
          "十神好壞運依講義速查表與格局對應，實際仍需結合大運流年與整體喜忌綜合判斷，僅供參考。",
      },
    ),

    section(
      "身強／身弱 運勢關鍵",
      3,
      `${strengthLabel} 命盤的歲運關鍵在於${isStrong ? "耗洩（財、官殺、食傷）為喜，生扶（印、比劫）為忌" : isWeak ? "生扶（印、比劫）為喜，耗洩（財、官殺、食傷）為忌" : "五行平衡，無明顯偏強偏弱"}。`,
      {
        evidence: (
          <ReasoningCard label="運勢關鍵" variant="default">
            <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
              {isStrong ? (
                <>
                  <li>喜財星、官殺、食傷大運與流年，利求財、升遷與表現。</li>
                  <li>忌印星、比劫大運，易產生壓力、破財或人際糾紛。</li>
                </>
              ) : isWeak ? (
                <>
                  <li>喜印星、比劫大運與流年，利貴人扶助與身體恢復。</li>
                  <li>忌財星、官殺、食傷大運，易漏財、壓力大或精神耗弱。</li>
                </>
              ) : (
                <li>五行中和，喜忌需依具體大運流年與五行強弱而定。</li>
              )}
              {isContinuum ? (
                <li className="text-zen-accent">為從格，順勢而為，不宜強行扶抑，以 ${patternLabel} 為準。</li>
              ) : null}
            </ul>
          </ReasoningCard>
        ),
        timeWindow: "依日主強弱與格局，配合當前大運段判斷。",
        actions: [
          "確認日主強弱狀態",
          "判斷當前大運走向",
          "執行對應補運方向",
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          "強弱與格局判斷依命盤五行生剋推斷，不同流派有差異，僅供參考，非絕對斷言。",
      },
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-yellow-400 font-mono">04.</span> 歲運推演與化解
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依據命盤十神分布與日主強弱，推演出您的<strong>歲運好壞與化解方向</strong>（以主星十神與格局為喜忌基準）：
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        歲運推演與化解依傳統八字斷法與講義速查表，實際吉凶需結合整體命盤格局、用神與個人情況綜合判斷，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}
