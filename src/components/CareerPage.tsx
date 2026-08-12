// src/components/CareerPage.tsx
// [AI MOD] 事業深度解析 — 打造與健康篇、財富篇完全一致的精緻目錄導覽與流暢滾動體驗，融合講義最完整的生肖搭配/轉職時機/事業風水/十神團隊對照

import CategoryPageTemplate from './CategoryPageTemplate';
import { useMemo } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores } from '../pattern';
import CategoryTimelineRemedy from './CategoryTimelineRemedy';
import CategorySynastry from './CategorySynastry';
import { GAN_TO_ELEMENT } from '../constants';
import { calculateDaYun, getTenGodForDaYun } from '../dayun';
import { 
  getWealthCareer, 
  getCareerRole, 
  LECTURE_DATA
} from '../data';
import DailyForecastCard from './DailyForecastCard';
import ElementRemedyCard from './ElementRemedyCard';
import { 
  Compass, 
  Briefcase, 
  Calendar, 
  Sparkles, 
  Layers, 
  Sparkle, 
  Target, 
  CheckCircle2, 
  Users, 
  Shuffle,
  BookOpen
} from 'lucide-react';

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

export default function CareerPage({ chart, primaryPattern, favorable, unfavorable, weakestElements, partners }: Props) {

  // 1. 統計十神，找出前兩名最多的類型 (僅計算天干 3 個及地支本氣 4 個，排除中餘氣，共計最多 7 個十神關係)
  const tenGodCount = useMemo(() => {
    const counts: Record<string, number> = {};
    const add = (god: string) => {
      if (god && god !== '日主') {
        counts[god] = (counts[god] || 0) + 1;
      }
    };
    
    // 天干十神
    if (chart.year.tenGod) add(chart.year.tenGod);
    if (chart.month.tenGod) add(chart.month.tenGod);
    if (chart.hour.tenGod) add(chart.hour.tenGod);

    // 地支本氣十神 (僅計算地支第一主氣，排除中氣與餘氣)
    if (chart.year.hiddenTenGods && chart.year.hiddenTenGods[0]) add(chart.year.hiddenTenGods[0]);
    if (chart.month.hiddenTenGods && chart.month.hiddenTenGods[0]) add(chart.month.hiddenTenGods[0]);
    if (chart.day.hiddenTenGods && chart.day.hiddenTenGods[0]) add(chart.day.hiddenTenGods[0]);
    if (chart.hour.hiddenTenGods && chart.hour.hiddenTenGods[0]) add(chart.hour.hiddenTenGods[0]);

    return counts;
  }, [chart]);

  const sortedTenGods = useMemo(() => {
    return Object.entries(tenGodCount).sort((a, b) => b[1] - a[1]);
  }, [tenGodCount]);

  const topGod1 = sortedTenGods[0]?.[0] || '無';
  const topCount1 = sortedTenGods[0]?.[1] || 0;
  const topGod2 = sortedTenGods[1]?.[0] || '';
  const topCount2 = sortedTenGods[1]?.[1] || 0;

  const maxGod = topGod1 || chart.month.tenGod || '正官';
  const secGod = topGod2 || null;

  const roleData = getCareerRole(maxGod);
  // 取得對應的職業建議 (利用前二名的十神組合)
  const careerInfo = getWealthCareer(maxGod, secGod);

  // 身強/身弱判定
  const isStrong = useMemo(() => primaryPattern.includes('身強'), [primaryPattern]);
  const isWeak = useMemo(() => primaryPattern.includes('身弱'), [primaryPattern]);

  const dmElement = GAN_TO_ELEMENT[chart.dayMaster] || '金';

  // 2. 專屬事業風水佈置指南 (講義第 9 & 10 頁)
  const customCareerFengShui = useMemo(() => {
    const data: Record<string, { element: string; directions: string[]; colors: string[]; items: string }> = {
      '金': {
        element: '火（以火生官殺）',
        directions: ['東北', '東南', '正南', '西南方'],
        colors: ['紅色', '黃色', '橙色', '綠色系'],
        items: '佈置馬、虎、狗、羊、蛇的木製擺件。亦可擺設紅、黃、橙色的精緻陶瓷擺件，助旺官運與氣勢。'
      },
      '木': {
        element: '金（以金煉木為官）',
        directions: ['正西', '西北', '東北', '西南方'],
        colors: ['白色', '灰色', '金色', '銀色系'],
        items: '置放蛇、猴、雞、牛的金屬材質生肖擺件。亦可選用金屬製鬧鐘/錢幣/風鈴/音樂盒，白色、灰色或金色瓶身的優雅香氛，或金銀色燈罩的燈具。'
      },
      '水': {
        element: '土（以土止水為官）',
        directions: ['東北', '西南', '東南', '西北方'],
        colors: ['紅色', '黃色', '橘色', '土黃色系'],
        items: '擺設馬、狗、羊、蛇、龍、牛的生肖雕件(材質以紅/橙/黃色陶瓷、玉石或原色陶土為最佳)。可搭配紅、黃、橘色地毯、紅紫色瓶身香氛或紅色鹽燈/燈具。'
      },
      '火': {
        element: '水（以水濟火為官）',
        directions: ['正北', '西北', '正西', '東北方'],
        colors: ['黑色', '藍色', '藍綠色', '白色', '灰色', '金色', '銀色系'],
        items: '置放鼠、豬、龍、雞、牛、猴的生肖件(材質以金屬、玻璃或水晶製為佳)。宜在辦公桌或客廳顯眼處布置一個盛水的透明水缸或常補乾淨清水的玻璃水杯。'
      },
      '土': {
        element: '木（以木疏土成器）',
        directions: ['東北', '正東', '東南方'],
        colors: ['綠色', '藍綠色系'],
        items: '置放豬、兔、羊、虎、龍的木雕擺件。十分推薦養育富貴竹、萬年青或黃金葛等綠色盆栽，並擺放綠水晶、翡翠，或使用綠色燈罩。'
      }
    };
    return data[dmElement] || data['金'];
  }, [dmElement]);

  // 3. 轉職時機判定 (講義第 10 頁)
  const jobChangeAdvice = useMemo(() => {
    const currentYearNum = new Date().getFullYear();
    const currentAge = currentYearNum - chart.birthYear;
    const daYunList = calculateDaYun(chart);
    const currentDaYun = daYunList.find(dy => currentAge >= dy.startAge && currentAge <= dy.startAge + 9);
    
    const el = dmElement as keyof typeof LECTURE_DATA.JOB_CHANGE['身強'];
    let detail = '';
    let condition = '';
    
    if (isWeak) {
      let isBalanced = false;
      if (currentDaYun) {
        const tenGod = getTenGodForDaYun(chart.dayMaster, currentDaYun.gan);
        if (['正印', '偏印', '比肩', '劫財'].includes(tenGod)) {
          isBalanced = true;
        }
      }
      if (isBalanced) {
        condition = `身弱命格，當前大運「${currentDaYun?.ganZhi || ''}」具有生扶力量，達到平衡。`;
        detail = `流年宜遇【${LECTURE_DATA.JOB_CHANGE['身弱_平衡'][el]}】之能量，能承擔官財之耗，利於跳槽和升職。`;
      } else {
        condition = `身弱命格，當前大運耗損日主氣場，處於失衡防守。`;
        detail = `流年宜遇【${LECTURE_DATA.JOB_CHANGE['身弱_不平衡'][el]}】（即生扶自身之印星/比劫歲運）時轉職，才不易因變動落入泥淖。`;
      }
    } else {
      condition = '身強命格，本身底氣充足，可隨時主動出擊衝刺。';
      detail = `流年宜逢【${LECTURE_DATA.JOB_CHANGE['身強'][el]}】（剋洩自身之官殺/財星/食傷歲運），最能大展拳腳、轉換到高回報跑道。`;
    }
    
    return { condition, detail };
  }, [chart, isWeak, dmElement]);

    const menuItems = [
    { id: 'judgment', labelShort: '判斷依據', icon: Compass },
    { id: 'inherent', labelShort: '職場角色', icon: Target },
    { id: 'wuxing', labelShort: '日主轉職', icon: Shuffle },
    { id: 'gods', labelShort: '十神開運', icon: Sparkles },
    { id: 'collab', labelShort: '分工戰略', icon: Users },
    { id: 'remedy', labelShort: '五行補運', icon: Sparkle },
    { id: 'decor', labelShort: '軟裝佈局', icon: Layers },
    { id: 'timeline', labelShort: '歲運推演', icon: Calendar },
    { id: 'dates', labelShort: '工作旺日', icon: Briefcase },
    { id: 'synastry', labelShort: '合盤觀測', icon: Users }
  ];

    return (
    <CategoryPageTemplate
      title="事業深度解析"
      subtitle="Empirical Ten Gods Career Navigation & Feng Shui Optimizer"
      icon={Briefcase}
      accentColor="blue"
      menuItems={menuItems}
    >
      <div className="space-y-8">

        {/* Section 1: 我是怎麼判斷的 */}
        <div id="judgment" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
            <Compass size={80} />
          </div>
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-blue-400 font-mono">01.</span> 我是怎麼判斷的：命盤十神分布
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            職涯格局判斷的首要基石，取決於<strong>天干主星表象與地支主氣本氣的十神匯聚</strong>。本派學理排除複雜干擾支藏干中氣、餘氣，唯有最真實反映格局主導力量的 7 個十神定位，能精準洞察您的核心職場傾向。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-zen-muted">年柱天干 ({chart.year.gan})</span>
              <strong className="text-base text-blue-400 font-serif block">{chart.year.tenGod || '日主'}</strong>
              <span className="text-[10px] text-zinc-500 block">主青年形象與資深長輩</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-zen-muted">月柱天干 ({chart.month.gan})</span>
              <strong className="text-base text-blue-400 font-serif block">{chart.month.tenGod || '日主'}</strong>
              <span className="text-[10px] text-zinc-500 block">主青壯年事業核心與社交環境</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 ring-1 ring-blue-500/20">
              <span className="text-[10px] text-blue-400/80">日主自己 (身命)</span>
              <strong className="text-base text-white font-black font-serif block">{chart.dayMaster} ({dmElement}命人)</strong>
              <span className="text-[10px] text-zinc-400 block font-semibold">{isStrong ? '身強格（厚實）' : '身弱格（靈巧）'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-zen-muted">時柱天干 ({chart.hour.gan})</span>
              <strong className="text-base text-blue-400 font-serif block">{chart.hour.tenGod || '日主'}</strong>
              <span className="text-[10px] text-zinc-500 block">主晚年歸宿與下屬部眾</span>
            </div>
          </div>

          <div className="bg-zen-surface/30 p-4 rounded-xl border border-zen-border space-y-3">
            <h3 className="text-xs font-bold text-zen-text flex items-center gap-1.5 mb-1 font-sans">
              <Sparkle size={14} className="text-blue-400 animate-pulse" /> 命盤十神原局個數盤點（不計支藏干中氣與餘氣）：
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {sortedTenGods.map(([god, count], idx) => (
                <div key={god} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/5 text-xs font-semibold">
                  <span className="text-blue-400">#{idx + 1}</span>
                  <span className="text-zen-text">{god}</span>
                  <span className="font-bold text-white px-1.5 py-0.5 rounded bg-white/5">{count}個</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zen-muted leading-relaxed font-sans mt-2">
              💡 <strong className="text-blue-400 font-bold">學術級計法說明：</strong>依講義排盤準則，本盤點排除支藏干內的中氣與餘氣，僅計日主外之天干（3個）與地支本氣/主氣（4個）共計 7 個十神關係，能最真實反映其主導格局，因此總和不超過 7 個（時柱未知時為 5 個）。
            </p>
          </div>
        </div>

        {/* Section 2: 先天職場角色與合適工作 */}
        <div id="inherent" className="scroll-mt-20 glass-card relative overflow-hidden">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-blue-400 font-mono">02.</span> 先天職場角色與工作型態
          </h2>

          <div className="mb-6 bg-zen-surface/60 border border-zen-border rounded-xl p-5">
            <p className="text-base text-zen-text leading-relaxed">
              您的命局中最具主導力的事業能量為：
              <strong className="text-blue-400 text-lg mx-1.5">{maxGod}</strong>
              {secGod && (
                <>
                  與輔助星 <strong className="text-blue-400 text-lg mx-1.5">{secGod}</strong>
                </>
              )}
            </p>
            <p className="text-xs text-zen-muted mt-1.5 font-sans">＊系統已為您盤點命盤中之十神能量比重，並取前二名進行深度定位分析。</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-black/30 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                🎯
              </div>
              <div>
                <p className="text-xs text-zen-muted font-bold">核心職能角色</p>
                <p className="text-base font-bold text-white leading-tight mt-1">
                  {roleData?.role || '獨立開拓宿主'} <span className="text-xs text-zen-muted font-normal ml-1">({maxGod}特質)</span>
                </p>
              </div>
            </div>

            {careerInfo && (
              <div className="space-y-4">
                <div className="p-4 bg-zen-surface/60 rounded-xl border border-zen-border space-y-2">
                  <p className="text-xs text-blue-400 font-bold flex items-center gap-1">
                    <span>💼</span> 合適行業與具體工作：
                  </p>
                  <p className="text-sm text-zinc-200 leading-relaxed bg-black/40 p-3.5 rounded-lg border border-white/5 font-sans">{careerInfo.suitableCareers}</p>
                </div>

                {roleData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <p className="text-xs text-zinc-400 font-bold">🏢 合適環境型態</p>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{roleData.suitable}</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <p className="text-xs text-zinc-400 font-bold">💡 專家核心建議</p>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{roleData.advice}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-zen-surface/60 rounded-xl border border-zen-border space-y-2">
                  <p className="text-xs text-blue-400 font-bold flex items-center gap-1 font-sans">
                    <span>🤝</span> 團隊合夥與分工指導建議：
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 font-sans">{careerInfo.partnerAdvice}</p>
                </div>

                <div className="p-4 bg-blue-950/10 rounded-xl border border-blue-500/10 space-y-3 font-sans">
                  <h4 className="text-xs font-bold text-blue-400">🐾 專屬職場生肖神隊友</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    根據您命盤的年支，若遇到生肖為 <strong>
                    {chart.year.zhi === '申' || chart.year.zhi === '子' || chart.year.zhi === '辰' ? '猴、鼠、龍' :
                     chart.year.zhi === '巳' || chart.year.zhi === '酉' || chart.year.zhi === '丑' ? '蛇、雞、牛' :
                     chart.year.zhi === '寅' || chart.year.zhi === '午' || chart.year.zhi === '戌' ? '虎、馬、狗' :
                     chart.year.zhi === '亥' || chart.year.zhi === '卯' || chart.year.zhi === '未' ? '豬、兔、羊' : '與您地支三合之生肖'}
                    </strong> 的合作夥伴，彼此磁場天然契合，極易達成共識！
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: 八字地支與發展場域 + 轉職時機 */}
        <div id="wuxing" className="scroll-mt-20 glass-card relative overflow-hidden">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-blue-400 font-mono">03.</span> 五行職涯與轉職時機
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 轉職時機 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-amber-400 text-xs mb-2 flex items-center gap-1.5">
                  <Shuffle size={13} /> 🔄 轉職時機與高回報出口
                </h3>
                <p className="text-xs text-zinc-400 mb-2 font-semibold">
                  命理格局：<strong className="text-white">{jobChangeAdvice.condition}</strong>
                </p>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans bg-black/40 p-3 rounded-lg border border-white/5">
                  {jobChangeAdvice.detail}
                </p>
              </div>
              <p className="text-[10px] text-amber-300/80 mt-2.5 pt-2 border-t border-white/5 select-none leading-relaxed font-sans">
                💡 <strong>昇華說明：</strong>當走到「{LECTURE_DATA.CAREER_PROMOTION[dmElement as keyof typeof LECTURE_DATA.CAREER_PROMOTION]}」之流年，本命官殺與財氣同旺，升遷跳槽易逢外來資本引渡，成其大功。
              </p>
            </div>

            {/* 發展場域 */}
            <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-xs mb-2 flex items-center gap-1.5 font-sans">
                  <Target size={13} className="text-blue-400" /> 📍 地支密碼與發展場域
                </h3>
                {(() => {
                  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
                  const countZhi = (arr: string[]) => zhis.filter(z => arr.includes(z)).length;
                  
                  const groups = [
                    { key: '寅申巳亥', count: countZhi(['寅','申','巳','亥']), data: LECTURE_DATA.ZHI_CAREER_SUITABILITY['寅申巳亥'] },
                    { key: '辰戌丑未', count: countZhi(['辰','戌','丑','未']), data: LECTURE_DATA.ZHI_CAREER_SUITABILITY['辰戌丑未'] },
                    { key: '子午卯酉', count: countZhi(['子','午','卯','酉']), data: LECTURE_DATA.ZHI_CAREER_SUITABILITY['子午卯酉'] }
                  ].sort((a, b) => b.count - a.count);

                  const dominantGroup = groups[0];
                  if (dominantGroup.count === 0) return <p className="text-xs text-zen-muted">地支能量分佈平均，無特定聚焦。</p>;

                  return (
                    <div className="space-y-2 mt-2">
                      <p className="text-xs text-zinc-300 font-sans">
                        命盤地支以 <strong className="text-white">{dominantGroup.key}</strong> 最多 ({dominantGroup.count}顆)。
                      </p>
                      <div className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/40 p-3 rounded border border-white/5 space-y-1">
                        <strong className="text-blue-400">「{dominantGroup.data.type}」特質：</strong>
                        <p>{dominantGroup.data.desc}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed mt-2.5 font-sans">
                ＊地支四正、四生或四墓庫代表了您的先天職場心態與行為模式。
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: 專屬十神事業開運指南 */}
        <div id="gods" className="scroll-mt-20">
          {(() => {
            const godCareerAdvice: Record<string, { title: string; strategy: string; timing: string; tip: string }> = {
              '比肩': { title: '比肩為自主創業星', strategy: '適合合夥創業、自由職業、技術合夥，與同輩合作能發揮團隊戰力', timing: '逢比肩流日適合提案、簽約、拓展人脈', tip: '比肩代表自我意識強，宜培養專業技能，避免過度固執己見。' },
              '劫財': { title: '劫財為競爭突破星', strategy: '適合競爭激烈的業務、銷售、體育、金融投機等高挑戰領域', timing: '逢劫財流日適合衝刺業績、挑戰極限', tip: '劫財代表競爭與冒險，需控制衝動，避免過度投機。' },
              '食神': { title: '食神為才藝表達星', strategy: '適合教育、餐飲、藝術、創作、諮詢、技術研發等靠才華吃飯的行業', timing: '逢食神流日適合發表作品、教學、創意發想', tip: '食神代表才華與口福，宜持續學習新知，避免好逸惡勞。' },
              '傷官': { title: '傷官為創新變革星', strategy: '適合科技、設計、行銷、公關、律師、顧問等需要創新思維的行業', timing: '逢傷官流日適合創新提案、改革、表達意見', tip: '傷官代表聰明才智，需收斂鋒芒，避免言語過於尖銳。' },
              '偏財': { title: '偏財為多元進財星', strategy: '適合投資、副業、業務、公關、人際經營等多元收入來源', timing: '逢偏財流日適合投資理財、拓展業務、社交應酬', tip: '偏財代表靈活理財，需量入為出，避免過度投機。' },
              '正財': { title: '正財為穩健財神星', strategy: '適合金融、會計、行政、管理、技術工程等穩定收入的行業', timing: '逢正財流日適合談判薪資、簽約、理財規劃', tip: '正財代表正當收入，宜踏實工作、累積實力，忌投機取巧。' },
              '七殺': { title: '七殺為權威挑戰星', strategy: '適合軍警、外科、工程、管理、創業等需要抗壓與決斷力的行業', timing: '逢七殺流日適合處理難題、承擔重任、展現魄力', tip: '七殺代表壓力與挑戰，需修身養性，避免衝動決策。' },
              '正官': { title: '正官為管理領導星', strategy: '適合公務員、主管、管理、法律、教育等需要制度與責任的行業', timing: '逢正官流日適合升遷談判、參加考試、求職面試', tip: '正官代表責任與紀律，宜守法守分，避免過度保守。' },
              '偏印': { title: '偏印為學術研究星', strategy: '適合研究、學術、醫療、宗教、玄學、技術專精等需要深度思考的領域', timing: '逢偏印流日適合學習進修、研究策劃、深度思考', tip: '偏印代表智慧與直覺，宜專注深耕，避免三心二意。' },
              '正印': { title: '正印為貴人扶持星', strategy: '適合教育、文化、行政、醫療、社會服務等需要貴人相助的行業', timing: '逢正印流日適合拜師學習、尋求貴人、參加培訓', tip: '正印代表貴人與長輩，宜謙虛學習，避免過度依賴。' },
            };

            const mainAdvice = godCareerAdvice[maxGod];
            const secAdvice = secGod ? godCareerAdvice[secGod] : null;

            if (!mainAdvice) return null;

            return (
              <div className="glass-card animate-in fade-in">
                <h2 className="text-lg font-bold text-zen-text mb-4 flex items-center gap-2 border-b border-zen-border pb-3">
                  <span className="text-blue-400 font-mono">04.</span> 專屬十神事業開運指南
                </h2>
                <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
                  根據命盤十神數量分析，您的事業主力結構以 <strong className="text-blue-400 font-bold">{maxGod}</strong>（{topCount1}個）為核心主幹
                  {secGod && <>，次主力以 <strong className="text-blue-400 font-bold">{secGod}</strong>（{topCount2}個）起到輔佐平衡的作用</>}。
                </p>

                {/* 主要能量 */}
                <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4.5 mb-4 space-y-3 font-sans">
                  <h3 className="text-sm font-bold text-blue-400 flex items-center gap-1">
                    <span className="text-base">🔵</span> 主要星耀特質：{maxGod} — {mainAdvice.title}
                  </h3>
                  <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed font-medium pl-5.5">
                    <p>🎯 <strong className="text-zinc-100 font-semibold pl-1">開拓策略：</strong>{mainAdvice.strategy}</p>
                    <p>🗓️ <strong className="text-zinc-100 font-semibold pl-1">關鍵時機：</strong>{mainAdvice.timing}</p>
                    <p>⚠️ <strong className="text-zinc-100 font-semibold pl-1">開運警示：</strong>{mainAdvice.tip}</p>
                  </div>
                </div>

                {/* 輔助能量 */}
                {secAdvice && (
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
                )}
              </div>
            );
          })()}
        </div>

        {/* Section 5: 十神團隊搭配與分工攻略 (講義第 11 & 12 頁) */}
        <div id="collab" className="scroll-mt-20 glass-card relative overflow-hidden">
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
            <span className="text-blue-400 font-mono">05.</span> 十神團隊搭配與分工攻略
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            職場並非單打獨鬥。根據您的命盤，您可以了解您在團隊中的優劣勢。以下為講義中，<strong>「比、劫、食、傷、財、官殺、印」五大能量</strong>之完整職場優缺、互補與合作策略防線：
          </p>

          <div className="space-y-4">
            {/* 列表 / 細節 */}
            {[
              {
                godGroup: '財星（正財/偏財客體）',
                tag: '財',
                strength: '財感極強、極擅拉拔資源與捕獲商業機會、頭腦精算、行動派、高結果導向。',
                weakness: '常常制度鬆散、大意、財務風險意識偏低、個人情緒及狀態隨金流損益產生劇烈起伏。',
                bestPartner: '官殺（重規則制度與風險管理、充當剎車皮）、印星（善後勤、有長遠眼光、安心理財）。',
                avoidPartner: '財星（主權撞車、爭奪資源）、比劫（重義氣而透支人情、金錢界線必須提前釐清）。',
                isMyType: maxGod === '正財' || maxGod === '偏財' || secGod === '正財' || secGod === '偏財'
              },
              {
                godGroup: '官殺（正官/七殺星曜）',
                tag: '官殺',
                strength: '具強烈責任感與高壓適應力、追求細節極致、精益求精、講求忠誠與使命必達。',
                weakness: '容易求好心切過度、畏懼犯錯受罰、精神緊繃度高、需謹防自壓力超載。',
                bestPartner: '食傷（企劃大師、創意行銷激發）、財星（業務成果落地變現、放大合作效益）、比劫（敢於衝鋒陷陣、分擔扛責）。',
                avoidPartner: '官殺（重製度、雙方缺乏彈性容易直接對撞、導致事務陷入僵局）。',
                isMyType: maxGod === '正官' || maxGod === '七殺' || secGod === '正官' || secGod === '七殺'
              },
              {
                godGroup: '印星（正印/偏印星曜）',
                tag: '印星',
                strength: '邏輯靈活極具學習敏銳、偏愛深度鑽研研究、顧全大局架構、深謀遠慮且耐心十足。',
                weakness: '重度事前規劃強迫、執行落地度較弱、往往容易處在「高付出、低主動反饋」局面。',
                bestPartner: '官殺（重製度化、具果決敢衝性、適合長期契合拍檔。印助官殺思考防錯，官殺助印變現執行）。',
                avoidPartner: '比劫（行事衝動、先斬後奏、主觀極強、節奏天差地遠、需要大量時間溝通磨合）。',
                isMyType: maxGod === '正印' || maxGod === '偏印' || secGod === '正印' || secGod === '偏印'
              },
              {
                godGroup: '食傷（食神/傷官才華）',
                tag: '食傷',
                strength: '極富創意發想且表達力拔群、具備天生自媒體天賦、擅長對外商務公關、社交聯誼。',
                weakness: '穩定性偏低，對繁雜瑣碎、墨守成規、重複性的行政與制度深感不耐與抗拒。',
                bestPartner: '官殺（定方向、把控總進度、扛起行政責任提供穩定大後方）、印星（協助梳理混雜架構、收斂瘋狂想法）。',
                avoidPartner: '食傷（想法過多易流於空談）、比劫（決策多變磨合難、資源分配難妥協）。',
                isMyType: maxGod === '食神' || maxGod === '傷官' || secGod === '食神' || secGod === '傷官'
              },
              {
                godGroup: '比劫（比肩/劫財同氣）',
                tag: '比劫',
                strength: '具強悍行動力、重視朋友手足情義、天生自帶凝聚與帶隊風範、擅長前線突破拓展。',
                weakness: '極易衝過頭犯險、過於主觀不聽勸、容易在人情與利益邊界模糊，稍顯太過感性。',
                bestPartner: '官殺（架構制度規則合理、流程井然、能夠幫助比劫團隊劃清彼此責任與理性界限）。',
                avoidPartner: '比劫（極易在後期陷入爭名奪利與股權衝突中）、財星（極易盲目追求熱點融資、忽略了無形破財風險）。',
                isMyType: maxGod === '比肩' || maxGod === '劫財' || secGod === '比肩' || secGod === '劫財'
              }
            ].map((col, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all ${
                  col.isMyType 
                    ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/20 shadow-lg' 
                    : 'bg-black/35 border-white/5 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                      col.isMyType ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {col.tag}
                    </span>
                    <strong className="text-sm font-bold text-white">{col.godGroup}</strong>
                  </div>
                  {col.isMyType && (
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
            ))}
          </div>
        </div>

        {/* Section 6: 個人事業五行補運 */}
        <div id="remedy" className="scroll-mt-20">
          <ElementRemedyCard
            chart={chart}
            primaryPattern={primaryPattern}
            weakestElements={weakestElements}
            category="career"
            accentColor="text-blue-400"
            accentBg="bg-blue-500/10"
            accentBorder="border-blue-500/20"
            categoryLabel="事業"
          />
        </div>

        {/* Section 7: 學術級事業風水佈局 (講義第 9 & 10 頁) ----- 全新加入，絕不漏缺！ */}
        <div id="decor" className="scroll-mt-20 glass-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-5 select-none">
            <BookOpen size={100} />
          </div>
          <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono">07.</span> 學術級事業風水軟裝佈局
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/20 border border-blue-500/20 px-2 py-0.5 rounded">
              徐玉蘭風水磁場順心術
            </span>
          </h2>
          <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
            講義明示：<strong>補事業風水不須考慮身強或身弱</strong>，僅須根據日主，調理自身「事業官殺」位。在辦公室或書房的專屬官殺方位擺放生旺色彩和軟裝，或坐於此方位書寫公章、商談，具有極強的添載磁場妙用：
          </p>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-black border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0 text-xl shadow-glow">
                🔮
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-wider font-mono">My Day Master Feng Shui</span>
                <strong className="text-base text-blue-400 font-serif">您的日主五行屬「{dmElement}」— 專屬事業五行屬 {customCareerFengShui.element}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">📍 開運黃金方位：</span>
                <div className="flex flex-wrap gap-1.5">
                  {customCareerFengShui.directions.map((dir, idx) => (
                    <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10.5px] px-2 py-0.5 font-bold rounded">
                      {dir}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  💡建議將您的辦公桌、主椅安置在上述方位。如空間受限，可在此方位擺置您的提案報告、筆記型電腦。
                </p>
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <span className="text-blue-400 font-bold block">🎨 旺運色系：</span>
                <div className="flex flex-wrap gap-1.5">
                  {customCareerFengShui.colors.map((col, idx) => (
                    <span key={idx} className="bg-blue-500/10 text-white border border-white/10 text-[10.5px] px-2 py-0.5 font-bold rounded">
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  建議辦公室裝潢細節、桌墊、日常服飾配件可大幅融入上述顏色起烘生助作用。
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/80 rounded-xl border border-white/5 space-y-2 font-sans text-xs">
              <span className="text-amber-400 font-black flex items-center gap-1">
                🐾 特製生肖軟裝擺飾與催旺法：
              </span>
              <p className="text-zinc-200 leading-relaxed font-medium">{customCareerFengShui.items}</p>
              <div className="p-2.5 bg-amber-950/20 rounded border border-amber-500/20 text-[10.5px] text-amber-300 leading-relaxed font-semibold">
                ⚠️ <strong>催運提點：</strong>整理事業方位的佈置、務必保持潔淨。書寫簽約、開會研究、策劃大決策時，誠坐此「官殺方位」，能大幅加持理智、提振權重！
              </div>
            </div>
          </div>
        </div>

        {/* Section 8: 歲運推演與化解 */}
        <div id="timeline" className="scroll-mt-20">
          <CategoryTimelineRemedy 
            chart={chart} 
            primaryPattern={primaryPattern} 
            favorable={favorable} 
            unfavorable={unfavorable} 
            category="career" 
            categoryTitle="事業" 
          />
        </div>

        {/* Section 9: 流日專屬事業預報 */}
        <div id="dates" className="scroll-mt-20">
          <DailyForecastCard
            chart={chart}
            category="career"
            categoryName="事業"
            accentColor="text-blue-400"
            title="流日專屬事業預報"
            emptyMessage="近期無明顯事業旺日，請保持穩定守正，穩步推進已有安排。"
            actionGuide="拜訪大客戶、向上級匯報提案、研究面試新動、推進重大延滯項目。"
            dateBorderColors={{
              border: 'border-blue-500/20',
              bg: 'bg-blue-500/10',
              text: 'text-blue-400',
            }}
          />
        </div>

        {/* Section 10: 職場人際與合盤觀測 */}
        <div id="synastry" className="scroll-mt-20">
          <CategorySynastry chart={chart} partners={partners || []} category="career" />
        </div>

      </div>
    </CategoryPageTemplate>
  );
}