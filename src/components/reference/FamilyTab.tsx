// FamilyTab — 家庭 tab. 父母子女互動、手足關係、子息緣分、家庭變動與健康警訊。
// Same data values as src/data; no logic changes.
import { ContentSection, ReasoningCard, UncertaintyNotice, SectionGrammar } from "../shared";
import {
  familyRoles,
  FAMILY_INTERACTIONS,
  FERTILITY_INFO,
  FERTILITY_TIMING,
  FAMILY_ROLES,
  FAMILY_HEALTH_WARNINGS,
  SIBLING_RELATIONS,
  FAMILY_CHANGES,
  getFamilyInteraction,
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

function groupByTenGodType(items: typeof FAMILY_INTERACTIONS) {
  return items.reduce<Record<string, typeof FAMILY_INTERACTIONS>>((acc, item) => {
    (acc[item.tenGodType] ??= []).push(item);
    return acc;
  }, {});
}

export default function FamilyTab() {
  const interactionsByType = groupByTenGodType(FAMILY_INTERACTIONS);

  return (
    <div className="space-y-6">
      {/* 十神與家庭角色 */}
      <ContentSection
        defaultOpen
        grammar={section(
          "十神與家庭角色",
          2,
          "各十神在家庭中扮演不同角色，決定與長輩、子女的相處模式。",
          {
            evidence: (
              <div className="grid gap-3">
                {familyRoles.map((role) => (
                  <ReasoningCard key={role.tenGodName} label={role.tenGodName} variant="default">
                    <p className="text-zen-text">父母／長輩：{role.parentInteraction}</p>
                    <p className="text-zen-text mt-1">子女：{role.childInteraction}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "長期適用，依命盤十神組合為準。",
            actions: ["確認自身十神", "對照與父母子女相處", "調整家庭相處方式"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 父母與子女相處 */}
      <ContentSection
        grammar={section(
          "父母與子女相處",
          2,
          "依十神類型判斷與父母、子女的相處特質與策略。",
          {
            evidence: (
              <div className="space-y-4">
                {Object.entries(interactionsByType).map(([tenGodType, items]) => (
                  <div key={tenGodType} className="border border-white/5 rounded-xl bg-white/5 p-4">
                    <p className="text-sm font-medium text-zen-text mb-2">{tenGodType}</p>
                    <div className="grid gap-3">
                      {items.map((item) => (
                        <ReasoningCard
                          key={item.tenGodSubtype}
                          label={item.tenGodSubtype}
                          variant="muted"
                        >
                          <p className="text-zen-text">父母特質：{item.parentTrait}</p>
                          <p className="text-zen-accent mt-1">父母策略：{item.parentStrategy}</p>
                          <p className="text-zen-text mt-2">子女特質：{item.childTrait}</p>
                          <p className="text-zen-accent mt-1">子女策略：{item.childStrategy}</p>
                        </ReasoningCard>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ),
            timeWindow: "長期適用，依命盤十神類型為準。",
            actions: ["確認十神類型", "對照父母子女策略", "改善家庭互動"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 手足關係 */}
      <ContentSection
        grammar={section(
          "手足關係",
          2,
          "比劫星決定手足緣分深淺與相處模式。",
          {
            evidence: (
              <div className="space-y-3">
                <ReasoningCard label="有緣情況" variant="default">
                  <ul className="list-disc pl-4 space-y-1 text-zen-text">
                    {SIBLING_RELATIONS.fortune.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="連結較弱" variant="muted">
                  <ul className="list-disc pl-4 space-y-1 text-zen-muted">
                    {SIBLING_RELATIONS.weakConnection.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="各十神手足特質" variant="accent">
                  <div className="space-y-1">
                    {SIBLING_RELATIONS.traits.map((t, i) => (
                      <p key={i} className="text-sm text-zen-text">
                        {t.tenGod}：{t.trait} — {t.strategy}
                      </p>
                    ))}
                  </div>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "以命盤比劫分布與流年沖刑為準。",
            actions: ["統計命盤比劫", "判斷手足緣分", "調整手足相處"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 子女緣份與易懷孕時機 */}
      <ContentSection
        grammar={section(
          "子女緣份與易懷孕時機",
          2,
          "時柱為子息宮，子息星與流年決定子女緣分與求子時機。",
          {
            evidence: (
              <div className="space-y-3">
                <ReasoningCard label="子息星" variant="default">
                  <p className="text-zen-text">男命：{FERTILITY_INFO.star.male}</p>
                  <p className="text-zen-text mt-1">女命：{FERTILITY_INFO.star.female}</p>
                  <p className="text-sm text-zen-muted mt-2">子息宮：{FERTILITY_INFO.palace}</p>
                </ReasoningCard>
                <ReasoningCard label="緣分判讀原則" variant="muted">
                  <ul className="list-disc pl-4 space-y-1 text-zen-muted">
                    {FERTILITY_INFO.judgment.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="子女性別與數量" variant="accent">
                  <ul className="list-disc pl-4 space-y-1 text-zen-text">
                    {FERTILITY_INFO.genderCount.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="易懷孕時機" variant="default">
                  <p className="text-zen-text">男命：{FERTILITY_TIMING.male}</p>
                  <p className="text-zen-text mt-1">女命：{FERTILITY_TIMING.female}</p>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "以流年天干地支主氣與子息星透干為準。",
            actions: ["確認子息宮與子息星", "對照易懷孕流年", "評估求子時機"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 家庭變動與遷移 */}
      <ContentSection
        grammar={section(
          "家庭變動與遷移",
          2,
          "大運與流年沖刑月柱、日支時支，暗示家庭成員變動與遷移。",
          {
            evidence: (
              <div className="space-y-3">
                <ReasoningCard label="居住與遷移" variant="default">
                  <ul className="list-disc pl-4 space-y-1 text-zen-text">
                    {FAMILY_CHANGES.moving.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="家人成員變動" variant="muted">
                  <ul className="list-disc pl-4 space-y-1 text-zen-muted">
                    {FAMILY_CHANGES.members.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "以大運與流年沖刑月柱、日支、時支為準。",
            actions: ["排查大運流年沖刑", "判斷家人變動年份", "擇吉遷入或裝潢"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 十神代表大家庭角色 */}
      <ContentSection
        grammar={section(
          "十神代表大家庭角色",
          2,
          "十神與親屬關係的對應表，判斷命盤中各親屬方位。",
          {
            evidence: (
              <div className="grid gap-3">
                {Object.entries(FAMILY_ROLES).map(([relation, tenGods]) => (
                  <ReasoningCard key={relation} label={relation} variant="muted">
                    <p className="text-zen-text">{tenGods}</p>
                  </ReasoningCard>
                ))}
              </div>
            ),
            timeWindow: "長期適用，依命盤十神為準。",
            actions: ["對照十神與親屬", "判斷各親屬方位", "重點關注忌神親屬"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 家人健康警訊 */}
      <ContentSection
        grammar={section(
          "家人健康警訊",
          2,
          "沖刑與庫駕馬暗示家人健康風險，需特別關注。",
          {
            evidence: (
              <div className="space-y-3">
                <ReasoningCard label="沖與刑" variant="default">
                  <p className="text-zen-text">{FAMILY_HEALTH_WARNINGS.clash}</p>
                  <p className="text-zen-text mt-1">{FAMILY_HEALTH_WARNINGS.punishment}</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-zen-muted mt-2">
                    {FAMILY_HEALTH_WARNINGS.rules.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </ReasoningCard>
                <ReasoningCard label="地支健康警訊" variant="accent">
                  <div className="space-y-1">
                    {Object.entries(FAMILY_HEALTH_WARNINGS.branchWarnings).map(([key, w], i) => (
                      <p key={i} className="text-sm text-zen-text">
                        {key}（{w.name}）：{w.warning}，建議{w.advice}。
                      </p>
                    ))}
                  </div>
                </ReasoningCard>
                <ReasoningCard label="身弱財旺" variant="muted">
                  <p className="text-zen-text">{FAMILY_HEALTH_WARNINGS.weakBody}</p>
                </ReasoningCard>
              </div>
            ),
            timeWindow: "以流年與大運沖刑子息宮、家人星地支為準。",
            actions: ["排查沖刑年份", "關注庫駕馬健康", "安排健康檢查"].slice(0, MAX_ACTIONS),
          }
        )}
      />

      <UncertaintyNotice>
        家庭分析依命盤十神與地支沖刑推斷，實際家庭關係尚受個人性格、溝通與後天經營影響，僅供參考，非絕對預測。
      </UncertaintyNotice>
    </div>
  );
}
