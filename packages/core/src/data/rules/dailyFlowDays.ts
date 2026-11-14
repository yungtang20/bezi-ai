import { GAN_TO_ELEMENT } from '../../constants';
import { LECTURE_DATA } from '../lecture';

// 日主能量最強日（比劫最旺）：天干取同五行的比肩／劫財，地支取該五行的旺地與庫地。
// 例：金日主 庚申、辛酉、辛丑；火日主 丙午、丁巳、丁未、丙戌；水日主 壬子、癸亥、壬辰、癸丑。
const ENERGY_PEAK_DAYS: Record<string, string[]> = {
  木: ['甲寅', '乙卯', '乙未'],
  火: ['丙午', '丁巳', '丁未', '丙戌'],
  土: ['戊辰', '戊戌', '己未', '己丑'],
  金: ['庚申', '辛酉', '辛丑'],
  水: ['壬子', '癸亥', '壬辰', '癸丑'],
};

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

  const myWealthMap =
    LECTURE_DATA.ROMANCE_DAYS['男'][
      dmElement as keyof (typeof LECTURE_DATA.ROMANCE_DAYS)['男']
    ];
  if (myWealthMap && myWealthMap.combos.includes(dayGanZhi)) {
    types.push('得財日');
  }

  const myRomanceMap =
    LECTURE_DATA.ROMANCE_DAYS[gender as '男' | '女'][
      dmElement as keyof (typeof LECTURE_DATA.ROMANCE_DAYS)['男']
    ];
  if (myRomanceMap && myRomanceMap.combos.includes(dayGanZhi)) {
    types.push('桃花日');
  }

  const myCareerMap =
    LECTURE_DATA.CAREER_DAYS[
      dmElement as keyof typeof LECTURE_DATA.CAREER_DAYS
    ];
  if (myCareerMap && myCareerMap.combos.includes(dayGanZhi)) {
    types.push('事業機會日');
  }

  // 健康注意日與犯小人日同源：老師在 2-4 以「流日干支皆為比劫（同我）＝日主五行最強之日」
  // 定犯小人時機，並在 qa-0106 說健康注意日／犯小人日是同一個判準。
  // 兩者共用同一組日子，不再各維護一張表（曾出現兩表不一致：木乙未、火丙戌丁未、金辛丑、水癸丑）。
  const energyPeakDays = ENERGY_PEAK_DAYS[dmElement];
  if (energyPeakDays && energyPeakDays.includes(dayGanZhi)) {
    types.push('健康注意日', '犯小人日');
  }

  return Array.from(new Set(types));
}
