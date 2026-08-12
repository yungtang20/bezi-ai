// src/components/HealthPage.tsx
// [AI MOD] 健康深度解析 — 遵循學術級講義體系，精確推演八大核心維度
import CategoryPageTemplate from './CategoryPageTemplate';
import { useMemo } from 'react';
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Inbox,
  Info,
  Sparkle,
  Compass
} from 'lucide-react';
import { BaziChart } from '../paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../constants';
import { calculateDaYun, getLiuNian } from '../dayun';
import { getHealthRemedy, HEALTH_DATA, HEALTH_PRESERVATION_GUIDE } from '../data';
import { Solar } from 'lunar-javascript';

import { PartnerInfo } from '../types';

interface Props {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];  // 所有最弱五行
  partners?: PartnerInfo[];
  onNavigate?: (step: number) => void;
}

export default function HealthPage({ chart, weakestElements }: Props) {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
  
  // 1. 命盤五行分佈（純個數盤點，天干+地支本氣，不數支藏干）
  const elementCount = useMemo(() => {
    const count: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    const pillars = [chart.year, chart.month, chart.day, chart.hour];
    for (const p of pillars) {
      if (!p) continue;
      const eGan = GAN_TO_ELEMENT[p.gan];
      if (eGan) count[eGan] += 1;
      const eZhi = p.zhi ? ZHI_TO_ELEMENT[p.zhi] : '';
      if (eZhi) count[eZhi] += 1;
    }
    return count;
  }, [chart]);

  // 偏弱五行（個數 <= 1）
  const weakElements = useMemo(() => {
    return Object.entries(elementCount)
      .filter(([, val]) => val <= 1)
      .map(([el]) => el);
  }, [elementCount]);

  // 過旺五行（個數 >= 3）
  const excessElements = useMemo(() => {
    return Object.entries(elementCount)
      .filter(([, val]) => val >= 3)
      .map(([el]) => el);
  }, [elementCount]);

  // 2. 當前大運 & 流年取得
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;
  const allDaYun = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = useMemo(() => {
    return allDaYun.find(d => currentAge >= d.startAge && currentAge <= d.startAge + 9);
  }, [allDaYun, currentAge]);
  const currentLiuNian = useMemo(() => getLiuNian(currentYear, chart.dayMaster), [currentYear, chart.dayMaster]);

  // 得出最需注意之五行資訊（以 weakestElements 為主，若無則取個數最少者）
  const targetWeakest = useMemo(() => {
    return weakestElements.length > 0 ? weakestElements : (weakElements.length > 0 ? weakElements : ['金']);
  }, [weakestElements, weakElements]);

  // 計算大運健康推演
  const daYunHealthDetails = useMemo(() => {
    const primaryWeak = targetWeakest[0];
    const dyInfo = HEALTH_DATA.DAYUN_HEALTH[primaryWeak as keyof typeof HEALTH_DATA.DAYUN_HEALTH];
    if (!dyInfo || !currentDaYun) return { status: '平穩', desc: '大運氣場平穩，日常注意保養即可。', code: 'neutral' };

    const dyGanEl = GAN_TO_ELEMENT[currentDaYun.gan] || '';
    const dyZhiEl = ZHI_TO_ELEMENT[currentDaYun.zhi] || '';

    const isGood = dyInfo.good.includes(dyGanEl) || dyInfo.good.includes(dyZhiEl);
    const isBad = dyInfo.bad.includes(dyGanEl) || dyInfo.bad.includes(dyZhiEl);

    if (isGood) {
      return { 
        status: '穩定好轉', 
        desc: `大運五行運轉至「${dyGanEl}${dyZhiEl}」，五行屬性與被補元素相合（屬 ${dyInfo.good.join('、')}），得到充沛補養，先天健康弱項獲得修復契機，體質呈穩定上升趨勢。`,
        code: 'good'
      };
    } else if (isBad) {
      return {
        status: '健康警訊',
        desc: `大運五行運轉至「${dyGanEl}${dyZhiEl}」，引動剋洩氣場（屬 ${dyInfo.bad.join('、')}）。先天弱項 ${primaryWeak} 能量被抑制或耗損過度：${dyInfo.badDesc}。`,
        code: 'bad'
      };
    }
    return { status: '平穩保持', desc: '大運氣場平順，健康無明顯克洩。', code: 'neutral' };
  }, [targetWeakest, currentDaYun]);

  // 計算大運 X 流年綜合健康推論（先差後好 / 穩定但小恙 / 旺上加旺 / 雙凶護航）
  const combinedYearlyAnalysis = useMemo(() => {
    const primaryWeak = targetWeakest[0];
    const dyInfo = HEALTH_DATA.DAYUN_HEALTH[primaryWeak as keyof typeof HEALTH_DATA.DAYUN_HEALTH];
    if (!dyInfo || !currentDaYun || !currentLiuNian) {
      return { phrase: '歲運平健', body: '大運與流年五行流動和諧，維持常態保養即可。' };
    }

    const dyGanEl = GAN_TO_ELEMENT[currentDaYun.gan] || '';
    const dyZhiEl = ZHI_TO_ELEMENT[currentDaYun.zhi] || '';
    const lnGanEl = GAN_TO_ELEMENT[currentLiuNian.gan] || '';
    const lnZhiEl = ZHI_TO_ELEMENT[currentLiuNian.zhi] || '';

    const dyGood = dyInfo.good.includes(dyGanEl) || dyInfo.good.includes(dyZhiEl);
    const lnGood = dyInfo.good.includes(lnGanEl) || dyInfo.good.includes(lnZhiEl);

    if (!dyGood && lnGood) {
      return {
        phrase: '先差後好',
        body: `【大運逢警訊，流年送甘霖】目前十年間大運與先天弱項「${primaryWeak}」相悖，健康時受小恙拖累；但今年歲君「${currentLiuNian.ganZhi}」能量屬「${lnGanEl}/${lnZhiEl}」迎來健康好轉之星，利復原與調理，呈現『先差後好，先苦後甘』之象。`
      };
    } else if (dyGood && !lnGood) {
      return {
        phrase: '穩定但小恙',
        body: `【大限底氣足，流年值金傷】十年大運底氣充足、健康穩定；但今年歲君「${currentLiuNian.ganZhi}」帶來暫時克制沖犯，需留意細小突發痼疾（如疲勞感冒、關節扭傷、上火發炎）。大象平穩而偶有小坎，防微杜漸即可。`
      };
    } else if (dyGood && lnGood) {
      return {
        phrase: '健康及時雨（雙吉補強）',
        body: `【大運引流，流年相扶】大限與歲君雙雙為喜神，能提供極富成效的修復能量。是積極進補、調理身心、恢復元氣的黃金之年。`
      };
    } else {
      return {
        phrase: '警訊疊加，切忌過勞',
        body: `【大運洩耗，歲君重克】大下限與今年流年均對先天弱項「${primaryWeak}」形成克洩交加。容易出現免疫水平低下、器官超負荷運作。務必保持充足睡眠、忌熬夜暴食，並安排全面健康檢查。`
      };
    }
  }, [targetWeakest, currentDaYun, currentLiuNian]);

  // 3. 掃描未來 120 天日曆中，極端能量流日 & 弱五行受克流日
  const scannedDates = useMemo(() => {
    const extremeDaysList: { date: string; ganZhi: string; comment: string }[] = [];
    const weakControlDaysList: { date: string; ganZhi: string; comment: string }[] = [];

    const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';
    
    // 日主對應極端能量
    const HEALTH_WARNING_DAYS: Record<string, string[]> = {
      '木': ['甲寅', '乙卯'],
      '火': ['丙午', '丁巳'],
      '土': ['戊辰', '己丑', '戊戌', '己未'],
      '金': ['庚申', '辛酉'],
      '水': ['壬子', '癸亥'],
    };
    const dmExtremeDays = HEALTH_WARNING_DAYS[dmEl] || [];

    // 最弱五行被剋流日組合列表
    const WEAK_CONTROL_DAYS: Record<string, string[]> = {
      '金': ['丙寅', '丙午', '丙戌', '丁巳', '丁未'],
      '木': ['庚申', '辛酉', '辛丑'],
      '水': ['戊戌', '戊辰', '戊午', '己未', '己丑', '己巳'],
      '火': ['壬子', '壬申', '壬辰', '癸亥', '癸酉', '癸丑'],
      '土': ['甲寅', '甲子', '甲辰', '乙卯', '乙亥', '乙未'],
    };

    const primaryWeak = targetWeakest[0];
    const weakCtrlDays = WEAK_CONTROL_DAYS[primaryWeak] || [];

    const today = new Date();
    // 遍歷 120 天，找出符合的日辰
    for (let i = 0; i < 120 && (extremeDaysList.length < 5 || weakControlDaysList.length < 5); i++) {
      const scanDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const solar = Solar.fromDate(scanDate);
      const lunar = solar.getLunar();
      const baZi = lunar.getEightChar();
      const gan = baZi.getDayGan();
      const zhi = baZi.getDayZhi();
      const ganZhi = `${gan}${zhi}`;

      const formattedLabel = `${solar.getMonth()}月${solar.getDay()}日`;

      if (dmExtremeDays.includes(ganZhi) && extremeDaysList.length < 5) {
        let extremeDesc = '';
        if (dmEl === '木') extremeDesc = '木氣極旺，小心腸胃不適。';
        if (dmEl === '火') extremeDesc = '火爆發炎，防上火與呼吸道受損。';
        if (dmEl === '土') extremeDesc = '土滯水弱，防代謝、水腫負擔。';
        if (dmEl === '金') extremeDesc = '金剛過燥，防神經焦慮、關節緊繃。';
        if (dmEl === '水') extremeDesc = '水勢奔騰，注意血壓與眼部疲倦。';

        extremeDaysList.push({
          date: formattedLabel,
          ganZhi,
          comment: extremeDesc
        });
      }

      if (weakCtrlDays.includes(ganZhi) && weakControlDaysList.length < 5) {
        const weakDetails = HEALTH_DATA.WEAK_ADVICE[primaryWeak as keyof typeof HEALTH_DATA.WEAK_ADVICE];
        weakControlDaysList.push({
          date: formattedLabel,
          ganZhi,
          comment: `弱五行「${primaryWeak}」受克。注意：${weakDetails?.organs || ''}`
        });
      }
    }

    return { extremeDaysList, weakControlDaysList };
  }, [chart.dayMaster, targetWeakest]);

  const wxColors: Record<string, string> = {
    '木': '#22C55E', '火': '#EF4444', '土': '#F59E0B', '金': '#94A3B8', '水': '#3B82F6',
  };

    const menuItems = [
    { id: 'distribution', label: '1. 命盤五行分佈', labelShort: '五行分佈', icon: Activity },
    { id: 'congenital', label: '2. 先天健康弱項', labelShort: '先天弱項', icon: Heart },
    { id: 'timeline', label: '3. 歲運推演分析', labelShort: '歲運分析', icon: Calendar },
    { id: 'weakness', label: '4. 能量偏弱觀察', labelShort: '能量偏弱', icon: Sparkle },
    { id: 'excess', label: '5. 能量過旺防範', labelShort: '能量過旺', icon: TrendingUp },
    { id: 'remedy', label: '6. 健康補運指南', labelShort: '補運指南', icon: Sparkles },
    { id: 'extreme', label: '7. 極端能量流日', labelShort: '極端流日', icon: Info },
    { id: 'clashed', label: '8. 最弱被剋流日', labelShort: '被剋流日', icon: Compass },
  ];

    return (
    <CategoryPageTemplate
      title="健康深度解析"
      subtitle="Bazi Constitution & Wellness Guide"
      icon={Activity}
      accentColor="emerald"
      menuItems={menuItems}
    >
      <div className="space-y-8">

          {/* Section 1: 命盤五行分佈 */}
          <div id="distribution" className="scroll-mt-20 glass-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
              <Activity size={80} />
            </div>
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">01.</span> 命盤五行分佈
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              依據講義核心健康準則：<strong>「健康不看合化、身強身弱，直接看命盤中最少或沒有的五行。」</strong> 命盤中的八字，純個數盤點，不數地支藏干。
            </p>

            {/* Counts Visualizer */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {Object.entries(elementCount).map(([el, count]) => (
                <div key={el} className="p-4 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col justify-between">
                  <span className="text-xs text-zen-muted font-bold mb-1">屬{el}個數</span>
                  <span className="text-3xl font-extrabold" style={{ color: wxColors[el] }}>{count}</span>
                  <span className="text-[10px] text-zen-muted mt-2">
                    {count === 0 ? '⚠️ 完全缺失' : (count === 1 ? '⚡ 偏弱易克' : (count >= 3 ? '🔥 過旺亢盛' : '穩定'))}
                  </span>
                </div>
              ))}
            </div>

            {/* Principles Details */}
            <div className="bg-zen-surface/30 p-3 rounded-xl border border-zen-border space-y-2 text-xs text-zen-muted leading-relaxed">
              <div className="flex gap-2">
                <span className="text-amber-400 font-mono">規則一：</span>
                <p><strong>五行為 0 個</strong>：極容易成為終身的健康死角，缺乏天生抵禦與修補機制，必須永久高度防範與主動保養。</p>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-400 font-mono">規則二：</span>
                <p><strong>五行各 1 個</strong>：此為薄弱點。若原局同時有某一強旺五行（個數 ≥ 3），便會形成被剋五行受極端摧殘，是易爆發慢性痼疾的重災區。</p>
              </div>
            </div>
          </div>

          {/* Section 2: 先天健康弱項 */}
          <div id="congenital" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">02.</span> 先天健康弱項
            </h2>
            
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                <ShieldAlert size={18} />
                <span>病原弱項：最需注意的五行</span>
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                {targetWeakest.map(el => (
                  <span key={el} className="px-3 py-1 rounded-lg text-xs font-black text-white" style={{ backgroundColor: `${wxColors[el]}40`, border: `1px solid ${wxColors[el]}` }}>
                    {el} 氣
                  </span>
                ))}
              </div>
              <p className="text-xs text-zen-text leading-relaxed">
                經由個數盤點，您本命中最少、或被重金強木克洩之先天最危險器官。
              </p>
            </div>

            <div className="space-y-4">
              {targetWeakest.map(el => {
                const remedy = getHealthRemedy(el);
                const weakDetails = HEALTH_DATA.WEAK_ADVICE[el as keyof typeof HEALTH_DATA.WEAK_ADVICE];

                return (
                  <div key={el} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black font-serif" style={{ color: wxColors[el] }}>{el}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-zen-muted font-mono">先天缺陷靶點</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-zen-muted block">對應器官與系統：</span>
                        <strong className="text-zen-text text-sm block">
                          {weakDetails?.organs || remedy?.organs || HEALTH_DATA.ORGANS[el as keyof typeof HEALTH_DATA.ORGANS]}
                        </strong>
                      </div>
                      <div className="space-y-1">
                        <span className="text-zen-muted block">對應健康警訊症狀：</span>
                        <p className="text-zen-text leading-relaxed font-semibold">
                          {weakDetails?.symptoms || remedy?.weakSymptoms}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: 歲運推演分析 */}
          <div id="timeline" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">03.</span> 動態歲運推演
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted uppercase tracking-wider block">當前逢限大運</span>
                <strong className="text-lg text-zen-text font-serif block">
                  {currentDaYun ? `${currentDaYun.startAge}歲~${currentDaYun.startAge + 9}歲大運：${currentDaYun.ganZhi}` : '查無大運'}
                </strong>
                <span className="text-xs text-zen-muted block">
                  大限管中局：奠定這十年健康修復與病理的背景底色。
                </span>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted uppercase tracking-wider block">當前流年歲君</span>
                <strong className="text-lg text-emerald-400 font-serif block">
                  {currentLiuNian ? `${currentYear}年 (${currentLiuNian.ganZhi}年)` : `${currentYear}年`}
                </strong>
                <span className="text-xs text-zen-muted block">
                  流年主時效：點燃突發性意外、疾痛修復起伏的導火索。
                </span>
              </div>
            </div>

            {/* Subset A: 大運 x 健康狀況 */}
            <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Calendar className="text-emerald-400" size={16} />
                <h3 className="font-bold text-xs text-zen-text">子項一：大運 x 先天健康狀況</h3>
              </div>
              
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zen-muted font-bold">大運推演判定：</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    daYunHealthDetails.code === 'good' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    daYunHealthDetails.code === 'bad' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                    'bg-white/5 text-zen-muted'
                  }`}>
                    {daYunHealthDetails.status}
                  </span>
                </div>
                <p className="text-xs text-zen-text leading-relaxed font-semibold">
                  {daYunHealthDetails.desc}
                </p>
              </div>
            </div>

            {/* Subset B: 大運 x 流年 */}
            <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <TrendingUp className="text-emerald-400" size={16} />
                <h3 className="font-bold text-xs text-zen-text">子項二：大運 x 流年雙重干涉</h3>
              </div>
              <p className="text-[11px] text-zen-muted mb-2">
                大運為底牌，流年為觸發。雙重交叉對抗或生扶先天弱項，形成一整年動態走向：
              </p>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <h4 className="text-xs font-bold text-emerald-400 mb-1">
                  歲運合演結構：【{combinedYearlyAnalysis.phrase}】
                </h4>
                <p className="text-xs text-zen-text leading-relaxed font-semibold">
                  {combinedYearlyAnalysis.body}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: 能量偏弱觀察 */}
          <div id="weakness" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">04.</span> 能量偏弱觀察（日常保健）
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              針對本命盤中純個數小於等於 1 的弱五行，進行生理衰疲觀察，並給予最精確的食物和起居調養建議。
            </p>

            <div className="space-y-4">
              {weakElements.length === 0 ? (
                <div className="text-center p-6 text-xs text-zen-muted">
                  <Inbox className="mx-auto mb-2 opacity-30" size={32} />
                  您的五行分佈極為平衡，無純個數小於等於 1 個的薄弱能量。
                </div>
              ) : (
                weakElements.map(el => {
                  const remedies = HEALTH_PRESERVATION_GUIDE[el] || [];
                  const rData = getHealthRemedy(el);
                  return (
                    <div key={`weak-obs-${el}`} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold" style={{ color: wxColors[el] }}>{el} 氣薄弱</span>
                        <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5">防衰竭退化</span>
                      </div>
                      
                      <div className="text-xs space-y-2">
                        <p className="text-zen-text font-semibold">
                          <strong className="text-zen-muted">疲虛表現：</strong>{rData?.weakSymptoms}
                        </p>
                        <div className="p-3 rounded-lg bg-emerald-950/10 border border-emerald-900/10 mt-2 space-y-1.5">
                          <strong className="text-emerald-400 block mb-1">🌿 生理與飲食日常保健：</strong>
                          {remedies.map((tip, i) => (
                            <p key={i} className="text-[11px] text-zen-text leading-relaxed font-medium">
                              {tip}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 5: 能量過旺觀察 */}
          <div id="excess" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">05.</span> 能量過旺觀察
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              探究原局中能量過剩的五行「純個數 ≥ 3」。氣過旺亦可能克害其他五行、造成病理病變：
            </p>

            <div className="space-y-4">
              {excessElements.length === 0 ? (
                <div className="text-center p-6 text-xs text-zen-muted bg-white/[0.01] border border-white/5 rounded-xl">
                  <Inbox className="mx-auto mb-2 opacity-30" size={32} />
                  您的五行分佈溫和，無純個數大於等於 3 個的過旺元素。
                </div>
              ) : (
                excessElements.map(el => {
                  const remedy = getHealthRemedy(el);
                  let excessComment = '';
                  if (el === '火') excessComment = '※火神太旺：「發炎」重症，體內燥熱，易引發發燒、黏膜紅腫、上火發炎障礙。';
                  if (el === '土') excessComment = '※土神太旺：辰戌丑未太多引發「堆積物」淤塞、結石、瘜肉、腫瘤、癰疽，需極力疏導。';

                  return (
                    <div key={`exc-obs-${el}`} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-lg font-bold" style={{ color: wxColors[el] }}>{el} 氣亢盛 ({elementCount[el]}個)</span>
                        <span className="text-xs text-red-400 font-bold px-2 py-0.5 bg-red-400/10 rounded">防亢進與積壓</span>
                      </div>
                      <div className="text-xs space-y-2">
                        <p className="text-zen-text font-semibold">
                          <strong className="text-zen-muted">亢進病變表現：</strong>{remedy?.excessSymptoms}
                        </p>
                        {excessComment && (
                          <div className="p-3 rounded-lg bg-red-950/10 border border-red-900/15 text-red-300 font-semibold leading-relaxed text-[11px]">
                            {excessComment}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 6: 健康補運指南 */}
          <div id="remedy" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">06.</span> 健康補運指南
            </h2>
            
            <div className="space-y-4 text-xs text-zen-text">
              {/* Rules of thumb */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles size={14} /> 核心補運大綱與調候
                </h4>
                <div className="space-y-2 leading-relaxed font-semibold">
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <p>找出命中最少的五行物理性質（如服飾色彩、配戴水晶或用神掛飾）增補先天缺口。</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <p>若健康五行在命局中不幸為忌神，則<strong>不盲目進補</strong>；此時以大運的用神（喜神，如平衡大運命盤整體氣候）作為養生和調理的首要參考。</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">3.</span>
                    <p>若是特殊從格，則<strong>順勢而為</strong>，不必刻意補足，行用神運限時健康狀態即暢順自得。</p>
                  </div>
                </div>
              </div>

              {/* Space Feng Shui section */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <h4 className="font-bold text-amber-500 flex items-center gap-2">
                  <Compass size={14} /> 空間地利煞氣化解 (2026年飛星與疾病防範)
                </h4>
                <p className="text-xs text-zen-muted leading-relaxed">
                  除個人生辰八字天命外，空間地理煞方位（二黑巨門星、五黃廉貞星皆屬土星，五黃凶災最烈）對健康具有絕大影響。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 rounded-lg bg-yellow-950/10 border border-yellow-900/20 space-y-1.5">
                    <strong className="text-yellow-400 text-xs block">二黑巨門星 (西北方位) — 病符星</strong>
                    <p className="text-[11px] text-zen-muted leading-relaxed">
                      2026年病符星飛臨<strong>西北方</strong>，極易主導精神不濟、腸胃痼疾加重與突發性傷寒。
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-950/15 border border-red-900/20 space-y-1.5">
                    <strong className="text-red-400 text-xs block">五黃廉貞星 (正南方位) — 凶煞星</strong>
                    <p className="text-[11px] text-zen-muted leading-relaxed">
                      2026年五黃大煞星飛臨<strong>正南方</strong>，主是非、重大血光、開刀、意外惡疾。
                    </p>
                  </div>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-zen-border space-y-2 text-[11px] font-semibold mt-3">
                  <strong className="text-emerald-400 block mb-1">🛡️ 二黑五黃具體化解方法：</strong>
                  <div className="space-y-1.5 leading-relaxed">
                    <p><span className="text-yellow-500">【原則一：煞方宜靜不宜動】</span> 西北與正南方不宜施工敲牆、鑽洞、敲打，不宜堆放有聲家電（音響、風扇、拖地機器人、鬧鐘）。保持門窗遮掩，避免氣氣流動激動土煞。</p>
                    <p><span className="text-yellow-500">【原則二：以「金」洩土煞】</span> 二黑五黃屬土。用金屬器皿（如金屬銅葫蘆、六帝金錢、銅鈴、銀器擺飾）來化宿疾與凶災。地毯選用白、灰、金屬色系。</p>
                    <p><span className="text-red-400">【避忌禁區】</span> 煞方絕對忌用紅色（火生土助煞）、黃色系（助旺土氣）、綠色系植物（木克土，驚動土地神引發反噬）。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: 極端能量流日 */}
          <div id="extreme" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">07.</span> 極端能量流日
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              當流日出現與您的<strong>「日主五行相同且能量最強的日辰」</strong>時，會造成日主五行本氣極度亢盛，進而強烈剋制對應臟器，引發突發病患：
            </p>

            {/* Extreme Warning rules table */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 mb-4 text-xs font-semibold">
              <div className="flex items-center gap-2 text-amber-400">
                <Info size={14} />
                <span>您的日主五行屬【{dmEl}】，專屬極端流日警示：</span>
              </div>
              <div className="space-y-2 leading-relaxed">
                {dmEl === '木' && <p>• <strong className="text-zen-text">日主屬木</strong>：流年流日逢「甲寅、乙卯」能量最強，極端剋土，易致腸胃不適、壓力腹部脹痛。</p>}
                {dmEl === '火' && <p>• <strong className="text-zen-text">日主屬火</strong>：流年流日逢「丙午、丁巳」能量最強，極端剋金，多見支氣管發炎、呼吸困難、皮膚大爆疹過敏。</p>}
                {dmEl === '土' && <p>• <strong className="text-zen-text">日主屬土</strong>：流年流日逢「戊辰、戊戌、己丑、己未」能量最強，極端剋水，小心代謝水腫、泌尿感染、腎經負擔增加。</p>}
                {dmEl === '金' && <p>• <strong className="text-zen-text">日主屬金</strong>：流年流日逢「庚申、辛酉」能量最強，極端剋木，易感焦慮失眠、血壓突然不穩、關節緊繃與手足抽痛。</p>}
                {dmEl === '水' && <p>• <strong className="text-zen-text">日主屬水</strong>：流年流日逢「壬子、癸亥」能量最強，極端剋火，需特別防範心血管、眼底壓升高與頭暈。</p>}
              </div>
            </div>

            {/* Dynamic scanned dates visualizer */}
            <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4">
              <strong className="text-xs text-zen-text block mb-2">📅 預測推算：未來 120 天內您的「極端流日」警示：</strong>
              {scannedDates.extremeDaysList.length === 0 ? (
                <p className="text-xs text-zen-muted">未來 120 天內沒有明顯的極端能量流日，請常規保持即可。</p>
              ) : (
                <div className="space-y-2.5">
                  {scannedDates.extremeDaysList.map((item, idx) => (
                    <div key={`extreme-date-${idx}`} className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          {item.ganZhi}日
                        </span>
                        <span className="text-xs font-bold text-zen-text">{item.date}</span>
                      </div>
                      <span className="text-[11px] text-zen-muted font-medium text-right">{item.comment}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 8: 最弱五行被剋流日 */}
          <div id="clashed" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">08.</span> 最弱五行被剋流日
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              分析原局最缺乏之五行（怕大旺之神前來強行剋洩）。當流日的天干和地支重疊形成強勢克星時，先天缺陷處會面臨重度剋傷：
            </p>

            {/* Meticulous rendering of weak control combinations from lecture notes */}
            <div className="space-y-4 mb-4">
              {targetWeakest.map(el => {
                const weakDetails = HEALTH_DATA.WEAK_ADVICE[el as keyof typeof HEALTH_DATA.WEAK_ADVICE];
                if (!weakDetails) return null;

                return (
                  <div key={`weak-detail-${el}`} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: wxColors[el] }}>先天缺 {el} 能量：</span>
                      <span className="text-[11px] text-red-400 font-bold">怕 {weakDetails.avoidElement}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                      <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-lg space-y-1">
                        <strong className="text-red-400 block">⚡ 禁忌流日干支：</strong>
                        <p><span className="text-zen-muted">天干忌：</span>{weakDetails.avoidGans.join('、')}</p>
                        <p><span className="text-zen-muted">地支忌：</span>{weakDetails.avoidZhis.join('、')}</p>
                      </div>

                      <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-lg space-y-1">
                        <strong className="text-red-400 block">📌 最凶流日干支組合：</strong>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {weakDetails.avoidDays.map(day => (
                            <span key={day} className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 font-mono text-[10px]">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 bg-black/30 p-3 rounded-lg border border-white/5">
                      <p><span className="text-emerald-400 font-bold">🏥 易致病防守器官：</span>{weakDetails.organs}</p>
                      <p><span className="text-amber-400 font-bold font-sans">⚠️ 突發警訊症狀：</span>{weakDetails.symptoms}</p>
                      <p><span className="text-blue-400 font-bold">💡 講義養護對策：</span>{weakDetails.advice}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic scanned dates visualizer for clashed days */}
            <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4">
              <strong className="text-xs text-zen-text block mb-2">📅 預測推算：未來 120 天內您「最弱被剋流日」警示：</strong>
              {scannedDates.weakControlDaysList.length === 0 ? (
                <p className="text-xs text-zen-muted">未來 120 天內沒有明顯的被剋流日，請常規保持即可。</p>
              ) : (
                <div className="space-y-2.5">
                  {scannedDates.weakControlDaysList.map((item, idx) => (
                    <div key={`weak-date-${idx}`} className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          {item.ganZhi}日
                        </span>
                        <span className="text-xs font-bold text-zen-text">{item.date}</span>
                      </div>
                      <span className="text-[11px] text-zen-muted font-medium text-right">{item.comment}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
    </CategoryPageTemplate>
  );
}