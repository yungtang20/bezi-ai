/**
 * 大運流年補運架構
 * 來源：大運流年補運架構/ 資料夾（10 個 PDF）＋ 課程逐字稿 2-1-1～2-1-3（三格喜忌）
 * [domain rule: 徐玉蘭口徑] 本檔為靜態速查表；動態分支（依當前大運算補運）以
 * src/data/core/fiveElementsBalance.ts 的 getLiunianAndRemedy 為單一來源，兩者同構。
 *
 * 十張表的核心語義（2.5 補運架構）：
 * - 身強：補運只有一組，永遠是耗洩組（財、官殺、食傷）——大運好壞、流年好壞都不改這一欄。
 * - 身弱：補運看大運、不看流年。大運走生扶 → 補耗洩組（既有配置兌現）；
 *          大運走耗洩 → 補生扶組（印、比劫）。
 * - 從格：求順勢不求解平衡；從強的喜忌＝身弱、從弱的喜忌＝身強，差別在理由與劑量。
 *         成格全好、破格全壞；只要成格，對他來說就是好的大運。
 */

import type { FiveElement } from '../core/types';
import { getLiunianAndRemedy } from '../core/fiveElementsBalance';
export type Pattern = '身強' | '身弱' | '從強' | '從弱';

/** 大運流年補運架構 */
export interface DayunLiunianGuide {
  element: FiveElement
  pattern: Pattern
  goodDayun: string[]        // 好的大運五行（大運走這組＝天氣好）
  badDayun: string[]         // 不好的大運五行（忌神大運）
  /** 身強／從弱：補運只有這一組，永遠＝耗洩組 */
  remedyAlways: string[]
  /** 身弱／從強：大運走生扶（好大運）時補耗洩組（既有配置兌現） */
  remedyWhenDayunGood: string[]
  /** 身弱／從強：大運走耗洩（不好的大運）時補生扶組 */
  remedyWhenDayunBad: string[]
  note: string               // 該格局的補運口徑註記（講義／逐字稿來源語義）
}

// 根據講義邏輯（與 fiveElementsBalance 同構，單一事實來源）：
// 剋、洩、耗 = 財、官殺、食傷；生、扶 = 印、比劫
const WEAKENING: Record<FiveElement, string[]> = {
  木: ['火', '土', '金'],
  火: ['土', '金', '水'],
  土: ['金', '水', '木'],
  金: ['水', '木', '火'],
  水: ['木', '火', '土'],
};
const STRENGTHENING: Record<FiveElement, string[]> = {
  木: ['水', '木'],
  火: ['木', '火'],
  土: ['火', '土'],
  金: ['土', '金'],
  水: ['金', '水'],
};

const HUMID_SOIL_NOTE: Partial<Record<Pattern, string>> = {
  身弱: '金日主補土時挑濕土（辰、丑）——濕土能生金，燥土比較無法生金（1-4 [07:14]、[18:17]）。',
  從強: '金日主補土時挑濕土（辰、丑）——濕土能生金，燥土比較無法生金（1-4 [07:14]、[18:17]）。',
};

function buildGuide(element: FiveElement, effective: '身強' | '身弱', pattern: Pattern): DayunLiunianGuide {
  // 身強／從弱走「身強」分支：好大運＝耗洩組，補運一律耗洩組（大運好壞均同）
  // 身弱／從強走「身弱」分支：好大運＝生扶組；補運依大運分支
  const good   = getLiunianAndRemedy(element, effective, true);
  const bad    = getLiunianAndRemedy(element, effective, false);
  const weakening = WEAKENING[element];
  const strengthening = STRENGTHENING[element];

  if (effective === '身強') {
    const note = pattern === '從弱'
      ? '從格求順勢：喜忌方向同身強（耗洩組），差別在理由與劑量——推到極端而非拉回中間（5-1 [20:09]）。成格全好、破格全壞；只要成格就是好的大運（2-1-3 [00:10]）。'
      : '身強的補運只有一組，永遠是耗洩組——大運好壞、流年好壞都不改這一欄（補運架構表）。好大運＝天氣好就發生事情（走財得財、走官升職，2-1-1）；忌印比大運，且印剋食傷、比劫剋財＝壞上加壞。';
    return {
      element,
      pattern,
      goodDayun: [...good.goodLiunian],
      badDayun: [...good.badLiunian],
      remedyAlways: [...good.remedy],
      remedyWhenDayunGood: [...weakening],
      remedyWhenDayunBad: [...weakening],
      note: note + (element === '金' && HUMID_SOIL_NOTE[pattern] ? ' ' : '') + (element === '金' ? (HUMID_SOIL_NOTE[pattern] ?? '') : ''),
    };
  }

  const note = pattern === '從強'
    ? '從格求順勢：無論如何去補最旺的那個五行就對了（1-4 [04:17]）；喜忌方向同身弱。成格全好、破格全壞；只要成格就是好的大運（2-1-3 [00:10]）。'
    : '身弱的補運看大運、不看流年：大運走生扶（印比）→ 補耗洩組，此時流年走耗洩反而標為好的流年（日主能量已被大運補起來，命盤上的正財偏財解鎖成加分項——既有配置兌現，不是新事件；2-1-2 [04:53]）；大運走耗洩 → 補生扶組（印比）。身弱走吉運可幫 5–10 年（2-1-2 [04:14]）。身弱本身一律補印比是錯的簡化，正確規則以此分支為準。';

  return {
    element,
    pattern,
    goodDayun: [...good.badLiunian],   // 從「大運不好」分支取：好大運＝生扶組
    badDayun: [...bad.badLiunian],     // 不好大運＝耗洩組
    remedyAlways: [...strengthening],  // 向後相容（未判大運時保守值＝補生扶）
    remedyWhenDayunGood: [...good.remedy],
    remedyWhenDayunBad: [...bad.remedy],
    note: note + (element === '金' && HUMID_SOIL_NOTE[pattern] ? ' ' : '') + (element === '金' ? (HUMID_SOIL_NOTE[pattern] ?? '') : ''),
  };
}

// effective strength 對照（2-1-1～2-1-3）：身強/從弱 → 喜耗洩；身弱/從強 → 喜生扶
export const DAYUN_LIUNIAN_GUIDES: Record<FiveElement, Record<Pattern, DayunLiunianGuide>> =
  Object.fromEntries(
    (['木', '火', '土', '金', '水'] as FiveElement[]).map(element => [
      element,
      Object.fromEntries([
        ['身強', buildGuide(element, '身強', '身強')],
        ['從弱', buildGuide(element, '身強', '從弱')],
        ['身弱', buildGuide(element, '身弱', '身弱')],
        ['從強', buildGuide(element, '身弱', '從強')],
      ]),
    ]),
  ) as Record<FiveElement, Record<Pattern, DayunLiunianGuide>>;

/**
 * 取得大運流年補運建議。
 * isDayunGood = 當前大運是否走喜用（生扶/耗洩方向）：
 * - 身強／從弱：千篇一律回耗洩組（remedyAlways），參數不影響結果。
 * - 身弱／從強：true → remedyWhenDayunGood（耗洩兌現）；false → remedyWhenDayunBad（補生扶）。
 *   未提供 isDayunGood 時保守回 remedyAlways（身弱＝生扶組）。
 */
export function getDayunLiunianGuide(
  element: FiveElement,
  pattern: Pattern,
  isDayunGood?: boolean,
): DayunLiunianGuide {
  const guide = DAYUN_LIUNIAN_GUIDES[element]?.[pattern];
  if (!guide) {
    return {
      element,
      pattern,
      goodDayun: [],
      badDayun: [],
      remedyAlways: [],
      remedyWhenDayunGood: [],
      remedyWhenDayunBad: [],
      note: '',
    };
  }
  if (isDayunGood === undefined) return guide;
  const remedy = isDayunGood ? guide.remedyWhenDayunGood : guide.remedyWhenDayunBad;
  return { ...guide, remedyAlways: remedy };
}
