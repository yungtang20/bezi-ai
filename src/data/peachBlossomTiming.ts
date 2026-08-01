// src/data/peachBlossomTiming.ts

// 生肖三合對照表
export const ZODIAC_TRIPLE_MAP: Record<string, { members: string[]; element: string }> = {
  '鼠': { members: ['猴', '鼠', '龍'], element: '水' },
  '牛': { members: ['蛇', '雞', '牛'], element: '金' },
  '虎': { members: ['虎', '馬', '狗'], element: '火' },
  '兔': { members: ['豬', '兔', '羊'], element: '木' },
  '龍': { members: ['猴', '鼠', '龍'], element: '水' },
  '蛇': { members: ['蛇', '雞', '牛'], element: '金' },
  '馬': { members: ['虎', '馬', '狗'], element: '火' },
  '羊': { members: ['豬', '兔', '羊'], element: '木' },
  '猴': { members: ['猴', '鼠', '龍'], element: '水' },
  '雞': { members: ['蛇', '雞', '牛'], element: '金' },
  '狗': { members: ['虎', '馬', '狗'], element: '火' },
  '豬': { members: ['豬', '兔', '羊'], element: '木' },
};

// 生肖六沖對照表
export const ZODIAC_CLASH_MAP: Record<string, string> = {
  '鼠': '馬', '馬': '鼠',
  '牛': '羊', '羊': '牛',
  '虎': '猴', '猴': '虎',
  '兔': '雞', '雞': '兔',
  '龍': '狗', '狗': '龍',
  '蛇': '豬', '豬': '蛇',
};

// 地支與生肖對照
export const ZHI_TO_ZODIAC: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龍', '巳': '蛇', '午': '馬', '未': '羊',
  '申': '猴', '酉': '雞', '戌': '狗', '亥': '豬',
};

// 約會表白旺日 — 男
export const MALE_ROMANCE_DAYS: Record<string, string[]> = {
  '金': ['甲寅', '甲子', '乙卯', '甲辰', '壬寅', '癸卯', '乙未'],
  '木': ['戊戌', '戊寅', '戊午', '己未', '己巳', '丙寅', '丙午', '丙戌', '丁未', '丁巳'],
  '水': ['丙寅', '丙午', '丙戌', '丁未', '丁巳', '甲寅', '丙辰', '乙未', '乙巳', '甲午', '甲戌'],
  '火': ['庚辰', '辛丑', '己丑', '戊申', '庚申', '辛酉'],
  '土': ['壬申', '壬子', '壬辰', '癸酉', '癸丑', '癸亥', '庚子', '庚辰', '庚申', '辛亥'],
};

// 約會表白旺日 — 女
export const FEMALE_ROMANCE_DAYS: Record<string, string[]> = {
  '金': ['丙午', '丙戌', '丁巳', '丁未', '甲寅', '乙未', '丙寅', '丁卯'],
  '木': ['庚申', '辛酉', '庚辰', '辛丑', '戊申', '己酉', '己丑'],
  '水': ['戊戌', '戊辰', '己巳', '戊午', '己未', '己丑', '丙午', '丁未', '丁巳', '丙戌'],
  '火': ['壬子', '癸亥', '壬辰', '壬申', '癸丑', '庚子', '辛巳', '庚辰', '庚申', '辛亥'],
  '土': ['甲寅', '乙卯', '甲辰', '乙未', '乙亥', '壬寅', '癸卯'],
};

// 桃花危機流年規則
export interface PeachBlossomCrisis {
  pattern: string;  // 天干組合模式
  description: string;
}

export const PEACH_BLOSSOM_CRISIS: PeachBlossomCrisis[] = [
  {
    pattern: "財星透干+比劫",
    description: "心儀對象可能與他人藕斷絲連，注意情敵。"
  },
  {
    pattern: "比劫+財星",
    description: "對象感情關係複雜，可能名花有主，容易陷入三角糾紛。"
  },
  {
    pattern: "官殺+比劫",
    description: "心儀對象已有伴侶或踏多條船，需多加觀察。"
  },
  {
    pattern: "比劫+官殺",
    description: "對象感情關係複雜，易有第三者介入。"
  }
];

// 輔助函式：取得某生肖的三合生肖
export function getTripleZodiacs(zodiac: string): string[] {
  return ZODIAC_TRIPLE_MAP[zodiac]?.members || [];
}

// 輔助函式：檢查是否為桃花三合年
export function isPeachBlossomTripleYear(myZodiac: string, yearZhi: string): boolean {
  const yearZodiac = ZHI_TO_ZODIAC[yearZhi];
  const tripleZodiacs = getTripleZodiacs(myZodiac);
  return tripleZodiacs.includes(yearZodiac);
}

// 輔助函式：檢查是否為六沖年
export function isClashYear(myZodiac: string, yearZhi: string): boolean {
  const yearZodiac = ZHI_TO_ZODIAC[yearZhi];
  return ZODIAC_CLASH_MAP[myZodiac] === yearZodiac;
}
