// src/components/WealthPage.tsx
// [AI MOD] 財富深度解析 — 遵循學術級講義體系，精確推演六大核心維度
import CategoryPageTemplate from './CategoryPageTemplate';
import { useState, useMemo, useEffect } from 'react';
import { 
  Coins, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Inbox, 
  Info,
  Layers,
  Sparkle,
  Briefcase,
  Users,
  Target,
  Wrench,
  DollarSign
} from 'lucide-react';
import { BaziChart } from '../paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../constants';
import { calculateDaYun, getLiuNian, getTenGodForDaYun } from '../dayun';
import { Solar } from 'lunar-javascript';
import { WEALTH_GUIDELINES, WEALTH_PILLAR_MEANINGS, NO_WEALTH_REMEDIES, SOLVE_MONEY_LOSS, WEALTH_LOST_TIMING } from '../data/charts/wealthGuidelines';
import { LECTURE_DATA } from '../data/lecture/lectureData';

interface Props {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];  // 所有最弱五行
  partners?: any[];
  onNavigate?: (step: number) => void;
}

export default function WealthPage({ chart, primaryPattern, favorable, unfavorable, weakestElement, weakestElements, partners, onNavigate }: Props) {
  
  // 1. 判斷依據：命盤十神分布（天干與地支本氣）
  // 統計天干十神與地支主氣，不計支藏干中餘氣，天干3個+地支本氣4個，共計7個十神關係
  const tenGodCounts = useMemo(() => {
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
    return Object.entries(tenGodCounts).sort((a, b) => b[1] - a[1]);
  }, [tenGodCounts]);

  const topGod1 = sortedTenGods[0]?.[0] || '無';
  const topCount1 = sortedTenGods[0]?.[1] || 0;
  const topGod2 = sortedTenGods[1]?.[0] || '';
  const topCount2 = sortedTenGods[1]?.[1] || 0;

  // 2. 先天財富特質
  // 檢查四柱中財星的位置
  const wealthLocations = useMemo(() => {
    const locations: { pillar: string; type: string; desc: string }[] = [];
    const pillars = [
      { name: '年柱', p: chart.year },
      { name: '月柱', p: chart.month },
      { name: '日柱', p: chart.day },
      { name: '時柱', p: chart.hour }
    ];

    pillars.forEach((item) => {
      let found = false;
      let types: string[] = [];

      // 檢查天干
      if (item.p.tenGod === '正財' || item.p.tenGod === '偏財') {
        types.push(item.p.tenGod);
        found = true;
      }
      // 檢查地支
      if (item.p.hiddenTenGods) {
        if (item.p.hiddenTenGods.includes('正財') && !types.includes('正財')) types.push('正財');
        if (item.p.hiddenTenGods.includes('偏財') && !types.includes('偏財')) types.push('偏財');
      }

      if (types.length > 0) {
        let text = '';
        if (item.name === '時柱') text = '後代財富豐厚、晚年財富穩健，家庭和諧。';
        if (item.name === '日柱') text = '自身或伴侶善於賺錢、伴侶起點高或家境佳、夫妻攜手同心拼搏。';
        if (item.name === '月柱') text = '容易獲得父母或長輩傳承財富，或有機會得到外人優質投資與合夥機會。';
        if (item.name === '年柱') text = '家族企業繁榮、傳承祖宗蔭庇遺產。';
        locations.push({
          pillar: item.name,
          type: types.join('、'),
          desc: text
        });
      }
    });

    return locations;
  }, [chart]);

  const isNoWealth = wealthLocations.length === 0;

  // 身強/身弱判定
  const isStrong = useMemo(() => primaryPattern.includes('身強'), [primaryPattern]);
  const isWeak = useMemo(() => primaryPattern.includes('身弱'), [primaryPattern]);

  // 3. 歲運推演：當前大運 & 流年取得
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;
  const allDaYun = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = useMemo(() => {
    return allDaYun.find(d => currentAge >= d.startAge && currentAge <= d.startAge + 9);
  }, [allDaYun, currentAge]);
  const currentLiuNian = useMemo(() => getLiuNian(currentYear, chart.dayMaster), [currentYear, chart.dayMaster]);

  // 大運與流年五行屬性判定財富走向
  const daYunWealthDetails = useMemo(() => {
    if (!currentDaYun) return { status: '平穩', desc: '大運氣場平穩，建議常規累積。', tone: 'neutral' };

    const dyGanEl = GAN_TO_ELEMENT[currentDaYun.gan] || '';
    const dyZhiEl = ZHI_TO_ELEMENT[currentDaYun.zhi] || '';

    const hasFavorable = favorable.includes(dyGanEl) || favorable.includes(dyZhiEl);
    const hasUnfavorable = unfavorable.includes(dyGanEl) || unfavorable.includes(dyZhiEl);

    if (hasFavorable) {
      return {
        status: '求財好運 (吉利大運)',
        desc: `大運運轉至「${currentDaYun.ganZhi}」。此運五行（${dyGanEl}/${dyZhiEl}）生扶喜用，求財底氣極足、財源廣進，思路清晰、善能得到貴人指引。是開拓事業版圖或理財投資的核心黃金歲月。`,
        tone: 'good'
      };
    } else if (hasUnfavorable) {
      return {
        status: '求財克洩 (忌神大運)',
        desc: `大運運轉至「${currentDaYun.ganZhi}」。五行屬性（${dyGanEl}/${dyZhiEl}）處被克洩、忌神肆虐，求財阻力與隱性支出大。尤其容易因衝動投資、親友借貸而受損。應以此十年作累積防守、切防輕浮起舞。`,
        tone: 'bad'
      };
    }

    return {
      status: '中平守正 (平健大運)',
      desc: `大運行至「${currentDaYun.ganZhi}」，金流波動有限、處平順流動狀態。適合在已有本行深耕、防範無謂支出即可。`,
      tone: 'neutral'
    };
  }, [currentDaYun, favorable, unfavorable]);

  // 大運 × 流年（財富領域綜合判定）
  const combinedWealthAnalysis = useMemo(() => {
    if (!currentDaYun || !currentLiuNian) {
      return { phrase: '中平守正', body: '流年與大運金流平順，宜穩打穩紮累積底氣。' };
    }

    const dyGanEl = GAN_TO_ELEMENT[currentDaYun.gan] || '';
    const dyZhiEl = ZHI_TO_ELEMENT[currentDaYun.zhi] || '';
    const lnGanEl = GAN_TO_ELEMENT[currentLiuNian.gan] || '';
    const lnZhiEl = ZHI_TO_ELEMENT[currentLiuNian.zhi] || '';

    const dyGood = favorable.includes(dyGanEl) || favorable.includes(dyZhiEl);
    const lnGood = favorable.includes(lnGanEl) || favorable.includes(lnZhiEl);

    if (dyGood && lnGood) {
      return {
        phrase: '雙吉臨盤（財富高歌）',
        body: `【大運引路，流年相扶】大限與流年歲君雙雙落入財富第一層用神星位。今年是資金周轉極其暢快、利擴張、投資與決策的高回報之年。`
      };
    } else if (dyGood && !lnGood) {
      return {
        phrase: '大象安穩，偶有小耗',
        body: `【大運有底牌，歲君值耗金】十年大限財基無虞，求財環境穩實。但今年歲君「${currentLiuNian.ganZhi}」帶來暫時性花銷大或短暫項目受卡，屬『賺多也花多』，小耗無傷大局。`
      };
    } else if (!dyGood && lnGood) {
      return {
        phrase: '大運雖阻，流年迎春（歲君甘霖）',
        body: `【大運雖受阻，流年送驚喜】大運雖不旺，但今年歲君助攻，在重重阻力中獲得突破性的短線投資回報或副業起色，是利求財變現、扭虧為盈的好年份。`
      };
    } else {
      return {
        phrase: '雙忌守盤，保守規避',
        body: `【大限被洩，流年逢壓】大限與歲君皆對求財氣場不利，最易遭受突發性大宗破財。本年嚴禁盲目創業、跟風投機，守本保全為上。`
      };
    }
  }, [currentDaYun, currentLiuNian, favorable, unfavorable]);

  // 當前日主對應的開運風水指引
  const dmElement = GAN_TO_ELEMENT[chart.dayMaster] || '金';
  const customWealthGuide = useMemo(() => {
    return WEALTH_GUIDELINES[dmElement as keyof typeof WEALTH_GUIDELINES];
  }, [dmElement]);

  // 4. 動態掃描未來 120 天專屬得財日（PDF第1頁與第3頁精確對照）
  const scannedDates = useMemo(() => {
    const list: { date: string; ganZhi: string; comment: string }[] = [];
    const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '土';

    // PDF 規定的日主特殊得財流日组合 
    const SPECIAL_WEALTH_DAYS: Record<string, string[]> = {
      '金': ['甲寅', '甲子', '乙卯', '甲辰', '壬寅', '癸卯', '乙未'],
      '木': ['丙寅', '丙午', '丙戌', '丁未', '丁巳', '戊戌', '戊寅', '戊午', '己未', '己巳'],
      '水': ['甲寅', '丙辰', '乙未', '乙巳', '甲午', '甲戌', '丙午', '丙戌', '丙寅', '丁未', '丁巳'],
      '火': ['庚辰', '辛丑', '己丑', '戊申', '庚申', '辛酉'],
      '土': ['壬申', '壬子', '壬辰', '癸酉', '癸丑', '癸亥', '庚子', '庚辰', '庚申', '辛亥'],
    };

    const targetDays = SPECIAL_WEALTH_DAYS[dmEl] || [];
    const today = new Date();

    for (let i = 0; i < 120 && list.length < 6; i++) {
      const scanDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const solar = Solar.fromDate(scanDate);
      const lunar = solar.getLunar();
      const baZi = lunar.getEightChar();
      const gan = baZi.getDayGan();
      const zhi = baZi.getDayZhi();
      const ganZhi = `${gan}${zhi}`;

      if (targetDays.includes(ganZhi)) {
        list.push({
          date: `${solar.getMonth()}月${solar.getDay()}日`,
          ganZhi,
          comment: `財星旺氣相生，天干地支五行同旺，適合談判、簽約、投資、高值金流決策。`
        });
      }
    }
    return list;
  }, [chart.dayMaster]);

  // 地支合適工作數量盤點
  const zhiCount = useMemo(() => {
    const counts: Record<string, number> = { '寅申巳亥': 0, '辰戌丑未': 0, '子午卯酉': 0 };
    const pillars = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
    for (const z of pillars) {
      if (!z) continue;
      if ('寅申巳亥'.includes(z)) counts['寅申巳亥'] += 1;
      else if ('辰戌丑未'.includes(z)) counts['辰戌丑未'] += 1;
      else if ('子午卯酉'.includes(z)) counts['子午卯酉'] += 1;
    }
    return counts;
  }, [chart]);

  const sortedZhiTypes = useMemo(() => {
    return Object.entries(zhiCount).sort((a, b) => b[1] - a[1]);
  }, [zhiCount]);

  const dominantZhiType = sortedZhiTypes[0]?.[0] || '寅申巳亥';

  // 根據日主動態計算破財時的天干地支事件，提供高度個人化的直接干支指示
  const baziLossDetails = useMemo(() => {
    const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || '金';
    switch (dmEl) {
      case '金':
        return {
          wealthStar: '木（天干：甲、乙，地支：寅、卯）',
          chongDesc: '地支遇「申 (猴)」、「酉 (雞)」（如大運/流年地支為申、酉，與命盤寅、卯發生寅申相沖、卯酉相沖），主財根不穩，資金流失。',
          heDesc: '地支遇「亥 (豬)」（寅亥合）、「戌 (狗)」（卯戌合），或天干遇「己」（與甲合）、「庚」（與乙合），財星被合走絆住，資金容易被套牢或他人瓜分。',
          keDesc: '天干遇「庚 (金)」、「辛 (金)」，地支遇「申 (猴)」、「酉 (雞)」之比劫奪財（金剋木）。此時競爭壓力大，極易發生因友破財、投資受騙。',
        };
      case '木':
        return {
          wealthStar: '土（天干：戊、己，地支：辰、戌、丑、未）',
          chongDesc: '地支遇「戌 (狗)」（辰戌相沖）、「辰 (龍)」（戌辰相沖）、「未 (羊)」（丑未相沖）、「丑 (牛)」（未丑相沖），財根受激烈衝撞，不宜進行大宗投機轉帳。',
          heDesc: '地支遇「酉 (雞)」（辰酉合）、「卯 (兔)」（卯戌合）、「子 (鼠)」（子丑合）、「午 (馬)」（午未合），財星元氣受合，合約容易產生無形牽制或無法如期回流。',
          keDesc: '天干遇「甲 (木)」、「乙 (木)」，地支遇「寅 (虎)」、「卯 (兔)」之比劫奪財（木剋土）。日主同氣極旺奪財，開銷開支倍增，極端忌諱與熟人投機或借貸。',
        };
      case '水':
        return {
          wealthStar: '火（天干：丙、丁，地支：巳、午）',
          chongDesc: '地支遇「亥 (豬)」（巳亥相沖）、「子 (鼠)」（子午相沖），財氣之根重創，也主心焦急躁，極易失誤蒙受巨大財務清算或破財。',
          heDesc: '地支遇「申 (猴)」（巳申合）、「未 (羊)」（午未合），天干遇「辛」（丙辛合）、「壬」（丁壬合），資金流動性被鎖住，注意合夥合約糾紛或他人拖欠。',
          keDesc: '天干遇「壬 (水)」、「癸 (水)」，地支遇「亥 (豬)」、「子 (鼠)」之比劫奪財（水剋火）。大水來襲、群劫分金，絕對忌諱合夥投機或盲目創業。',
        };
      case '火':
        return {
          wealthStar: '金（天干：庚、辛，地支：申、酉）',
          chongDesc: '地支遇「寅 (虎)」（寅申相沖）、「卯 (兔)」（卯酉相沖），本命財根被正面回沖，動盪不穩，嚴禁在這些時日做重大融資決策。',
          heDesc: '地支遇「巳 (蛇)」（巳申合）、「辰 (龍)」（辰酉合），天干遇「乙」（乙庚合）、「丙」（丙辛合），財星受合絆窒礙，注意感情事件或親友牽連導向的破財。',
          keDesc: '天干遇「丙 (火)」、「丁 (火)」，地支遇「巳 (蛇)」、「午 (馬)」之比劫奪財（火剋金）。烈火鎔金，生意上有強烈惡性競爭、資金流失飛快。',
        };
      case '土':
        return {
          wealthStar: '水（天干：壬、癸，地支：子、亥）',
          chongDesc: '地支遇「午 (馬)」（子午相沖）、「巳 (蛇)」（巳亥相沖），財水之根遭遇衝擊干擾。投資容易半途夭折，或者主動面對大宗意外罰單、保險理賠。',
          heDesc: '地支遇「丑 (牛)」（子丑合）、「寅 (虎)」（寅亥合），天干遇「丁」（丁壬合）、「戊」（戊癸合），財氣遭合走，往往有被動借代、退水、融資失敗或死帳。',
          keDesc: '天干遇「戊 (土)」、「己 (土)」，地支遇「辰、戌、丑、未 (土)」之比劫奪財（土克水）。群土阻水，水流不暢，財富極端被動。要注意朋友圈、親戚手足大額消費連帶損耗。',
        };
      default:
        return {
          wealthStar: '本命財星',
          chongDesc: '地支財星被沖，根基不穩，容易發生周轉不順或突發重耗，不宜在對沖日做大宗交易。',
          heDesc: '天干/地支財星被相合，往往被套、融資卡關、或合建不順，承諾難以兌現。',
          keDesc: '遇比肩、劫財同氣天干地支重臨，掠奪財源，嚴格規避高風險投資。',
        };
    }
  }, [chart.dayMaster]);

    const menuItems = [
    { id: 'judgment', label: '1. 我是怎麼判斷的', labelShort: '判斷依據', icon: Compass },
    { id: 'inherent', label: '2. 先天財富特質', labelShort: '先天特質', icon: Coins },
    { id: 'jobs', label: '3. 專屬十神合適工作', labelShort: '合適工作', icon: Briefcase },
    { id: 'timeline', label: '4. 歲運推演與化解', labelShort: '歲運推演', icon: Calendar },
    { id: 'remedy', label: '5. 個人財富補運指南', labelShort: '補運指南', icon: Sparkles },
    { id: 'space', label: '6. 2026財星催旺配置', labelShort: '風水佈置', icon: Layers },
    { id: 'dates', label: '7. 專屬得財日預報', labelShort: '得財預報', icon: Sparkle },
  ];

  return (
    <CategoryPageTemplate
      title="財富深度解析"
      subtitle="Wealth Code & Financial Feng Shui"
      icon={Coins}
      accentColor="amber"
      menuItems={menuItems}
    >
      <div className="space-y-8">

          {/* Section 1: 我是怎麼判斷的 */}
          <div id="judgment" className="scroll-mt-20 glass-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 text-zen-muted opacity-10">
              <Compass size={80} />
            </div>
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 font-mono">01.</span> 我是怎麼判斷的：命盤十神分布
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              財富判斷的首要前提，在於<strong>「四柱天干」的十神分佈及能量偏旺強度</strong>。日主與各柱天干所生、剋之十神，奠定了先天財氣的第一道格局門檻。
            </p>

            {/* Render Heavenly Stems Ten Gods */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted">年柱天干 ({chart.year.gan})</span>
                <strong className="text-base text-yellow-400 font-serif block">{chart.year.tenGod || '日主（己）'}</strong>
                <span className="text-[10px] text-zinc-500 block">主青年祖業根基</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted">月柱天干 ({chart.month.gan})</span>
                <strong className="text-base text-yellow-400 font-serif block">{chart.month.tenGod || '日主'}</strong>
                <span className="text-[10px] text-zinc-500 block">主父母兄弟與外部社會</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1 ring-1 ring-yellow-400/20">
                <span className="text-[10px] text-yellow-400/80">日主自己 (己身)</span>
                <strong className="text-base text-white font-black font-serif block">{chart.dayMaster} ({GAN_TO_ELEMENT[chart.dayMaster]}命人)</strong>
                <span className="text-[10px] text-zinc-400 block font-semibold">{isStrong ? '身強格（氣充）' : '身弱格（待扶）'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted">時柱天干 ({chart.hour.gan})</span>
                <strong className="text-base text-yellow-400 font-serif block">{chart.hour.tenGod || '日主'}</strong>
                <span className="text-[10px] text-zinc-500 block">主晚年子嗣與歸宿氣運</span>
              </div>
            </div>

            {/* Global Ten Gods Count Breakdown */}
            <div className="bg-zen-surface/30 p-4 rounded-xl border border-zen-border space-y-3">
              <h3 className="text-xs font-bold text-zen-text flex items-center gap-1.5 mb-1">
                <Sparkle size={14} className="text-yellow-400 animate-pulse" /> 命盤十神原局個數盤點（僅計天干與地支本氣）：
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {sortedTenGods.map(([god, count], idx) => (
                  <div key={god} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/5 text-xs font-semibold">
                    <span className="text-yellow-400">#{idx + 1}</span>
                    <span className="text-zen-text">{god}</span>
                    <span className="font-bold text-white px-1.5 py-0.5 rounded bg-white/5">{count}個</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zen-muted leading-relaxed font-sans mt-2">
                💡 <strong className="text-yellow-400 font-bold">學術級計法說明：</strong>依講義排盤準則，本盤點排除支藏干內的中氣與餘氣，僅計日主外之天干（3個）與地支本氣/主氣（4個）共計 7 個十神關係，能最真實反映其主導格局，因此總和不超過 7 個（時柱未知時為 5 個）。
              </p>
            </div>
          </div>

          {/* Section 2: 先天財富特質 */}
          <div id="inherent" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 font-mono">02.</span> 先天財富特質：八字命盤的呈現
            </h2>

            {/* Sub-block A: 財星位置解析 */}
            <div className="space-y-4 mb-6">
              <h3 className="text-xs font-bold text-yellow-400/95 flex items-center gap-1">
                <span className="text-base">📍</span> 1. 財星（正財/偏財）本命中之宮位位置解析
              </h3>

              {isNoWealth ? (
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
                    <span className="text-base">⚠️</span> 命盤無財（財星未顯現）
                  </div>
                  <p className="text-xs text-zen-text leading-relaxed font-semibold">
                    命盤中不顯現『正財、偏財』。講義釋疑：<strong>命盤無財不表示貧窮</strong>，而是獲財方式不同，需依命中最強之十神變現：
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-black/40 rounded-lg space-y-1">
                      <strong className="text-yellow-400 font-semibold">• 食傷生財類：</strong>
                      <p className="text-zen-muted">{NO_WEALTH_REMEDIES['食傷生財']}</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg space-y-1">
                      <strong className="text-yellow-400 font-semibold">• 官殺得財類：</strong>
                      <p className="text-zen-muted">{NO_WEALTH_REMEDIES['正官七殺多']}</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg space-y-1">
                      <strong className="text-yellow-400 font-semibold">• 印星得財類：</strong>
                      <p className="text-zen-muted">{NO_WEALTH_REMEDIES['正印偏印多']}</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg space-y-1">
                      <strong className="text-yellow-400 font-semibold">• 比劫得財類：</strong>
                      <p className="text-zen-muted">{NO_WEALTH_REMEDIES['比肩劫財多']}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wealthLocations.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-mono text-[10px] font-bold">
                          {item.pillar}
                        </span>
                        <strong className="text-xs text-white">逢 {item.type} 星</strong>
                      </div>
                      <p className="text-xs text-zen-text font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-block B: 身強/身弱人得財時機 */}
            <div className="p-4 rounded-xl bg-zen-surface/30 border border-zen-border space-y-3 font-semibold text-xs text-zen-text leading-relaxed">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Target size={14} /> 2. 身強、身弱命主得財黃金時機推演
              </h3>

              {isWeak && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/20 rounded-lg space-y-2">
                  <h4 className="text-emerald-400 font-bold">
                    【身弱人（待引印比生扶）得財時辰契機】
                  </h4>
                  <p className="text-[11px] text-zen-text font-semibold">
                    當歲限行運走到<strong>「比劫、印星」</strong>大運或流年時，命盤中的財星（即便原局無實財，或者帶有微弱根氣）位置即會被引動變現，這時極易大發。例如：年柱有財，走到比劫歲限時，就能迅速順利獲得祖產繼承。
                  </p>
                  <div className="space-y-1 text-slate-300 font-medium">
                    <p>💡 <strong className="text-yellow-400">行動秘訣一：</strong>走到比劫之大運時，強烈建議合夥創業，切忌盲目獨資。但需注意不可選在純比劫劫財之流年（易產生分財不均）。</p>
                    <p>💡 <strong className="text-yellow-400">行動秘訣二（分財為用）：</strong>廣結同儕好友善緣、多方跨界合夥，結交良緣貴人，以分攤股利、分讓利潤來扶持壯大自身實力。</p>
                  </div>
                </div>
              )}

              {isStrong && (
                <div className="p-3 bg-yellow-950/15 border border-yellow-900/20 rounded-lg space-y-2">
                  <h4 className="text-yellow-400 font-bold">
                    【身強人（喜財官食傷克洩）得財黃金契機】
                  </h4>
                  <p className="text-[11px] text-zen-text font-semibold">
                    當走到<strong>「財星、官殺、食傷」</strong>之大運，且流年遇<strong>「財星」</strong>時，命盤中的財星本氣會被最大化激發，是自主創業、簽署巨額訂單、買房增值、收穫投資翻倍的最大時機點。
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                    您的日主元氣充足，具備擔當重重金錢利誘的承載力。主動出擊、利用大品牌渠道或自主控制核心大資產，得財最顯著。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: 專屬十神合適工作 */}
          <div id="jobs" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 font-mono">03.</span> 專屬十神與地支合適工作指導
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              依據命理講義：<strong>「盤點自己命盤中數量最多（次多）之十神與地支，對照其五行本質與交叉關係來判定合適的工作屬性與得財鏈路。」</strong>
            </p>

            <div className="space-y-4">
              
              {/* Primary Ten God Career Suitability */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                    <Briefcase size={14} /> 第一最多十神：{topGod1} ({topCount1}個) 之合適事業
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">主導天生才幹</span>
                </div>
                
                <div className="text-xs text-zen-text space-y-2">
                  {topGod1.includes('財') && (
                    <div className="space-y-2 leading-relaxed">
                      <p className="font-bold text-white">💰 適合與財富直接相關工作（如：做生意、創業、理金、接案、副業、高抽成業務）。</p>
                      <p>• <strong>正財多特性：</strong>適合重視秩序、穩定累積、需要高契合度計算法的行業（如會計、工程、金融精算、長期抗通膨理財）。註：若命盤中正財有2個以上，性格脾氣會偏向偏財性質，不適合依賴單一死板工資。</p>
                      <p>• <strong>偏財多特性：</strong>適合高流動、利潤點浮動、靠人情資源搏意外機遇的行業（如投資經理、股票交易、代理行銷、業績抽成分紅制、靈活的多角化跨界副業）。</p>
                      <p>• <strong>只有1個正財：</strong>性格保守、求穩，最適合單純且有穩定退職年金保障的固定收入工資工作。</p>
                    </div>
                  )}
                  {topGod1.includes('官') || topGod1.includes('殺') && (
                    <div className="space-y-2 leading-relaxed">
                      <p className="font-bold text-white">⚔️ 適合大型常規組織、大企業集團、高政府關聯、嚴格體系管理、工程與重交付職務。</p>
                      <p>• <strong>正官多（偏文）：</strong>適合公務法規體系、合辦公、重視既定規範與清晰程序的工作，是極佳的模範執行者與核心高管。</p>
                      <p>• <strong>七殺多（偏武）：</strong>適合高抗壓、高速變動、需要大量公關危機處理、需要獨立作戰突破重圍的高難度變動職位。</p>
                    </div>
                  )}
                  {topGod1.includes('食') || topGod1.includes('傷') && (
                    <div className="space-y-2 leading-relaxed">
                      <p className="font-bold text-white">🎨 適合需要無窮創造力、自媒體、方案企劃、教育諮詢、設計開發等需要思維輸出的職能。</p>
                      <p>• <strong>食傷生財：</strong>適合以自身掌握的獨門專業技術、文字技巧、藝術才華直接面向受眾變現，而非簡單的倒買倒賣物流貨易。</p>
                      <p>• <strong>傷官得名：</strong>天干透干者最易一戰成名，極利於深耕網路網紅、自媒體發言人或獨立諮詢顧問。</p>
                    </div>
                  )}
                  {topGod1.includes('印') && (
                    <div className="space-y-2 leading-relaxed">
                      <p className="font-bold text-white">📖 適合精耕私領域、具有明確邊界感、同理心高、偏向行政文書、人資特助或研究員職位。</p>
                      <p>• 需要有完善SOP體系的常規流暢行政，且不宜被指派承擔過度激進、高彈性的野戰軍或業績高壓追逐類工作。</p>
                    </div>
                  )}
                  {topGod1.includes('比') || topGod1.includes('劫') && (
                    <div className="space-y-2 leading-relaxed">
                      <p className="font-bold text-white">🤝 適合利用社群與人脈合夥打江山。但要非常提防『同伴奪財』，必須明確股權架構與明確的分潤約定。</p>
                      <p>• 適合從事輕資產創業、賺轉手賺佣、跑客戶促成的地產房仲中介、社群自營電商等不需沈澱大宗預算資金的行業。</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cross Combinations Section */}
              {topGod2 && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Users size={14} /> 十神交叉組合：{topGod1} × {topGod2} 合力判讀
                  </h3>
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs leading-relaxed font-semibold">
                    {(() => {
                      const matchKeys = [
                        `${topGod1}_${topGod2}`,
                        `${topGod2}_${topGod1}`,
                        `${topGod1.charAt(0)}_${topGod2.charAt(0)}`,
                        `${topGod2.charAt(0)}_${topGod1.charAt(0)}`,
                      ];
                      
                      // 尋找講義中匹配的組合
                      for (const k of matchKeys) {
                        const directAdvice = LECTURE_DATA.TEN_GOD_CAREER_COMBO[k as keyof typeof LECTURE_DATA.TEN_GOD_CAREER_COMBO];
                        if (directAdvice) {
                          return `【${topGod1} 與 ${topGod2} 二強聯手】：${directAdvice}`;
                        }
                      }
                      
                      // 模糊後備匹配
                      if ((topGod1.includes('財') && topGod2.includes('食')) || (topGod1.includes('食') && topGod2.includes('財'))) {
                        return `【食傷生財結構】：${LECTURE_DATA.TEN_GOD_CAREER_COMBO['財_食傷']}`;
                      }
                      if ((topGod1.includes('財') && topGod2.includes('官')) || (topGod1.includes('官') && topGod2.includes('財'))) {
                        return `【財生官殺結構】：${LECTURE_DATA.TEN_GOD_CAREER_COMBO['財_官殺']}`;
                      }
                      
                      return `您的格局組合為「${topGod1}配${topGod2}」，兼具強大自我特徵與多重辦事思路。在與大企業合作或搭建多渠道變現鏈路時較能得心應手。`;
                    })()}
                  </div>
                </div>
              )}

              {/* Day Master branch type (十天干與地支旺工作) */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
                <h3 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <Wrench size={14} /> 八字地支旺特性：{dominantZhiType} 佔優勢地位
                </h3>
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-white mb-1.5">
                    地支在年、月、日、時所積累的能量本源，決定您的行動力與工作環境契合度：
                  </p>
                  
                  {dominantZhiType === '寅申巳亥' && (
                    <div className="p-3 bg-blue-950/20 border border-blue-900/20 rounded-lg text-[11px] font-semibold space-y-1">
                      <span className="text-blue-300 font-bold block">【驛馬動態流動】：寅申巳亥多 (共計{zhiCount['寅申巳亥']}個)</span>
                      <p className="text-zen-muted">工作地點或內容變動大，經常出差，需要常保持移動型，比如國際物流、外貿拓展、差旅頻繁的商務拓展或大片區督導工作。宜動不宜靜。</p>
                    </div>
                  )}

                  {dominantZhiType === '辰戌丑未' && (
                    <div className="p-3 bg-yellow-950/15 border border-yellow-900/20 rounded-lg text-[11px] font-semibold space-y-1">
                      <span className="text-yellow-400 font-bold block">【華蓋靜態穩定】：辰戌丑未多 (共計{zhiCount['辰戌丑未']}個)</span>
                      <p className="text-zen-muted">適合定點、獨處工作。宜在一個特定專精、極其具備技術門檻的深水區長年扎根；因具有天生神祕緣、極易與宗教哲理或身心靈等方向產生濃厚宿世緣法。</p>
                    </div>
                  )}

                  {dominantZhiType === '子午卯酉' && (
                    <div className="p-3 bg-pink-950/20 border border-pink-900/20 rounded-lg text-[11px] font-semibold space-y-1">
                      <span className="text-pink-300 font-bold block">【桃花四敗舞台位】：子午卯酉多 (共計{zhiCount['子午卯酉']}個)</span>
                      <p className="text-zen-muted">適合曝光、自媒體、向眾人展示自我才幹或美感。極佳的直面消費者產業（如：時尚奢品、創意行銷、公關外交、演藝自媒體或品牌傳播官）。</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: 歲運推演與化解 */}
          <div id="timeline" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 font-mono">04.</span> 動態歲運推演與化解大綱
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted uppercase tracking-wider block font-bold">當前逢限大運</span>
                <strong className="text-lg text-zen-text font-serif block">
                  {currentDaYun ? `${currentDaYun.startAge}歲~${currentDaYun.startAge + 9}歲大運：${currentDaYun.ganZhi}` : '目前無大運'}
                </strong>
                <span className="text-xs text-zinc-400 block font-semibold">
                  大限評定：{daYunWealthDetails.status}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-zen-muted uppercase tracking-wider block font-bold">當前流年歲君</span>
                <strong className="text-lg text-yellow-500 font-serif block">
                  {currentYear}年 ({currentLiuNian ? currentLiuNian.ganZhi : ''}年)
                </strong>
                <span className="text-xs text-zinc-400 block font-semibold">
                  歲君判定：{combinedWealthAnalysis.phrase}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* 大運影響解析 */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                  <Calendar size={14} /> 大運具體影響分析：
                </h4>
                <p className="text-xs text-zen-text leading-relaxed font-semibold">
                  {daYunWealthDetails.desc}
                </p>
              </div>

              {/* 大運 x 流年 綜合判定 */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={14} /> 大運 × 流年（財富領域綜合判定）：
                </h4>
                <div className="p-3 rounded bg-emerald-950/15 border border-emerald-900/30 text-xs leading-relaxed font-semibold">
                  <p className="text-emerald-400 mb-1 font-bold">綜合判定：{combinedWealthAnalysis.phrase}</p>
                  <p className="text-white">{combinedWealthAnalysis.body}</p>
                </div>
              </div>

              {/* 破財防範方案 */}
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3.5">
                <h4 className="text-xs font-black text-red-400 flex items-center gap-1.5">
                  <ShieldAlert size={16} className="animate-bounce" /> ⚠️ 警惕：八字命格破財時機判定
                </h4>

                <div className="p-3 bg-black/40 rounded-xl border border-red-500/10 space-y-2 mb-2 text-xs leading-relaxed font-sans">
                  <p className="text-yellow-400 font-bold flex items-center gap-1">
                    <span>📊</span> 您的專屬財星五行：<strong className="text-white text-sm underlineDecoration font-serif">{baziLossDetails.wealthStar}</strong>
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    依據講義法門，不論命盤身強身弱，當大運、流年、甚至流日碰到下述與此財星五行產生<strong>沖、合、剋</strong>的特定「天干」或「地支」時，即為破財高度預警期。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                  <div className="p-3 bg-black/30 rounded-lg border border-red-500/10 space-y-2 font-semibold">
                    <span className="text-red-400 block font-bold border-b border-red-500/20 pb-1">⚡ 身強命格破財時機：</span>
                    <p>• <strong className="text-amber-400">財星遇沖：</strong>{baziLossDetails.chongDesc}</p>
                    <p>• <strong className="text-amber-400">財星被合：</strong>{baziLossDetails.heDesc}</p>
                    <p>• <strong className="text-amber-400">財星被剋：</strong>{baziLossDetails.keDesc}</p>
                    <p>• <strong className="text-amber-400">虛浮透出：</strong>財星僅透干而無地支主氣深藏，最怕遭到大運流年直接沖剋，代表難以守住浮財。</p>
                  </div>
                  <div className="p-3 bg-black/30 rounded-lg border border-red-500/10 space-y-2 font-semibold">
                    <span className="text-red-400 block font-bold border-b border-red-500/20 pb-1">⚡ 身弱命格破財時機：</span>
                    <p>• <strong className="text-red-300">走忌神大運 × 忌神流年：</strong>如大運行至財星、官殺、食傷等消耗弱身的十年，此時再遇到同類耗洩流年/流日，特別容易決策錯誤、投資落入陷阱而破財。</p>
                    <p>• <strong className="text-red-300">財星逢重沖：</strong>{baziLossDetails.chongDesc}</p>
                    <p>• <strong className="text-red-300">財星被合絆：</strong>{baziLossDetails.heDesc}</p>
                  </div>
                </div>

                {/* Remedy: 主動破財 */}
                <div className="p-3.5 bg-black/40 rounded-lg border border-red-900/40 text-xs font-semibold mt-3 space-y-2">
                  <strong className="text-red-400 block font-black">⚒️ 講義秘傳：化解破財避坑指南</strong>
                  <div className="space-y-1.5 leading-relaxed text-zinc-300 font-medium">
                    <p><span className="text-yellow-400 font-bold">1. 最推薦「主動破財」法：</span>在不顺流年，搶先引導金錢主動流出：</p>
                    <p className="text-[11px] text-zinc-400 pl-3">
                      ① <strong>保本投資：</strong>主動買入極強變現能力的 ETF、中長期大資產或買房，化浮財為庫。<br />
                      ② <strong>債務清償：</strong>提前歸還房貸等利息債務。<br />
                      ③ <strong>汰舊換新：</strong>主動更換老舊電腦、辦公大件或保養愛車。<br />
                      ④ <strong>佈施捐款：</strong>向慈善機構、落後地區行善捐贈，積德改磁場。<br />
                      ⑤ <strong>進修學習：</strong>為自身專業技能、證照進修付費，把虛財轉變為持久的大腦天賦。
                    </p>
                    <p><span className="text-yellow-400 font-bold">2. 行為規避：</span>破財大運/流年中，絕對忌諱開店、盲目借貸、充當保人、起草合夥，特別當財星天干地支有明顯合沖相剋現象時。</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 5: 個人財富補運指南 */}
          <div id="remedy" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 font-mono">05.</span> 個人專屬財富五行補運指南
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              根據命盤中最落入短板的<strong>最弱五行（${weakestElements.join('、')}）</strong>，通過物理、日行、方位與色彩進行實體磁場修補，生扶用神：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-zinc-300">
              {weakestElements.map(el => {
                const guide = WEALTH_GUIDELINES[el as keyof typeof WEALTH_GUIDELINES];
                if (!guide) return null;

                return (
                  <div key={el} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-base text-white font-serif">{el} 氣補足磁場</span>
                      <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                    </div>

                    <div className="space-y-1.5 leading-relaxed font-semibold">
                      <p>👕 <span className="text-yellow-500 font-bold">穿搭色彩：</span>{guide.fengShui.colors}</p>
                      <p>📌 <span className="text-yellow-500 font-bold">開運方位：</span>{guide.fengShui.directions.join('、')}</p>
                      <p>✨ <span className="text-yellow-500 font-bold">生肖運物：</span>{guide.fengShui.luckyItems}</p>
                      <p>🗺️ <span className="text-yellow-500 font-bold">補運日常：</span>{guide.fengShui.setup.join('、')}</p>
                      <p>🌱 <span className="text-yellow-500 font-bold">加強行動：</span>{guide.fengShui.boostActions.join('、')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: 2026財星催旺配置 */}
          <div id="space" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 font-mono">06.</span> 2026年 財星催旺空間佈置指南
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              依據日命主五行生剋關係，推演出您專屬的<strong>財位風水與空間軟裝加強對策</strong>（不論身強或身弱，專為招商催旺）：
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-semibold leading-relaxed space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-zinc-500 block text-[10px]">您的日主</span>
                  <strong className="text-sm text-yellow-400 font-serif">{chart.dayMaster} ({GAN_TO_ELEMENT[chart.dayMaster]}命人)</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">理致富財星五行</span>
                  <strong className="text-sm text-white font-serif">{customWealthGuide?.wealthElement} 氣</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">佈置最佳空間場域</span>
                  <strong className="text-sm text-yellow-400 font-serif">住家客廳、個人辦公桌、辦公室</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                <div className="space-y-1.5 p-3 rounded-lg bg-yellow-950/10 border border-yellow-900/15">
                  <strong className="text-yellow-400 block font-bold">🔮 旺財色系與空間配置顏色：</strong>
                  <p>{customWealthGuide?.fengShui.colors}</p>
                  <strong className="text-yellow-400 block font-bold mt-2">🧭 專屬得財方位：</strong>
                  <p>{customWealthGuide?.fengShui.directions.join('、')}</p>
                </div>
                
                <div className="space-y-1.5 p-3 rounded-lg bg-yellow-950/10 border border-yellow-900/15">
                  <strong className="text-yellow-400 block font-bold">🐚 招財軟裝吉品：</strong>
                  <p>{customWealthGuide?.fengShui.setup.join('、')}</p>
                  <strong className="text-yellow-400 block font-bold mt-2">🧸 攜身生肖開運物：</strong>
                  <p>{customWealthGuide?.fengShui.luckyItems}</p>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-[11px] font-semibold space-y-1.5">
                <strong className="text-emerald-400 block flex items-center gap-1">
                  <Sparkling size={12} className="text-yellow-400" /> 得財流日加強催財特定指令：
                </strong>
                <p>每逢您個人的得財黃金流日，請執行以下三條催財動作，其效更顯著：</p>
                <div className="text-zinc-400 font-medium pl-2.5">
                  <p>1. <strong>財位水缸換水：</strong>確保財星位置的水質清潤、活水融通。</p>
                  <p>2. <strong>整理清潔擦拭：</strong>把財位的擺飾、金飾水晶徹底拭去積塵，通透納氣。</p>
                  {customWealthGuide?.wealthElement === '木' && (
                    <p>3. <strong>修剪盆栽：</strong>枯葉要主動修剪去蕪存菁，讓木氣勃發生機。</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: 專屬得財日預報 */}
          <div id="dates" className="scroll-mt-20 glass-card relative overflow-hidden">
            <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
              <span className="text-yellow-400 font-mono">07.</span> 專屬得財日預報日曆
            </h2>
            <p className="text-xs text-zen-muted mb-4 leading-relaxed">
              當逢與您日主五行生剋最契合的<strong>正財 / 偏財（我剋）</strong>或<strong>食神 / 傷官（生財、食傷生財）</strong>相交流日。在此日金流與商業決策最不易受蒙蔽：
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 mb-4 text-xs font-semibold">
              <div className="flex items-center gap-2 text-amber-500">
                <Info size={14} />
                <span>各五行日主得財日判定干支大綱：</span>
              </div>
              <div className="space-y-1.5 leading-relaxed text-[11px] text-zinc-400">
                <p>• <strong className="text-white">日主屬金</strong>：流日逢「甲寅、甲子、乙卯、甲辰、壬寅、癸卯、乙未」時，財星與食傷共鳴。</p>
                <p>• <strong className="text-white">日主屬木</strong>：流日逢「丙寅、丙午、丙戌、丁未、丁巳、戊戌、戊寅、戊午、己未、己巳」時，火土相生得極品之庫。</p>
                <p>• <strong className="text-white">日主屬水</strong>：流日逢「甲寅、丙辰、乙未、乙巳、甲午、甲戌、丙午、丙戌、丙寅、丁未、丁巳」時，木火大動。</p>
                <p>• <strong className="text-white">日主屬火</strong>：流日逢「庚辰、辛丑、己丑、戊申、庚申、辛酉」時，金土之藏氣吐露。</p>
                <p>• <strong className="text-white">日主屬土</strong>：流日逢「壬申、壬子、壬辰、癸酉、癸丑、癸亥、庚子、庚辰、庚申、辛亥」時，金水潤局金流最旺。</p>
              </div>
            </div>

            {/* Dynamic Forecast Dates render */}
            <div className="bg-zen-surface/30 border border-zen-border rounded-xl p-4">
              <strong className="text-xs text-yellow-400 block mb-3">📅 預測推算：未來 120 天內您的「專屬得財幸運流日」</strong>
              
              {scannedDates.length === 0 ? (
                <p className="text-xs text-zen-muted text-center py-4">近期沒有明顯的得財吉日，請常規保持即可。</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scannedDates.map((item, idx) => (
                    <div key={`wealth-date-${idx}`} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-white">{item.date}</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-mono font-bold">
                          {item.ganZhi}日 [開運]
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                        {item.comment}
                      </p>
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

// Sparkle element replacement to avoid TypeScript complain
function Sparkling({ size, className }: { size?: number; className?: string }) {
  return <Sparkle size={size || 14} className={className} />;
}
