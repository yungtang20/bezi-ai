export const ZODIAC_TRIPLE_MAP: Record<string, { members: string[]; element: string }> = {
  '鼠': { members: ['猴', '鼠', '龍'], element: '水' },
  '牛': { members: ['巳', '酉', '丑'], element: '金' },
  '虎': { members: ['寅', '午', '戌'], element: '火' },
  '兔': { members: ['亥', '卯', '未'], element: '木' },
  '龍': { members: ['猴', '鼠', '龍'], element: '水' },
  '蛇': { members: ['巳', '酉', '丑'], element: '金' },
  '馬': { members: ['寅', '午', '戌'], element: '火' },
  '羊': { members: ['亥', '卯', '未'], element: '木' },
  '猴': { members: ['猴', '鼠', '龍'], element: '水' },
  '雞': { members: ['巳', '酉', '丑'], element: '金' },
  '狗': { members: ['寅', '午', '戌'], element: '火' },
  '豬': { members: ['亥', '卯', '未'], element: '木' },
  '寅': { members: ['寅', '午', '戌'], element: '火' },
  '卯': { members: ['亥', '卯', '未'], element: '木' },
  '辰': { members: ['申', '子', '辰'], element: '水' },
  '巳': { members: ['巳', '酉', '丑'], element: '金' },
  '午': { members: ['寅', '午', '戌'], element: '火' },
  '未': { members: ['亥', '卯', '未'], element: '木' },
  '申': { members: ['申', '子', '辰'], element: '水' },
  '酉': { members: ['巳', '酉', '丑'], element: '金' },
  '戌': { members: ['寅', '午', '戌'], element: '火' },
  '亥': { members: ['亥', '卯', '未'], element: '木' },
  '子': { members: ['申', '子', '辰'], element: '水' },
  '丑': { members: ['巳', '酉', '丑'], element: '金' },
};

export const ZODIAC_CLASH_MAP: Record<string, string> = {
  '鼠': '馬', '馬': '鼠', '牛': '羊', '羊': '牛',
  '虎': '猴', '猴': '虎', '兔': '雞', '雞': '兔',
  '龍': '狗', '狗': '龍', '蛇': '豬', '豬': '蛇',
  '子': '午', '午': '子', '丑': '未', '未': '丑',
  '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
};

export const ZHI_TO_ZODIAC: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龍', '巳': '蛇', '午': '馬', '未': '羊',
  '申': '猴', '酉': '雞', '戌': '狗', '亥': '豬'
};

export const MALE_ROMANCE_DAYS = ['正財', '偏財'];
export const FEMALE_ROMANCE_DAYS = ['正官', '七殺'];

// [AI MOD] 桃花危機/爛桃花時機診斷（依 docx L417-423 具體規則）
// 男命：水命男逢丙子年（財坐劫財）、木命男逢乙丑/乙未年（比劫坐財）
// 女命：金命女逢丙申年（官坐比劫）、土命女逢天干土/比劫＋地支木/官殺（比劫坐官殺）
export const PEACH_BLOSSOM_CRISIS = [
  '男命為水日主，逢「丙子」年/流日：天干丙火（財、桃花）透出，但地支子水比劫暗藏競爭，心儀對象可能與他人藕斷絲連，自身極易陷入三角糾紛。',
  '男命為木日主，逢「乙丑」或「乙未」年/流日：天干乙木比劫＋地支丑/未土財星，情敵眾多，與伴侶的感情極易因身邊朋友或第三者介入而產生變故。',
  '女命為金日主，逢「丙申」年/流日：天干丙火正官桃花極旺，但地支申金坐劫財（比劫），心儀對象極可能早有伴侶，或本質腳踏多條船。',
  '女命為土日主，逢天干土/比劫＋地支木/官殺之年/流日：交往對象感情背景極其複雜，女命極易在不知情下陷入三角糾紛、或被動成為第三者。'
];

export function getTripleZodiacs(zodiacOrZhi: string): string[] {
  return ZODIAC_TRIPLE_MAP[zodiacOrZhi]?.members || [];
}

export function isPeachBlossomTripleYear(zodiacOrZhi: string, yearZhi: string): boolean {
  const members = ZODIAC_TRIPLE_MAP[zodiacOrZhi]?.members || [];
  return members.includes(yearZhi);
}

export function isClashYear(zodiacOrZhi: string, yearZhi: string): boolean {
  return ZODIAC_CLASH_MAP[zodiacOrZhi] === yearZhi;
}
