// JobsSection.tsx — 專屬十神合適工作
// 內容區塊：固定文法「結論先行 → 依據 → 時間窗 → 動作 → 不確定處」。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from "../../../components/shared";
import {
  getWealthCareer,
  getCareerRole,
  LECTURE_DATA,
} from "../../../data";

interface JobsSectionProps {
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
  zhiCount: { "寅申巳亥": number; "辰戌丑未": number; "子午卯酉": number };
  dominantZhiType: string;
}

const MAX_ACTIONS = 3;

export default function JobsSection({
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
  zhiCount,
  dominantZhiType,
}: JobsSectionProps) {
  const primaryCareer = getWealthCareer(topGod1, topGod2 || null);
  const primaryRole = getCareerRole(topGod1);

  return (
    <div className="space-y-6">
      {/* 專屬十神與地支合適工作 */}
      <ContentSection
        defaultOpen
        grammar={makeSection(
          "專屬十神與地支合適工作指導",
          2,
          "主導十神與次要十神交叉，決定最適合的工作屬性與得財鏈路；地支旺衰再決定流動與靜態的環境契合度。",
          {
            evidence: (
              <div className="grid gap-4">
                {/* 第一：主導十神合適事業 */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                    第一最多十神：{topGod1} ({topCount1} 個)
                  </h3>
                  <ReasoningCard label="主導天生才幹" variant="default">
                    {primaryCareer ? (
                      <>
                        <p className="text-zen-text">
                          {primaryCareer.suitableCareers}
                        </p>
                        <p className="text-zen-muted mt-1">
                          得財風格：{primaryCareer.wealthStyle}
                        </p>
                        {primaryRole && (
                          <p className="text-sm text-zen-accent mt-1">
                            職能定位：{primaryRole.role} — {primaryRole.suitable}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-zen-text">
                        暫無「{topGod1}」的對應職業對照，請以次要十神與地支特性參考。
                      </p>
                    )}
                  </ReasoningCard>

                  {tenGodCounts[topGod1] > 0 && (
                    <ReasoningCard label="十神本質建議" variant="muted">
                      {topGod1.includes("財") && (
                        <>
                          <p className="text-zen-text">
                            💰 適合與財富直接相關工作（創業、理金、接案、高抽成業務）。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            正財多特性：適合重視秩序、穩定累積、高契合度計算法的行業（會計、
                            工程、金融精算、長期抗通膨理財）。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            偏財多特性：適合高流動、利潤點浮動、靠人情資源搏意外機遇的行業
                            （投資經理、股票交易、代理行銷、抽成分紅制、多角化副業）。
                          </p>
                        </>
                      )}
                      {(topGod1.includes("官") || topGod1.includes("殺")) && (
                        <>
                          <p className="text-zen-text">
                            ⚔️ 適合大型常規組織、嚴格體系管理、工程與重交付職務。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            正官多（偏文）：適合公務法規體系、既定規範與清晰程序的工作。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            七殺多（偏武）：適合高抗壓、高速變動、獨立作戰突破的高難度變動
                            職位。
                          </p>
                        </>
                      )}
                      {(topGod1.includes("食") || topGod1.includes("傷")) && (
                        <>
                          <p className="text-zen-text">
                            🎨 適合無窮創造力、自媒體、方案企劃、教育諮詢、設計開發等思維輸出
                            職能。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            食傷生財：以獨門專業技術、文字技巧、藝術才華直接面向受眾變現。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            傷官得名：天干透干者易一戰成名，極利於網路網紅、自媒體發言人或
                            獨立諮詢顧問。
                          </p>
                        </>
                      )}
                      {topGod1.includes("印") && (
                        <>
                          <p className="text-zen-text">
                            📖 適合精耕私領域、行政文書、人資特助或研究員職位。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            需有完善 SOP 體系的常規流暢行政，不宜承擔過度激進、高彈性的
                            業績高壓追逐類工作。
                          </p>
                        </>
                      )}
                      {(topGod1.includes("比") || topGod1.includes("劫")) && (
                        <>
                          <p className="text-zen-text">
                            🤝 適合利用社群與人脈合夥打江山，提防「同伴奪財」，需明確股權
                            架構與分潤約定。
                          </p>
                          <p className="text-xs text-zen-muted mt-1">
                            適合輕資產創業、賺轉手賺佣、房仲中介、社群自營電商等不需沈澱
                            大宗預算資金的行業。
                          </p>
                        </>
                      )}
                    </ReasoningCard>
                  )}

                  {/* 第二：十神交叉組合 */}
                  {topGod2 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        十神交叉組合：{topGod1} × {topGod2}
                      </h3>
                      <ReasoningCard label="二強聯手合力判讀" variant="accent">
                        {(() => {
                          const matchKeys = [
                            `${topGod1}_${topGod2}`,
                            `${topGod2}_${topGod1}`,
                            `${topGod1.charAt(0)}_${topGod2.charAt(0)}`,
                            `${topGod2.charAt(0)}_${topGod1.charAt(0)}`,
                          ];

                          for (const k of matchKeys) {
                            const directAdvice =
                              LECTURE_DATA.TEN_GOD_CAREER_COMBO[
                                k as keyof typeof LECTURE_DATA.TEN_GOD_CAREER_COMBO
                              ];
                            if (directAdvice) {
                              return (
                                <p className="text-zen-text">
                                  【{topGod1} 與 {topGod2} 二強聯手】：{directAdvice}
                                </p>
                              );
                            }
                          }

                          // 模糊後備匹配
                          if (
                            (topGod1.includes("財") && topGod2.includes("食")) ||
                            (topGod1.includes("食") && topGod2.includes("財"))
                          ) {
                            return (
                              <p className="text-zen-text">
                                【食傷生財結構】：
                                {LECTURE_DATA.TEN_GOD_CAREER_COMBO["財_食傷"]}
                              </p>
                            );
                          }
                          if (
                            (topGod1.includes("財") && topGod2.includes("官")) ||
                            (topGod1.includes("官") && topGod2.includes("財"))
                          ) {
                            return (
                              <p className="text-zen-text">
                                【財生官殺結構】：
                                {LECTURE_DATA.TEN_GOD_CAREER_COMBO["財_官殺"]}
                              </p>
                            );
                          }

                          return (
                            <p className="text-zen-text">
                              您的格局組合為「{topGod1}配{topGod2}」，兼具強大自我特徵與多重
                              辦事思路。在與大企業合作或搭建多渠道變現鏈路時較能得心應手。
                            </p>
                          );
                        })()}
                    </ReasoningCard>
                  </div>
                )}
                </div>

                {/* 第三：地支旺特性 */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                    八字地支旺特性：{dominantZhiType}
                  </h3>
                  <ReasoningCard label="行動力與工作環境契合度" variant="muted">
                    <p className="text-zen-text">
                      地支在年、月、日、時所積累的能量本源，決定您的行動力與工作環境
                      契合度。
                    </p>
                    {dominantZhiType === "寅申巳亥" && (
                      <>
                        <p className="text-blue-300 font-bold block mt-2">
                          【驛馬動態流動】：寅申巳亥多 (共計{zhiCount["寅申巳亥"]} 個)
                        </p>
                        <p className="text-zen-muted mt-1">
                          工作地點或內容變動大，經常出差，需要常保持移動型，比如國際物
                          流、外貿拓展、差旅頻繁的商務拓展或大片區督導工作。宜動不宜靜。
                        </p>
                      </>
                    )}
                    {dominantZhiType === "辰戌丑未" && (
                      <>
                        <p className="text-yellow-400 font-bold block mt-2">
                          【華蓋靜態穩定】：辰戌丑未多 (共計{zhiCount["辰戌丑未"]} 個)
                        </p>
                        <p className="text-zen-muted mt-1">
                          適合定點、獨處工作。宜在一個特定專精、極其具備技術門檻的深水
                          區長年扎根；因具有天生神祕緣，極易與宗教哲理或身心靈等方向
                          產生濃厚宿世緣法。
                        </p>
                      </>
                    )}
                    {dominantZhiType === "子午卯酉" && (
                      <>
                        <p className="text-pink-300 font-bold block mt-2">
                          【桃花四敗舞台位】：子午卯酉多 (共計{zhiCount["子午卯酉"]} 個)
                        </p>
                        <p className="text-zen-muted mt-1">
                          適合曝光、自媒體、向眾人展示自我才幹或美感。極佳的直面消費者
                          產業（時尚奢品、創意行銷、公關外交、演藝自媒體或品牌傳播官）。
                        </p>
                      </>
                    )}
                  </ReasoningCard>
                </div>
              </div>
            ),
            timeWindow:
              "長期適用，以命盤十神與地支為準；隨大運流年變動而微調，建議與當前「" +
              (patternLabel || "未設定格局") +
              "」配合閱讀。",
            actions: [
              "對照主導十神與適合職業",
              "評估目前工作與十神契合度",
              "規劃職涯發展方向",
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      <UncertaintyNotice>
        專屬工作建議依命盤十神分布與地支旺特性推斷，實際職涯尚受學歷、經驗、市場與
        個人選擇影響，僅供參考，非絕對預測。
      </UncertaintyNotice>
    </div>
  );
}
