// src/components/career/sections/GodsSection.tsx
// 專屬十神事業開運指南 — 主星與次星特質。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from "react";
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  SectionGrammar,
} from "../../../components/shared";

const MAX_ACTIONS = 3;

function section(
  title: string,
  level: SectionGrammar["level"],
  conclusion: string,
  rest: Partial<SectionGrammar>,
): SectionGrammar {
  return { title, level, conclusion: conclusion.slice(0, 120), ...rest };
}

interface GodsSectionProps {
  maxGod: string;
  secGod: string | null;
  topCount1: number;
  topCount2: number;
}

const GOD_CAREER_ADVICE: Record<string, { title: string; strategy: string; timing: string; tip: string }> = {
  比肩: {
    title: "比肩為自主創業星",
    strategy: "適合合夥創業、自由職業、技術合夥，與同輩合作能發揮團隊戰力",
    timing: "逢比肩流日適合提案、簽約、拓展人脈",
    tip: "比肩代表自我意識強，宜培養專業技能，避免過度固執己見。"
  },
  劫財: {
    title: "劫財為競爭突破星",
    strategy: "適合競爭激烈的業務、銷售、體育、金融投機等高挑戰領域",
    timing: "逢劫財流日適合衝刺業績、挑戰極限",
    tip: "劫財代表競爭與冒險，需控制衝動，避免過度投機。"
  },
  食神: {
    title: "食神為才藝表達星",
    strategy: "適合教育、餐飲、藝術、創作、諮詢、技術研發等靠才華吃飯的行業",
    timing: "逢食神流日適合發表作品、教學、創意發想",
    tip: "食神代表才華與口福，宜持續學習新知，避免好逸惡勞。"
  },
  傷官: {
    title: "傷官為創新變革星",
    strategy: "適合科技、設計、行銷、公關、律師、顧問等需要創新思維的行業",
    timing: "逢傷官流日適合創新提案、改革、表達意見",
    tip: "傷官代表聰明才智，需收斂鋒芒，避免言語過於尖銳。"
  },
  偏財: {
    title: "偏財為多元進財星",
    strategy: "適合投資、副業、業務、公關、人際經營等多元收入來源",
    timing: "逢偏財流日適合投資理財、拓展業務、社交應酬",
    tip: "偏財代表靈活理財，需量入為出，避免過度投機。"
  },
  正財: {
    title: "正財為穩健財神星",
    strategy: "適合金融、會計、行政、管理、技術工程等穩定收入的行業",
    timing: "逢正財流日適合談判薪資、簽約、理財規劃",
    tip: "正財代表正當收入，宜踏實工作、累積實力，忌投機取巧。"
  },
  七殺: {
    title: "七殺為權威挑戰星",
    strategy: "適合軍警、外科、工程、管理、創業等需要抗壓與決斷力的行業",
    timing: "逢七殺流日適合處理難題、承擔重任、展現魄力",
    tip: "七殺代表壓力與挑戰，需修身養性，避免衝動決策。"
  },
  正官: {
    title: "正官為管理領導星",
    strategy: "適合公務員、主管、管理、法律、教育等需要制度與責任的行業",
    timing: "逢正官流日適合升遷談判、參加考試、求職面試",
    tip: "正官代表責任與紀律，宜守法守分，避免過度保守。"
  },
  偏印: {
    title: "偏印為學術研究星",
    strategy: "適合研究、學術、醫療、宗教、玄學、技術專精等需要深度思考的領域",
    timing: "逢偏印流日適合學習進修、研究策劃、深度思考",
    tip: "偏印代表智慧與直覺，宜專注深耕，避免三心二意。"
  },
  正印: {
    title: "正印為貴人扶持星",
    strategy: "適合教育、文化、行政、醫療、社會服務等需要貴人相助的行業",
    timing: "逢正印流日適合拜師學習、尋求貴人、參加培訓",
    tip: "正印代表貴人與長輩，宜謙虛學習，避免過度依賴。"
  },
};

export function GodsSection({
  maxGod,
  secGod,
  topCount1,
  topCount2,
}: GodsSectionProps) {
  const mainAdvice = GOD_CAREER_ADVICE[maxGod];
  const secAdvice = secGod ? GOD_CAREER_ADVICE[secGod] : null;

  if (!mainAdvice) return null;

  const sections: SectionGrammar[] = [
    section(
      "主要星耀特質",
      2,
      `您的事業主力結構以 ${maxGod}（${topCount1} 個）為核心主幹${secGod ? `，次主力以 ${secGod}（${topCount2} 個）起到輔佐平衡的作用` : ""}。`,
      {
        evidence: (
          <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4.5 space-y-3 font-sans">
            <h3 className="text-sm font-bold text-blue-400 flex items-center gap-1">
              <span className="text-base">🔵</span> 主要星耀特質：{maxGod} — {mainAdvice.title}
            </h3>
            <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed font-medium pl-5.5">
              <p>🎯 <strong className="text-zinc-100 font-semibold pl-1">開拓策略：</strong>{mainAdvice.strategy}</p>
              <p>🗓️ <strong className="text-zinc-100 font-semibold pl-1">關鍵時機：</strong>{mainAdvice.timing}</p>
              <p>⚠️ <strong className="text-zinc-100 font-semibold pl-1">開運警示：</strong>{mainAdvice.tip}</p>
            </div>
          </div>
        ),
        timeWindow: "根據命盤十神數量分析，長期適用。",
        actions: ["確認主星十神類型", "對照開拓策略與關鍵時機", "遵守開運警示"].slice(0, MAX_ACTIONS),
      },
    ),
  ];

  if (secAdvice) {
    sections.push(
      section(
        "輔助星耀特質",
        3,
        `次主力以 ${secGod}（${topCount2} 個）起到輔佐平衡的作用。`,
        {
          evidence: (
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4.5 space-y-3 font-sans">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-1">
                <span className="text-base text-zinc-400">⚪</span> 輔助星耀特質：{secGod} — {secAdvice.title}
              </h3>
              <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed font-medium pl-5.5">
                <p>🎯 <strong className="text-zinc-100 font-semibold pl-1">開拓策略：</strong>{secAdvice.strategy}</p>
                <p>🗓️ <strong className="text-zinc-100 font-semibold pl-1">關鍵時機：</strong>{secAdvice.timing}</p>
                <p>⚠️ <strong className="text-zinc-100 font-semibold pl-1">開運警示：</strong>{secAdvice.tip}</p>
              </div>
            </div>
          ),
          timeWindow: "與主星交織，長期適用。",
          actions: ["了解次星特質", "觀察與主星互動", "整合雙星能量"].slice(0, MAX_ACTIONS),
        }
      )
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2 border-b border-zen-border pb-3">
        <span className="text-blue-400 font-mono">04.</span> 專屬十神事業開運指南
      </h2>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
        根據命盤十神數量分析，您的事業主力結構以 <strong className="text-blue-400 font-bold">{maxGod}</strong>（{topCount1} 個）為核心主幹
        {secGod && <>，次主力以 <strong className="text-blue-400 font-bold">{secGod}</strong>（{topCount2} 個）起到輔佐平衡的作用</>}。
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        十神事業開運指南依命盤十神分布推斷，實際事業發展仍受大運、流年與個人選擇影響，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}
