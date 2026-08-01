// src/data/dailyFlowDays.ts

// 事業運旺的流日
export const CAREER_GOOD_DAYS: Record<string, string[]> = {
  '金': ['丙寅', '丁巳', '丙午', '丁未', '丙戌'],
  '木': ['庚申', '庚戌', '辛丑', '辛巳', '辛酉', '庚辰'],
  '水': ['戊寅', '戊辰', '戊午', '戊申', '戊戌', '己巳', '己丑', '己未'],
  '火': ['壬子', '癸丑', '壬辰', '壬申', '癸亥'],
  '土': ['甲寅', '乙卯', '甲辰', '乙未', '乙亥'],
};

// 易犯小人日
export const VILLAIN_DAYS: Record<string, string[]> = {
  '金': ['庚申', '辛酉', '辛丑'],
  '火': ['丁巳', '丁未', '丙戌', '丙午'],
  '水': ['壬子', '癸亥', '壬辰'],
  '木': ['甲寅', '乙卯', '甲辰'],
  '土': ['戊戌', '戊辰', '己丑', '己未'],
};

// 得財旺日
export const WEALTH_GOOD_DAYS: Record<string, string[]> = {
  '金': ['甲寅', '甲子', '乙卯', '甲辰', '壬寅', '癸卯', '乙未'],
  '木': ['戊戌', '戊寅', '戊午', '己未', '己巳', '丙寅', '丙午', '丙戌', '丁未', '丁巳'],
  '水': ['丙寅', '丙午', '丙戌', '丁未', '丁巳', '甲寅', '丙辰', '乙未', '乙巳', '甲午', '甲戌'],
  '火': ['庚辰', '辛丑', '己丑', '戊申', '庚申', '辛酉'],
  '土': ['壬申', '壬子', '壬辰', '癸酉', '癸丑', '癸亥', '庚子', '庚辰', '庚申', '辛亥'],
};

// 輔助函式
export function checkDayType(dayPillar: string, dayMasterElement: string, dayMap: Record<string, string[]>): boolean {
  const days = dayMap[dayMasterElement] || [];
  return days.includes(dayPillar);
}
