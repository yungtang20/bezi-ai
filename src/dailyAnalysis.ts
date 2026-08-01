// src/dailyAnalysis.ts
import { Solar } from 'lunar-javascript';
import { BaziChart } from './paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT, getTenGod as getTenGodForDaYun, getTenGodType } from './constants';
import { HARM_MAP, DESTROY_MAP as BREAK_MAP } from './data/rules/taiSui';
import { checkDayType } from './data/rules/dailyFlowDays';
import { LECTURE_DATA } from './data/lecture/lectureData';
import { LiuNian } from './dayun';

export interface DailyEnergy {
  isExtremeDay: boolean;
  extremeType: string;
  theoreticalOutcome: string; // 順利/平穩/不順
  theoreticalExplanation: string; // 新增：解釋原因
  dayGanZhi: string;          // 今日干支
  lunarDate: string;          // 農曆日期
  solarDate: string;          // 國曆日期 (Added)
  dayTenGodType: string;      // 新增：財星 / 官殺 / 食傷 / 比劫 / 印星
  dayTypes: string[];         // 從 dailyFlowDays 獲取
  isWeaknessDay?: boolean;
  weaknessType?: string;
}

/**
 * 取得今天的能量分析
 */
export function getDailyEnergy(
  chart: BaziChart,
  weakestElement: string,
  favorable: string[],
  unfavorable: string[],
  primaryPattern: string,
  targetDate?: Date
): DailyEnergy {
  const d = targetDate || new Date();
  const solar = Solar.fromDate(d);
  const lunar = solar.getLunar();
  const baZi = lunar.getEightChar();

  const dayGan = baZi.getDayGan();
  const dayZhi = baZi.getDayZhi();
  const dayPillar = `${dayGan}${dayZhi}`;

  // ---- 極端能量日判斷 ----
  const extremeDayMap: Record<string, string[]> = {
    '甲': ['甲寅', '乙卯'], '乙': ['甲寅', '乙卯'],
    '丙': ['丙午', '丁巳'], '丁': ['丙午', '丁巳'],
    '戊': ['戊辰', '戊戌', '己丑', '己未'],
    '己': ['戊辰', '戊戌', '己丑', '己未'],
    '庚': ['庚申', '辛酉'], '辛': ['庚申', '辛酉'],
    '壬': ['壬子', '癸亥'], '癸': ['壬子', '癸亥'],
  };

  const extremeDays = extremeDayMap[chart.dayMaster] || [];
  const isExtremeDay = extremeDays.includes(dayPillar);

  // ---- 理論好壞日判斷 ----
  const dayGanElement = GAN_TO_ELEMENT[dayGan];
  const dayZhiElement = ZHI_TO_ELEMENT[dayZhi] || GAN_TO_ELEMENT[dayZhi];
  const dayGod = getTenGodForDaYun(chart.dayMaster, dayGan);
  
  let theoreticalOutcome = '平穩';
  let totalScore = 0;
  const explanationParts: string[] = [];

  // 五行影響
  const evalElement = (element: string | undefined, label: string, score: number): [number, string] => {
    if (!element) return [0, ''];
    if (favorable.includes(element)) return [score, `${label}「${element}」為您的喜用神(+${score})`];
    if (unfavorable.includes(element)) return [-score, `${label}「${element}」為您的忌神(-${score})`];
    return [0, ''];
  };

  const [ganScore, ganExpl] = evalElement(dayGanElement, `今日天干${dayGan}`, 1.0);
  if (ganExpl) { totalScore += ganScore; explanationParts.push(ganExpl); }

  const [zhiScore, zhiExpl] = evalElement(dayZhiElement, `地支${dayZhi}`, 2.0);
  if (zhiExpl) { totalScore += zhiScore; explanationParts.push(zhiExpl); }

  // 十神影響 (根據格局喜忌)
  const dayGodType = getTenGodType(dayGod);
  if (favorable.includes(dayGanElement || '')) {
    totalScore += 0.5;
    explanationParts.push(`且帶動「${dayGodType}」能量增益(+0.5)`);
  }

  const scoreThresholds = [
    { threshold: 1.5, outcome: '順利' },
    { threshold: 0.5, outcome: '小吉' },
    { threshold: -0.5, outcome: '平穩' },
    { threshold: -1.5, outcome: '較差' },
    { threshold: -Infinity, outcome: '不順' }
  ];
  
  theoreticalOutcome = scoreThresholds.find(t => totalScore >= t.threshold)?.outcome || '平穩';

  // 如果今天是極端能量日，且日主五行與喜用神相關，可升級為大好/大壞
  if (isExtremeDay) {
    const dayMasterElement = GAN_TO_ELEMENT[chart.dayMaster];
    if (dayMasterElement && favorable.includes(dayMasterElement)) {
      theoreticalOutcome = '大好';
    } else {
      theoreticalOutcome = '不佳';
    }
  }

  // 計算日干的十神類型
  const dayTenGodType = getTenGodType(dayGod);
  const dayTypes = checkDayType(dayGan, dayZhi, chart.dayMaster, chart.gender);

  // ---- 最弱五行被剋流日判斷 ----
  const weakControlDaysMap: Record<string, string[]> = {
    '金': ['丙寅', '丙午', '丙戌', '丁巳', '丁未'], '木': ['庚申', '辛酉', '辛丑'],
    '水': ['戊辰', '戊戌', '戊午', '己未', '己丑', '己巳'], '火': ['壬申', '壬子', '壬辰', '癸亥', '癸酉', '癸丑'],
    '土': ['甲子', '甲寅', '甲辰', '乙卯', '乙亥', '乙未'],
  };
  const myWeakDays = weakControlDaysMap[weakestElement] || [];
  const isWeaknessDay = myWeakDays.includes(dayPillar);

  return {
    isExtremeDay,
    extremeType: isExtremeDay ? `日主${chart.dayMaster}的極端能量日` : '',
    isWeaknessDay,
    weaknessType: isWeaknessDay ? `最弱五行「${weakestElement}」受重剋流日` : '',
    theoreticalOutcome,
    theoreticalExplanation: explanationParts.join('，') + '。',
    dayGanZhi: `${baZi.getYearGan()}${baZi.getYearZhi()}年 ${baZi.getMonthGan()}${baZi.getMonthZhi()}月 ${dayPillar}日`,
    lunarDate: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    solarDate: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
    dayTenGodType,
    dayTypes
  };
}

// 檢查是否為易犯小人日
const VILLAIN_DAYS: Record<string, string[]> = {
  '金': ['庚申', '辛酉', '辛丑'],
  '火': ['丙午', '丁巳', '丁未', '丙戌'],
  '木': ['甲寅', '乙卯', '乙未'],
  '水': ['壬子', '癸亥', '癸丑'],
  '土': ['戊辰', '戊戌', '己未', '己丑'],
};

// [AI MOD] 內部使用，不 export
function checkVillainDay(dayPillar: string, dayMaster: string): boolean {
  const el = GAN_TO_ELEMENT[dayMaster];
  const days = VILLAIN_DAYS[el] || [];
  return days.includes(dayPillar);
}

// 事件日判斷 — [AI MOD] 內部使用，不 export
function getDailyEvents(dayGan: string, dayZhi: string, chart: BaziChart, isMale: boolean, weakestElement: string = '') {
  const events = [];
  const el = GAN_TO_ELEMENT[dayGan];
  const zhiEl = ZHI_TO_ELEMENT[dayZhi];
  const dayMaster = chart.dayMaster;
  
  // 官殺（事業旺日）
  const careerMap: Record<string, string> = {
    '木': '金', '火': '水', '土': '木', '金': '火', '水': '土'
  };
  // 財星（得財日）
  const wealthMap: Record<string, string> = {
    '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
  };
  
  const myEl = GAN_TO_ELEMENT[dayMaster];
  
  if (el === careerMap[myEl]) events.push({ type: '事業旺日', desc: '適合安排重要會議、提案或決策' });
  if (el === wealthMap[myEl]) events.push({ type: '財運日', desc: '適合理財、談判、收帳' });
  
  // 桃花日（男看財星，女看官殺）
  const romanceEl = isMale ? wealthMap[myEl] : careerMap[myEl];
  if (el === romanceEl) events.push({ type: '桃花日', desc: '利於感情互動、結識新氣象' });

  // 補養日
  if (weakestElement && (el === weakestElement || zhiEl === weakestElement)) {
     events.push({ type: '健康加分日', desc: `今日五行補足了您命盤最弱的「${weakestElement}」，是極佳的養生休息日` });
  }

  return events;
}

// [AI MOD] 內部型別，不 export
interface UpcomingDay {
  date: string;
  ganZhi: string;
  isFavorable: boolean;
}

/** 地支六沖對照表 */
const CHONG_MAP: Record<string, string> = {
  '子': '午', '午': '子', '寅': '申', '申': '寅', '辰': '戌', '戌': '辰',
  '丑': '未', '未': '丑', '卯': '酉', '酉': '卯', '巳': '亥', '亥': '巳',
};

/** 健康警示日：各五行日主的極端能量日 */
const HEALTH_WARNING_DAYS: Record<string, string[]> = {
  '木': ['甲寅', '乙卯'], '火': ['丙午', '丁巳'],
  '土': ['戊辰', '己丑', '戊戌', '己未'], '金': ['庚申', '辛酉'], '水': ['壬子', '癸亥'],
};

/** 弱五行受剋流日 */
const WEAK_CONTROL_DAYS: Record<string, string[]> = {
  '金': ['丙寅', '丙午', '丙戌', '丁巳', '丁未'], '木': ['庚申', '辛酉', '辛丑'],
  '水': ['戊辰', '戊戌', '戊午', '己未', '己丑', '己巳'], '火': ['壬申', '壬子', '壬辰', '癸亥', '癸酉', '癸丑'],
  '土': ['甲子', '甲寅', '甲辰', '乙卯', '乙亥', '乙未'],
};

/** 檢查地支是否與命盤年柱或日柱相沖 */
function hasChartChong(zhi: string, chart: BaziChart): boolean {
  const chong = CHONG_MAP[zhi];
  return chong === chart.year.zhi || chong === chart.day.zhi;
}

/** 檢查地支是否與任何伴侶命盤相沖 */
function hasPartnerChong(zhi: string, partners: any[]): boolean {
  const chong = CHONG_MAP[zhi];
  return partners.some(p => p.chart && (chong === p.chart.year.zhi || chong === p.chart.day.zhi));
}

/** 通用 combo 日檢查（wealth/career/romance 共用邏輯） */
function matchComboDay(
  category: string, ganZhi: string, comboMap: Record<string, { combos: string[] }>,
  myChong: boolean, partnerChong: boolean,
): boolean {
  return !!(comboMap[category]?.combos.includes(ganZhi) && !myChong && !partnerChong);
}

export function getUpcomingDatesForCategory(
  chart: BaziChart,
  category: 'wealth' | 'career' | 'romance' | 'health_warning' | 'move_in' | 'villain',
  favorable: string[],
  unfavorable: string[],
  weakestElement: string = '',
  amount: number = 6,
  partners?: any[],
  maxDaysToScan: number = 200
): UpcomingDay[] {
  const results: UpcomingDay[] = [];
  const myEl = GAN_TO_ELEMENT[chart.dayMaster];
  if (!myEl) return results;

  const myRomanceMap = LECTURE_DATA.ROMANCE_DAYS[chart.gender as '男' | '女'][myEl as keyof typeof LECTURE_DATA.ROMANCE_DAYS['男']];
  const myCareerMap = LECTURE_DATA.CAREER_DAYS[myEl as keyof typeof LECTURE_DATA.CAREER_DAYS];
  const myWealthMap = LECTURE_DATA.ROMANCE_DAYS['男'][myEl as keyof typeof LECTURE_DATA.ROMANCE_DAYS['男']];

  const comboMap = { wealth: myWealthMap, career: myCareerMap, romance: myRomanceMap };
  const myHealthDays = HEALTH_WARNING_DAYS[myEl] || [];
  const myWeakDays = WEAK_CONTROL_DAYS[weakestElement] || [];

  const activePartners = partners || [];
  let d = new Date();

  for (let i = 0; i < maxDaysToScan && results.length < amount; i++) {
    const solar = Solar.fromDate(d);
    const baZi = solar.getLunar().getEightChar();
    const gan = baZi.getDayGan();
    const zhi = baZi.getDayZhi();
    const ganZhi = `${gan}${zhi}`;
    const el = GAN_TO_ELEMENT[gan];
    const zhiEl = ZHI_TO_ELEMENT[zhi] || GAN_TO_ELEMENT[zhi];
    const isFav = favorable.includes(el) || favorable.includes(zhiEl);

    const myChong = hasChartChong(zhi, chart);
    const partnerChong = hasPartnerChong(zhi, activePartners);

    let isMatch = false;
    let isFavExt = false;

    if (matchComboDay(category, ganZhi, comboMap, myChong, partnerChong)) {
      isMatch = true;
      isFavExt = isFav;
    } else if (category === 'health_warning') {
      isMatch = myHealthDays.includes(ganZhi) || myWeakDays.includes(ganZhi);
      isFavExt = false;
    } else if (category === 'move_in') {
      const isAlmanacGood = solar.getLunar().getDayYi().includes('入宅');
      isMatch = isAlmanacGood && !myChong && !partnerChong && !unfavorable.includes(zhiEl);
      isFavExt = false;
    } else if (category === 'villain') {
      isMatch = checkVillainDay(ganZhi, chart.dayMaster);
      isFavExt = false;
    }

    if (isMatch) {
      results.push({
        date: `${solar.getMonth()}月${solar.getDay()}日`,
        ganZhi,
        isFavorable: isFavExt,
      });
    }

    d.setDate(d.getDate() + 1);
  }

  return results;
}

// 取得刑沖影響的柱位
function getAffectedPillars(chart: BaziChart, zhiList: string[]): string[] {
  const affected = [];
  if (zhiList.includes(chart.year.zhi)) affected.push('年柱（祖輩/長官）');
  if (zhiList.includes(chart.month.zhi)) affected.push('月柱（父母/工作環境）');
  if (zhiList.includes(chart.day.zhi)) affected.push('日柱（自己/伴侶）');
  if (zhiList.includes(chart.hour.zhi)) affected.push('時柱（子女/下屬）');
  return affected;
}

// 檢查相害與相破 — [AI MOD] 內部使用，不 export
function checkHarmAndBreak(chart: BaziChart, zhi: string): { type: string; warning: string; affected: string[] }[] {
  const results = [];

  const chartZhi = [
    { z: chart.year.zhi, p: '年柱（長輩/外部）' },
    { z: chart.month.zhi, p: '月柱（父母/主管）' },
    { z: chart.day.zhi, p: '日柱（伴侶/自己）' },
    { z: chart.hour.zhi, p: '時柱（子女/下屬）' },
  ];

  // 相害
  if (HARM_MAP[zhi]) {
    const affected = chartZhi.filter(c => c.z === HARM_MAP[zhi]).map(c => c.p);
    if (affected.length > 0) {
      results.push({
        type: '相害',
        warning: '易有人際摩擦、遭人嫉妒或暗中阻撓，情緒較易不悅。',
        affected,
      });
    }
  }

  // 相破
  if (BREAK_MAP[zhi]) {
    const affected = chartZhi.filter(c => c.z === BREAK_MAP[zhi]).map(c => c.p);
    if (affected.length > 0) {
      results.push({
        type: '相破',
        warning: '突如其來的阻力、計畫生變或物品損壞，但影響力較輕。',
        affected,
      });
    }
  }
  
  return results;
}

// 檢查自刑 — [AI MOD] 內部使用，不 export
function checkSelfPunishment(chart: BaziChart): string[] {
  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
  const counts: Record<string, number> = {};
  for (const z of zhis) counts[z] = (counts[z] || 0) + 1;
  
  const selfZhis = ['辰', '午', '酉', '亥'];
  const warnings = [];
  for (const sz of selfZhis) {
    if (counts[sz] >= 2) {
      warnings.push(`${sz}${sz}自刑`);
    }
  }
  return warnings;
}
// [AI MOD] 內部使用，不 export
function checkTriplePunishment(
  chart: BaziChart,
  liuNian: LiuNian
): { hasTriple: boolean; type: string; warning: string; affected: string[] } {
  const allZhi = [
    chart.year.zhi,
    chart.month.zhi,
    chart.day.zhi,
    chart.hour.zhi,
    liuNian.zhi,
  ];
  
  const rules = [
    { zhis: ['寅', '巳', '申'], type: '寅巳申三刑', warning: '注意車關、外傷、跌倒、突發性心血管問題' },
    { zhis: ['丑', '戌', '未'], type: '丑戌未三刑', warning: '注意腫瘤、結石、婦科問題、精神壓力' }
  ];

  const matchedRule = rules.find(rule => rule.zhis.every(z => allZhi.includes(z)));
  
  if (matchedRule) {
    return {
      hasTriple: true,
      type: matchedRule.type,
      warning: matchedRule.warning,
      affected: getAffectedPillars(chart, matchedRule.zhis),
    };
  }
  
  return { hasTriple: false, type: '', warning: '', affected: [] };
}
