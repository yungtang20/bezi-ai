// src/components/reference/FriendsTab.tsx
// 人際 tab — 朋友、合作與相處策略。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../shared";
import {
  COMPANION_MATCHING,
  COMPANION_ZODIAC,
  BIRTHPLACE_COMPANION,
  CONG_PATTERN_COMPANION,
  BUSINESS_PATTERN,
  COMMUNICATION_STYLES,
  WORKPLACE_STRATEGIES,
  getCompanionAdvice,
  getCommunicationStyle,
  getWorkplaceType,
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

interface FriendsTabProps {
  decorElement: "金" | "木" | "水" | "火" | "土";
  setDecorElement: React.Dispatch<React.SetStateAction<"金" | "木" | "水" | "火" | "土">>;
  decorGender: "男" | "女";
  setDecorGender: React.Dispatch<React.SetStateAction<"男" | "女">>;
  referenceFSYear: number;
  setReferenceFSYear: React.Dispatch<React.SetStateAction<number>>;
}

export default function FriendsTab() {
  const dayMasters = ["金", "木", "水", "火", "土"];
  const patterns = ["身強", "身弱", "從強", "從弱"];

  return (
    <div className="space-y-6">
      {/* 日主互補夥伴 */}
      <ContentSection
        defaultOpen
        grammar={section(
          "日主互補夥伴選擇",
          2,
          "依日主五行與格局尋找互補五行的朋友與合夥人，達成順勢而為。",
          {
            evidence: (
              <div className="grid gap-3 sm:grid-cols-2">
                {dayMasters.map((dm) => {
                  const strong = COMPANION_MATCHING.find((c) => c.dayMaster === dm && c.pattern === "身強");
                  const weak = COMPANION_MATCHING.find((c) => c.dayMaster === dm && c.pattern === "身弱");
                  return (
                    <ReasoningCard key={dm} label={`${dm}命人`} variant="default">
                      {strong && (
                        <p className="text-xs text-zen-text">身強互補：{strong.complementaryElement}（{strong.complementaryDayMasters.join("、")}）</p>
                      )}
                      {weak && (
                        <p className="text-xs text-zen-muted mt-1">身弱互補：{weak.complementaryElement}（{weak.complementaryDayMasters.join("、")}）</p>
                      )}
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "依命盤日主與格局判斷，長期適用。",
            actions: ["確認日主五行與格局", "對照互補五行與日主", "選擇互補型朋友或合夥人"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 格局夥伴 */}
      <ContentSection
        grammar={section(
          "從格夥伴原則",
          3,
          "從強與身強找相同屬性；從弱與身弱找相同屬性，順勢而為找貴人朋友。",
          {
            evidence: (
              <ReasoningCard label="從格原則" variant="muted">
                <p className="text-xs text-zen-text">{CONG_PATTERN_COMPANION.fromStrong}</p>
                <p className="text-xs text-zen-text mt-1">{CONG_PATTERN_COMPANION.fromWeak}</p>
                <p className="text-xs text-zen-accent mt-1">原則：{CONG_PATTERN_COMPANION.principle}</p>
              </ReasoningCard>
            ),
            timeWindow: "依命盤格局判斷，長期適用。",
            actions: ["確認命盤格局", "套用從格夥伴原則", "尋找貴人類朋友"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 互補生肖 */}
      <ContentSection
        grammar={section(
          "互補生肖對照",
          3,
          "依日主強弱與五行，對應互補的生肖朋友與合夥人。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(COMPANION_ZODIAC).map(([key, val]) => (
                  <ReasoningCard key={key} label={key} variant="muted">
                    <p className="text-xs text-zen-text">五行：{val.elements.join("、")}</p>
                    <p className="text-xs text-zen-muted mt-1">生肖：{val.zodiacs.join("、")}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "依日主強弱判斷，長期適用。",
            actions: ["確認日主強弱", "對照互補生肖", "選擇對應生肖夥伴"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 出生地貴人 */}
      <ContentSection
        grammar={section(
          "出生地貴人與夥伴",
          3,
          "依日主五行對應方位，前往對應國家地區尋找朋友與貴人。",
          {
            evidence: (
              <div className="space-y-2">
                {Object.entries(BIRTHPLACE_COMPANION).map(([el, advice]) => (
                  <ReasoningCard key={el} label={`${el}行`} variant="default">
                    <p className="text-xs text-zen-text leading-relaxed">{advice}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "依日主五行方位判斷，長期適用。",
            actions: ["確認日主五行", "對照出生地建議", "前往對應方位尋找貴人"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 獨資 vs 合夥 */}
      <ContentSection
        grammar={section(
          "適合獨資與合夥",
          3,
          "身強與從弱宜獨資；身弱與從強適合合夥，朋友多為貴人。",
          {
            evidence: (
              <div className="grid gap-2">
                <ReasoningCard label="宜獨資" variant="default">
                  <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                    {BUSINESS_PATTERN.solo.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="適合合夥" variant="muted">
                  <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                    {BUSINESS_PATTERN.partnership.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "依命盤格局與日主強弱判斷。",
            actions: ["判斷日主強弱與格局", "選擇獨資或合夥模式", "明確利益分配與職責"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 溝通模式 */}
      <ContentSection
        grammar={section(
          "十神溝通模式",
          3,
          "各十神對上級、同級、下屬的溝通方式不同，相處需對症下藥。",
          {
            evidence: (
              <div className="grid gap-3">
                {COMMUNICATION_STYLES.map((cs) => (
                  <ReasoningCard key={cs.tenGod} label={cs.tenGod} variant="muted">
                    <p className="text-xs text-zen-text">{cs.trait}</p>
                    <p className="text-xs text-zen-muted mt-1">對上級：{cs.toSuperior}</p>
                    <p className="text-xs text-zen-muted mt-1">對平級：{cs.toPeer}</p>
                    <p className="text-xs text-zen-muted mt-1">對下屬：{cs.toSubordinate}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "依十神類型判斷，職場與日常相處皆適用。",
            actions: ["確認自身與他人十神", "對照溝通模式", "調整相處方式"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 職場相處策略 */}
      <ContentSection
        grammar={section(
          "十神職場相處策略",
          3,
          "針對各十神的職場特質，給出與上級、同級、下屬的相處策略。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(WORKPLACE_STRATEGIES).map(([tenGod, s]) => (
                  <ReasoningCard key={tenGod} label={tenGod} variant="default">
                    <p className="text-xs text-zen-text">{s.traits}</p>
                    <p className="text-xs text-zen-muted mt-1">與上級：{s.up}</p>
                    <p className="text-xs text-zen-muted mt-1">與同級：{s.same}</p>
                    <p className="text-xs text-zen-muted mt-1">與下屬：{s.down}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "依十神名稱判斷，長期適用。",
            actions: ["確認十神類型", "對照職場相處策略", "調整職場互動方式"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      <UncertaintyNotice>
        人際分析依命盤十神與五行互補原則推斷，實際人際關係仍受個人性格、經驗與溝通意願影響，僅供參考。
      </UncertaintyNotice>
    </div>
  );
}
