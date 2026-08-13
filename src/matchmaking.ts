import { BaziChart } from './paipan';
import { determinePattern, TRIAD_MEETINGS, TRIAD_GROUPS } from './pattern';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT, ELEMENT_CONTROLS } from './constants';

// 伴侶資料結構
export interface PartnerChart {
  id: string;
  name: string;
  relationship: '伴侶' | '合作夥伴' | '家人' | '其他';
  gender: string;
  birthDate: string;
  birthTime: string;
  chart: BaziChart;
}

export function checkSanHui(zhi1: string, zhi2: string): string | null {
  if (zhi1 === zhi2) return null;
  const meeting = TRIAD_MEETINGS.find(m => m.branches.includes(zhi1) && m.branches.includes(zhi2));
  if (!meeting) return null;
  return `${meeting.branches.join('')}三會${meeting.result}局`;
}

export function checkSanHe(zhi1: string, zhi2: string): string | null {
  if (zhi1 === zhi2) return null;
  const group = TRIAD_GROUPS.find(g => g.branches.includes(zhi1) && g.branches.includes(zhi2));
  if (!group) return null;
  return `${group.branches.join('')}三合${group.result}局`;
}

// 六沖 / 六合判斷（共用雙向配對查找）
const PAIR_RELATIONS: Record<string, Record<string, string>> = {
  '沖': { '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅', '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳' },
  '合': { '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午' },
};

/** 通用配對查找：檢查兩地支是否為指定關係（沖/合） */
function checkPairRelationByMap(zhi1: string, zhi2: string, relation: '沖' | '合'): string | null {
  const map = PAIR_RELATIONS[relation];
  return map[zhi1] === zhi2 ? `${zhi1}${zhi2}${relation}` : null;
}

export const checkLiuChong = (z1: string, z2: string) => checkPairRelationByMap(z1, z2, '沖');
export const checkLiuHe = (z1: string, z2: string) => checkPairRelationByMap(z1, z2, '合');

// 相刑判斷
export function checkXiangXing(zhi1: string, zhi2: string): string | null {
  const wuEn = ['寅', '巳', '申'];
  const shiShi = ['丑', '戌', '未'];
  const ziXing = ['辰', '午', '酉', '亥'];

  if (wuEn.includes(zhi1) && wuEn.includes(zhi2) && zhi1 !== zhi2) return `無恩之刑(${zhi1}${zhi2})`;
  if (shiShi.includes(zhi1) && shiShi.includes(zhi2) && zhi1 !== zhi2) return `恃勢之刑(${zhi1}${zhi2})`;
  if ((zhi1 === '子' && zhi2 === '卯') || (zhi1 === '卯' && zhi2 === '子')) return '恩愛之刑(子卯)';
  if (ziXing.includes(zhi1) && zhi1 === zhi2) return `自刑(${zhi1}${zhi2})`;

  return null;
}

// 六破 / 六害判斷（共用配對查找）
function checkPairRelation(zhi1: string, zhi2: string, pairs: [string, string][], label: string): string | null {
  return pairs.some(([a, b]) => (a === zhi1 && b === zhi2) || (a === zhi2 && b === zhi1)) ? `${zhi1}${zhi2}${label}` : null;
}

const PO_PAIRS: [string, string][] = [['子', '酉'], ['午', '卯'], ['寅', '亥'], ['巳', '申'], ['辰', '丑'], ['戌', '未']];
const HAI_PAIRS: [string, string][] = [['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']];

export const checkLiuPo = (z1: string, z2: string) => checkPairRelation(z1, z2, PO_PAIRS, '破');
export const checkLiuHai = (z1: string, z2: string) => checkPairRelation(z1, z2, HAI_PAIRS, '害');

// 五行互補判斷 — [AI MOD] 內部使用，不 export
function checkWuXingComplement(myChart: BaziChart, partnerChart: BaziChart, myFavorable?: string[]) {
  const myPat = determinePattern(myChart);
  const pPat = determinePattern(partnerChart);

  const myFav = myFavorable || myPat.favorable;
  const pFav = pPat.favorable;

  const countP: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const pillars = [partnerChart.year, partnerChart.month, partnerChart.day, partnerChart.hour];
  for (const p of pillars) {
    const e1 = GAN_TO_ELEMENT[p.gan];
    if (e1) countP[e1]++;
    // 地支以本氣計算五行（使用 ZHI_TO_ELEMENT）
    const e2 = ZHI_TO_ELEMENT[p.zhi];
    if (e2) countP[e2]++;
  }

  // 排序伴侶五行強度
  const pTopElements = Object.entries(countP).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);

  // 我的喜用神是否在對方的最強五行中
  const isComplement = myFav.some(f => pTopElements.includes(f));
  
  return {
    isComplement,
    myFavorable: myFav,
    partnerStrongest: pTopElements
  };
}

// 五行互補組合 (身強/身弱互補)
export function checkMutualComplement(myChart: BaziChart, pChart: BaziChart) {
  const myPat = determinePattern(myChart);
  const pPat = determinePattern(pChart);
  
  const myPri = myPat.pattern;
  const pPri = pPat.pattern;

  const myEl = GAN_TO_ELEMENT[myChart.dayMaster];
  const pEl = GAN_TO_ELEMENT[pChart.dayMaster];

  if ((myPri === '身弱' && pPri === '身強') || (myPri === '身強' && pPri === '身弱')) {
    return '身強身弱互補，能夠截長補短。';
  } else if (myPri === '身強' && pPri === '身強') {
    return `雙方皆為身強，${myEl}與${pEl}能量強大碰撞，需注意溝通與退讓。`;
  }
  return '能量相似，可相互理解與陪伴。';
}

// 日柱結構相似
export function checkDayStructureSimilarity(chart1: BaziChart, chart2: BaziChart) {
  const e1_gan = GAN_TO_ELEMENT[chart1.dayMaster];
  const e1_zhi = ZHI_TO_ELEMENT[chart1.day.zhi];
  const e2_gan = GAN_TO_ELEMENT[chart2.dayMaster];
  const e2_zhi = ZHI_TO_ELEMENT[chart2.day.zhi];
  
  if (e1_gan === e2_gan && e1_zhi === e2_zhi) {
    return `日柱五行同為${e1_gan}${e1_zhi}，結構相似，價值觀相近，運勢同好同壞。好運時保持實力，壞運時保守為上。`;
  }
  return null;
}

// 共同姻緣五行 (rule from page 4)
export function checkCommonSpouseElement(c1: BaziChart, c2: BaziChart): string | null {
  const male = c1.gender === '男' ? c1 : c2.gender === '男' ? c2 : null;
  const female = c1.gender === '女' ? c1 : c2.gender === '女' ? c2 : null;
  
  if (!male || !female) return null;
  
  const mGan = male.dayMaster;
  const fGan = female.dayMaster;
  
  const spouseRules: { m: string[]; f: string[]; spouse: string }[] = [
    { m: ['壬', '癸'], f: ['庚', '辛'], spouse: '火' },
    { m: ['庚', '辛'], f: ['戊', '己'], spouse: '木' },
    { m: ['甲', '乙'], f: ['壬', '癸'], spouse: '土' },
    { m: ['丙', '丁'], f: ['甲', '乙'], spouse: '金' },
    { m: ['戊', '己'], f: ['丙', '丁'], spouse: '水' },
  ];

  const match = spouseRules.find(r => r.m.includes(mGan) && r.f.includes(fGan));
  if (match) {
    return `男女日主結合，共同夫妻星皆為「${match.spouse}」，姻緣五行相同！`;
  }

  return null;
}

// 互為夫妻星判斷
export function checkSpouseStar(myChart: BaziChart, partnerChart: BaziChart): string | null {
  const myGender = myChart.gender;
  const pGender = partnerChart.gender;
  
  if (myGender === pGender) return null;

  const myEl = GAN_TO_ELEMENT[myChart.dayMaster];
  const pEl = GAN_TO_ELEMENT[partnerChart.dayMaster];
  
  // 男方剋女方
  const isMyMale = myGender === '男';
  const maleEl = isMyMale ? myEl : pEl;
  const femaleEl = isMyMale ? pEl : myEl;
  
  if (ELEMENT_CONTROLS[maleEl] === femaleEl) {
    return `男命（${maleEl}）剋女命（${femaleEl}）為財，女命被剋為官，互為夫妻星！`;
  }
  
  return null;
}

// 先天感情運判斷 — [AI MOD] 內部使用，不 export
function checkDestinyRomance(chart: BaziChart): boolean {
  const myEl = GAN_TO_ELEMENT[chart.dayMaster];
  const zhiEl = ZHI_TO_ELEMENT[chart.day.zhi];
  // ELEMENT_CONTROLS: key 剋 value — 男命看財星(我剋)，女命看官殺(剋我)
  if (chart.gender === '男') return ELEMENT_CONTROLS[myEl] === zhiEl;
  return ELEMENT_CONTROLS[zhiEl] === myEl;
}
