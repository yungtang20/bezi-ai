// src/components/reference/TimelineTab.tsx
// 大運流年 tab — 時間節奏、喜忌與補運。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../shared";
import { type FiveElement } from "../../data";
import {
  DAYUN_LIUNIAN_GUIDES,
  getDayunLiunianGuide,
  type Pattern,
} from "../../data/rules/dayunLiunian";
import {
  TIMELINE_GUIDELINES,
  type TimelineGuideline,
} from "../../data/rules/timelineGuidelines";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface TimelineTabProps {
  decorElement: "金" | "木" | "水" | "火" | "土";
  setDecorElement: React.Dispatch<React.SetStateAction<"金" | "木" | "水" | "火" | "土">>;
  decorGender: "男" | "女";
  setDecorGender: React.Dispatch<React.SetStateAction<"男" | "女">>;
  referenceFSYear: number;
  setReferenceFSYear: React.Dispatch<React.SetStateAction<number>>;
}

const PATTERNS: Pattern[] = ["身強", "身弱", "從強", "從弱"];
const ELEMENTS: FiveElement[] = ["木", "火", "土", "金", "水"];

export default function TimelineTab({
  decorElement,
  setDecorElement,
  decorGender,
  setDecorGender,
  referenceFSYear,
  setReferenceFSYear,
}: TimelineTabProps) {
  void decorElement;
  void setDecorElement;
  void decorGender;
  void setDecorGender;
  void referenceFSYear;
  void setReferenceFSYear;

  return (
    <div className="space-y-6">
      {/* 補運架構 */}
      <ContentSection
        defaultOpen
        grammar={section(
          "大運流年補運架構",
          2,
          "身強／從弱永遠補耗洩組；身弱／從強依大運走向決定補運組；從格求順勢。",
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="身強／從弱" variant="default">
                  <p className="text-xs text-zen-text">補運只有一組，永遠是耗洩組（財、官殺、食傷）。</p>
                  <p className="text-xs text-zen-muted mt-1">大運好壞、流年好壞均不改這一欄。</p>
                </ReasoningCard>
                <ReasoningCard label="身弱／從強" variant="muted">
                  <p className="text-xs text-zen-text">大運走生扶（印比）→ 補耗洩組，流年走耗洩反而標為好。</p>
                  <p className="text-xs text-zen-muted mt-1">大運走耗洩 → 補生扶組（印、比劫）。</p>
                </ReasoningCard>
                <ReasoningCard label="從格" variant="accent">
                  <p className="text-xs text-zen-text">求順勢不求解平衡；成格全好、破格全壞。</p>
                  <p className="text-xs text-zen-muted mt-1">從強的喜忌＝身弱，從弱的喜忌＝身強。</p>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "依日主五行與命盤格局判斷，配合大運與流年。",
            actions: ["確認日主五行與格局", "判斷當前大運走向", "對照補運組與方向"].slice(0, MAX_ACTIONS),
            uncertainty: "補運方向需以整體格局喜忌為準，不以單一五行斷定。",
          }
        )}
      />

      {/* 各五行補運指南 */}
      <ContentSection
        grammar={section(
          "各五行大運流年補運指南",
          3,
          "每個五行在不同格局下的好大運、壞大運與補運方向。",
          {
            evidence: (
              <div className="grid gap-3">
                {ELEMENTS.map((el: FiveElement) => {
                  const guides = DAYUN_LIUNIAN_GUIDES[el];
                  return (
                    <ReasoningCard key={el} label={`${el}行補運`} variant="default">
                      {PATTERNS.map((p: Pattern) => {
                        const g = guides[p];
                        return (
                          <div key={p} className="mb-2">
                            <p className="text-xs text-zen-text font-medium">{p}</p>
                            <p className="text-xs text-zen-muted">好大運：{g.goodDayun.join("、")}</p>
                            <p className="text-xs text-zen-muted">壞大運：{g.badDayun.join("、")}</p>
                            <p className="text-xs text-zen-accent mt-1">補運：{g.remedyAlways.join("、")}</p>
                          </div>
                        );
                      })}
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "依日主五行與格局，配合當前大運段判斷。",
            actions: ["確認日主五行", "對照各格局補運方向", "判斷當前大運好壞"].slice(0, MAX_ACTIONS),
            uncertainty: "補運方向需以整體格局喜忌為準，不以單一五行斷定。",
          }
        )}
      />

      {/* 當前流年補運 */}
      <ContentSection
        grammar={section(
          "當前流年補運建議",
          3,
          "依日主五行、格局與當前大運走向，給出具體補運建議。",
          {
            evidence: (
              <div className="grid gap-3">
                {ELEMENTS.map((el: FiveElement) => {
                  const strongGuide = getDayunLiunianGuide(el, "身強", true);
                  const weakGuide = getDayunLiunianGuide(el, "身弱", true);
                  return (
                    <ReasoningCard key={el} label={`${el}行（身強／身弱參考）`} variant="muted">
                      <p className="text-xs text-zen-text">身強補運（大運好）：{strongGuide.remedyWhenDayunGood.join("、")}</p>
                      <p className="text-xs text-zen-text">身強補運（大運壞）：{strongGuide.remedyWhenDayunBad.join("、")}</p>
                      <p className="text-xs text-zen-muted mt-1">身弱補運（大運好）：{weakGuide.remedyWhenDayunGood.join("、")}</p>
                      <p className="text-xs text-zen-muted mt-1">身弱補運（大運壞）：{weakGuide.remedyWhenDayunBad.join("、")}</p>
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: `流年 ${new Date().getFullYear()} 年，配合當前大運段。`,
            actions: ["確認日主五行與格局", "判斷當前大運走向", "執行對應補運方向"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 十神好壞運 */}
      <ContentSection
        grammar={section(
          "十神好壞運與影響",
          3,
          "不同十神類別在不同格局下的好運與壞運影響，附帶化解建議。",
          {
            evidence: (
              <div className="space-y-2">
                {TIMELINE_GUIDELINES.filter((g: TimelineGuideline) => g.type === "good").map((g: TimelineGuideline) => (
                  <ReasoningCard key={`${g.tenGodCategory}-good`} label={`${g.tenGodCategory}（好運）`} variant="default">
                    <p className="text-xs text-zen-text">{g.impact}</p>
                    <p className="text-xs text-zen-accent mt-1">建議：{g.remedy}</p>
                  </ReasoningCard>
                ))}
                {TIMELINE_GUIDELINES.filter((g: TimelineGuideline) => g.type === "bad").map((g: TimelineGuideline) => (
                  <ReasoningCard key={`${g.tenGodCategory}-bad-${g.targetPattern}`} label={`${g.tenGodCategory}（壞運・${g.targetPattern}）`} variant="muted">
                    <p className="text-xs text-zen-text">{g.impact}</p>
                    <p className="text-xs text-zen-accent mt-1">建議：{g.remedy}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "依十神類別與目標格局判斷，配合流年。",
            actions: ["統計命盤十神類別", "對照好壞運影響", "採取化解建議"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      <UncertaintyNotice>
        大運流年補運依傳統八字斷法，實際吉凶需結合整體命盤格局、用神與個人情況綜合判斷，僅供參考。
      </UncertaintyNotice>
    </div>
  );
}
