import { GAN_TO_ELEMENT } from '../../constants';
import { LECTURE_DATA } from '../lecture';

export function checkDayType(
  dayGan: string, 
  dayZhi: string, 
  dayMaster: string, 
  gender: string
): string[] {
  const types: string[] = [];
  
  const dmElement = GAN_TO_ELEMENT[dayMaster];
  if (!dmElement) return types;

  const dayGanZhi = `${dayGan}${dayZhi}`;

  const myWealthMap = LECTURE_DATA.ROMANCE_DAYS['男'][dmElement as keyof typeof LECTURE_DATA.ROMANCE_DAYS['男']];
  if (myWealthMap && myWealthMap.combos.includes(dayGanZhi)) {
    types.push('得財日');
  }

  const myRomanceMap = LECTURE_DATA.ROMANCE_DAYS[gender as '男' | '女'][dmElement as keyof typeof LECTURE_DATA.ROMANCE_DAYS['男']];
  if (myRomanceMap && myRomanceMap.combos.includes(dayGanZhi)) {
    types.push('桃花日');
  }

  const myCareerMap = LECTURE_DATA.CAREER_DAYS[dmElement as keyof typeof LECTURE_DATA.CAREER_DAYS];
  if (myCareerMap && myCareerMap.combos.includes(dayGanZhi)) {
    types.push('事業機會日');
  }

  // 健康注意日 (Health Warning Day) specific exact days
  const healthDays: Record<string, string[]> = {
    '木': ['甲寅', '乙卯'],
    '火': ['丙午', '丁巳'],
    '土': ['戊辰', '己丑', '戊戌', '己未'],
    '金': ['庚申', '辛酉'],
    '水': ['壬子', '癸亥'],
  };
  if (healthDays[dmElement] && healthDays[dmElement].includes(dayGanZhi)) {
    types.push('健康注意日');
  }

  // 犯小人日 (Villain Day)
  const villainDays: Record<string, string[]> = {
    '金': ['庚申', '辛酉', '辛丑'],
    '火': ['丙午', '丁巳', '丁未', '丙戌'],
    '木': ['甲寅', '乙卯', '乙未'],
    '水': ['壬子', '癸亥', '癸丑'],
    '土': ['戊辰', '戊戌', '己未', '己丑'],
  };
  if (villainDays[dmElement] && villainDays[dmElement].includes(dayGanZhi)) {
    types.push('犯小人日');
  }

  return Array.from(new Set(types));
}

