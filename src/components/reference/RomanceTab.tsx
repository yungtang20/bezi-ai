// src/components/reference/RomanceTab.tsx
// 感情 tab — 姻緣篇。結構委派自 ReferenceTablePage 殼牌；內容僅用 ContentSection 文法。
// 所有數值與原始講義/資料表保持一致，不改動邏輯。
import React from "react";
import { ContentSection, ReasoningCard, SectionGrammar } from "../shared";
import {
  compatibilityRules,
  WEAK_ELEMENT_ROMANCE,
  LECTURE_DATA,
} from "../../data";

interface RomanceTabProps {
  decorElement: "金" | "木" | "水" | "火" | "土";
  setDecorElement: React.Dispatch<React.SetStateAction<"金" | "木" | "水" | "火" | "土">>;
  decorGender: "男" | "女";
  setDecorGender: React.Dispatch<React.SetStateAction<"男" | "女">>;
  referenceFSYear: number;
  setReferenceFSYear: React.Dispatch<React.SetStateAction<number>>;
}

export default function RomanceTab({
  decorElement,
  setDecorElement,
  decorGender,
  setDecorGender,
  referenceFSYear,
  setReferenceFSYear,
}: RomanceTabProps) {
  const genderLabel = decorGender === "男" ? "男命" : "女命";
  const remedy = WEAK_ELEMENT_ROMANCE[decorElement];

  const sections: SectionGrammar[] = [
    {
      title: "感情基礎：夫妻星與夫妻宮",
      level: 2,
      conclusion: "男命以財星看感情，女命以官殺看感情；夫妻宮（日支）反映婚姻狀態與伴侶特質。",
      evidence: (
        <ReasoningCard label="夫妻星定位">
          {decorGender === "男"
            ? "男命以「正財／偏財」為夫妻星；財星坐夫妻宮（日支）感情緣分尤深。"
            : "女命以「正官／七殺」為夫妻星；官殺坐夫妻宮（日支）感情緣分尤深。"}
        </ReasoningCard>
      ),
      timeWindow: "全生命週期皆適用；逢夫妻星臨旺運與流年時感情機會較多。",
      actions: ["對照日支夫妻宮特質", "檢查夫妻星是否坐宮", "觀察流年夫妻星透出"],
      uncertainty: "夫妻宮特質僅供參考，實際姻緣仍需與大運流年綜合斷應。",
    },
    {
      title: "夫妻宮地支類型與伴侶特質",
      level: 3,
      conclusion: "夫妻宮為子午卯酉（四正）伴侶顏值高；寅申巳亥（四長生）陽光好動；辰戌丑未（四墓庫）穩重內斂。",
      evidence: (
        <ReasoningCard label="夫妻宮分類（先天命盤固定）">
          子午卯酉（四正）：伴侶顏值較高、氣質出眾，感情相對豐富；寅申巳亥（四長生）：陽光好動、有活力，有話直說；辰戌丑未（四墓庫）：穩重踏實、安靜內斂，極為可靠。請對照您命盤日支地支查閱。
        </ReasoningCard>
      ),
      timeWindow: "先天命盤固定，與流年無關。",
      actions: ["確認日支地支", "對照四正／四長生／四墓庫", "參考伴侶外貌與性格描述"],
      uncertainty: "僅為傳統斷語概況，不等同於具體個人斷論。",
    },
    {
      title: "桃花流日與姻緣時機",
      level: 3,
      conclusion: "桃花旺之流日以夫妻星透出為主；男命以財，女命以官殺，大運與流年重疊時結婚機會較大。",
      evidence: (
        <>
          <ReasoningCard label="男命桃花流日（財）">
            {LECTURE_DATA.ROMANCE_DAYS.男[decorElement]?.combos.join("、") ?? "—"}
          </ReasoningCard>
          <ReasoningCard label="女命桃花流日（官殺）">
            {LECTURE_DATA.ROMANCE_DAYS.女[decorElement]?.combos.join("、") ?? "—"}
          </ReasoningCard>
        </>
      ),
      timeWindow: "大運（財／官殺）再遇流年（財／官殺）時姻緣機會最大。",
      actions: ["對照本命日主桃花流日組合", "檢查大運與流年是否重疊", "避開比劫夾財／官殺之年"],
      uncertainty: "流日組合來源於講義手冊，供參考，不作絕對預測。",
    },
    {
      title: "男命與女命感情差異",
      level: 3,
      conclusion: "男命財星弱則表達內斂、不善表達感情；女命官星弱則對異性缺乏吸引力。",
      evidence: (
        <ReasoningCard label="性別差異">
          男命看財，女命看官殺；身強者桃花旺，身弱者需等大運扶助。
        </ReasoningCard>
      ),
      timeWindow: "大運扶助期間較易有感情進展。",
      actions: ["區分男命／女命斷法", "檢查夫妻星強弱", "觀察大運是否扶助日主"],
      uncertainty: "性別差異為傳統斷語，不代表固定行為模式。",
    },
    {
      title: "夫妻星十神相處策略",
      level: 3,
      conclusion: "各十神夫妻星有不同性格與弱點，相處需對症下藥：正財重穩定、偏財控風險、正官給面子、七殺別硬碰硬。",
      evidence: (
        <>
          {compatibilityRules
            .filter((r) => r.tenGodType === "財星" || r.tenGodType === "官殺")
            .map((r) => (
              <ReasoningCard key={r.tenGodName} label={r.tenGodName}>
                {r.traits} {r.weaknesses} {r.strategy}
              </ReasoningCard>
            ))}
        </>
      ),
      timeWindow: "日常相處皆適用。",
      actions: ["確認配偶十神類型", "套用對應相處策略", "避免觸碰弱點"],
      uncertainty: "十神特質為概括性描述，實際仍視命盤整體。",
    },
    {
      title: "五行姻緣補運（依命盤五行）",
      level: 2,
      conclusion: `${decorElement}命人姻緣補運：${remedy.weakness}`,
      evidence: (
        <>
          <p>補運方向：{remedy.directions}</p>
          <p>幸運色：{remedy.colors}</p>
          <p>佈置擺件：{remedy.decor}</p>
          <p>應避免：{remedy.avoid}</p>
        </>
      ),
      timeWindow: "依目前大運與流年五行強弱彈性調整。",
      actions: ["確認命盤五行強弱", "對照補運方位與顏色", "避免列出的禁忌"],
      uncertainty: "補運建議屬象徵性調整，效果因人而異。",
    },
    {
      title: "2026 飛星感情佈置",
      level: 3,
      conclusion: "2026 年九紫右弼星於東南方主喜慶；一白貪狼星於中宮主人際，保持中央明亮通暢。",
      evidence: (
        <>
          <ReasoningCard label="九紫右弼星（2026 東南）">
            {LECTURE_DATA.FLYING_STARS_ROMANCE["九紫右弼星(喜慶之星)"]}
          </ReasoningCard>
          <ReasoningCard label="一白貪狼星（2026 中宮）">
            {LECTURE_DATA.FLYING_STARS_ROMANCE["一白貪狼星(人際關係)"]}
          </ReasoningCard>
        </>
      ),
      timeWindow: "2026 年（丙午年）流年佈置。",
      actions: ["東南方擺紅粉紫色物品與粉色水晶", "保持家中中央明亮、不堆雜物", "可用白/灰/金/銀色床具"],
      uncertainty: "飛星佈置為象徵性調整，與命理斷應分開。",
    },
    {
      title: "桃花危機與爛桃花預警",
      level: 3,
      conclusion: "男命財坐比劫或女命官殺坐比劫時，心儀對象可能已有伴侶或陷入三角糾紛，宜謹慎。",
      evidence: (
        <>
          <ReasoningCard label="桃花危機規則">
            {LECTURE_DATA.ROMANCE_CRISIS.男}
            <br />
            {LECTURE_DATA.ROMANCE_CRISIS.女}
          </ReasoningCard>
            {LECTURE_DATA.PEACH_BLOSSOM_CRISIS.男[decorElement as keyof typeof LECTURE_DATA.PEACH_BLOSSOM_CRISIS.男]?.desc ?? "暫無對應規則"}
            <br />
            {LECTURE_DATA.PEACH_BLOSSOM_CRISIS.女[decorElement as keyof typeof LECTURE_DATA.PEACH_BLOSSOM_CRISIS.女]?.desc ?? "暫無對應規則"}
        </>
      ),
      timeWindow: "遇到對應天干地支組合之流年時需特別留意。",
      actions: ["檢查夫妻星與比劫關係", "留意流年是否命中危機組合", "避免不明感情介入"],
      uncertainty: "危機診斷為傳統規則，不等於必然發生。",
    },
    {
      title: "誠實界線與不確定處",
      level: 2,
      conclusion: "感情分析基於傳統八字斷語與講義手冊，僅供參考，不構成感情或婚姻建議。",
      evidence: null,
      timeWindow: "長期適用。",
      actions: ["理性看待斷語結果", "重視實際相處與溝通", "必要時尋求專業諮詢"],
      uncertainty: "所有預測皆有機率，不能保證姻緣結果。",
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} />
      ))}
    </div>
  );
}
