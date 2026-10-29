// src/components/career/sections/CollabSection.tsx
// 十神團隊搭配與分工攻略。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import { ContentSection, ReasoningCard, UncertaintyNotice, type SectionGrammar, makeSection } from "../../../components/shared";
import { CheckCircle2 } from "lucide-react";

const MAX_ACTIONS = 3;

interface CollabSectionProps {
  maxGod: string;
  secGod: string | null;
}

const COLLAB_DATA = [
  {
    godGroup: "財星（正財/偏財客體）",
    tag: "財",
    strength: "財感極強、極擅拉拔資源與捕獲商業機會、頭腦精算、行動派、高結果導向。",
    weakness: "常常制度鬆散、大意、財務風險意識偏低、個人情緒及狀態隨金流損益產生劇烈起伏。",
    bestPartner: "官殺（重規則制度與風險管理、充當剎車皮）、印星（善後勤、有長遠眼光、安心理財）。",
    avoidPartner: "財星（主權撞車、爭奪資源）、比劫（重義氣而透支人情、金錢界線必須提前釐清）。",
    isMyType: (maxGod: string, secGod: string | null) =>
      maxGod === "正財" || maxGod === "偏財" || secGod === "正財" || secGod === "偏財",
  },
  {
    godGroup: "官殺（正官/七殺星曜）",
    tag: "官殺",
    strength: "具強烈責任感與高壓適應力、追求細節極致、精益求精、講求忠誠與使命必達。",
    weakness: "容易求好心切過度、畏懼犯錯受罰、精神緊繃度高、需謹防自壓力超載。",
    bestPartner: "食傷（企劃大師、創意行銷激發）、財星（業務成果落地變現、放大合作效益）、比劫（敢於衝鋒陷陣、分擔扛責）。",
    avoidPartner: "官殺（重製度、雙方缺乏彈性容易直接對撞、導致事務陷入僵局）。",
    isMyType: (maxGod: string, secGod: string | null) =>
      maxGod === "正官" || maxGod === "七殺" || secGod === "正官" || secGod === "七殺",
  },
  {
    godGroup: "印星（正印/偏印星曜）",
    tag: "印星",
    strength: "邏輯靈活極具學習敏銳、偏愛深度鑽研研究、顧全大局架構、深謀遠慮且耐心十足。",
    weakness: "重度事前規劃強迫、執行落地度較弱、往往容易處在「高付出、低主動反饋」局面。",
    bestPartner: "官殺（重製度化、具果決敢衝性、適合長期契合拍檔。印助官殺思考防錯，官殺助印變現執行）。",
    avoidPartner: "比劫（行事衝動、先斬後奏、主觀極強、節奏天差地遠、需要大量時間溝通磨合）。",
    isMyType: (maxGod: string, secGod: string | null) =>
      maxGod === "正印" || maxGod === "偏印" || secGod === "正印" || secGod === "偏印",
  },
  {
    godGroup: "食傷（食神/傷官才華）",
    tag: "食傷",
    strength: "極富創意發想且表達力拔群、具備天生自媒體天賦、擅長對外商務公關、社交聯誼。",
    weakness: "穩定性偏低，對繁雜瑣碎、墨守成規、重複性的行政與制度深感不耐與抗拒。",
    bestPartner: "官殺（定方向、把控總進度、扛起行政責任提供穩定大後方）、印星（協助梳理混雜架構、收斂瘋狂想法）。",
    avoidPartner: "食傷（想法過多易流於空談）、比劫（決策多變磨合難、資源分配難妥協）。",
    isMyType: (maxGod: string, secGod: string | null) =>
      maxGod === "食神" || maxGod === "傷官" || secGod === "食神" || secGod === "傷官",
  },
  {
    godGroup: "比劫（比肩/劫財同氣）",
    tag: "比劫",
    strength: "具強悍行動力、重視朋友手足情義、天生自帶凝聚與帶隊風範、擅長前線突破拓展。",
    weakness: "極易衝過頭犯險、過於主觀不聽勸、容易在人情與利益邊界模糊，稍顯太過感性。",
    bestPartner: "官殺（架構制度規則合理、流程井然、能夠幫助比劫團隊劃清彼此責任與理性界限）。",
    avoidPartner: "比劫（極易在後期陷入爭名奪利與股權衝突中）、財星（極易盲目追求熱點融資、忽略了無形破財風險）。",
    isMyType: (maxGod: string, secGod: string | null) =>
      maxGod === "比肩" || maxGod === "劫財" || secGod === "比肩" || secGod === "劫財",
  },
];

export function CollabSection({ maxGod, secGod }: CollabSectionProps) {
  const sections: SectionGrammar[] = COLLAB_DATA.map((col) => {
    const isMyType = col.isMyType(maxGod, secGod);
    return makeSection(
      `${col.tag} — ${col.godGroup}`,
      3,
      isMyType
        ? `${col.godGroup} 是您的命盤優勢焦點。`
        : `${col.godGroup} 為輔助團隊能量，可作為合作參考。`,
      {
        evidence: (
          <div
            className={`p-4 rounded-xl border transition-all ${
              isMyType
                ? "bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/20 shadow-lg"
                : "bg-black/35 border-white/5 opacity-85 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                  isMyType ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-300"
                }`}>
                  {col.tag}
                </span>
                <strong className="text-sm font-bold text-white">{col.godGroup}</strong>
              </div>
              {isMyType && (
                <span className="text-[10.5px] font-black text-amber-400 flex items-center gap-1 bg-amber-950/20 px-2 py-0.5 rounded">
                  <CheckCircle2 size={11} /> 您的命盤優勢焦點
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-sans">
              <div className="space-y-1">
                <p className="text-emerald-400 font-bold">💪 先天優勢精髓：</p>
                <p className="text-zinc-200 leading-relaxed">{col.strength}</p>
              </div>
              <div className="space-y-1">
                <p className="text-red-400 font-bold">⚠️ 暗影弱勢預警：</p>
                <p className="text-zinc-300 leading-relaxed">{col.weakness}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[11px] font-sans mt-3 pt-3 border-t border-white/5">
              <div className="text-zinc-400">
                <span className="text-blue-400 font-bold mr-1">🤝 黃金配對夥伴：</span>
                {col.bestPartner}
              </div>
              <div className="text-zinc-400">
                <span className="text-red-400 font-bold mr-1">🛑 合作或合夥忌諱：</span>
                {col.avoidPartner}
              </div>
            </div>
          </div>
        ),
        timeWindow: "依命盤主次十神判斷，長期適用。",
        actions: ["確認主次十神類型", "對照黃金配對夥伴", "避免忌諱合作對象"].slice(0, MAX_ACTIONS),
      }
    );
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
        <span className="text-blue-400 font-mono">05.</span> 十神團隊搭配與分工攻略
      </h2>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
        職場並非單打獨鬥。根據您的命盤，您可以了解您在團隊中的優劣勢。以下為講義中，<strong>「比、劫、食、傷、財、官殺、印」五大能量</strong>之完整職場優缺、互補與合作策略防線：
      </p>
      <div className="space-y-4">{sections.map((s) => <ContentSection key={s.title} grammar={s} defaultOpen={false} />)}</div>
      <UncertaintyNotice>
        十神團隊搭配依命盤十神分布推斷，實際人際與合作關係仍受個人性格與大運流年影響，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}
