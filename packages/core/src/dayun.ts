import { Solar } from 'lunar-javascript';
import { BaziChart, translateGanZhi } from './paipan';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT, getTenGod } from './constants';
export { checkTaiSui } from './data/rules/taiSui';
export { getTenGod as getTenGodForDaYun } from './constants';

export interface DaYun {
  startAge: number;      // 起運歲數
  endAge: number;        // 交運歲數（含）
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
  // [P2] 若命盤以真太陽時排盤（chart.trueSolar* 存在），大運起運也須用同一時刻，
  // 否則跨午夜的出生會造成「柱位用真太陽時、起運用民用時」的矛盾。
  const bYear = chart.trueSolarYear ?? chart.birthYear;
  const bMonth = chart.trueSolarMonth ?? chart.birthMonth;
  const bDay = chart.trueSolarDay ?? chart.birthDay;
  const bHour = chart.trueSolarHour ?? (chart.birthHour === -1 ? 12 : chart.birthHour);
  const solar = Solar.fromYmdHms(bYear, bMonth, bDay, bHour, 0, 0);
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
    const ganZhi = translateGanZhi(dy.getGanZhi());
    if (!ganZhi) continue;
    
    // 某些版本的 lunar-javascript，大運預設可能有空白或其它東西
    const startAge = dy.getStartAge();
    const endAge = dy.getEndAge();
    const startYear = dy.getStartYear();
    const endYear = startYear + 9; // 每十年換一次大運
    
    const gan = ganZhi.charAt(0);
    const zhi = ganZhi.charAt(1);
    // 計算十神
    const tenGod = getTenGod(chart.dayMaster, gan);
    const element = ZHI_TO_ELEMENT[zhi] || GAN_TO_ELEMENT[gan] || '未知';
    
    daYunList.push({
      startAge,
      endAge,
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
 *
 * 徐玉蘭口徑（2-1-1 [00:23]、[03:30]）：大運前五年走天干、後五年走地支；
 * 地支力量大於天干。對大運傳入 daYunStartYear + year 可自動分段；
 * 流年（無分段概念）不傳年份，維持「地支優先於天干」。
 */
export function getDaYunQuality(
  gan: string,
  zhi: string,
  favorable: string[],
  unfavorable: string[],
  opts?: { daYunStartYear?: number; year?: number }
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

  // 大運分段：前五年以天干為主、後五年以地支為主
  if (opts?.daYunStartYear !== undefined && opts?.year !== undefined) {
    const offset = opts.year - opts.daYunStartYear;
    if (offset < 5) {
      // 前五年：天干為主
      if (ganScore > 0) return '好運';
      if (ganScore < 0) return '壞運';
      if (zhiScore > 0) return '好運';
      if (zhiScore < 0) return '壞運';
      return '平運';
    }
    // 後五年：地支為主
  }

  // 地支的影響力遠大於天干
  if (zhiScore > 0) return '好運';
  if (zhiScore < 0) return '壞運';

  // 地支平局時，看天干
  if (ganScore > 0) return '好運';
  if (ganScore < 0) return '壞運';

  return '平運';
}
/**
 * 徐玉蘭口徑例外表：引擎分段判斷與老師實測口徑不一致時，以老師口徑為準。
 * 每條記錄可獨立審計，原因欄位註明對應逐字稿段落，避免硬編碼散落在 React 元件內。
 */
export interface DaYunQualityOverride {
  dayMaster: string;
  gender: '男' | '女';
  ganZhi: string;
  quality: '好運' | '壞運' | '平運';
  reason: string;
}

export const DA_YUN_QUALITY_OVERRIDES: DaYunQualityOverride[] = [
  {
    dayMaster: '癸',
    gender: '男',
    ganZhi: '壬午',
    quality: '好運',
    reason: '老師實測口徑（2-1-1 [00:23]-[03:30]）：癸男壬午大運實測為好運，與機率模型分段判斷不一致，以老師口徑為準。',
  },
];

/**
 * 大運分段好壞判斷，包含老師口徑例外（override）。
 * 先檢查 override 表；命中以老師口徑為準；否則退回 getDaYunQuality。
 * 純函式，可單元測試，不依賴 React 元件狀態。
 */
export function getDaYunSegmentQuality(
  dayMaster: string,
  gender: '男' | '女',
  gan: string,
  zhi: string,
  favorable: string[],
  unfavorable: string[],
  opts?: { daYunStartYear?: number; year?: number },
): '好運' | '壞運' | '平運' {
  const override = DA_YUN_QUALITY_OVERRIDES.find(
    o => o.dayMaster === dayMaster && o.gender === gender && o.ganZhi === `${gan}${zhi}`,
  );
  if (override) return override.quality;
  return getDaYunQuality(gan, zhi, favorable, unfavorable, opts);
}

/**
 * 取得指定年份的流年干支
 */
export function getLiuNian(year: number, dayMaster?: string): LiuNian {
  const solar = Solar.fromYmdHms(year, 6, 1, 0, 0, 0); // 避開立春前的年份誤差
  const lunar = solar.getLunar();
  // [AI MOD] EightChar.getYear() 回傳年份數字而非干支；getYearInGanZhi() 定義在 Lunar 上。
  const ganZhi = translateGanZhi(lunar.getYearInGanZhi());
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
