import { Solar } from 'lunar-javascript';
import { BaziChart } from './paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT, getTenGod } from './constants';
import { checkTaiSui } from './data/rules/taiSui';
export { checkTaiSui } from './data/rules/taiSui';
export { getTenGod as getTenGodForDaYun } from './constants';

export interface DaYun {
  startAge: number;      // 起運歲數
  startYear: number;     // 起運西元年
  endYear: number;       // 結束西元年
  ganZhi: string;        // 大運干支
  gan: string;           // 天干
  zhi: string;           // 地支
  tenGod: string;        // 十神（相對於日主）
  element: string;       // 五行
}

export interface LiuNian {
  year: number;          // 西元年
  ganZhi: string;        // 流年干支
  gan: string;           // 天干
  zhi: string;           // 地支
  element: string;       // 五行
  relation: string;      // 與日主的十神關係
}

/**
 * 計算所有大運
 * @param chart 八字命盤
 * @returns 大運陣列
 */
export function calculateDaYun(chart: BaziChart): DaYun[] {
  const solar = Solar.fromYmdHms(
    chart.birthYear, 
    chart.birthMonth, 
    chart.birthDay, 
    chart.birthHour === -1 ? 12 : chart.birthHour, 
    0, 0
  );
  const lunar = solar.getLunar();
  const baZi = lunar.getEightChar();
  
  // 使用 lunar-javascript 的大運功能
  // 設定性別（1=男, 0=女）
  const sex = chart.gender === '男' ? 1 : 0;
  const yun = baZi.getYun(sex);
  
  const daYunList: DaYun[] = [];
  const daYunArr = yun.getDaYun();
  
  for (let i = 0; i < daYunArr.length; i++) {
    const dy = daYunArr[i];
    const ganZhi = dy.getGanZhi();
    if (!ganZhi) continue;
    
    // 某些版本的 lunar-javascript，大運預設可能有空白或其它東西
    const startAge = dy.getStartAge();
    const startYear = dy.getStartYear();
    const endYear = startYear + 9; // 每十年換一次大運
    
    const gan = ganZhi.charAt(0);
    const zhi = ganZhi.charAt(1);
    // 計算十神
    const tenGod = getTenGod(chart.dayMaster, gan);
    const element = ZHI_TO_ELEMENT[zhi] || GAN_TO_ELEMENT[gan] || '未知';
    
    daYunList.push({
      startAge,
      startYear,
      endYear,
      ganZhi,
      gan,
      zhi,
      tenGod,
      element,
    });
  }
  
  return daYunList;
}

/**
 * 計算流年相對於日主的十神
 */
// [AI MOD] 內部使用，不 export
function getLiuNianRelation(dayMaster: string, liuNianGan: string): string {
  return getTenGod(dayMaster, liuNianGan);
}

/**
 * 判斷大運/流年 對當前格局的好壞
 */
export function getDaYunQuality(
  gan: string,
  zhi: string,
  favorable: string[],
  unfavorable: string[]
): '好運' | '壞運' | '平運' {
  const ganElement = GAN_TO_ELEMENT[gan];
  const zhiElement = ZHI_TO_ELEMENT[zhi] || GAN_TO_ELEMENT[zhi];
  
  if (!ganElement || !zhiElement) return '平運';

  let ganScore = 0;
  let zhiScore = 0;

  if (favorable.includes(ganElement)) ganScore = 1;
  else if (unfavorable.includes(ganElement)) ganScore = -1;

  if (favorable.includes(zhiElement)) zhiScore = 1;
  else if (unfavorable.includes(zhiElement)) zhiScore = -1;

  // 地支的影響力遠大於天干
  if (zhiScore > 0) return '好運';
  if (zhiScore < 0) return '壞運';
  
  // 地支平局時，看天干
  if (ganScore > 0) return '好運';
  if (ganScore < 0) return '壞運';
  
  return '平運';
}

/**
 * 取得指定年份的流年干支
 */
export function getLiuNian(year: number, dayMaster?: string): LiuNian {
  const solar = Solar.fromYmdHms(year, 6, 1, 0, 0, 0); // 避開立春前的年份誤差
  const lunar = solar.getLunar();
  // [AI MOD] EightChar.getYear() 回傳年份數字而非干支；getYearInGanZhi() 定義在 Lunar 上。
  const ganZhi = lunar.getYearInGanZhi();
  const gan = ganZhi.charAt(0);
  
  return {
    year,
    ganZhi,
    gan,
    zhi: ganZhi.charAt(1),
    element: ZHI_TO_ELEMENT[ganZhi.charAt(1)] || GAN_TO_ELEMENT[gan] || '未知',
    relation: dayMaster ? getLiuNianRelation(dayMaster, gan) : '',
  };
}

/**
 * 計算未來 N 年的流年
 */
export function getFutureLiuNian(startYear: number, count: number, dayMaster: string): LiuNian[] {
  const liuNianList: LiuNian[] = [];
  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    liuNianList.push(getLiuNian(year, dayMaster));
  }
  return liuNianList;
}
