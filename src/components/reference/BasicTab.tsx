// src/components/reference/BasicTab.tsx
// 八字基礎 tab — 天干、地支、五行與十神。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../shared";
import {
  DAY_MASTER_TRAITS,
  BRANCH_GROUP_TRAITS,
  BRANCH_INTERACTIONS,
  DAY_MASTER_RELATIONS,
  ELEMENT_BALANCE_RULES,
  DEFICIENT_ELEMENT_REMEDIES,
  getElementBalanceRule,
  type FiveElement,
  type DayMasterStrength,
  type HeavenlyStem,
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

interface BasicTabProps {
  decorElement: "金" | "木" | "水" | "火" | "土";
  setDecorElement: React.Dispatch<React.SetStateAction<"金" | "木" | "水" | "火" | "土">>;
  decorGender: "男" | "女";
  setDecorGender: React.Dispatch<React.SetStateAction<"男" | "女">>;
  referenceFSYear: number;
  setReferenceFSYear: React.Dispatch<React.SetStateAction<number>>;
}

export default function BasicTab() {
  const stems: HeavenlyStem[] = [
    "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
  ];

  return (
    <div className="space-y-6">
      {/* 日主十干特質 */}
      <ContentSection
        defaultOpen
        grammar={section(
          "日主十干特質",
          2,
          "十天干各有不同五行屬性與意象，決定性格強弱與喜忌方向。",
          {
            evidence: (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {stems.map((stem) => {
                  const t = DAY_MASTER_TRAITS[stem];
                  return (
                    <ReasoningCard key={stem} label={`日主 ${stem}（${t.element}行/${t.yinYang}陰陽）`} variant="default">
                      <p className="text-zen-text text-sm">{t.image}</p>
                      <p className="text-zen-muted text-xs leading-relaxed">{t.trait}</p>
                      <p className="text-zen-accent text-xs mt-1">旺：{t.strong}</p>
                      <p className="text-zen-accent text-xs mt-1">弱：{t.weak}</p>
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "先天命盤固定，全生命週期皆適用。",
            actions: ["確認自身日主天干", "對照五行屬性與意象", "掌握旺弱特質"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 地支群組特質 */}
      <ContentSection
        grammar={section(
          "地支群組特質",
          3,
          "地支分為長生、帝旺、墓庫三群，分別暗示動態、外顯、穩定特質。",
          {
            evidence: (
              <div className="grid gap-3">
                {BRANCH_GROUP_TRAITS.map((group) => (
                  <ReasoningCard key={group.name} label={group.name} variant="muted">
                    <p className="text-zen-text text-sm">{group.meaning}</p>
                    <ul className="text-zen-muted text-xs list-disc pl-4 space-y-1 mt-1">
                      {group.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "根據命盤地支分布判斷，長期適用。",
            actions: ["統計命盤地支", "對照長生／帝旺／墓庫", "判斷動態或靜態傾向"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 地支相互作用 */}
      <ContentSection
        grammar={section(
          "地支相互作用",
          3,
          "相刑、相沖、相害、相破四類地支作用，影響事業、感情與健康。",
          {
            evidence: (
              <div className="grid gap-3">
                {BRANCH_INTERACTIONS.map((inter) => (
                  <ReasoningCard key={inter.name} label={inter.name} variant="accent">
                    <p className="text-zen-text text-sm leading-relaxed">{inter.effect}</p>
                    {inter.types.length > 0 && (
                      <ul className="text-zen-muted text-xs list-disc pl-4 space-y-1 mt-1">
                        {inter.types.map((t) => (
                          <li key={t.type}>
                            <span className="font-medium">{t.type}：</span>{t.desc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "命盤自帶相刑常在；相沖/相害/相破以大運流年為觸發。",
            actions: ["查盤是否存在地支作用", "對照大運與流年觸發", "採取對應化解行動"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 十神關係 */}
      <ContentSection
        grammar={section(
          "十神關係（日主視角）",
          3,
          "每個日主對應的十神分為我剋、剋我、我生、生我、同我五類，代表不同人事物。",
          {
            evidence: (
              <div className="grid gap-3 sm:grid-cols-2">
                {stems.map((stem) => {
                  const relations = DAY_MASTER_RELATIONS[stem];
                  return (
                    <ReasoningCard key={stem} label={`日主 ${stem}`} variant="default">
                      {relations.map((r) => (
                        <div key={r.elementGroup} className="mb-1">
                          <p className="text-xs text-zen-text font-medium">{r.elementGroup}</p>
                          <p className="text-xs text-zen-muted">
                            {r.heteroStem}{r.heteroGod} / {r.homoStem}{r.homoGod}（{r.element}）
                          </p>
                        </div>
                      ))}
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "先天命盤固定，長期適用。",
            actions: ["確認日主天干", "對照五類十神關係", "辨識命盤中的十神角色"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 五行強弱與補運 */}
      <ContentSection
        grammar={section(
          "五行強弱與補運方向",
          3,
          "身強喜耗洩（財官殺食傷），身弱喜生扶（印比劫），從格求順勢。",
          {
            evidence: (
              <div className="grid gap-3">
                {(["木", "火", "土", "金", "水"] as FiveElement[]).map((el) => {
                  const strong = getElementBalanceRule(el, "身強");
                  const weak = getElementBalanceRule(el, "身弱");
                  const remedy = DEFICIENT_ELEMENT_REMEDIES[el];
                  if (!strong || !weak) return null;
                  return (
                    <ReasoningCard key={el} label={`${el}行強弱與補運`} variant="muted">
                      <p className="text-xs text-zen-text">身強宜：{strong.goodElements.join("、")}</p>
                      <p className="text-xs text-zen-text">身強忌：{strong.badElements.join("、")}</p>
                      <p className="text-xs text-zen-text">身弱宜：{weak.goodElements.join("、")}</p>
                      <p className="text-xs text-zen-text">身弱忌：{weak.badElements.join("、")}</p>
                      {remedy && (
                        <p className="text-xs text-zen-accent mt-1">補運方向：{remedy.direction}</p>
                      )}
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: "依日主五行與命盤強弱判斷，配合大運流年。",
            actions: ["確認日主五行", "判斷身強身弱", "對照補運方向與顏色"].slice(0, MAX_ACTIONS),
            uncertainty: "身強身弱需以整體格局為準，不以單一五行斷定。",
          }
        )}
      />

      <UncertaintyNotice>
        八字基礎斷語來源於傳統命理講義，日主特質與十神關係為概括性描述，實際斷應需結合整體命盤與大運流年綜合判斷，僅供參考。
      </UncertaintyNotice>
    </div>
  );
}
