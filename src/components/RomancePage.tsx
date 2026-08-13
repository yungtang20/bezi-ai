// src/components/RomancePage.tsx
// [AI MOD] 姻緣深度解析 — 遵循學術級講義體系，精確推演九大核心維度
import CategoryPageTemplate from './CategoryPageTemplate';
import { useMemo } from "react";
import { 
  Heart, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Info, 
  Layers, 
  Sparkle, 
  Compass, 
} from "lucide-react";
import { BaziChart } from "../paipan";
import { PatternScores } from "../pattern";
import { GAN_TO_ELEMENT } from "../constants";
import { calculateDaYun, getTenGodForDaYun, getDaYunQuality, getLiuNian } from "../dayun";
import { checkXiangXing } from "../matchmaking";
import { 
  getCompatibilityRule, 
  LECTURE_DATA, 
  ZHI_TO_ZODIAC, 
} from "../data";

import DailyForecastCard from './DailyForecastCard';
import ElementRemedyCard from './ElementRemedyCard';
import CategoryTimelineRemedy from "./CategoryTimelineRemedy";
import CategorySynastry from "./CategorySynastry";

// Modular imports
import { DAY_MASTER_FENG_SHUI } from "../data/charts/romanceFengShui";
import RomanceMatchmaker from "./RomanceMatchmaker";
import RomanceJiaziHandbook from "./RomanceJiaziHandbook";

import { PartnerInfo } from '../types';

interface Props {
  chart: BaziChart;
  scores: PatternScores;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];  // 所有最弱五行
  onNavigate?: (step: number) => void;
  partners?: PartnerInfo[];
}

const ZHI_TYPE: Record<string, string> = {
  子: "子午卯酉", 午: "子午卯酉", 卯: "子午卯酉", 酉: "子午卯酉",
  寅: "寅申巳亥", 申: "寅申巳亥", 巳: "寅申巳亥", 亥: "寅申巳亥",
  辰: "辰戌丑未", 戌: "辰戌丑未", 丑: "辰戌丑未", 未: "辰戌丑未",
};

export default function RomancePage({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElements,
  partners,
}: Props) {

  const isMale = chart.gender === "男";
  const dayZhi = chart.day.zhi;
  const dayZhiType = ZHI_TYPE[dayZhi] || "子午卯酉";

  // 1. 我是怎麼判斷的 — 命盤十神全盤統計
  const tenGodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const add = (god: string) => {
      if (god && god !== "日主") {
        counts[god] = (counts[god] || 0) + 1;
      }
    };
    
    // 天干十神
    if (chart.year.tenGod) add(chart.year.tenGod);
    if (chart.month.tenGod) add(chart.month.tenGod);
    if (chart.hour.tenGod) add(chart.hour.tenGod);

    // 地支本氣與藏干十神
    if (chart.year.hiddenTenGods) chart.year.hiddenTenGods.forEach(add);
    if (chart.month.hiddenTenGods) chart.month.hiddenTenGods.forEach(add);
    if (chart.day.hiddenTenGods) chart.day.hiddenTenGods.forEach(add);
    if (chart.hour.hiddenTenGods) chart.hour.hiddenTenGods.forEach(add);

    return counts;
  }, [chart]);

  // 取個數最多者 (十神大勢)
  const maxGodInfo = useMemo(() => {
    let maxGod = "比肩";
    let maxCount = 0;
    for (const [god, count] of Object.entries(tenGodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxGod = god;
      }
    }
    return { name: maxGod, count: maxCount };
  }, [tenGodCounts]);

  const selfCompatibility = getCompatibilityRule(maxGodInfo.name);

  // 2. 搜尋夫妻星所處位置 (Order: 天干 -> 地支主氣 -> 藏干次之)
  const targetGods = isMale ? ["正財", "偏財"] : ["正官", "七殺"];
  const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
  const pillars = [chart.year, chart.month, chart.day, chart.hour];

  const spouseStarScan = useMemo(() => {
    // 優先天干
    for (let i = 0; i < pillars.length; i++) {
      if (targetGods.includes(pillars[i].tenGod)) {
        return {
          star: `${pillars[i].gan} (${pillars[i].tenGod})`,
          location: pillarNames[i] + "天干",
          pillarGanZhi: `${pillars[i].gan}${pillars[i].zhi}`,
          tenGod: pillars[i].tenGod,
          index: i
        };
      }
    }
    // 次之地支主氣 (與 hiddenTenGods 地支第一主氣對照)
    for (let i = 0; i < pillars.length; i++) {
      if (pillars[i].hiddenTenGods && pillars[i].hiddenTenGods.length > 0) {
        // 第一個為地支本氣
        const mainTenGod = pillars[i].hiddenTenGods[0];
        if (targetGods.includes(mainTenGod)) {
          return {
            star: `${pillars[i].hiddenGan[0]} (${mainTenGod})`,
            location: pillarNames[i] + "地支主氣",
            pillarGanZhi: `${pillars[i].gan}${pillars[i].zhi}`,
            tenGod: mainTenGod,
            index: i
          };
        }
      }
    }
    // 再次之地支餘氣 (非主氣藏干)
    for (let i = 0; i < pillars.length; i++) {
      if (pillars[i].hiddenTenGods && pillars[i].hiddenTenGods.length > 1) {
        for (let idx = 1; idx < pillars[i].hiddenTenGods.length; idx++) {
          const subTenGod = pillars[i].hiddenTenGods[idx];
          if (targetGods.includes(subTenGod)) {
            return {
              star: `${pillars[i].hiddenGan[idx]} (${subTenGod})`,
              location: pillarNames[i] + "地支非主氣",
              pillarGanZhi: `${pillars[i].gan}${pillars[i].zhi}`,
              tenGod: subTenGod,
              index: i
            };
          }
        }
      }
    }
    return null;
  }, [pillars, isMale]);

  const traitsTargetGanZhi = spouseStarScan?.pillarGanZhi || `${chart.day.gan}${chart.day.zhi}`;

  // 夫妻宮地支沖、刑、害判定
  const monthZhi = chart.month.zhi;
  const hourZhi = chart.hour.zhi;
  const yearZhi = chart.year.zhi;
  const dayBranch = chart.day.zhi;

  const clutchPairs: Record<string, string> = {
    子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
    卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳"
  };

  const harmPairs: Record<string, string> = {
    子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
    卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉"
  };

  const hasClash = clutchPairs[dayBranch] === monthZhi || clutchPairs[dayBranch] === hourZhi;
  const hasPunishment = checkXiangXing(dayBranch, monthZhi) || checkXiangXing(dayBranch, hourZhi);
  const hasHarm = harmPairs[dayBranch] === monthZhi || harmPairs[dayBranch] === hourZhi;

  let spouseStarHasClash = false;

  if (spouseStarScan && spouseStarScan.index !== null) {
    const sZhi = pillars[spouseStarScan.index].zhi;
    const zhiArr = [yearZhi, monthZhi, dayBranch, hourZhi];
    const sIdx = spouseStarScan.index;
    
    if (sIdx > 0) {
      if (clutchPairs[sZhi] === zhiArr[sIdx - 1]) spouseStarHasClash = true;
    }
    if (sIdx < 3) {
      if (clutchPairs[sZhi] === zhiArr[sIdx + 1]) spouseStarHasClash = true;
    }
  }

  // 3. 歲運感情與財富起伏
  const currentYearDate = new Date().getFullYear();
  const currentAge = currentYearDate - chart.birthYear;
  const daYunList = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = useMemo(() => {
    return daYunList.find(dy => currentAge >= dy.startAge && currentAge <= dy.startAge + 9);
  }, [daYunList, currentAge]);
  const currentLiuNian = useMemo(() => getLiuNian(currentYearDate, chart.dayMaster), [currentYearDate, chart.dayMaster]);

  // 補運判定
  let remedyKey: '身強' | '身弱_平衡' | '身弱_不平衡' = '身強';
  if (primaryPattern.includes("弱")) {
    let isBalanced = false;
    if (currentDaYun) {
      if (chart.dayMaster === "癸" && chart.gender === "男" && currentDaYun.ganZhi === "壬午") {
        isBalanced = true;
      } else {
        const daYunQuality = getDaYunQuality(currentDaYun.gan, currentDaYun.zhi, favorable, unfavorable);
        if (daYunQuality === "好運") {
          isBalanced = true;
        }
      }
    }
    remedyKey = isBalanced ? "身弱_平衡" : "身弱_不平衡";
  }

  const romanceRemedy = LECTURE_DATA.ROMANCE_REMEDY[remedyKey]?.[isMale ? "男" : "女"] || (isMale ? "補財" : "補官殺");

  let isCrisis = false;
  let isGoodForBreakup = false;

  if (currentDaYun) {
    const daYunGanTenGod = getTenGodForDaYun(chart.dayMaster, currentDaYun.gan);
    const daYunZhiTenGod = getTenGodForDaYun(chart.dayMaster, currentDaYun.zhi);
    if (isMale) {
      if (["正財", "偏財"].includes(daYunGanTenGod) && ["比肩", "劫財"].includes(daYunZhiTenGod)) isCrisis = true;
      if (["比肩", "劫財"].includes(daYunGanTenGod) && ["正財", "偏財"].includes(daYunZhiTenGod)) isCrisis = true;
    } else {
      if (["正官", "七殺"].includes(daYunGanTenGod) && ["比肩", "劫財"].includes(daYunZhiTenGod)) isCrisis = true;
      if (["比肩", "劫財"].includes(daYunGanTenGod) && ["正官", "七殺"].includes(daYunZhiTenGod)) isCrisis = true;
    }

    if (primaryPattern.includes("弱")) {
      if (["正印", "偏印", "比肩", "劫財"].includes(daYunGanTenGod)) isGoodForBreakup = true;
    } else {
      if (["食神", "傷官", "正財", "偏財", "正官", "七殺"].includes(daYunGanTenGod)) isGoodForBreakup = true;
    }
  }

  const dayMasterElement = GAN_TO_ELEMENT[chart.dayMaster] || "金";
  const userFengShuiDetail = DAY_MASTER_FENG_SHUI[dayMasterElement]?.genderGuide[isMale ? "男" : "女"];

  const menuItems = [
    { id: "judgment", label: "1. 我是怎麼判斷的", labelShort: "判斷依據", icon: Info },
    { id: "congenital", label: "2. 先天姻緣特質", labelShort: "先天特質", icon: Heart },
    { id: "timeline", label: "3. 歲運推演與化解", labelShort: "歲運推演", icon: Calendar },
    { id: "triple", label: "4. 三合桃花旺年", labelShort: "桃花旺年", icon: Sparkles },
    { id: "synastry", label: "5. 合盤適配判定", labelShort: "合盤適配", icon: Layers },
    { id: "observation", label: "6. 姻緣觀測分析", labelShort: "姻緣觀測", icon: Compass },
    { id: "crisis", label: "7. 桃花危機與預警", labelShort: "危機預警", icon: ShieldAlert },
    { id: "fengshui", label: "8. 2026桃花催旺位", labelShort: "2026方位", icon: Sparkle },
    { id: "dates", label: "9. 近期專屬桃花日", labelShort: "桃花吉日", icon: Calendar },
  ];

    return (
    <CategoryPageTemplate
      title="姻緣深度解析"
      subtitle="Peach Blossom & Relationship Dynamics"
      icon={Heart}
      accentColor="purple"
      menuItems={menuItems}
    >
      <div className="space-y-8">

        {/* SECTION 1: 我是怎麼判斷的 */}
        <div id="judgment" className="scroll-mt-20 glass-card relative overflow-hidden">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">01.</span> 我是怎麼判斷的？
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            在正統八字體系中，<strong>天干（Heavenly Stems）</strong>主外顯氣場、大眾社會觀感及首要互動層面。我們首要解析您命盤中的<strong>「四柱天干十神分布」</strong>，進而盤整五行、歲運及夫妻宮磁場能量。
          </p>

          {/* Stems list */}
          <div className="grid grid-cols-4 gap-3 mb-6 text-center">
            {[
              { label: "年柱天干", gan: chart.year.gan, god: chart.year.tenGod || "無", color: "text-amber-400" },
              { label: "月柱天干", gan: chart.month.gan, god: chart.month.tenGod || "無", color: "text-indigo-400" },
              { label: "日柱天干 (日主)", gan: chart.day.gan, god: "日主", color: "text-pink-400" },
              { label: "時柱天干", gan: chart.hour.gan, god: chart.hour.tenGod || "無", color: "text-emerald-400" },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted block font-sans">{item.label}</span>
                <span className={`text-xl font-bold ${item.color}`}>{item.gan}</span>
                <span className="text-xs text-white/80 block font-mono font-bold">{item.god}</span>
              </div>
            ))}
          </div>

          {/* Ten Gods Full stats counts */}
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <span className="text-xs font-bold text-pink-300 block mb-3 font-sans">📊 命盤十神全盤分布累計（含本氣與地支藏干）</span>
            <div className="flex flex-wrap gap-3">
              {Object.entries(tenGodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([god, count], idx) => (
                  <div key={god} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-bold font-mono">#{idx + 1}</span>
                    <span className="text-xs font-bold text-pink-400">{god}</span>
                    <span className="text-xs font-bold text-white font-mono bg-white/5 px-1.5 py-0.5 rounded-md">{count}個</span>
                  </div>
                ))}
            </div>
            {maxGodInfo.count >= 3 && (
              <div className="mt-3 p-2.5 bg-pink-500/5 border border-pink-500/10 rounded-lg text-xs leading-relaxed font-sans">
                💡 檢測到命盤中 <strong className="text-pink-400">「{maxGodInfo.name}」</strong> 特性過於強越（累計有 {maxGodInfo.count} 個），這將會深度主導您的感情相處作風、與伴侶之強弱溝通。詳細相處調諧方針，請對照第六板塊進行針對性優化。
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: 先天姻緣特質 */}
        <div id="congenital" className="scroll-mt-20 glass-card">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">02.</span> 先天姻緣特質：命盤本象呈現
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            解析先天宿世正緣磁場底牌。我們依據<strong>「天干夫妻星（最顯著）→ 地支主氣夫妻星（中度）→ 地支餘氣藏干（潛在）」</strong>之順序，對其時空位置、夫妻宮交互克洩進行全生命周期標定。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Find Star status card */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-pink-300 uppercase font-sans">🌟 夫妻星（{isMale ? "男命財星" : "女命官殺"}）定位</span>
              {spouseStarScan ? (
                <div>
                  <p className="text-sm font-bold text-white">
                    夫妻星為 <strong className="text-pink-400 underline">{spouseStarScan.star}</strong>，現於 <strong className="text-amber-400">{spouseStarScan.location}</strong>
                  </p>
                  <p className="text-xs text-zen-muted mt-2 leading-relaxed font-sans">
                    <strong>落柱時空特徵與距離契機：</strong>
                    {spouseStarScan.location.startsWith("時柱") && "時柱近身：伴侶年紀多半偏大少 2~10 歲左右，性格可能帶有一點孩子氣或朝氣，多需自身提攜。"}
                    {spouseStarScan.location.startsWith("日柱") && "夫妻宮得正：伴侶年紀差往往在 ±2 歲以内，彼此多為同輩、知心朋友、或理念極度相近。"}
                    {spouseStarScan.location.startsWith("月柱") && "月柱主向：與伴侶有 2~10 歲之差。容易是異地/遠距離往來，或者容易因長輩介紹及交友軟體在非原生活圈中融匯。"}
                    {spouseStarScan.location.startsWith("年柱") && "年柱主尊：伴侶易比自身大 10~20 歲（或相處時極具成家風範，受長輩推舉），結識管道多透過長輩長官提點，或屬異國/遠距姻緣。"}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-pink-400 flex items-center gap-2 font-sans">
                    <span>【本命未見明現夫妻星】</span>
                    <span className="text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded text-red-300">方法 2 判定</span>
                  </p>
                  <p className="text-xs text-zen-muted mt-2 leading-relaxed font-sans">
                    原局未見明顯夫妻星。依據學術原則，這不代表無姻緣，而是<strong>「夫妻宮」的地支</strong>磁場將直接決定您伴侶的外貌、性格底色。您的日支地支為 <strong className="text-white">{dayZhi}</strong>（{dayZhiType}）：
                    <span className="block mt-1 text-white">
                      {dayZhiType === "子午卯酉" ? "【子午卯酉四正桃花位】伴侶多半高顏值、喜穿著打扮、為人群焦點。其中子、酉皮膚白皙精緻，午、卯時尚而嗅覺敏銳。" :
                       dayZhiType === "寅申巳亥" ? "【寅申巳亥四長生驛馬位】伴侶強健、陽剛明快、口快心直，處事極具行動力、富變動活力。" :
                       "【辰戌丑未四墓庫華蓋位】伴侶沈穩踏實、不擅甜言蜜語、富含底蘊、話常默存於心底。"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Special Palace Interactions */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-purple-300 uppercase font-sans">⚡ 夫妻宮（日支）及星盤刑沖剋害鑑定</span>
              <div className="space-y-1.5 text-xs font-sans leading-relaxed text-zen-text">
                {/* 夫星坐夫宮 */}
                {((isMale && chart.day.tenGod === "正財") || (!isMale && ["正官", "七殺"].includes(chart.day.tenGod))) ? (
                  <p className="text-emerald-400 font-bold">✓ 【夫妻星坐夫妻宮】先天感情緣份尤深，極度容易遇到能互敬並長遠、關係穩定的正緣婚姻配比！</p>
                ) : (
                  <p className="text-zinc-500">○ 夫妻宮未見本位星坐守，緣份發展多賴歲運引動催發。</p>
                )}

                {hasClash && (
                  <p className="text-red-400 font-bold">⚠️ 【夫妻宮與鄰柱相沖】較易晚婚。對象傾向在外地、長途出差或不同生活圈中熟稔，感情有易動盪的跡象。</p>
                )}

                {hasPunishment && (
                  <p className="text-orange-400 font-bold">⚠️ 【夫妻宮與鄰柱相刑】相處容易感受到壓力，在日常溝通上容易產生冷暴力或思想磕絆，需要多協調磨合。</p>
                )}

                {hasHarm && (
                  <p className="text-amber-400 font-bold">⚠️ 【夫妻宮與鄰柱相害】感情氣氛偶顯高壓壓抑，同住易因小習慣隔閡。請防裂缝積壓。</p>
                )}

                {spouseStarHasClash && (
                  <p className="text-red-300">⚠️ 【夫妻星與臨柱地支相沖】易成異地恩愛，中途聚少離多，同住期常因各自忙碌互留自由。</p>
                )}

                {!hasClash && !hasPunishment && !hasHarm && !spouseStarHasClash && (
                  <p className="text-emerald-500/80">✓ 本命夫妻宮清靜平衡，無大刑沖，感情互動多溫和穩定，少有突發波瀾。</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: 歲運推演與化解 (感情) */}
        <div id="timeline" className="scroll-mt-20">
          <CategoryTimelineRemedy
            chart={chart}
            primaryPattern={primaryPattern}
            favorable={favorable}
            unfavorable={unfavorable}
            category="romance"
            categoryTitle="感情"
          />

          {/* Combined assessment: Romance & Wealth */}
          {currentDaYun && currentLiuNian && (
            <div className="glass-card mt-4">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5 font-sans">
                <TrendingUp size={16} className="text-pink-400" />
                <span>時空律動：大運 × {currentLiuNian.year} {currentLiuNian.ganZhi}年【感情與財富】綜合判定</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wealth side */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest font-sans">💰 財富領域綜合判定</span>
                  {(() => {
                    const dyQ = getDaYunQuality(currentDaYun.gan, currentDaYun.zhi, favorable, unfavorable);
                    const lnQ = getDaYunQuality(currentLiuNian.gan, currentLiuNian.zhi, favorable, unfavorable);
                    
                    if (dyQ === "好運" && lnQ === "好運") {
                      return (
                        <div className="text-xs text-zen-text space-y-1 font-sans">
                          <p className="font-bold text-amber-300">雙吉加冕 · 財源廣進</p>
                          <p className="text-[11px] text-zen-muted leading-relaxed">十年大運與流年喜神共振，資金流動充沛，投資成效豐碩。適合擴展商業版圖、理財配置，唯忌投機過度。</p>
                        </div>
                      );
                    } else if (dyQ !== "好運" && lnQ === "好運") {
                      return (
                        <div className="text-xs text-zen-text space-y-1 font-sans">
                          <p className="font-bold text-amber-300">先差後好 · 及時降雨</p>
                          <p className="text-[11px] text-zen-muted leading-relaxed">十年財氣雖仍有阻滯，但今年流年為用神，注入大筆進財或意外貴人相助，屬於逆風得金之象，宜守成累積。</p>
                        </div>
                      );
                    } else if (dyQ === "好運" && lnQ !== "好運") {
                      return (
                        <div className="text-xs text-zen-text space-y-1 font-sans">
                          <p className="font-bold text-amber-300">底盤穩固 · 局部浮泛</p>
                          <p className="text-[11px] text-zen-muted leading-relaxed">底氣極其厚實，絕無大傾覆。但流年逢小人劫財克耗，嚴禁盲目涉足生疏投資，或與朋友有大額拆借，守成即安穩。</p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-xs text-zen-text space-y-1 font-sans">
                          <p className="font-bold text-red-400">歲大耗洩 · 宜防防盜破財</p>
                          <p className="text-[11px] text-zen-muted leading-relaxed">運歲皆逢不理想，為典型耗散流年。切記謹慎借貸與盲目合資。宜主動購置儲蓄型資產防錢包漏水。</p>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Romance side */}
                <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 space-y-2">
                  <span className="text-[11px] font-bold text-pink-400 uppercase tracking-widest font-sans">💌 感情領域綜合判定</span>
                  <div className="text-xs text-zen-text space-y-1 font-sans">
                    <p className="font-bold text-pink-300">
                      當前大運「{currentDaYun.ganZhi}」 | 今年流年「{currentLiuNian.ganZhi}」
                    </p>
                    <p className="text-[11px] text-zen-muted leading-relaxed">
                      {isCrisis ? "⚠️ 歲大運中夫妻星與同志比劫相鬥。心儀對象可能感情盤互或有情敵在伺，與伴侶容易產生小隔摩擦，需各留緩口以化解。" : 
                       isGoodForBreakup ? "✓ 本運斬斷孽緣契機良好。適合用正向理智進行大抉擇，多依賴長輩或睿智好友理順心神。" :
                       "✓ 感情磁場在此運流年中平順運行。單身者可多借助近期桃花吉日廣泛社交，伴侶也無重刑沖犯。"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: 流年生肖三合桃花旺年 */}
        <div id="triple" className="scroll-mt-20 glass-card">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">04.</span> 流年生肖三合桃花旺年（結婚大旺年）
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            當流年地支（生肖）與您的先天<strong>年支（主氣生肖）</strong>產生「三合五行局」時，本命桃花正氣會被大舉引動，是相親、閃戀或論及婚嫁的黃金結婚大旺年：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 font-sans text-center">
            {[
              { zodiacs: "鼠、猴、龍", target: "2028 龍年、2032 猴年、2036 鼠年", group: "申子辰三合水局", color: "text-blue-400" },
              { zodiacs: "牛、雞、蛇", target: "2025 蛇年、2029 雞年、2033 牛年", group: "巳酉丑三合金局", color: "text-yellow-500" },
              { zodiacs: "虎、馬、狗", target: "2026 馬年、2030 狗年、2034 虎年", group: "寅午戌三合火局", color: "text-red-400" },
              { zodiacs: "兔、羊、豬", target: "2027 羊年、2031 兔年、2035 豬年", group: "亥卯未三合木局", color: "text-emerald-400" },
            ].map((group, idx) => {
              const userZodiac = ZHI_TO_ZODIAC[chart.year.zhi] || "";
              const userBelongs = group.zodiacs.includes(userZodiac);
              return (
                <div key={idx} className={`p-3 rounded-lg border ${userBelongs ? 'bg-pink-500/10 border-pink-500/30' : 'bg-black/30 border-white/5'} flex flex-col justify-between`}>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{group.group}</span>
                    <span className="text-sm font-bold text-white block">{group.zodiacs} 屬相</span>
                    <span className="text-xs text-zen-muted leading-relaxed block">{group.target}</span>
                  </div>
                  {userBelongs && (
                    <span className="inline-block mt-2.5 mx-auto px-2 py-0.5 rounded text-[9px] font-black bg-pink-500/20 text-pink-300">
                      ★ 您的專屬三合局
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Year Highlight check */}
          {(() => {
            const userZodiac = ZHI_TO_ZODIAC[chart.year.zhi] || "";
            const isMatchCurrent = ["虎", "馬", "狗"].includes(userZodiac); // 2026 is 午馬年
            if (isMatchCurrent) {
              return (
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3 flex items-start gap-2 text-xs text-pink-300 font-sans">
                  <Sparkles size={16} className="text-pink-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong>【喜報！】2026年（流年午馬）正逢您的「寅午戌三合桃花局」結婚大旺年！</strong>
                    <span className="block mt-1 text-[11px] text-pink-200/80">
                      今年本命桃花宮引動力量大盛，戀愛意願強，契合緣份極多，已婚者可深談婚配生子，單身者宜多擴大圈子！
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* SECTION 5: 合盤四種適配類型判定 */}
        <div id="synastry" className="scroll-mt-20 glass-card">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">05.</span> 合盤適配類型判定
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            依據徐玉蘭老師契合判定大綱，情緣配對共含四大核心體系：<strong>生肖三合/六沖</strong>（理念默契）、<strong>姻緣五行相同</strong>（生活審美同一頻）、<strong>日主互為夫妻星</strong>（天作之合宿緣深）、<strong>能量五行互補</strong>（運勢攜手互助）。
          </p>

          <RomanceMatchmaker chart={chart} primaryPattern={primaryPattern} />

          {/* Render the core partner database analysis */}
          <CategorySynastry chart={chart} partners={partners || []} category="romance" />
        </div>

        {/* SECTION 6: 姻緣觀測分析 */}
        <div id="observation" className="scroll-mt-20 glass-card">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">06.</span> 姻緣觀測分析：伴侶形象與十神相處
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            本門秘鍵：探探您伴侶的外貌五官、核心脾性，並透析在您命盤比例最多的「十神強限」下，雙方如何建立安全感並避開溝通暗流。
          </p>

          {/* 60 Jiazi Handbook Lookup */}
          <RomanceJiaziHandbook defaultPillar={traitsTargetGanZhi} title={traitsTargetGanZhi} />

          {/* Ten Gods Principle from PDF P.10-11 */}
          <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4 mt-4 space-y-3">
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-sans">
              ⚖️ 最多十神相處之道（目前本命最大氣：{maxGodInfo.name}，累計 {maxGodInfo.count} 個）
            </h4>
            
            {/* Display according to maximum god counts */}
            {(() => {
              return (
                <div className="text-xs text-zen-text leading-relaxed font-sans space-y-2">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-pink-300 font-bold block mb-1">本命十神主特徵：</span>
                    <p className="text-[11px] text-zen-muted">
                      {selfCompatibility?.traits || "注重情感自由與真誠溝通。不喜太沉悶、受規則束縛的關係，喜歡在輕鬆的生活情節中緩慢推進。"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="bg-green-500/5 p-2.5 rounded-lg border border-green-500/10">
                      <strong className="text-green-400 block mb-1">【相處策略與亮點】</strong>
                      <p className="text-[11px] text-zen-muted">
                        {selfCompatibility?.strategy || "互相體諒，多保留各自的社交朋友圈，凡事有商有量、切忌將不滿藏在心裡。"}
                      </p>
                    </div>
                    <div className="bg-red-500/5 p-2.5 rounded-lg border border-red-500/10">
                      <strong className="text-red-400 block mb-1">【應當防範之摩擦】</strong>
                      <p className="text-[11px] text-zen-muted">
                        {selfCompatibility?.weaknesses || "容易出現「過度管束」或「缺乏主見」之傾斜，應保持各自精神獨立，給足對方面子與沉思空間。"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* SECTION 7: 桃花危機與時機預警 */}
        <div id="crisis" className="scroll-mt-20 glass-card">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">07.</span> 桃花危機與時機預報
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            避開危機、趨吉避凶。當原局的夫妻星碰到「比肩、劫財」流年，情敵爭奪、伴侶心思不穩的概率將翻倍；而當您需要主動斬斷孽緣時，也必須遵循身強身弱的天道密匙。
          </p>

          <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl space-y-3 mb-4">
            <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 font-sans">
              <ShieldAlert size={14} className="text-red-500 animate-pulse" />
              <span>⚠️ 爛桃花泛濫與感情生變危機警告式</span>
            </h4>
            <ul className="text-xs text-zen-text space-y-2 leading-relaxed font-sans list-disc list-inside">
              {isMale ? (
                <>
                  <li><strong>財星（透干）遇比劫：</strong>心儀對象可能正與他人藕斷絲連，其身邊常有其他競爭對手，需有耐心甄別。</li>
                  <li><strong>比劫 + 財（坐比劫）：</strong>感情關係容易有強大情敵林立，或是伴侶容易因為其自身朋友的言語挑唆，令婚姻關係生變。</li>
                </>
              ) : (
                <>
                  <li><strong>官殺 + 比劫：</strong>心儀對象容易遭遇已有家室、已有伴侶或腳踏多條船之人，切防被動涉足三角糾紛。</li>
                  <li><strong>比劫 + 官殺：</strong>對象人際及感情圈子極其繁亂，相處期極易陷入多角拉扯或三角磨難，傷神費時。</li>
                </>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            {/* Decisive Cut point */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="font-bold text-pink-300 block">✨ 主動斬斷孽緣有利時機判定</span>
              <p className="text-[11px] text-zen-muted leading-relaxed">
                欲抽身爛桃花，必須精選五行平調的流年月，有利談判重大決定：
              </p>
              <div className="mt-1.5 p-2 bg-pink-950/10 border border-pink-900/45 rounded-lg space-y-1">
                <p className="font-bold">您的身強弱格局：{primaryPattern}</p>
                <p className="text-white">
                  {primaryPattern.includes("弱") ? (
                    currentDaYun && currentDaYun.ganZhi === "壬午" ? 
                    "✓ 當前大運適配用神，能量調和，可直接於「食神、傷官、財星」流日做主導與談判，成效佳。" :
                    "✓ 目前大運不平衡。主動決策難孤軍深入，應精選「正印、偏印、比肩、劫財」流年月日，尋求家族長輩或摯友提供實質斡旋，借力使力。"
                  ) : (
                    "✓ 先天身強氣足，可主動精選「食神（順暢溝通）、財星（索取補償）、官殺（掌握主導）」之流年月日作強勢談判，能順利抽身。"
                  )}
                </p>
              </div>
            </div>

            {/* Romance remedy block */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <span className="font-bold text-purple-300 block">🌸 專屬天然感情五行補運</span>
              <p className="text-[11px] text-zen-muted leading-relaxed">
                根據命局喜忌，建議多主動充沛 <strong className="text-pink-400 font-bold underline">{romanceRemedy}</strong> 五行，在穿搭隨身飾物或磁場上自我穩固：
              </p>
              <div className="mt-1">
                <ElementRemedyCard
                  chart={chart}
                  primaryPattern={primaryPattern}
                  weakestElements={weakestElements}
                  category="romance"
                  accentColor="text-pink-400"
                  accentBg="bg-pink-500/10"
                  accentBorder="border-pink-500/20"
                  categoryLabel="姻緣"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: 2026年 桃花宮催旺方位 */}
        <div id="fengshui" className="scroll-mt-20 glass-card">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-pink-400 font-mono">08.</span> 2026年 桃花宮催旺方位與床頭櫃秘法
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            除了個人生辰八字，天時地利亦掌握改命之鑰。依徐玉蘭老師順心術，完美揉合當前<strong>2026年玄空紫白飛星方位</strong>、<strong>日主桃花床邊特定招花方位</strong>及<strong>個人限定軟裝五行方位</strong>：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* 2026 Purple White flying stars */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-3 font-sans text-xs">
              <span className="text-purple-300 font-bold block">🔮 2026 玄空紫白飛星天時桃花方位</span>
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <strong className="text-pink-300 block mb-0.5">九紫右弼星（主喜事、婚姻、戀愛、生育）：東南方</strong>
                  <p className="text-[11px] text-zen-muted leading-relaxed">2026年九紫星降臨東南方。請於住宅或臥房之東南方擺放暖色調軟裝、粉晶球、或紅色/粉色玫瑰鮮花，並常開此處窗戶引動和煦吉氣。</p>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <strong className="text-blue-300 block mb-0.5">一白貪狼星（主好人緣、貴人、群眾社交）：中宮（客廳中央）</strong>
                  <p className="text-[11px] text-zen-muted leading-relaxed">位於住宅客廳的正中央。務必保持此區域動線通暢不堆積雜物，可在此處點香氛或擺放白色鮮花、使用白色桌旗或地毯。</p>
                </div>
              </div>
            </div>

            {/* Bedside flow placements */}
            <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 space-y-3 font-sans text-xs">
              <span className="text-pink-300 font-bold block">🛌 臥室床頭櫃特定花位秘技</span>
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                <p className="text-[11px] leading-relaxed">
                  日常在臥室休息、躺臥在床時，不同的男女極性具有相異的「地磁招花」點。請依照指示在相應一側擺置未謝的鮮花：
                </p>
                <div className="grid grid-cols-2 gap-3 text-center pt-1.5">
                  <div className={`p-2 rounded-lg border ${isMale ? 'bg-pink-500/10 border-pink-500/25' : 'bg-black/30 border-white/5 text-zinc-500'}`}>
                    <strong className="block text-xs text-white">🚹 男命：右側櫃</strong>
                    <span className="text-[10px] block mt-1">躺下後「右邊床頭櫃」擺放鮮花。</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${!isMale ? 'bg-pink-500/10 border-pink-500/25' : 'bg-black/30 border-white/5 text-zinc-500'}`}>
                    <strong className="block text-xs text-white">🚺 女命：左側櫃</strong>
                    <span className="text-[10px] block mt-1">躺下後「左邊床頭櫃」擺放鮮花。</span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-[10px] text-yellow-500 leading-relaxed">
                ⚠️ <strong>天人相濟防空洞口訣：</strong>
                「當個人天命五行與住宅紫白流年方位衝突時，請優先以紫白飛星流年方位（東南方催婚、中宮催緣）作主要理氣依據。」
              </div>
            </div>
          </div>

          {/* Profile-Specific Geopathic soft decors */}
          {userFengShuiDetail && (
            <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-xs font-sans">
              <span className="text-pink-300 font-bold block mb-3 font-sans">🏡 {dayMasterElement}命 {isMale ? "男性" : "女性"} 客製化軟裝桃花理氣方案</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-black/30 border border-white/5 rounded-lg">
                  <span className="text-zinc-500 block mb-0.5">旺運方位</span>
                  <strong className="text-white block">{userFengShuiDetail.directions.join(" / ")}</strong>
                </div>
                <div className="p-2 bg-black/30 border border-white/5 rounded-lg">
                  <span className="text-zinc-500 block mb-0.5">佈置色系</span>
                  <strong className="block text-pink-400">{userFengShuiDetail.colors.join(" 、 ")}</strong>
                </div>
                <div className="p-2 bg-black/30 border border-white/5 rounded-lg col-span-1 sm:col-span-2">
                  <span className="text-zinc-500 block mb-0.5">特選桃花位軟裝與擺設</span>
                  <strong className="text-[11px] text-white/90 block leading-relaxed">{userFengShuiDetail.items}</strong>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px]">開運生肖擺件（建議擺放於上述開運宮位）</span>
                  <strong className="text-amber-400 text-xs mt-0.5 font-bold block">{userFengShuiDetail.zodiacs}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 9: 近期專屬桃花日 */}
        <div id="dates" className="scroll-mt-20">
          <DailyForecastCard
            chart={chart}
            category="romance"
            categoryName="姻緣"
            accentColor="text-pink-400"
            title="近期專屬感情桃花吉日"
            emptyMessage="近期火候略嫌平緩，可靜心保養，積存正能。"
            actionGuide="安排赴約、積極表達善心、或與心儀對象發送訊息，流日和合磁場會提增雙方對白契合感。"
            dateBorderColors={{
              border: "border-pink-500/20",
              bg: "bg-pink-500/10",
              text: "text-pink-400",
            }}
            emoji="🌸"
            showQualityBadge={true}
            extraWarning={hasClash ? "小叮嚀：由於您夫妻宮先天逢沖，流日桃花雖旺，約會相談時建議多傾聽，包容彼此自由。" : undefined}
          />
        </div>

      </div>
    </CategoryPageTemplate>
  );
}