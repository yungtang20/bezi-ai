// src/components/reference/WealthTab.tsx
// 財富 tab — 財星、求財方式與財位。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../shared";
import {
  WEALTH_GUIDELINES,
  WEALTH_PILLAR_MEANINGS,
  WEALTH_LOST_TIMING,
  SOLVE_MONEY_LOSS,
  NO_WEALTH_REMEDIES,
  WEALTH_REMEDIES_DATA,
  wealthCareers,
  type FiveElement,
} from "../../data";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface WealthTabProps {
  decorElement: "金" | "木" | "水" | "火" | "土";
  setDecorElement: React.Dispatch<React.SetStateAction<"金" | "木" | "水" | "火" | "土">>;
  decorGender: "男" | "女";
  setDecorGender: React.Dispatch<React.SetStateAction<"男" | "女">>;
  referenceFSYear: number;
  setReferenceFSYear: React.Dispatch<React.SetStateAction<number>>;
}

export default function WealthTab() {
  const elements: FiveElement[] = ["金", "木", "水", "火", "土"];

  return (
    <div className="space-y-6">
      {/* 日主財星規則 */}
      <ContentSection
        defaultOpen
        grammar={section(
          "日主財星與財位規則",
          2,
          "各日主對應的財星五行不同，財星天干地支與組合決定求財時機與方位。",
          {
            evidence: (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {elements.map((el) => {
                  const g = WEALTH_GUIDELINES[el];
                  return (
                    <ReasoningCard key={el} label={`日主 ${el}（財 ${g.wealthElement}）`} variant="default">
                      <p className="text-xs text-zen-text">財星天干：{g.wealthStems}</p>
                      <p className="text-xs text-zen-text">財星地支：{g.wealthBranches}</p>
                      <p className="text-xs text-zen-muted">好財日：{g.goodWealthDays.stems} / {g.goodWealthDays.branches}</p>
                      <p className="text-xs text-zen-accent mt-1">方位：{g.fengShui.directions.join("、")}</p>
                      <p className="text-xs text-zen-accent mt-1">顏色：{g.fengShui.colors}</p>
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "依日主五行長期適用，配合流年財星透出判斷。",
            actions: ["確認日主五行", "對照財星天干地支", "擇好財日行動"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 財位四柱含義 */}
      <ContentSection
        grammar={section(
          "四柱財位含義",
          3,
          "年月日時四柱各自代表不同財富來源層次。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(WEALTH_PILLAR_MEANINGS).map(([pillar, info]) => (
                  <ReasoningCard key={pillar} label={`${pillar}（${info.title}）`} variant="muted">
                    <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                      {info.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "先天命盤固定，長期適用。",
            actions: ["確認四柱財位宮", "對照對應財富來源", "評估財富根基"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 得財方式 */}
      <ContentSection
        grammar={section(
          "得財方式與財富機會",
          3,
          "不同十神組合對應不同得財途徑，無財星者仍可透過食傷生財等途徑獲財。",
          {
            evidence: (
              <div className="space-y-2">
                {Object.entries(NO_WEALTH_REMEDIES).map(([key, val]) => (
                  <ReasoningCard key={key} label={key} variant="default">
                    <p className="text-xs text-zen-text leading-relaxed">{val}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "依命盤十神組合判斷，長期適用。",
            actions: ["統計命盤十神類型", "對照得財方式", "選擇適合求財途徑"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 財富損失時機 */}
      <ContentSection
        grammar={section(
          "財富損失時機",
          3,
          "身強與身弱命盤在不同流年下財富損失原因不同，需提前防範。",
          {
            evidence: (
              <div className="grid gap-3">
                <ReasoningCard label="身強命盤" variant="default">
                  <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                    {WEALTH_LOST_TIMING.strong.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="身弱命盤" variant="muted">
                  <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                    {WEALTH_LOST_TIMING.weak.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "以大運與流年五行為準，結合日主強弱。",
            actions: ["判斷日主強弱", "監控財星被沖/合情況", "忌神運段避免重大財務決定"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 破財化解 */}
      <ContentSection
        grammar={section(
          "破財化解與主動破財",
          3,
          "透過保本投資、債務清償、佈施等主動破財，化解被動破財風險。",
          {
            evidence: (
              <div className="space-y-2">
                {SOLVE_MONEY_LOSS.map((item) => (
                  <ReasoningCard key={item.title} label={item.title} variant="accent">
                    <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                      {item.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "破財大運/流年段特別適用。",
            actions: ["評估當前流年財星狀態", "選擇主動破財方式", "補充用神能量"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 財富風水 */}
      <ContentSection
        grammar={section(
          "財富風水佈置",
          3,
          "依日主五行擺設財位，使用對應顏色、擺件與生肖催旺財運。",
          {
            evidence: (
              <div className="grid gap-3">
                {elements.map((el) => {
                  const r = WEALTH_REMEDIES_DATA[el];
                  return (
                    <ReasoningCard key={el} label={`日主 ${el}`} variant="muted">
                      <p className="text-xs text-zen-text">補運五行：{r.fengShui.remedyElement}</p>
                      <p className="text-xs text-zen-text">方位：{r.fengShui.directions}</p>
                      <p className="text-xs text-zen-text">顏色：{r.fengShui.colors}</p>
                      <p className="text-xs text-zen-muted">生肖：{r.fengShui.zodiacs}</p>
                      <p className="text-xs text-zen-accent mt-1">行動：{r.fengShui.actions.join("、")}</p>
                      <p className="text-xs text-zen-accent mt-1">幸運日：{r.fengShui.wealthLuckyDays.join("、")}</p>
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "依日主五行長期適用，流年財星臨旺時效果較佳。",
            actions: ["確認日主五行", "對照方位與顏色擺設", "擇幸運日進行財務行動"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 財富職業 */}
      <ContentSection
        grammar={section(
          "十神財富職業對照",
          3,
          "各十神代表不同得財模式與適合職業，財星多者適合理財相關工作。",
          {
            evidence: (
              <div className="grid gap-3">
                {wealthCareers.map((wc) => (
                  <ReasoningCard key={wc.tenGodName} label={`${wc.tenGodType}・${wc.tenGodName}`} variant="default">
                    <p className="text-xs text-zen-text">適合職業：{wc.suitableCareers}</p>
                    <p className="text-xs text-zen-muted">得財風格：{wc.wealthStyle}</p>
                    <p className="text-xs text-zen-accent mt-1">合作建議：{wc.partnerAdvice}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "依命盤主星十神判斷，長期適用。",
            actions: ["確認主星十神類型", "對照適合職業與得財風格", "評估合作夥伴條件"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      <UncertaintyNotice>
        財富分析依命盤財星與日主五行推斷，實際財務狀況尚受學歷、經驗、市場與個人選擇影響，僅供參考，非投資建議。
      </UncertaintyNotice>
    </div>
  );
}
