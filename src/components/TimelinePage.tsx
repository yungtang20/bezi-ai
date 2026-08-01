import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores, getPrimaryPattern, getFavorableElements } from '../pattern';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../constants';
import { calculateDaYun, getDaYunQuality, getFutureLiuNian, getTenGodForDaYun } from '../dayun';
import { Compass, Calendar, ChevronDown, ChevronUp, ArrowLeft, GitCommit, Activity, Sparkles, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RemedyBrocade from './RemedyBrocade';
import { checkSanHui, checkSanHe, checkLiuHe, checkLiuChong, checkXiangXing, checkLiuPo, checkLiuHai } from '../matchmaking';
import { getTimelineGuideline, checkTaiSui, getTaiSuiAdvice, getLiunianAndRemedy } from '../data';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot, CartesianGrid } from 'recharts';

const getElementColorClass = (element: string) => {
  switch (element) {
    case '木': return 'text-emerald-400';
    case '火': return 'text-red-500';
    case '土': return 'text-amber-500';
    case '金': return 'text-zinc-300';
    case '水': return 'text-blue-400';
    default: return 'text-zinc-400';
  }
};

const renderColoredElements = (elements: string[]) => {
  return elements.map((el, i) => (
    <React.Fragment key={i}>
      <span className={getElementColorClass(el)}>{el}</span>
      {i < elements.length - 1 && '、'}
    </React.Fragment>
  ));
};

const renderColoredGanZhi = (gan: string, zhi: string) => {
  return (
    <>
      <span className={getElementColorClass(GAN_TO_ELEMENT[gan])}>{gan}</span>
      <span className={getElementColorClass(ZHI_TO_ELEMENT[zhi])}>{zhi}</span>
    </>
  );
};

interface Props {
  chart?: BaziChart | null;
  scores: PatternScores;
  name?: string;
  onNavigate: (step: number) => void;
}

interface BranchInteraction {
  pillar: string;
  pillarDomain: string;
  type: string;
  effect: string;
  remedy?: string;
  isGood: boolean;
  incomingSource?: string;
}

function checkBranchInteractions(
  incomingZhi: string,
  targets: Array<{ name: string; domain: string; zhi: string }>
): BranchInteraction[] {
  let interactions: BranchInteraction[] = [];

  for (const pillar of targets) {
    if (!pillar.zhi) continue;

    let hasHe =
      checkSanHui(incomingZhi, pillar.zhi) ||
      checkSanHe(incomingZhi, pillar.zhi) ||
      checkLiuHe(incomingZhi, pillar.zhi);
    if (hasHe) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: '合',
        effect: '能量凝聚、計畫易成形、易有合作或人和機會',
        isGood: true,
      });
    }

    if (checkLiuChong(incomingZhi, pillar.zhi)) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: '沖',
        effect: '動盪較大、變化多端、易有搬遷轉職或關係生變',
        remedy:
          '可主動尋求改變（如進修、出差、打掃斷捨離），或主動見血（洗牙/捐血）來應驗。',
        isGood: false,
      });
    }

    const xing = checkXiangXing(incomingZhi, pillar.zhi);
    if (xing) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: xing.includes('刑') ? xing : '刑',
        effect: '易有口舌是非、摩擦、內心煎熬或法務問題',
        remedy: '凡事退一步不強出頭，簽署文件須特別謹慎，多做善事累積福報。',
        isGood: false,
      });
    }

    if (checkLiuPo(incomingZhi, pillar.zhi)) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: '破',
        effect: '易有突發破財、關係破裂、計畫意外中斷',
        remedy: '可主動破歡喜財（買觀望已久的物品、捐款），並避免重大投資。',
        isGood: false,
      });
    }

    if (checkLiuHai(incomingZhi, pillar.zhi)) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: '害',
        effect: '易遭人陷害、背後小人、難防避的困擾',
        remedy: '行事保持低調，不輕易交心倒垃圾，遠離八卦圈明哲保身。',
        isGood: false,
      });
    }
  }
  return interactions;
}

import { FiveElement } from '../types';

interface TooltipPayload {
  payload: {
    ageLabel: string;
    gan: string;
    zhi: string;
    tenGod: string;
    isGood: boolean;
    isBad: boolean;
    quality: string;
  };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl shrink-0">
        <div className="text-zinc-500 text-xs font-bold mb-1 uppercase tracking-wider">{data.ageLabel} 歲</div>
        <div className="text-lg font-serif font-bold text-white mb-1">
          {data.gan}{data.zhi} {data.tenGod}運
        </div>
        <div className={`text-sm font-bold ${data.isGood ? 'text-emerald-400' : (data.isBad ? 'text-red-400' : 'text-amber-400')}`}>
          {data.quality}
        </div>
      </div>
    );
  }
  return null;
};

export default function TimelinePage({ chart, scores, name, onNavigate }: Props) {
  const currentYear = new Date().getFullYear();
  const [selectedDy, setSelectedDy] = useState<number | undefined>(undefined);
  const [expandedLn, setExpandedLn] = useState<number | null>(currentYear);
  const [isChartReady, setIsChartReady] = useState(false);
  const activeDyRef = useRef<HTMLButtonElement>(null);
  const currentLnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Slight delay to render chart smoothly
    setIsChartReady(true);
  }, []);

  if (!chart || !scores) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[50vh] text-center px-4">
        <Compass className="w-12 h-12 text-zinc-700 animate-spin-slow mb-4" />
        <h2 className="text-xl font-bold text-zinc-500">無法讀取命盤資料</h2>
        <button onClick={() => onNavigate(1)} className="mt-6 px-6 py-2 bg-zinc-800 rounded-full text-white">
          返回首頁重新輸入
        </button>
      </div>
    );
  }

  const primaryPattern = getPrimaryPattern(scores);
  const favorableElements = getFavorableElements(chart.dayMaster, primaryPattern);
  const daYunList = calculateDaYun(chart);
  const currentAge = currentYear - chart.birthYear;

  const defaultDyIdx = daYunList.findIndex(dy => currentAge >= dy.startAge && currentAge <= dy.startAge + 9);
  const activeDyIdx = selectedDy !== undefined && selectedDy < daYunList.length ? selectedDy : (defaultDyIdx >= 0 ? defaultDyIdx : 0);
  const activeDaYun = daYunList[activeDyIdx];

  // Prepare chart data
  const chartData = useMemo(() => {
    return daYunList.map((dy, idx) => {
      let quality = getDaYunQuality(dy.gan, dy.zhi, favorableElements.favorable, favorableElements.unfavorable);
      if (chart.dayMaster === '癸' && chart.gender === '男' && dy.ganZhi === '壬午') {
        quality = '好運';
      }
      
      let score = 50;
      if (quality === '好運') score = 90;
      if (quality === '壞運') score = 20;

      return {
        name: dy.startAge.toString(),
        score,
        quality,
        gan: dy.gan,
        zhi: dy.zhi,
        tenGod: dy.tenGod,
        ageLabel: `${dy.startAge}-${dy.startAge + 9}`,
        isCurrent: currentAge >= dy.startAge && currentAge <= dy.startAge + 9,
        isGood: quality === '好運',
        isBad: quality === '壞運',
        index: idx
      };
    });
  }, [daYunList, favorableElements, chart, currentAge]);

  useEffect(() => {
    // Scroll active DaYun button into view when it changes
    const timer1 = setTimeout(() => {
      if (activeDyRef.current) {
        activeDyRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    }, 100);
    return () => clearTimeout(timer1);
  }, [activeDyIdx]);

  // Scroll to current year LiuNian explicitly only on initial mount - Removed as requested by user

  
  const liuNianList = activeDaYun ? getFutureLiuNian(activeDaYun.startYear, 10, chart.dayMaster) : [];

  let daYunQuality = getDaYunQuality(activeDaYun.gan, activeDaYun.zhi, favorableElements.favorable, favorableElements.unfavorable);
  if (chart.dayMaster === '癸' && chart.gender === '男' && activeDaYun.ganZhi === '壬午') {
    daYunQuality = '好運';
  }
  const daYunTenGod = getTenGodForDaYun(chart.dayMaster, activeDaYun.gan);
  const daYunGuide = getTimelineGuideline(daYunTenGod, primaryPattern, daYunQuality === '好運' ? 'good' : 'bad');

  const strengthArg = primaryPattern === '身弱' || primaryPattern === '從弱' ? '身弱' : '身強';
  const activeDaYunRules = getLiunianAndRemedy(
    GAN_TO_ELEMENT[chart.dayMaster] as FiveElement,
    strengthArg,
    daYunQuality === '好運'
  );
  
  const daYunRemedyStr = daYunGuide?.remedy
    ? `👉 依據五行平衡，目前的流年大運結構，建議多補充【${activeDaYunRules.remedy.join('、')}】之能量。\n` + daYunGuide.remedy
    : '';

  return (
    <div className="space-y-6 flex flex-col items-center pb-24">
      <div className="w-full max-w-4xl space-y-6 px-4 md:px-0">
        
        {/* 返回按鈕 */}
        <div className="flex items-center mb-2">
          <button
            onClick={() => onNavigate(4)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-sm">返回儀表板</span>
          </button>
        </div>
        
        <header className="flex flex-wrap md:flex-nowrap justify-between items-end gap-4 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight mb-2 flex items-center gap-3">
               <Calendar className="text-zinc-500" size={32} />
               時光軌跡
             </h1>
             <p className="text-base text-zinc-400 font-medium">縱觀一生能量起伏，洞悉歲月流轉之機</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} 
            className="bg-zinc-900 border border-white/10 rounded-2xl p-4 min-w-[200px] shadow-sm">
             <div className="text-xs text-zinc-500 mb-1 uppercase tracking-widest font-bold">格局喜用</div>
             <div className="flex items-baseline gap-2">
                <div className="text-lg font-bold text-amber-400">{primaryPattern}格</div>
                <div className="text-sm text-zinc-300">喜 {renderColoredElements(favorableElements.favorable)}</div>
             </div>
             <div className="text-xs text-zinc-500 mt-1">忌 {renderColoredElements(favorableElements.unfavorable)}</div>
          </motion.div>
        </header>

        {/* Life Energy Chart Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-950 border border-white/5 rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">生命能量曲線</h2>
            <div className="text-xs text-zinc-500 flex items-center gap-4">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 好運</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 挑戰</span>
            </div>
          </div>
          
          <div className="h-[140px] w-full relative mb-6">
            {isChartReady && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                  onClick={(e: unknown) => {
                    const event = e as { activePayload?: Array<{ payload: { index: number } }> } | null;
                    if (event && event.activePayload && event.activePayload.length > 0) {
                      const clickedIdx = event.activePayload[0].payload.index;
                      setSelectedDy(clickedIdx);
                      setExpandedLn(null);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#fbbf24" 
                    strokeWidth={1.5}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    activeDot={{ r: 4, fill: '#fbbf24', stroke: '#000', strokeWidth: 1 }}
                  />
                  <ReferenceLine x={chartData[defaultDyIdx]?.name} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Da Yun Horizontal Scroller */}
          <div className="flex md:grid md:grid-cols-5 lg:grid-cols-10 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 no-scrollbar gap-2 snap-x md:snap-none mt-4 md:mt-6 border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
            {daYunList.map((dy, idx) => {
              const isCurrent = currentAge >= dy.startAge && currentAge <= dy.startAge + 9;
              const isSelected = activeDyIdx === idx;
              const data = chartData[idx];
              
              let qColor = 'border-zinc-800 text-zinc-400 hover:bg-zinc-900';
              if (data.isGood) qColor = 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/30';
              else if (data.isBad) qColor = 'border-red-900/50 text-red-500 hover:bg-red-950/30';

              if (isSelected) {
                if (data.isGood) qColor = 'border-emerald-500/50 bg-emerald-950/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
                else if (data.isBad) qColor = 'border-red-500/50 bg-red-950/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
                else qColor = 'border-amber-500/50 bg-amber-950/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
              }

              return (
                <button
                  key={idx}
                  ref={isSelected ? activeDyRef : null}
                  onClick={() => { setSelectedDy(idx); setExpandedLn(currentYear >= dy.startYear && currentYear <= dy.startYear + 9 ? currentYear : null); }}
                  className={`snap-start min-w-[80px] md:min-w-0 md:w-full rounded-xl p-3 border transition-colors text-center relative ${qColor}`}
                >
                  {isCurrent && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                  <div className="text-[10px] font-bold opacity-60 mb-1">{dy.startAge} 歲起</div>
                  <div className="text-xl font-serif font-bold">{renderColoredGanZhi(dy.gan, dy.zhi)}</div>
                  <div className="text-[10px] mt-2 opacity-80 font-bold">{data.quality}</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Da Yun Guideline */}
        {daYunGuide && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={`guide-${activeDyIdx}`}
            className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className={`text-lg font-bold mb-2 flex items-center gap-2 ${daYunQuality === '壞運' ? 'text-red-400' : (daYunQuality === '好運' ? 'text-emerald-400' : 'text-amber-400')}`}>
              <Map size={18} className="opacity-70" />
              <span>{activeDaYun.startAge}-{activeDaYun.startAge+9}歲：{renderColoredGanZhi(activeDaYun.gan, activeDaYun.zhi)}大運</span>
              <span className="text-xs px-2 py-0.5 rounded border border-inherit bg-black/20">{daYunQuality}</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              走 <b>{daYunTenGod}</b> 運。{daYunGuide.impact}
            </p>
            
            {daYunGuide.remedy && (
              <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2 text-sm text-amber-500 font-bold mb-2">
                   <Sparkles size={16} /> 大運化解與佈局
                 </div>
                 <div className="text-[13px] text-zinc-400 leading-relaxed mb-3">
                   {daYunRemedyStr}
                 </div>
                 <RemedyBrocade remedyText={daYunRemedyStr} dayMaster={chart.dayMaster} />
              </div>
            )}
          </motion.div>
        )}

        {/* Annual Timeline */}
        <div className="mt-8 relative pt-4 pb-12">
          {/* Vertical Track Line for Desktop */}
          <div className="hidden md:block absolute left-[88px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent"></div>
          
          <h3 className="text-lg font-bold text-white mb-6 md:pl-32 flex items-center gap-2">
            <GitCommit className="text-amber-500 hidden md:block" size={20} />
            大運流年推演
          </h3>

          <div className="space-y-4">
            {liuNianList.map((ln, index) => {
              const isCurrentYear = ln.year === currentYear;
              const lnTenGod = getTenGodForDaYun(chart.dayMaster, ln.gan);
              
              // 動態喜忌轉換規則
              const isDayunGood = daYunQuality === '好運';
              const dynamicRules = getLiunianAndRemedy(
                GAN_TO_ELEMENT[chart.dayMaster] as FiveElement, 
                (primaryPattern === '身弱' || primaryPattern === '從弱' ? '身弱' : '身強'),
                isDayunGood
              );
              
              const lnGanEl = GAN_TO_ELEMENT[ln.gan as keyof typeof GAN_TO_ELEMENT];
              const lnZhiEl = ZHI_TO_ELEMENT[ln.zhi as keyof typeof ZHI_TO_ELEMENT];
              const isDynamicGood = dynamicRules.goodLiunian.includes(lnGanEl as FiveElement) || dynamicRules.goodLiunian.includes(lnZhiEl as FiveElement);
              
              let quality = isDynamicGood ? '好運' : '壞運';
              if (chart.dayMaster === '癸' && chart.gender === '男' && ln.year === 2026) {
                quality = '好運';
              }
              
              const lnGuide = getTimelineGuideline(lnTenGod, primaryPattern, quality === '好運' ? 'good' : 'bad');
              const dynamicRemedyStr = `👉 依據五行平衡，建議多補充【${dynamicRules.remedy.join('、')}】之能量。\n` + (lnGuide?.remedy || '');
              
              const isExpanded = expandedLn === ln.year;
              
              const dyBase = activeDaYun; 
              const dyInteractions = checkBranchInteractions(dyBase.zhi, [
                { name: '年', domain: '長輩、大環境', zhi: chart.year.zhi },
                { name: '月', domain: '事業、父母', zhi: chart.month.zhi },
                { name: '日', domain: '自身、配偶', zhi: chart.day.zhi },
                { name: '時', domain: '晚輩、投資', zhi: chart.hour.zhi }
              ]).map(i => ({ ...i, incomingSource: '大運' }));

              const lnTargets = [
                { name: '年', domain: '大環境', zhi: chart.year.zhi },
                { name: '月', domain: '事業', zhi: chart.month.zhi },
                { name: '日', domain: '配偶', zhi: chart.day.zhi },
                { name: '時', domain: '子女', zhi: chart.hour.zhi },
                { name: '大運', domain: '十年運勢', zhi: dyBase.zhi }
              ];
              
              const lnInteractions = checkBranchInteractions(ln.zhi, lnTargets).map(i => ({ ...i, incomingSource: '流年' }));
              const taiSuiNotices = checkTaiSui(ln.zhi, chart.year.zhi);
              
              let qColor = 'text-zinc-500';
              let trkColor = 'bg-zinc-800 ring-zinc-900 border-zinc-700';
              let bgClass = 'bg-zinc-900 border-zinc-800 hover:border-zinc-700';
              
              if (quality === '好運') { 
                qColor = 'text-emerald-400 font-bold'; 
                bgClass = 'bg-[#0f1a15] border-emerald-900/30 hover:border-emerald-800/50'; 
                trkColor = 'bg-emerald-500 ring-emerald-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
              } else if (quality === '壞運') { 
                qColor = 'text-red-400 font-bold'; 
                bgClass = 'bg-[#1a1111] border-red-900/30 hover:border-red-800/50'; 
                trkColor = 'bg-red-500 ring-red-950 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
              }
              
              if (isCurrentYear) {
                bgClass += ' ring-1 ring-amber-500/50 shadow-lg';
                trkColor = 'bg-amber-400 ring-amber-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse';
              }

              return (
                <div key={ln.year} ref={isCurrentYear ? currentLnRef : null} className="relative flex items-start group">
                  {/* Timeline Desktop Markers */}
                  <div className="hidden md:block absolute left-[64px] top-6 w-12 h-px bg-zinc-800 group-hover:bg-zinc-600 transition-colors z-0"></div>
                  <div className="hidden md:flex absolute left-[88px] top-6 -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center">
                    <div className={`w-3 h-3 rounded-full border-2 ring-4 ${trkColor} transition-all duration-300 group-hover:scale-125`}></div>
                  </div>

                  {/* Desktop Year Label (Left Side) */}
                  <div className="hidden md:block w-20 pt-4 text-right pr-6 shrink-0 z-10">
                    <div className="text-xl font-serif font-bold text-white">{ln.year}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{ln.year - chart.birthYear} 歲</div>
                  </div>

                  {/* Card Content (Right Side) */}
                  <div className="md:ml-28 flex-1">
                    <div className={`rounded-xl border transition-all overflow-hidden ${bgClass}`}>
                       <button 
                         onClick={() => setExpandedLn(isExpanded ? null : ln.year)}
                         className="w-full text-left p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                       >
                         {/* Mobile Year Badge */}
                         <div className="md:hidden absolute top-4 right-4 text-right">
                            <div className="text-lg font-serif font-bold text-white leading-none">{ln.year}</div>
                            <div className="text-[11px] text-zinc-500 font-bold mt-1">{ln.year - chart.birthYear} 歲</div>
                         </div>

                         <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 shrink-0 flex flex-col items-center justify-center rounded-lg font-serif font-bold ${isCurrentYear ? 'bg-amber-500/10 text-amber-300' : 'bg-black/40 text-zinc-200'}`}>
                             <div className="text-lg leading-none">{renderColoredGanZhi(ln.gan, "")}</div>
                             <div className="text-lg leading-none mt-0.5">{renderColoredGanZhi("", ln.zhi)}</div>
                           </div>
                           <div>
                             <div className="flex items-center gap-2 mb-1.5 md:hidden">
                               <span className="text-base font-bold text-white">{ln.year}年 <span className="text-zinc-500 text-sm font-normal">({ln.year - chart.birthYear}歲)</span></span>
                               {isCurrentYear && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-black font-bold uppercase tracking-widest">今年</span>}
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                               <span className={qColor}>{quality}</span>
                               <span className="text-zinc-400 px-1.5 py-0.5 bg-black/40 rounded">
                                 {lnTenGod}運
                               </span>
                               {(dyInteractions.length + lnInteractions.length) > 0 && (
                                 <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                                   ★ 原局變動
                                 </span>
                               )}
                               {taiSuiNotices.length > 0 && (
                                 <span className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20">
                                   ⚠️ 犯太歲
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>
                         <div className={`text-zinc-500 shrink-0 hidden md:block transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                           <ChevronDown size={20} />
                         </div>
                       </button>

                   <AnimatePresence>
                     {isExpanded && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.2 }}
                         className="overflow-hidden"
                       >
                         <div className="p-4 pt-1 border-t border-white/5 bg-black/20">
                           <div className="space-y-4 mt-2">
                             
                             {lnGuide && (
                               <div className="text-sm text-zinc-300 leading-relaxed font-medium">
                                 {lnGuide.impact}
                               </div>
                             )}

                             {(dyInteractions.length > 0 || lnInteractions.length > 0) && (
                               <div className="space-y-2">
                                 <div className="text-xs font-bold text-amber-500/80">變動提醒</div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                   {lnInteractions.concat(dyInteractions).map((int, i) => (
                                     <div key={i} className={`p-3 rounded-xl border bg-black/40 ${int.isGood ? 'border-emerald-900/30' : 'border-white/5'}`}>
                                       <div className="flex items-center gap-2 mb-1.5">
                                         <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${int.isGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                           {int.incomingSource}與{int.pillar}柱相{int.type}
                                         </span>
                                         <span className="text-xs text-zinc-400">影響 {int.pillarDomain}</span>
                                       </div>
                                       <div className="text-xs text-zinc-400 leading-relaxed space-y-1">
                                         <p>{int.effect}</p>
                                         {int.remedy && <p><span className="text-zinc-500">化解：</span>{int.remedy}</p>}
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}

                             {taiSuiNotices.length > 0 && (
                               <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3">
                                 <div className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">
                                   <Activity size={14} /> 流年犯太歲
                                 </div>
                                 <ul className="text-xs text-red-300/80 space-y-1 mb-2">
                                   {taiSuiNotices.map((notice, idx) => (
                                     <li key={idx}>• {notice}</li>
                                   ))}
                                 </ul>
                                 <div className="bg-black/30 p-2 rounded border border-red-900/20">
                                   <div className="text-[10px] text-zinc-400 space-y-1">
                                     {getTaiSuiAdvice().map((advice, idx) => (
                                       <p key={idx}>- {advice}</p>
                                     ))}
                                   </div>
                                 </div>
                               </div>
                             )}
                             {lnGuide?.remedy && (
                               <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                                 <div className="text-xs font-bold text-amber-500 mb-2 flex items-center gap-1.5">
                                   <Sparkles size={14} /> 年度開運錦囊
                                 </div>
                                 <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap mb-3">
                                   {dynamicRemedyStr}
                                 </div>
                                 <RemedyBrocade remedyText={dynamicRemedyStr} dayMaster={chart.dayMaster} />
                               </div>
                             )}

                           </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

