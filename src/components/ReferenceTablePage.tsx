import React, { useState, useEffect } from "react";
import { FiveElement } from "../types";
import { Solar } from "lunar-javascript";
import { GAN_TO_ELEMENT, getYinYang } from "../constants";
import { Search, X, ArrowLeft } from "lucide-react";
import {
  LECTURE_DATA, WORKPLACE_STRATEGIES, wealthCareers, careerRoles,
  DAY_MASTER_RELATIONS, ELEMENT_BALANCE_RULES, getLiunianAndRemedy,
  WEALTH_GUIDELINES, WEALTH_PILLAR_MEANINGS, NO_WEALTH_REMEDIES, SOLVE_MONEY_LOSS, WEALTH_LOST_TIMING,
  CAREER_GUIDELINES, BRANCH_CAREER_SUITABILITY, CAREER_CROSS_MATCHING, JOB_TRANSFER_TIMING,
  DEFICIENT_ELEMENT_REMEDIES, RELATIVES_MAPPING,
  DAY_MASTER_TRAITS, BRANCH_GROUP_TRAITS, BRANCH_INTERACTIONS,
  SPOUSE_TRAITS_MAPPING, NO_SPOUSE_STAR_BRANCHES, PEACH_BLOSSOM_RULES, SPOUSE_STAR_POSITION, SPOUSE_STAR_CLASHES, PARTNER_TEN_GODS_TRAITS,
  HEALTH_DATA, CHILDREN_GUIDELINES, SIBLING_RELATIONS, FAMILY_CHANGES,
  PARTNER_MATCHING_DATA, MATCHING_TYPES, FENG_SHUI_2026, getHomeDecorGuide, getFlyingStarsForYear,
} from "../data";

// ... (keep HEAVENLY_STEMS and getTenGod here) ...
const HEAVENLY_STEMS = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
];

function getTenGod(dayMaster: string, otherGan: string): string {
  const dmEl = GAN_TO_ELEMENT[dayMaster as keyof typeof GAN_TO_ELEMENT];
  const otherEl = GAN_TO_ELEMENT[otherGan as keyof typeof GAN_TO_ELEMENT];
  const dmYy = getYinYang(dayMaster);
  const otherYy = getYinYang(otherGan);

  const isSameYinYang = dmYy === otherYy;

  const ELEMENT_GENERATES: Record<string, string> = {
    木: "火",
    火: "土",
    土: "金",
    金: "水",
    水: "木",
  };
  const ELEMENT_CONTROLS: Record<string, string> = {
    木: "土",
    火: "金",
    土: "水",
    金: "木",
    水: "火",
  };

  let relation = "";
  if (dmEl === otherEl) relation = "same";
  else if (ELEMENT_GENERATES[dmEl] === otherEl) relation = "generate";
  else if (ELEMENT_GENERATES[otherEl] === dmEl) relation = "generated";
  else if (ELEMENT_CONTROLS[dmEl] === otherEl) relation = "control";
  else if (ELEMENT_CONTROLS[otherEl] === dmEl) relation = "controlled";

  if (relation === "same") return isSameYinYang ? "比肩" : "劫財";
  if (relation === "generate") return isSameYinYang ? "食神" : "傷官";
  if (relation === "control") return isSameYinYang ? "偏財" : "正財";
  if (relation === "controlled") return isSameYinYang ? "七殺" : "正官";
  if (relation === "generated") return isSameYinYang ? "偏印" : "正印";
  return "";
}

export default function ReferenceTablePage({ onNavigate }: { onNavigate?: (step: number) => void }) {
  const initialTab = typeof window !== 'undefined' ? sessionStorage.getItem('currentRefTab') || 'basic' : 'basic';
  const [activeRefTab, setActiveRefTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [decorElement, setDecorElement] = useState<'金' | '木' | '水' | '火' | '土'>('金');
  const [decorGender, setDecorGender] = useState<'男' | '女'>('男');
  const [referenceFSYear, setReferenceFSYear] = useState(2026);

  // 當掛載時，確保如果是從其他頁面連過來的能正確讀取 state (如果有變化)
  useEffect(() => {
    const tab = sessionStorage.getItem('currentRefTab');
    if (tab) {
      setActiveRefTab(tab);
      sessionStorage.removeItem('currentRefTab');
    }
  }, []);

  const REF_TABS = [
    { key: 'basic', label: '基礎理論' },
    { key: 'timeline', label: '流年大運' },
    { key: 'health', label: '健康' },
    { key: 'wealth', label: '財富' },
    { key: 'family', label: '家人' },
    { key: 'friends', label: '人際' },
    { key: 'romance', label: '感情' },
    { key: 'career', label: '事業' },
  ];

  const TEN_GOD_INFO = [
    { name: '比肩/劫財', group: '比劫', desc: '自我意識、兄弟朋友、同輩、競爭。身弱喜比劫，身強忌比劫。' },
    { name: '食神/傷官', group: '食傷', desc: '才華、口才、創意、晚輩、福氣。身強喜洩秀，身弱忌洩氣過重。' },
    { name: '正財/偏財', group: '財星', desc: '金錢、物慾、勤奮、掌控感。男命代表妻子（正）與情人（偏）。' },
    { name: '正官/七殺', group: '官殺', desc: '地位、權力、法律、壓力、自律。女命代表丈夫（官）與情人（殺）。' },
    { name: '正印/偏印', group: '印星', desc: '長輩、保護、學習、名望、心靈。為生我之物，身弱者最愛。' },
  ];

  const PILLAR_POSITIONS = [
    { name: '年柱', timing: '出生~16歲', meaning: '祖輩、長輩、上司、社會環境、童年、頭部。' },
    { name: '月柱', timing: '17~32歲', meaning: '父母、手足、工作環境、青年、胸部與內臟。' },
    { name: '日柱', timing: '33~48歲', meaning: '自己（日干）、伴侶（日支）、中年、腹部。' },
    { name: '時柱', timing: '49歲~晚年', meaning: '子孫、下屬、事業成果、秘密、晚年、腿部。' },
  ];

  const FIVE_ELEMENTS_TRAITS = [
    { name: '木', nature: '仁', trait: '向上生長、惻隱之心、直爽、固執、肝膽系統。' },
    { name: '火', nature: '禮', trait: '散發光熱、熱情急躁、謙讓、虛榮、心血管系統。' },
    { name: '土', nature: '信', trait: '承載化育、厚重誠信、守舊、懶散、脾胃系統。' },
    { name: '金', nature: '義', trait: '變革肅殺、勇敢果斷、剛毅、冷酷、呼吸系統。' },
    { name: '水', nature: '智', trait: '潤下聰明、機智靈活、多謀、善變、腎臟泌尿系統。' },
  ];

  const doSearch = (term: string) => {
    if (!term) return null;
    const q = term.toLowerCase();
    
    // helper 
    const isMatch = (str: string) => str.toLowerCase().includes(q);

    const matches = [];

    // Search ten gods
    const tgMatches = TEN_GOD_INFO.filter(t => isMatch(t.name) || isMatch(t.desc) || isMatch(t.group));
    if (tgMatches.length > 0) matches.push({ title: '十神理論', items: tgMatches.map(t => `${t.name}: ${t.desc}`) });

    // Search elements
    const feMatches = FIVE_ELEMENTS_TRAITS.filter(t => isMatch(t.name) || isMatch(t.trait));
    if (feMatches.length > 0) matches.push({ title: '五行特質', items: feMatches.map(t => `${t.name} (${t.nature}): ${t.trait}`) });

    // Search positions
    const pMatches = PILLAR_POSITIONS.filter(t => isMatch(t.name) || isMatch(t.meaning));
    if (pMatches.length > 0) matches.push({ title: '四柱宮位', items: pMatches.map(t => `${t.name} (${t.timing}): ${t.meaning}`) });

    // Search Wealth
    const wcMatches = wealthCareers.filter(t => isMatch(t.tenGodName) || isMatch(t.suitableCareers) || isMatch(t.wealthStyle));
    if (wcMatches.length > 0) matches.push({ title: '得財策略', items: wcMatches.map(t => `${t.tenGodName} - 適合: ${t.suitableCareers}`) });

    // Search Career
    const crMatches = careerRoles.filter(t => isMatch(t.tenGodName) || isMatch(t.role) || isMatch(t.suitable) || isMatch(t.advice));
    if (crMatches.length > 0) matches.push({ title: '職業適配與特質', items: crMatches.map(t => `${t.tenGodName} (${t.role}): ${t.suitable}`) });

    // Search Workplace
    const wpMatches = Object.entries(WORKPLACE_STRATEGIES).filter(([k, v]) => isMatch(k) || isMatch(v.traits) || isMatch(v.title));
    if (wpMatches.length > 0) matches.push({ title: '職場相處策略', items: wpMatches.map(([k, v]) => `${k} (${v.title}): ${v.traits}`) });

    // Search Romance
    const rpMatches = Object.entries(LECTURE_DATA.SPOUSE_PALACE_TRAITS).filter(([k, v]) => isMatch(k) || isMatch(v.desc) || isMatch(v.sub));
    if (rpMatches.length > 0) matches.push({ title: '伴侶長相與特質', items: rpMatches.map(([k, v]) => `${k}: ${v.desc}`) });

    // Search Family/Social
    const parMatches = Object.entries(LECTURE_DATA.PARTNER_TRAITS).filter(([k, v]) => isMatch(k) || isMatch(v.pros) || isMatch(v.cons));
    if (parMatches.length > 0) matches.push({ title: '人際合盤策略', items: parMatches.map(([k, v]) => `${k} - 優勢: ${v.pros}`) });
    
    return matches;
  };

  const searchResults = doSearch(searchQuery);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* 頁面標題 */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-serif font-bold display-title mb-3">理論說明</h1>
        <div className="gold-divider mt-4 mx-auto max-w-[200px]"></div>
      </div>

      {onNavigate && (
        <div className="flex items-center">
          <button
            onClick={() => onNavigate(4)}
            className="flex items-center gap-2 text-zen-muted hover:text-zen-text transition-colors group font-sans"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-sm">返回儀表板</span>
          </button>
        </div>
      )}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-serif font-bold text-zen-text flex items-center gap-2">
            <span className="w-1.5 h-6 bg-zen-gold inline-block rounded-full"></span>
            📖 理論速查
          </h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋理論關鍵字..."
              className="w-full bg-zen-surface border border-zen-border text-zen-text pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:border-zen-gold text-sm font-sans"
            />
            <Search className="absolute left-3 top-2.5 text-zen-muted" size={16} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zen-muted hover:text-zen-text"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {searchQuery && searchResults ? (
          <div className="space-y-6">
            <p className="text-base text-zen-gold font-bold mb-4 font-sans">搜尋結果 ({searchQuery})</p>
            {searchResults.length === 0 ? (
              <div className="text-center p-8 text-zen-muted border border-zen-border rounded-xl bg-zen-surface/50 font-sans">
                 沒有找到符合的理論。
              </div>
            ) : (
              searchResults.map((sec, idx) => (
                <div key={idx} className="bg-zen-surface/60 border border-zen-border rounded-xl p-5">
                  <h3 className="font-serif font-bold text-zen-gold text-sm mb-3 border-b border-zen-border pb-2">{sec.title}</h3>
                  <ul className="space-y-2">
                    {sec.items.map((item, i) => (
                      <li key={i} className="text-[13px] text-zen-text flex items-start gap-2 font-sans">
                        <span className="text-zen-gold mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* 標籤導航 */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-zen-border pb-4">
          {REF_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveRefTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all font-sans ${
                activeRefTab === tab.key
                  ? 'bg-zen-gold/20 text-zen-gold border border-zen-gold/30'
                  : 'text-zen-muted border border-transparent hover:text-zen-text hover:bg-zen-surface/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeRefTab === 'basic' && (
          <div className="space-y-8">

            {/* 日主特質 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5">
              <h3 className="font-serif font-bold text-zen-gold text-sm mb-4">日主模樣 (天干)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-[13px]">
                {Object.values(DAY_MASTER_TRAITS).map((item, i) => (
                  <div key={i} className="p-4 bg-zen-bg/50 rounded-xl border border-zen-border hover:border-zen-gold/30 transition-all">
                    <h4 className="text-zen-text font-bold mb-1 border-b border-zen-border pb-1 font-serif">{item.stem} ({item.yinYang}{item.element}) - {item.image}</h4>
                    <p className="text-zen-muted mt-2 font-sans">{item.trait}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 地支特性 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5">
              <h3 className="font-serif font-bold text-zen-gold text-sm mb-4">看八字內什麼多 (地支特質)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                {BRANCH_GROUP_TRAITS.map((item, i) => (
                  <div key={i} className="p-4 bg-zen-bg/50 rounded-xl border border-zen-border hover:border-zen-gold/30 transition-all">
                     <h4 className="text-zen-text font-bold mb-1 border-b border-zen-border pb-1 font-serif">{item.name}：{item.branches.join('、')}</h4>
                     <p className="text-zen-gold font-bold mt-2 font-sans">{item.meaning}</p>
                     <ul className="list-disc pl-4 text-zen-muted mt-1 space-y-1 font-sans">
                       {item.details.map((d, j) => <li key={j}>{d}</li>)}
                     </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 地支互動 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5">
              <h3 className="font-serif font-bold text-zen-gold text-sm mb-4">地支互動關聯 (刑、沖、害、破)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {BRANCH_INTERACTIONS.map((item, i) => (
                  <div key={i} className="p-4 bg-zen-bg/50 rounded-xl border border-zen-border hover:border-zen-gold/30 transition-all">
                     <h4 className="text-zen-text font-bold mb-1 text-base font-serif">{item.name}</h4>
                     <p className="text-zen-muted mb-2 font-sans">{item.effect}</p>
                     {item.types.length > 0 && (
                       <ul className="list-disc pl-4 text-zen-muted space-y-1 font-sans">
                         {item.types.map((t, j) => (
                           <li key={j}><strong>{t.type}</strong>{t.desc ? `：${t.desc}` : ''}</li>
                         ))}
                       </ul>
                     )}
                  </div>
                ))}
              </div>
            </div>

        {/* 原有表單內容 */}
        <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 overflow-x-auto mb-8">
          <h3 className="font-serif font-bold text-zen-gold text-sm mb-4 border-b border-zen-border pb-2">📚 十神關係組合 (講義原版)</h3>
          <p className="text-base text-zen-muted mb-4 italic font-sans">
            依據各日主（甲木～癸水）分別列出其對應的陰陽異性與同性之十神關係，完全收錄自講義精華。
          </p>
          <div className="space-y-6">
            {Object.entries(DAY_MASTER_RELATIONS).map(([dm, relations]) => (
              <div key={dm} className="bg-zen-bg/50 border border-zen-border rounded-xl p-5">
                <h4 className="text-zen-gold font-bold mb-3 border-b border-zen-gold/20 pb-1 text-lg font-serif">
                  {dm}{GAN_TO_ELEMENT[dm as keyof typeof GAN_TO_ELEMENT]}日主
                </h4>
                <div className="overflow-x-auto">
                  <table className="zebra-table text-sm text-left min-w-[500px]">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 w-1/4">關係</th>
                        <th className="px-4 py-3 w-1/4">對應五行</th>
                        <th className="px-4 py-3 w-1/4">陰陽異性</th>
                        <th className="px-4 py-3 w-1/4">陰陽同性</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relations.map((rel, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-bold font-sans">{rel.elementGroup}</td>
                          <td className="px-4 py-3 font-sans">{rel.element}</td>
                          <td className="px-4 py-3 font-sans">
                            <span className="inline-block w-8 text-rose-300">{rel.heteroGod}</span>
                            <span className="text-zen-muted px-2">|</span>
                            <span className="text-zen-muted">{rel.heteroStem}</span>
                          </td>
                          <td className="px-4 py-3 font-sans">
                            <span className="inline-block w-8 text-blue-300">{rel.homoGod}</span>
                            <span className="text-zen-muted px-2">|</span>
                            <span className="text-zen-muted">{rel.homoStem}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4 overflow-x-auto mb-8">
          <h3 className="font-bold text-primary text-sm mb-3 border-b border-zen-border pb-2">📊 十天干生尅與十神速查</h3>
          <p className="text-base text-zen-muted mb-4 italic">
            表中左側行為「日主」，上方列為「其他天干」。交叉點即為日主對該天干的「十神」。
          </p>
          <div className="min-w-[700px]">
            <table className="w-full text-sm text-center border-collapse">
              <thead>
                <tr>
                  <th className="border border-zen-border p-2 bg-black/40 text-zen-text w-20">
                    日主 \ 天干
                  </th>
                  {HEAVENLY_STEMS.map((gan) => (
                    <th
                      key={"col-" + gan}
                      className="border border-zen-border p-2 bg-black/40 text-primary w-12"
                    >
                      {gan}
                      <br />
                      <span className="text-sm text-zen-muted font-normal">
                        {GAN_TO_ELEMENT[gan as keyof typeof GAN_TO_ELEMENT]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEAVENLY_STEMS.map((dm) => (
                  <tr key={"row-" + dm}>
                    <td className="border border-zen-border p-2 bg-black/40 text-primary font-bold">
                      {dm}
                      <br />
                      <span className="text-sm text-zen-muted font-normal">
                        {GAN_TO_ELEMENT[dm as keyof typeof GAN_TO_ELEMENT]}
                      </span>
                    </td>
                    {HEAVENLY_STEMS.map((gan) => (
                      <td
                        key={"cell-" + dm + "-" + gan}
                        className="border border-zen-border p-2 text-zen-text"
                      >
                        {getTenGod(dm, gan)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4 overflow-x-auto">
          <h3 className="font-bold text-blue-400 text-sm mb-3">
            十二地支藏干表
          </h3>
          <p className="text-[13px] text-zen-muted mb-4">
            地支為體，藏干為用。這是判斷地支能量與流年沖合的重要依據。
          </p>
          <div className="min-w-[600px]">
            <table className="w-full text-sm text-center border-collapse">
              <thead>
                <tr>
                  <th className="border border-zen-border p-2 bg-black/40 text-zen-text w-16">
                    地支
                  </th>
                  <th className="border border-zen-border p-2 bg-black/40 text-blue-400 w-16">
                    陰陽五行
                  </th>
                  <th className="border border-zen-border p-2 bg-black/40 text-zen-text">
                    本氣
                  </th>
                  <th className="border border-zen-border p-2 bg-black/40 text-zen-text">
                    中氣
                  </th>
                  <th className="border border-zen-border p-2 bg-black/40 text-zen-text">
                    餘氣
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { zhi: "子", wx: "陰水", main: "癸", mid: "-", res: "-" },
                  { zhi: "丑", wx: "陰土", main: "己", mid: "辛", res: "癸" },
                  { zhi: "寅", wx: "陽木", main: "甲", mid: "丙", res: "戊" },
                  { zhi: "卯", wx: "陰木", main: "乙", mid: "-", res: "-" },
                  { zhi: "辰", wx: "陽土", main: "戊", mid: "乙", res: "癸" },
                  { zhi: "巳", wx: "陰火", main: "丙", mid: "庚", res: "戊" },
                  { zhi: "午", wx: "陽火", main: "丁", mid: "己", res: "-" },
                  { zhi: "未", wx: "陰土", main: "己", mid: "丁", res: "乙" },
                  { zhi: "申", wx: "陽金", main: "庚", mid: "壬", res: "戊" },
                  { zhi: "酉", wx: "陰金", main: "辛", mid: "-", res: "-" },
                  { zhi: "戌", wx: "陽土", main: "戊", mid: "辛", res: "丁" },
                  { zhi: "亥", wx: "陰水", main: "壬", mid: "甲", res: "-" },
                ].map((r) => (
                  <tr key={r.zhi}>
                    <td className="border border-zen-border p-2 bg-black/40 font-bold text-blue-400">
                      {r.zhi}
                    </td>
                    <td className="border border-zen-border p-2 text-zen-muted text-sm">
                      {r.wx}
                    </td>
                    <td className="border border-zen-border p-2 text-zen-text">
                      {r.main}
                    </td>
                    <td className="border border-zen-border p-2 text-zen-muted">
                      {r.mid}
                    </td>
                    <td className="border border-zen-border p-2 text-zen-muted">
                      {r.res}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
          <h3 className="font-bold text-amber-500 text-sm mb-3">
            地支沖合刑害速查
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div className="space-y-2">
              <p className="font-bold text-zen-text border-b border-zen-border pb-1">🔘 六合 (穩定/合作)</p>
              <p className="text-zen-muted">子丑、寅亥、卯戌、辰酉、巳申、午未</p>
              
              <p className="font-bold text-zen-text border-b border-zen-border pb-1 mt-4">🔵 三合 (強大能量/主流)</p>
              <ul className="text-zen-muted list-disc list-inside">
                <li>申子辰三合水局</li>
                <li>亥卯未三合木局</li>
                <li>寅午戌三合火局</li>
                <li>巳酉丑三合金局</li>
              </ul>

              <p className="font-bold text-zen-text border-b border-zen-border pb-1 mt-4">🟢 三會 (地域/最強五行)</p>
              <ul className="text-zen-muted list-disc list-inside">
                <li>寅卯辰三會木局</li>
                <li>巳午未三會火局</li>
                <li>申酉戌三會金局</li>
                <li>亥子丑三會水局</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-rose-500 border-b border-zen-border pb-1">🔴 六沖 (變動/衝突)</p>
              <p className="text-zen-muted">子午、丑未、寅申、卯酉、辰戌、巳亥</p>

              <p className="font-bold text-amber-400 border-b border-zen-border pb-1 mt-4">⚠️ 相刑 (拉扯/糾結)</p>
              <ul className="text-zen-muted list-disc list-inside">
                <li>寅巳申 (無恩之刑)</li>
                <li>丑戌未 (恃勢之刑)</li>
                <li>子卯 (無禮之刑)</li>
                <li>辰午酉亥 (自刑)</li>
              </ul>

              <p className="font-bold text-orange-400 border-b border-zen-border pb-1 mt-4">⚠️ 六害/六破 (消耗/摩擦)</p>
              <p className="text-zen-muted"><span className="text-zen-text">害：</span>子未、丑午、寅巳、卯辰、申亥、酉戌</p>
              <p className="text-zen-muted"><span className="text-zen-text">破：</span>子酉、午卯、寅亥、巳申、辰丑、戌未</p>
            </div>
          </div>
        </div>
        </div>
        )}

        {/* 流年大運理論 */}
        {activeRefTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-amber-500 text-sm mb-3">五行喜忌與大運、流年補運法則</h3>
              <p className="text-sm text-zen-muted mb-6 italic">
                完全收錄自講義精華。判斷流年與大運的好壞，以及該如何補運，取決於五行身強身弱之平衡。
                <br/>身強以「洩剋耗」為吉；身弱以「生扶」為吉。唯身弱逢好運（生扶）時，因已得助，反喜「洩剋耗」之流年調和。
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['木', '火', '土', '金', '水'].map((el) => {
                  const strongRule = ELEMENT_BALANCE_RULES.find(r => r.dayMasterElement === el && r.strength === '身強');
                  const weakRule = ELEMENT_BALANCE_RULES.find(r => r.dayMasterElement === el && r.strength === '身弱');
                  
                  if (!strongRule || !weakRule) return null;

                  const renderTree = (rule: typeof strongRule) => {
                    const isStrong = rule.strength === '身強';
                    const goodDayun = rule.goodElements;
                    const badDayun = rule.badElements;
                    
                    const gdState = getLiunianAndRemedy(el as FiveElement, rule.strength, true);
                    const bdState = getLiunianAndRemedy(el as FiveElement, rule.strength, false);

                    return (
                      <div className="space-y-4 text-xs md:text-sm">
                        <div className="flex items-center gap-2 font-bold text-lg border-b border-zen-border pb-1 mb-2">
                          <span className={`${
                            el === '木' ? 'text-green-500' : 
                            el === '火' ? 'text-red-500' :
                            el === '土' ? 'text-yellow-600' :
                            el === '金' ? 'text-yellow-400' :
                            'text-blue-500'
                          } bg-zen-surface/80 px-3 py-1 rounded-full`}>{el}命人 | {rule.strength}</span>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="w-1 bg-zen-border mx-2"></div>
                          <div className="flex-1 space-y-4">
                            {/* Good Dayun */}
                            <div className="bg-black/30 border border-zen-border p-3 rounded-lg">
                              <p className="text-emerald-400 font-bold mb-2">好的大運: <span className="text-zen-text ml-1">{goodDayun.join(' ')}</span></p>
                              <div className="ml-4 space-y-2 border-l border-zen-border pl-4 py-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                  <span className="text-emerald-300">好的流年: {gdState.goodLiunian.join(' ')}</span>
                                  <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded text-xs">補運: {gdState.remedy.join(' ')}</span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                  <span className="text-rose-400">不好的流年: {gdState.badLiunian.join(' ')}</span>
                                  <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded text-xs">補運: {gdState.remedy.join(' ')}</span>
                                </div>
                              </div>
                            </div>
                            {/* Bad Dayun */}
                            <div className="bg-black/30 border border-zen-border p-3 rounded-lg">
                              <p className="text-rose-500 font-bold mb-2">不好的大運: <span className="text-zen-text ml-1">{badDayun.join(' ')}</span></p>
                              <div className="ml-4 space-y-2 border-l border-zen-border pl-4 py-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                  <span className="text-emerald-300">好的流年: {bdState.goodLiunian.join(' ')}</span>
                                  <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded text-xs">補運: {bdState.remedy.join(' ')}</span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                  <span className="text-rose-400">不好的流年: {bdState.badLiunian.join(' ')}</span>
                                  <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded text-xs">補運: {bdState.remedy.join(' ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <React.Fragment key={el}>
                      <div className="bg-zen-surface/80/30 border border-zen-border/50 rounded-xl p-4">
                        {renderTree(strongRule)}
                      </div>
                      <div className="bg-zen-surface/80/30 border border-zen-border/50 rounded-xl p-4">
                        {renderTree(weakRule)}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 財富理論 */}
        {activeRefTab === 'wealth' && (
          <div className="space-y-6">
            {/* 財星系統表格 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">財星系統</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-zen-text border-collapse">
                  <thead>
                    <tr className="border-b border-zen-border">
                      <th className="text-left py-1 px-2 text-zen-muted">概念</th>
                      <th className="text-left py-1 px-2 text-zen-muted">說明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-yellow-300">正財</td>
                      <td className="py-1 px-2">我剋者異陰陽 — 穩定收入、正當職業</td>
                    </tr>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-yellow-300">偏財</td>
                      <td className="py-1 px-2">我剋者同陰陽 — 意外之財、投資、副業</td>
                    </tr>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-yellow-300">財星入命</td>
                      <td className="py-1 px-2">天干透財或地支藏財 — 財運強弱指標</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-medium text-yellow-300">財庫</td>
                      <td className="py-1 px-2">辰戌丑未四庫 — 財星入庫為聚財</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 求財五行對照表 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">求財五行對照</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-zen-text border-collapse">
                  <thead>
                    <tr className="border-b border-zen-border">
                      <th className="text-left py-1 px-2 text-zen-muted">日主</th>
                      <th className="text-left py-1 px-2 text-zen-muted">財星五行</th>
                      <th className="text-left py-1 px-2 text-zen-muted">財星天干</th>
                      <th className="text-left py-1 px-2 text-zen-muted">財星地支</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-blue-300">金</td>
                      <td className="py-1 px-2">木</td>
                      <td className="py-1 px-2">甲、乙</td>
                      <td className="py-1 px-2">寅、卯、辰、未、亥</td>
                    </tr>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-green-300">木</td>
                      <td className="py-1 px-2">土</td>
                      <td className="py-1 px-2">戊、己</td>
                      <td className="py-1 px-2">寅、辰、巳、午、未、申、戌</td>
                    </tr>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-cyan-300">水</td>
                      <td className="py-1 px-2">火</td>
                      <td className="py-1 px-2">丙、丁</td>
                      <td className="py-1 px-2">寅、巳、午、未、戌</td>
                    </tr>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-red-300">火</td>
                      <td className="py-1 px-2">金</td>
                      <td className="py-1 px-2">庚、辛</td>
                      <td className="py-1 px-2">申、酉、丑、辰、戌、亥</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-medium text-amber-300">土</td>
                      <td className="py-1 px-2">水</td>
                      <td className="py-1 px-2">壬、癸</td>
                      <td className="py-1 px-2">亥、子、申、辰</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 致富流日說明 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">致富流日</h3>
              <p className="text-xs text-zen-muted mb-2">求財應選擇「財星能量強」的流日：</p>
              <ul className="text-xs text-zen-text space-y-1">
                <li><strong className="text-blue-300">日主為金</strong>：甲乙日、壬癸日（木日干＝金之財）</li>
                <li><strong className="text-green-300">日主為木</strong>：丙丁日、戊己日（火土日干＝木之財）</li>
                <li><strong className="text-cyan-300">日主為水</strong>：甲乙日、丙丁日（木火日干＝水之財）</li>
              </ul>
            </div>

            {/* 大運流年與財運表格 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">大運流年與財運</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-zen-text border-collapse">
                  <thead>
                    <tr className="border-b border-zen-border">
                      <th className="text-left py-1 px-2 text-zen-muted">指標</th>
                      <th className="text-left py-1 px-2 text-zen-muted">意義</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-yellow-300">財星大运</td>
                      <td className="py-1 px-2">十年財運整體走向</td>
                    </tr>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-yellow-300">財星流年</td>
                      <td className="py-1 px-2">當年財運變化</td>
                    </tr>
                    <tr className="border-b border-zen-border">
                      <td className="py-1 px-2 font-medium text-red-300">比劫奪財</td>
                      <td className="py-1 px-2">比肩/劫財大運易破財</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-medium text-green-300">食傷生財</td>
                      <td className="py-1 px-2">食神/傷官大運易創造財富</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">財星宮位解析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px]">
                {Object.entries(WEALTH_PILLAR_MEANINGS).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/30 rounded border border-yellow-500/10 space-y-1">
                    <strong className="text-yellow-400 block border-b border-yellow-900/50 pb-1 mb-2">{k} ({v.title})</strong> 
                    <ul className="list-disc pl-4 text-zen-text space-y-1">
                      {v.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">財旺流日與風水財位</h3>
              <div className="space-y-4 text-[13px]">
                {Object.entries(WEALTH_GUIDELINES).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/30 rounded border border-yellow-500/10">
                    <h4 className="text-yellow-400 font-bold text-base mb-2 border-b border-yellow-900/50 pb-1">{k}命人</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                       <div>
                        <p className="text-zen-text font-bold mb-1">💰 財旺流日組合</p>
                        <p className="text-zen-text"><strong>適合天干：</strong>{v.goodWealthDays.stems}</p>
                        <p className="text-zen-text"><strong>適合地支：</strong>{v.goodWealthDays.branches}</p>
                        <p className="text-zen-text"><strong>最佳組合：</strong>{v.goodWealthDays.combinations}</p>
                        <p className="text-zen-muted mt-1">例如：{v.goodWealthDays.combinationsDetail.join('、')}</p>
                      </div>
                      <div>
                        <p className="text-zen-text font-bold mb-1">🗺️ 風水財位 (我剋者為財：{v.wealthElement})</p>
                        <p className="text-zen-text"><strong>得財方位：</strong>{v.fengShui.directions.join('、')}</p>
                        <p className="text-zen-text"><strong>旺財色系：</strong>{v.fengShui.colors}</p>
                        <p className="text-zen-text"><strong>得財佈置：</strong>{v.fengShui.setup.join('、')}</p>
                        <p className="text-zen-text"><strong>生肖小物：</strong>{v.fengShui.luckyItems}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-zen-border">
                       <p className="text-yellow-300"><strong>得財流日加強催財：</strong>{v.fengShui.boostActions.join('、')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">命盤無財的得財方式</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {Object.entries(NO_WEALTH_REMEDIES).map(([k, v]) => (
                   <div key={k} className="p-3 bg-black/30 rounded border border-yellow-500/10">
                     <strong className="text-yellow-400 block mb-1">{k}</strong>
                     <span className="text-zen-text">{v}</span>
                   </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">大運流年破財時機</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div className="p-3 bg-black/30 rounded border border-rose-900/30">
                  <h4 className="text-zen-text font-bold mb-2">💪 身強破財時機</h4>
                  <ul className="list-disc pl-4 text-zen-text space-y-1">
                    {WEALTH_LOST_TIMING.strong.map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                </div>
                <div className="p-3 bg-black/30 rounded border border-rose-900/30">
                  <h4 className="text-zen-text font-bold mb-2">💧 身弱破財時機</h4>
                  <ul className="list-disc pl-4 text-zen-text space-y-1">
                    {WEALTH_LOST_TIMING.weak.map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">大運流年破財解法</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                {SOLVE_MONEY_LOSS.map((item, i) => (
                   <div key={i} className="p-3 bg-black/30 rounded border border-rose-900/30">
                     <strong className="text-rose-400 block mb-2">{i+1}. {item.title}</strong>
                     <ul className="list-disc pl-4 text-zen-text space-y-1">
                       {item.details.map((d, j) => <li key={j}>{d}</li>)}
                     </ul>
                   </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-yellow-500 text-sm mb-3">得財策略 (依十神)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {wealthCareers.map((item, i) => (
                  <div key={i} className="p-3 bg-black/30 rounded border border-yellow-500/10">
                    <strong className="text-yellow-400">{item.tenGodName}:</strong> 
                    <div className="text-zen-text ml-2 mt-1">
                       <p><strong>適合:</strong> {item.suitableCareers}</p>
                       <p className="mt-1"><strong>風格:</strong> {item.wealthStyle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🏡 風水軟裝添運對照表 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-zen-border pb-3 gap-3">
                <div>
                  <h3 className="font-bold text-yellow-500 text-base">🏡 住宅軟裝添運五行對照表</h3>
                  <p className="text-xs text-zen-muted mt-1">徐玉蘭的風水磁場順心術 — 依日常大能量與五行對應催旺</p>
                </div>
                {/* 篩選按鈕 */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-black/40 rounded-lg p-1 border border-zen-border flex gap-1 text-xs">
                    {(['金', '木', '水', '火', '土'] as const).map(el => (
                      <button
                        key={el}
                        onClick={() => setDecorElement(el)}
                        className={`px-3 py-1 rounded transition-all font-bold ${
                          decorElement === el
                            ? 'bg-yellow-600 text-zen-text shadow'
                            : 'text-zen-muted hover:text-zen-text'
                        }`}
                      >
                        {el}命人
                      </button>
                    ))}
                  </div>
                  <div className="bg-black/40 rounded-lg p-1 border border-zen-border flex gap-1 text-xs">
                    {(['男', '女'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setDecorGender(g)}
                        className={`px-3 py-1 rounded transition-all font-bold ${
                          decorGender === g
                            ? 'bg-indigo-600 text-zen-text shadow'
                            : 'text-zen-muted hover:text-zen-text'
                        }`}
                      >
                        {g}命
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 渲染選定條件的軟裝建議 */}
              {(() => {
                const guide = getHomeDecorGuide(decorElement, decorGender);
                if (!guide) return null;

                return (
                  <div className="space-y-4 text-[13px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {guide.palaces.map((p, idx) => (
                        <div key={idx} className="p-4 bg-black/30 rounded-xl border border-zen-border hover:border-zen-border transition-all space-y-2.5">
                          <div className="flex items-center justify-between border-b border-zen-border/80 pb-1.5">
                            <span className="font-bold text-yellow-500 text-sm">📍 {p.palace}</span>
                            <span className="text-[11px] text-zen-muted bg-zen-surface/80/60 px-2 py-0.5 rounded">{p.location}</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-zen-muted"><strong>建議顏色:</strong> <span className="text-zen-text font-semibold">{p.colors}</span></p>
                            <p className="text-zen-muted"><strong>開運方位:</strong> <span className="text-amber-500 font-bold">{p.directions.join('、')}</span></p>
                            <p className="text-zen-muted"><strong>材質建議:</strong> <span className="text-zen-text">{p.material}</span></p>
                          </div>
                          <div className="pt-1.5 border-t border-zen-border/40">
                            <p className="text-zen-muted"><strong>生肖擺件:</strong> <span className="text-teal-400 font-bold">{p.zodiac}</span></p>
                            <span className="text-zen-muted text-xs block pl-1 mt-0.5">※ {p.zodiacMaterial}</span>
                          </div>
                          <div className="bg-black/30 p-2.5 rounded-lg border border-zen-border/60 mt-1">
                            <p className="text-yellow-400/90 font-bold text-xs mb-1 flex items-center gap-1">🎁 添運配置物件：</p>
                            <p className="text-zen-text leading-relaxed text-xs">{p.items.join('、')}</p>
                          </div>
                          {p.flowerSide && (
                            <p className="text-rose-400 text-xs mt-2 italic font-medium flex items-center gap-1">🌸 鮮花置放：{p.flowerSide}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 水缸佈置細節專區 */}
                    <div className="bg-gradient-to-r from-teal-950/10 to-teal-900/15 p-4 rounded-xl border border-teal-800/30 space-y-3">
                      <h4 className="text-teal-400 font-bold text-sm flex items-center gap-1.5">
                        🌊 專屬招財水缸佈置細節 ({decorElement}命人財位專用)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <p className="text-zen-text"><strong>📏 尺寸大小:</strong> {guide.waterTank.size}</p>
                          <p className="text-zen-text"><strong>🏺 材質顏色:</strong> {guide.waterTank.material} ({guide.waterTank.color})</p>
                          <p className="text-zen-text"><strong>💧 水量與內容:</strong> 水量放置 {guide.waterTank.waterLevel}，放入 {guide.waterTank.contents}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-zen-text"><strong>⚡ 水流動力:</strong> {guide.waterTank.pump}</p>
                          <p className="text-zen-text"><strong>🔄 換水頻率:</strong> {guide.waterTank.changeFrequency}</p>
                        </div>
                      </div>
                      <div className="text-xs text-zen-muted border-t border-teal-900/20 pt-2 pl-1 space-y-0.5">
                        {guide.waterTank.notes.map((note, idx) => (
                          <p key={idx}>⚠️ 備註: {note}</p>
                        ))}
                      </div>
                    </div>

                    {/* 佈置原則 */}
                    <div className="bg-zen-surface/40/60 p-3 rounded-lg border border-zen-border/80 text-xs text-zen-muted leading-relaxed">
                      <p className="font-bold text-zen-text mb-1">💡 軟裝開運佈置兩大核心原則：</p>
                      {guide.generalTips.map((tip, idx) => (
                        <p key={idx} className="mt-0.5">{tip}</p>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 事業理論 */}
        {activeRefTab === 'career' && (
          <div className="space-y-6">
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 text-sm mb-3">八字地支與合適工作環境</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                {BRANCH_CAREER_SUITABILITY.map((item, i) => (
                  <div key={i} className="p-3 bg-black/30 rounded border border-emerald-500/20 space-y-2">
                    <h4 className="text-zen-text font-bold">{item.type}</h4>
                    <p className="text-emerald-300 font-bold border-b border-emerald-900/50 pb-1">{item.trait}</p>
                    <ul className="list-disc pl-4 text-zen-text space-y-1">
                      {item.details.map((d, j) => <li key={j}>{d}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 text-sm mb-3">官旺流日與風水事業位</h3>
              <div className="space-y-4 text-[13px]">
                {Object.entries(CAREER_GUIDELINES).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/30 rounded border border-emerald-500/10">
                    <h4 className="text-emerald-400 font-bold text-base mb-2 border-b border-emerald-900/50 pb-1">{k}命人</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-zen-text font-bold mb-1">💼 官旺流日組合</p>
                        <p className="text-zen-text"><strong>天干：</strong>{v.goodDays.stems}</p>
                        <p className="text-zen-text"><strong>地支：</strong>{v.goodDays.branches}</p>
                        <p className="text-zen-text"><strong>組合範例：</strong>{v.goodDays.combinations.join('、')}</p>
                      </div>
                      <div>
                        <p className="text-zen-text font-bold mb-1">🗺️ 風水事業位 (剋我者為官殺：{v.fengShui.element})</p>
                        <p className="text-zen-text"><strong>方位：</strong>{v.fengShui.directions.join('、')}</p>
                        <p className="text-zen-text"><strong>開運色彩：</strong>{v.fengShui.colors}</p>
                        <p className="text-zen-text"><strong>佈置擺件：</strong>{v.fengShui.luckyItems.join(' / ')}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zen-border">
                      <p className="text-emerald-300"><strong>事業流日補運：</strong>{v.boostActions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 text-sm mb-3">轉職時機與職涯建議 (五行身強弱)</h3>
              <div className="grid grid-cols-1 gap-2 text-[13px]">
                <div className="p-3 bg-black/30 rounded border border-emerald-500/10">
                   <p className="text-emerald-300"><strong>【身強】</strong> {JOB_TRANSFER_TIMING.strong}</p>
                </div>
                <div className="p-3 bg-black/30 rounded border border-emerald-500/10">
                   <p className="text-teal-300"><strong>【身弱・五行平衡】</strong> {JOB_TRANSFER_TIMING.weak_balanced}</p>
                </div>
                <div className="p-3 bg-black/30 rounded border border-emerald-500/10">
                   <p className="text-blue-300"><strong>【身弱・五行不平衡】</strong> {JOB_TRANSFER_TIMING.weak_unbalanced}</p>
                </div>
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 text-sm mb-3">財星與其他十神的跨界工作發展</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {Object.entries(CAREER_CROSS_MATCHING).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/30 rounded border border-emerald-500/10">
                    <strong className="text-emerald-400 block mb-2 border-b border-emerald-900/50 pb-1">{k}為用神或佔比較重時</strong>
                    <div className="space-y-3">
                      {v.map((match, i) => (
                        <div key={i}>
                          <p className="text-zen-text font-bold">配 【{match.type}】: {match.title}</p>
                          <p className="text-zen-muted whitespace-pre-line">{match.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 text-sm mb-3">十神職業適配與工作特質</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {careerRoles.map((item, i) => (
                  <div key={i} className="p-3 bg-black/30 rounded border border-emerald-500/10 space-y-1">
                    <strong className="text-emerald-300 text-sm">{item.tenGodName} <span className="text-zen-muted text-sm">({item.role})</span></strong>
                    <p className="text-zen-text"><strong>特質：</strong>{item.suitable}</p>
                    <p className="text-zen-muted"><strong>適合：</strong>{item.advice}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 text-sm mb-3">職場相處與管理策略</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {Object.entries(WORKPLACE_STRATEGIES).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/30 rounded border border-emerald-500/10 space-y-1">
                    <strong className="text-emerald-300">{k} ({v.title})</strong>
                    <p className="text-zen-muted text-sm mb-2">{v.traits}</p>
                    <p className="text-zen-text"><strong className="text-zen-text">對上級 (向上管理)</strong>: {v.up}</p>
                    <p className="text-zen-text"><strong className="text-zen-text">對同儕 (平行協作)</strong>: {v.same}</p>
                    <p className="text-zen-text"><strong className="text-zen-text">對下屬 (向下領導)</strong>: {v.down}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 姻緣理論 */}
        {activeRefTab === 'romance' && (
          <div className="space-y-6">
            {/* 夫妻星系統說明 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-rose-400 text-sm mb-3">夫妻星系統</h3>
              <p className="text-xs text-zen-muted mb-2">男命以「財星」為夫妻星，女命以「官殺」為夫妻星：</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-zen-muted">
                <li><strong className="text-zen-text">木日主</strong>：男 → 土（戊、己）；女 → 金（庚、辛）</li>
                <li><strong className="text-zen-text">火日主</strong>：男 → 金（庚、辛）；女 → 水（壬、癸）</li>
                <li><strong className="text-zen-text">土日主</strong>：男 → 水（壬、癸）；女 → 木（甲、乙）</li>
                <li><strong className="text-zen-text">金日主</strong>：男 → 木（甲、乙）；女 → 火（丙、丁）</li>
                <li><strong className="text-zen-text">水日主</strong>：男 → 火（丙、丁）；女 → 土（戊、己）</li>
              </ul>
            </div>

            {/* 姻緣判別順序 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-rose-400 text-sm mb-3">姻緣判別順序</h3>
              <ol className="list-decimal list-inside space-y-1 text-xs text-zen-muted">
                <li><strong className="text-zen-text">天干（外顯）夫妻星</strong> — 先看重天干上的夫妻星</li>
                <li><strong className="text-zen-text">地支夫妻星</strong> — 以主氣為主（需 2 個主氣地支才取用）</li>
                <li><strong className="text-zen-text">夫妻宮位（日支）</strong> — 地支無夫妻星才看非主氣地支</li>
              </ol>
            </div>

            {/* 夫妻星位置與年紀距離 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-rose-400 text-sm mb-3">夫妻星位置與年紀距離</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-zen-muted">
                <li><strong className="text-zen-text">時柱</strong>：年紀少 2～10 歲</li>
                <li><strong className="text-zen-text">日柱</strong>：年紀 ±2 歲</li>
                <li><strong className="text-zen-text">月柱</strong>：年紀差 2～10 歲</li>
                <li><strong className="text-zen-text">年柱</strong>：年紀大 10～20 歲（或異國、遠距、長輩介紹、交友軟體）</li>
              </ul>
            </div>

            {/* 夫妻宮互動 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-rose-400 text-sm mb-3">夫妻宮互動</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-zen-muted">
                <li><strong className="text-zen-text">夫妻宮與月支/時支相刑</strong>：關係易變動、離異；留意伴侶健康</li>
                <li><strong className="text-zen-text">夫妻星與鄰柱地支相沖</strong>：易遠距離姻緣（尤其夫妻星在年柱）</li>
                <li><strong className="text-zen-text">夫妻宮地支相沖</strong>：易晚婚；對象在外地結識</li>
                <li><strong className="text-zen-text">大運×流年×夫妻宮/星相沖</strong>：聚少離多、同住者易口角爭執</li>
                <li><strong className="text-zen-text">夫妻宮/星與鄰柱地支相害</strong>：相處易高壓，需多溝通磨合</li>
              </ul>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-rose-400 text-sm mb-3">夫妻宮特質與年齡差距</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div className="p-3 bg-black/30 rounded border border-rose-500/10 space-y-2">
                  <p className="font-bold text-zen-text mb-2 pb-1 border-b border-zen-border">年齡差距 (依夫妻星位置)</p>
                  {Object.entries(SPOUSE_STAR_POSITION).map(([k, v]) => (
                     <div key={k} className="text-zen-text"><span className="text-rose-300 font-bold">{v.split('：')[0]}：</span>{v.split('：')[1]}</div>
                  ))}
                  <p className="font-bold text-zen-text mt-4 mb-2 pb-1 border-b border-zen-border">年齡差距 (依夫妻宮位置 - 講義原版)</p>
                  {Object.entries(LECTURE_DATA.SPOUSE_PALACE_AGE).map(([k, v]) => (
                     <div key={k}><strong className="text-rose-300">{k}:</strong> <span className="text-zen-text">{v}</span></div>
                  ))}
                </div>
                <div className="p-3 bg-black/30 rounded border border-rose-500/10 space-y-2">
                  <p className="font-bold text-zen-text mb-2 pb-1 border-b border-zen-border">伴侶長相與特質 (依日支)</p>
                  {Object.entries(LECTURE_DATA.SPOUSE_PALACE_TRAITS).map(([k, v]) => (
                     <div key={k} className="mb-2">
                       <strong className="text-rose-300">{k}:</strong> 
                       <div className="text-zen-text ml-2">{v.desc} <br/><span className="text-base text-zen-muted">{v.sub}</span></div>
                     </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-rose-400 text-sm mb-3">夫妻星/宮位相沖相刑速查</h3>
              <div className="grid grid-cols-1 gap-4 text-[13px]">
                  <div className="p-3 bg-black/30 rounded border border-rose-500/10 space-y-2">
                     <h4 className="text-zen-text font-bold mb-1">【流年大運相刑沖】</h4>
                     {Object.entries(SPOUSE_STAR_CLASHES).map(([k, v]) => (
                        <p key={k} className="text-zen-text">{v}</p>
                     ))}
                  </div>
                  <div className="p-3 bg-black/30 rounded border border-rose-500/10">
                     <h4 className="text-zen-text font-bold mb-2">【原局宮位相刑沖 - 講義原版】</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {Object.entries(LECTURE_DATA.SPOUSE_PALACE_CLASH).map(([k, v]) => (
                          <div key={k}><strong className="text-rose-300">{k}:</strong> <span className="text-zen-text">{v}</span></div>
                       ))}
                     </div>
                  </div>
              </div>
            </div>
            
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-rose-400 text-sm">九宮飛星旺桃花佈陣 ({referenceFSYear}年)</h3>
                <select 
                  value={referenceFSYear} 
                  onChange={(e) => setReferenceFSYear(Number(e.target.value))}
                  className="bg-black border border-zen-border rounded px-2 py-1 text-xs text-zen-text outline-none"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(y => (
                    <option key={y} value={y}>{y}年 ({Solar.fromYmdHms(y, 6, 1, 0, 0, 0).getLunar().getYearInGanZhi()}年)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {getFlyingStarsForYear(referenceFSYear).stars
                  .filter(s => s.name.includes('九紫') || s.name.includes('一白'))
                  .map((star) => (
                    <div key={star.name} className="p-3 bg-black/30 rounded border border-rose-500/10">
                      <strong className="text-rose-300 block mb-1">
                        {star.name} 📍 位於「{star.location}」
                      </strong> 
                      <span className="text-zen-text">{star.remedy}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 健康理論 */}
        {activeRefTab === 'health' && (
          <div className="space-y-6">
            {/* 五行對應器官列表 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">五行對應器官</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-zen-muted">
                <li><strong className="text-zen-text">木</strong>：肝、膽、四肢（手腳）— 肝解毒與修復能力差、易疲勞、手腳僵硬</li>
                <li><strong className="text-zen-text">火</strong>：心臟、心血管系統、眼睛 — 易貧血、頭暈、手腳冰冷、眼部病變</li>
                <li><strong className="text-zen-text">土</strong>：脾胃（腸胃消化系統）— 消化差、胃痛腹瀉、吸收不良</li>
                <li><strong className="text-zen-text">金</strong>：呼吸道（肺、支氣管、大腸、皮膚）— 免疫差、易感冒、過敏體質</li>
                <li><strong className="text-zen-text">水</strong>：腎臟、婦科、泌尿系統、血液循環、淋巴 — 腎功能差、婦科問題、水腫、疲倦</li>
              </ul>
            </div>

            {/* 三刑與病符說明 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">三刑與病符</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-zen-muted">
                <li><strong className="text-zen-text">無恩之刑（寅巳申）</strong>：易血光之災、手術、突發性疾病、心血管阻塞、中風</li>
                <li><strong className="text-zen-text">恃勢之刑（丑戌未）</strong>：阻滯、淤積、易長腫瘤或癌症、結石</li>
                <li><strong className="text-zen-text">恩愛之刑（子卯）</strong>：情感糾結、精神壓力</li>
                <li><strong className="text-zen-text">自刑（辰辰/午午/酉酉/亥亥）</strong>：情緒糾結壓抑、自我內耗</li>
              </ul>
              <p className="mt-2 text-xs text-zen-muted">
                <strong className="text-red-400">二黑病符星（2026 西北方）</strong>：精神不濟、舊疾復發；<strong className="text-red-400">五黃廉貞星（2026 正南方）</strong>：重大意外、血光之災。
              </p>
            </div>

            {/* 健康弱項判斷原則 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">健康弱項判斷</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-zen-muted">
                <li>不看合化、身強身弱，直接看命盤中最少或沒有的五行</li>
                <li><strong className="text-zen-text">五行 0 個</strong>：不管幾個都要注意</li>
                <li><strong className="text-zen-text">五行各 1 個</strong>：找看看有沒有什麼過強再加剋那只有一個的五行</li>
              </ul>
            </div>

            {/* 養生建議 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">養生建議</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-zen-muted">
                <li>找出最少的五行，補健康五行</li>
                <li>若健康五行為忌神：以大運的喜用神（格局、用神命盤整體氣場）優先</li>
                <li>從格、順勢而為：走用神大運流年健康狀況佳</li>
                <li>科學預防：定期健康檢查</li>
                <li>提升運勢：配戴用神飾品</li>
                <li>風水化解：在家凶方擺放銅器</li>
              </ul>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">五行與臟腑健康對照</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {FIVE_ELEMENTS_TRAITS.map(t => (
                  <div key={t.name} className="p-3 bg-black/30 rounded border border-teal-500/10 space-y-1">
                    <strong className="text-teal-300">{t.name} ({t.nature})</strong>
                    <p className="text-zen-text"><strong>關聯系統：</strong>{t.trait.split('、').pop()}</p>
                    <p className="text-zen-muted"><strong>特徵：</strong>{t.trait}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">五行缺Ｘ補運方法</h3>
              <div className="space-y-4 text-[13px]">
                 {Object.entries(DEFICIENT_ELEMENT_REMEDIES).map(([k, v]) => (
                   <div key={k} className="p-3 bg-black/30 rounded border border-teal-500/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <h4 className="text-teal-300 font-bold border-b border-teal-900/50 pb-1 mb-2 text-base">缺{k}補運</h4>
                       <p className="text-zen-text"><strong className="text-zen-text">日常行動：</strong></p>
                       <ul className="list-disc pl-4 text-zen-muted space-y-1 mb-2">
                         {v.dailyActions.map((d, i) => <li key={i}>{d}</li>)}
                       </ul>
                       <p className="text-zen-text"><strong className="text-zen-text">開運方位：</strong>{v.direction}</p>
                       <p className="text-zen-muted pl-4">{v.directionsDetail}</p>
                     </div>
                     <div>
                       <p className="text-zen-text mt-2 md:mt-8"><strong className="text-zen-text">色彩搭配：</strong>{v.colors}</p>
                       <p className="text-zen-text mt-2"><strong className="text-zen-text">開運小物：</strong></p>
                       <ul className="list-disc pl-4 text-zen-muted space-y-1 mb-2">
                         {v.luckyItems.map((l, i) => <li key={i}>{l}</li>)}
                       </ul>
                       <p className="text-rose-400 mt-2"><strong className="text-rose-300">避免事項：</strong></p>
                       <ul className="list-disc pl-4 text-rose-500/80 space-y-1">
                         {v.avoid.map((a, i) => <li key={i}>{a}</li>)}
                       </ul>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">大運流年健康警訊</h3>
              <div className="space-y-4 text-[13px]">
                {Object.entries(HEALTH_DATA.DAYUN_HEALTH).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/30 rounded border border-teal-500/10">
                    <strong className="text-teal-300">缺{k}命人</strong>
                    <div className="mt-1 flex flex-col md:flex-row gap-4">
                      <p className="text-emerald-400"><strong>好的大運：</strong>{v.good.join('、')}</p>
                      <p className="text-rose-400 mt-1 md:mt-0"><strong>不好的大運：</strong>{v.bad.join('、')}</p>
                    </div>
                    <p className="text-zen-text mt-2"><strong>健康警訊與保養建議：</strong>{v.badDesc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
              <h3 className="font-bold text-teal-400 text-sm mb-3">極端能量流日警訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-[13px]">
                {Object.entries(HEALTH_DATA.EXTREME_DAYS).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/30 rounded border border-rose-900/30">
                    <strong className="text-rose-400">{k} 日</strong> <span className="text-zen-muted ml-1">[{v.element}]</span>
                    <p className="text-zen-text mt-1">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 家人理論 */}
        {activeRefTab === 'family' && (
          <div className="space-y-3">
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-3">
              <h3 className="font-bold text-orange-400 text-sm mb-2">八字看五行 (男女六親代表)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div className="p-3 bg-black/30 rounded border border-orange-500/10 space-y-2">
                  <h4 className="font-bold text-zen-text mb-2 text-center border-b border-zen-border pb-1">👦 男生八字看五行</h4>
                  {Object.entries(RELATIVES_MAPPING.male).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b last:border-0 border-zen-border py-1">
                      <strong className="text-orange-300 w-16">{k}:</strong>
                      <span className="text-zen-text flex-1">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-black/30 rounded border border-orange-500/10 space-y-2">
                  <h4 className="font-bold text-zen-text mb-2 text-center border-b border-zen-border pb-1">👧 女生八字看五行</h4>
                  {Object.entries(RELATIVES_MAPPING.female).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b last:border-0 border-zen-border py-1">
                      <strong className="text-orange-300 w-16">{k}:</strong>
                      <span className="text-zen-text flex-1">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-3">
              <h3 className="font-bold text-orange-400 text-sm mb-2">子女緣份與懷孕時機</h3>
              <div className="text-[13px] space-y-3">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-3 bg-black/30 rounded border border-orange-500/10">
                     <strong className="text-zen-text">👨 男命易得子流年</strong>
                     <p className="text-zen-muted mt-1 mb-2">{CHILDREN_GUIDELINES.rules.male}</p>
                     <ul className="space-y-1">
                       {CHILDREN_GUIDELINES.timingTable.filter(t => t.gender === '男').map((t, i) => (
                         <li key={i} className="text-zen-text"><span className="text-orange-300">{t.dayMaster}命：</span>遇 {t.stems} / {t.branches}</li>
                       ))}
                     </ul>
                   </div>
                   <div className="p-3 bg-black/30 rounded border border-orange-500/10">
                     <strong className="text-zen-text">👩 女命易得子流年</strong>
                     <p className="text-zen-muted mt-1 mb-2">{CHILDREN_GUIDELINES.rules.female}</p>
                     <ul className="space-y-1">
                       {CHILDREN_GUIDELINES.timingTable.filter(t => t.gender === '女').map((t, i) => (
                         <li key={i} className="text-zen-text"><span className="text-orange-300">{t.dayMaster}命：</span>遇 {t.stems} / {t.branches}</li>
                       ))}
                     </ul>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-3 bg-black/30 rounded border border-rose-900/30">
                     <strong className="text-rose-400">⚠️ 易剖腹產的狀況</strong>
                     <ul className="list-disc pl-4 text-zen-text mt-2 space-y-1">
                       {CHILDREN_GUIDELINES.cSectionIndicators.map((c, i) => <li key={i}>{c}</li>)}
                     </ul>
                   </div>
                   <div className="p-3 bg-black/30 rounded border border-emerald-900/30">
                     <strong className="text-emerald-400">✨ 產婦/寶寶平安流日選擇</strong>
                     <ul className="list-disc pl-4 text-zen-text mt-2 space-y-1">
                       {CHILDREN_GUIDELINES.goodBirthDays.map((c, i) => <li key={i}>{c}</li>)}
                     </ul>
                   </div>
                 </div>
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-3">
              <h3 className="font-bold text-orange-400 text-sm mb-2">手足關係與家庭變動</h3>
              <div className="text-[13px] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-black/30 rounded border border-orange-500/10 space-y-2">
                    <strong className="text-zen-text border-b border-zen-border pb-1 flex">👫 手足緣分深淺</strong>
                    <p className="text-zen-text"><strong>身強/從弱：</strong>{SIBLING_RELATIONS.fortune[1].split('：')[1]}</p>
                    <p className="text-zen-text"><strong>身弱/從強：</strong>{SIBLING_RELATIONS.fortune[0].split('：')[1]}</p>
                    <p className="text-zen-muted mt-2"><strong>緣分較淺：</strong></p>
                    <ul className="list-disc pl-4 text-zen-muted space-y-1">
                      {SIBLING_RELATIONS.weakConnection.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="p-3 bg-black/30 rounded border border-orange-500/10 space-y-2">
                    <strong className="text-zen-text border-b border-zen-border pb-1 flex">🏠 家人與居住處變動</strong>
                    <ul className="list-disc pl-4 text-zen-text space-y-1">
                      {FAMILY_CHANGES.moving.map((c, i) => <li key={i}>{c}</li>)}
                      {FAMILY_CHANGES.members.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-black/30 rounded border border-orange-500/10">
                  <strong className="text-zen-text border-b border-zen-border pb-1 flex mb-2">💡 手足最多十神特質與相處</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {SIBLING_RELATIONS.traits.map((t, i) => (
                      <div key={i} className="text-zen-text">
                        <strong className="text-orange-300">{t.tenGod}</strong>
                        <p className="mt-1">{t.trait}</p>
                        <p className="text-zen-muted mt-1">策略: {t.strategy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 人際交友理論 */}
        {activeRefTab === 'friends' && (
          <div className="space-y-3">
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-3">
              <h3 className="font-bold text-purple-400 text-sm mb-2">十神與人際關係</h3>
              <div className="text-[13px] space-y-3">
                <div className="p-3 bg-black/30 rounded border border-purple-500/10">
                  <h4 className="text-purple-300 font-bold mb-1">十神交友原則</h4>
                  <p className="text-zen-text mb-2">人際關係的核心在於「十神互動」。了解自己命盤最旺的十神，能掌握你在朋友圈中的角色定位與相處模式。</p>
                  <div className="space-y-2">
                    {PARTNER_TEN_GODS_TRAITS.map((item, i) => (
                      <div key={i} className="border-b last:border-0 border-zen-border pb-1">
                        <strong className="text-purple-300">{item.type}：</strong>
                        <span className="text-zen-text">{item.personality}</span>
                        <p className="text-zen-muted mt-0.5">→ 相處策略：{item.strategy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-black/30 rounded border border-purple-500/10">
                  <h4 className="text-purple-300 font-bold mb-1">五行互補交友法</h4>
                  <p className="text-zen-text mb-2">尋找與你五行互補的朋友，能形成天然的互助關係：</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(PARTNER_MATCHING_DATA.FIVE_ELEMENTS_COMPLEMENT).map(([el, v]) => (
                      <div key={el} className="bg-black/20 p-2 rounded border border-purple-900/20">
                        <strong className="text-purple-300">{el}命</strong>
                        <p className="text-zen-text text-xs">強者宜交：{v['強'].join('、')}</p>
                        <p className="text-zen-muted text-xs">弱者宜交：{v['弱'].join('、')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-black/30 rounded border border-purple-500/10">
                  <h4 className="text-purple-300 font-bold mb-1">貴人方位與生肖三合</h4>
                  <p className="text-zen-text mb-2">利用生肖三合、六合找出你的貴人屬相，多與這些生肖的人合作：</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PARTNER_MATCHING_DATA.ZODIAC_TRINITY.map((group, i) => (
                      <div key={i} className="bg-black/20 p-2 rounded border border-purple-900/20 text-center">
                        <strong className="text-purple-300 block">{['巳酉丑', '申子辰', '寅午戌', '亥卯未'][i]}</strong>
                        <p className="text-zen-muted text-xs mt-1">{group.join('、')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-black/30 rounded border border-purple-500/10">
                  <h4 className="text-purple-300 font-bold mb-1">十神配對攻略</h4>
                  <p className="text-zen-text mb-2">了解自己命盤最旺的十神，選擇互補的社交夥伴：</p>
                  <div className="space-y-2">
                    {Object.entries(PARTNER_MATCHING_DATA.TEN_GODS_MATCHING).map(([k, v]) => (
                      <div key={k} className="bg-black/20 p-2 rounded border border-purple-900/20">
                        <strong className="text-purple-300">{k} 最多者</strong>
                        <p className="text-zen-text text-xs">優勢：{v.pros}</p>
                        <p className="text-rose-300 text-xs">盲點：{v.cons}</p>
                        <p className="text-emerald-400 text-xs mt-1">✅ 適配：{v.matching.replace(/\n/g, '；')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-3">
              <h3 className="font-bold text-purple-400 text-sm mb-2">合盤的五大類型</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-[13px]">
                {MATCHING_TYPES.map((t, i) => (
                  <div key={i} className="p-3 bg-black/30 rounded border border-purple-500/20">
                    <strong className="text-purple-300">{i+1}. {t.title}</strong>
                    <p className="text-zen-text mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
      )}
      </div>
    </div>
  );
}
