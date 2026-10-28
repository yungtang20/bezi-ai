// CareerTab — 事業 tab. 職業適配、轉職與職場互動。
// Same data values as src/data; no logic changes.
import React from "react";
import { ContentSection, ReasoningCard, UncertaintyNotice, SectionGrammar } from "../shared";
import {
  CAREER_GUIDELINES,
  BRANCH_CAREER_SUITABILITY,
  JOB_TRANSFER_TIMING,
  CAREER_CROSS_MATCHING,
  careerRoles,
  CAREER_REMEDIES_DATA,
  WORKPLACE_STRATEGIES,
} from "../../data";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

export default function CareerTab() {
  return (
    <div className="space-y-6">
      {/* 十神職業適配 */}
      <ContentSection
        defaultOpen
        grammar={section(
          "十神職業適配",
          2,
          "你的主星十神決定最適合的工作類型與發展方向。",
          {
            evidence: (
              <div className="grid gap-3">
                {careerRoles.map((role) => (
                  <ReasoningCard key={role.tenGodName} label={role.tenGodName} variant="default">
                    <p className="text-zen-text">{role.role}</p>
                    <p className="text-zen-muted">{role.suitable}</p>
                    <p className="text-zen-accent mt-1">{role.advice}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "長期適用，隨十神強弱與大運流年變動而微調。",
            actions: ["查看主星十神對應職業", "評估目前工作與十神契合度", "規劃職涯發展方向"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 日主事業補強 */}
      <ContentSection
        grammar={section(
          "日主事業補強",
          3,
          "以日主五行搭配官殺方位與顏色，提升事業運。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(CAREER_GUIDELINES).map(([dm, guide]) => (
                  <ReasoningCard key={dm} label={`日主 ${dm}`} variant="muted">
                    <p className="text-zen-text">官殺天干：{guide.goodDays.stems}</p>
                    <p className="text-zen-text">官殺地支：{guide.goodDays.branches}</p>
                    <p className="text-sm text-zen-muted">組合：{guide.goodDays.combinations.join("、")}</p>
                    <p className="text-sm text-zen-accent mt-1">補強行動：{guide.boostActions}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "長期適用，以日主五行為準。",
            actions: ["確認日主五行", "對照官殺天干地支", "執行事業補強行動"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 地支事業適性 */}
      <ContentSection
        grammar={section(
          "地支事業適性",
          3,
          "地支組合暗示適合動態還是靜態事業。",
          {
            evidence: (
              <div className="grid gap-3">
                {BRANCH_CAREER_SUITABILITY.map((item) => (
                  <ReasoningCard key={item.type} label={item.type} variant="muted">
                    <p className="text-zen-text">{item.trait}</p>
                    <ul className="text-zen-muted list-disc pl-4 space-y-1">
                      {item.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "根據命盤地支分布判斷，長期適用。",
            actions: ["統計命盤地支", "對照動態/靜態適性", "選擇工作型態"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 轉職時機 */}
      <ContentSection
        grammar={section(
          "轉職時機",
          3,
          "身強宜財官殺食傷流年轉職；身弱視大運幫扶而定。",
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="身強" variant="default">
                  <p>{JOB_TRANSFER_TIMING.strong}</p>
                </ReasoningCard>
                <ReasoningCard label="身弱（大運幫扶，五行平衡）" variant="muted">
                  <p>{JOB_TRANSFER_TIMING.weak_balanced}</p>
                </ReasoningCard>
                <ReasoningCard label="身弱（大運削弱，五行不平衡）" variant="muted">
                  <p>{JOB_TRANSFER_TIMING.weak_unbalanced}</p>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "以流年五行為準，結合日主強弱與大運。",
            actions: ["判斷日主強弱", "對照流年五行", "決定轉職時機"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 十神交叉配對 */}
      <ContentSection
        grammar={section(
          "十神交叉配對",
          3,
          "不同十神組合產生不同事業模式與得財途徑。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(CAREER_CROSS_MATCHING).map(([tenGodType, items]) => (
                  <ReasoningCard key={tenGodType} label={tenGodType} variant="muted">
                    {items.map((item) => (
                      <div key={item.title} className="mb-2">
                        <p className="text-sm text-zen-text font-medium">{item.title}</p>
                        <p className="text-sm text-zen-muted">{item.desc}</p>
                      </div>
                    ))}
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "長期適用，以命盤十神組合為準。",
            actions: ["確認主星與次要十神", "對照交叉配對說明", "確認得財途徑"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 事業風水 */}
      <ContentSection
        grammar={section(
          "事業風水",
          3,
          "依日主五行選擇事業位方位、顏色與擺件。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(CAREER_REMEDIES_DATA).map(([dm, remedy]) => (
                  <ReasoningCard key={dm} label={`日主 ${dm}`} variant="accent">
                    <p className="text-zen-text">事業五行：{remedy.careerElement}</p>
                    <p className="text-zen-text">方位：{remedy.directions}</p>
                    <p className="text-zen-text">顏色：{remedy.colors}</p>
                    <p className="text-sm text-zen-muted">生肖：{remedy.zodiacs}</p>
                    <p className="text-sm text-zen-accent mt-1">擺件：{remedy.decorations}</p>
                    <p className="text-sm text-zen-accent mt-1">行動：{remedy.actions}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "長期適用，依日主五行定事業位。",
            actions: ["確認日主五行", "對照方位與顏色", "擺放事業擺件"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 職場互動策略 */}
      <ContentSection
        grammar={section(
          "職場互動策略",
          3,
          "針對上級、同級、下屬的十神相處策略。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(WORKPLACE_STRATEGIES).map(([tenGodName, strategy]) => (
                  <ReasoningCard key={tenGodName} label={tenGodName} variant="default">
                    <p className="text-zen-text">{strategy.title}</p>
                    <p className="text-sm text-zen-muted">特質：{strategy.traits}</p>
                    <p className="text-sm text-zen-muted">與上級：{strategy.up}</p>
                    <p className="text-sm text-zen-muted">與同級：{strategy.same}</p>
                    <p className="text-sm text-zen-muted">與下屬：{strategy.down}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "長期適用，依十神名稱判斷。",
            actions: ["確認自身十神", "對照上級/同級/下屬策略", "調整職場相處方式"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      <UncertaintyNotice>
        事業分析依命盤十神與日主五行推斷，實際職涯尚受學歷、經驗、市場與個人選擇影響，僅供參考，非絕對預測。
      </UncertaintyNotice>
    </div>
  );
}
