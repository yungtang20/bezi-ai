import { Solar } from 'lunar-javascript';
import {
  GAN_TO_ELEMENT,
  getTenGod,
  YANG_GANS,
  isSameYinYang,
} from './constants';
import { ZHI_HIDDEN } from './domain/baziRules';

// [AI MOD] 生肖對照表（移到模組頂層，避免每次呼叫 calculateChart 時重建）
const ZODIAC_MAP: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龍', '巳': '蛇', '午': '馬', '未': '羊',
  '申': '猴', '酉': '雞', '戌': '狗', '亥': '豬',
};

// [AI MOD] i18n 鍵到中文字符映射（lunar-javascript 返回 i18n 鍵而非中文）
const GAN_MAP: Record<string, string> = {
  '{tg.jia}': '甲', '{tg.yi}': '乙', '{tg.bing}': '丙', '{tg.ding}': '丁', '{tg.wu}': '戊',
  '{tg.ji}': '己', '{tg.geng}': '庚', '{tg.xin}': '辛', '{tg.ren}': '壬', '{tg.gui}': '癸',
};

const ZHI_MAP: Record<string, string> = {
  '{dz.zi}': '子', '{dz.chou}': '丑', '{dz.yin}': '寅', '{dz.mao}': '卯', '{dz.chen}': '辰', '{dz.si}': '巳',
  '{dz.wu}': '午', '{dz.wei}': '未', '{dz.shen}': '申', '{dz.you}': '酉', '{dz.xu}': '戌', '{dz.hai}': '亥',
};

/** 將 lunar-javascript 返回的 i18n 鍵翻譯成中文字符 */
export function translateGanZhi(ganZhi: string): string {
  // 處理空值或已經有中文的情況
  if (!ganZhi || ganZhi.length < 2) return '';
  // 如果不是 i18n 鍵格式，直接返回
  if (!ganZhi.startsWith('{')) return ganZhi;
  // 嘗試拆解：格式為 {tg.xxx}{dz.xxx}
  const match = ganZhi.match(/^\{tg\.([a-z]+)\}\{dz\.([a-z]+)\}$/);
  if (match) {
    const ganKey = `{tg.${match[1]}}`;
    const zhiKey = `{dz.${match[2]}}`;
    const gan = GAN_MAP[ganKey] || ganZhi;
    const zhi = ZHI_MAP[zhiKey] || ganZhi;
    return gan + zhi;
  }
  return ganZhi;
}

// 定義我們要輸出的命盤結構
export interface BaziChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: string;      // 日主天干
  gender: '男' | '女';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  zodiac: string;
}

// [AI MOD] 內部型別，不 export
interface Pillar {
  gan: string;            // 天干
  zhi: string;            // 地支
  hiddenGan: readonly string[];    // 藏干（依照講義中的百分比排序）
  tenGod: string;         // 該柱的十神（相對於日主）
  hiddenTenGods: string[]; // 藏干的十神
}

/**
 * 計算八字命盤
 * @param year 西元年
 * @param month 月份 (1-12)
 * @param day 日期 (1-31)
 * @param hour 時 (0-23)
 * @param gender 性別 ('男' 或 '女')
 * @returns BaziChart 結構
 */
export function calculateChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: '男' | '女',
  isHourUnknown?: boolean
): BaziChart {
  // 1. 將西元日期轉換為農曆物件 (若未知時間，以日中12時推算前三柱)
  const solar = Solar.fromYmdHms(year, month, day, isHourUnknown ? 12 : hour, 0, 0);
  const lunar = solar.getLunar();

  // 2. 取得四柱的天干地支（lunar-javascript 返回 i18n 鍵，需翻譯為中文）
  const yearGanZhi = translateGanZhi(lunar.getYearInGanZhi());    // 年柱
  const monthGanZhi = translateGanZhi(lunar.getMonthInGanZhi());  // 月柱
  const dayGanZhi = translateGanZhi(lunar.getDayInGanZhi());      // 日柱
  const hourGanZhi = translateGanZhi(lunar.getTimeInGanZhi());    // 時柱

  // 3. 取得各柱的詳細八字物件
  const baZi = lunar.getEightChar();
  
  // 取得每一柱的天干、地支、藏干列表
  const yearPillar = buildPillar(yearGanZhi);
  const monthPillar = buildPillar(monthGanZhi);
  const dayPillar = buildPillar(dayGanZhi);
  const hourPillar = isHourUnknown 
    ? { gan: '', zhi: '', hiddenGan: [], tenGod: '', hiddenTenGods: [] }
    : buildPillar(hourGanZhi);

  // 4. 日主天干
  const dayMaster = dayPillar.gan;

  // 5. 計算十神（需要先有天干對應的五行關係）
  const pillarsWithTenGod = setTenGods(
    [yearPillar, monthPillar, dayPillar, hourPillar],
    dayMaster
  );

  // 根據年支計算生肖
  const zodiac = ZODIAC_MAP[pillarsWithTenGod[0].zhi] || '未知';

  return {
    year: pillarsWithTenGod[0],
    month: pillarsWithTenGod[1],
    day: pillarsWithTenGod[2],
    hour: pillarsWithTenGod[3],
    dayMaster,
    gender,
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    birthHour: isHourUnknown ? -1 : hour,
    zodiac,
  };
}

// ---------- 輔助函式 ----------

/** 地支藏干對照表（來源：SRC-HIDDEN-STEMS-1） */
export const ZHI_HIDE_GAN: Readonly<Record<string, readonly string[]>> = ZHI_HIDDEN;

export function getHiddenTenGodsForZhi(zhi: string, dayMaster: string): string[] {
  const hiddenGan = ZHI_HIDE_GAN[zhi] || [];
  return hiddenGan.map(hGan => getTenGod(dayMaster, hGan));
}

/** 建立一個 Pillar 物件 */
function buildPillar(ganZhi: string): Pillar {
  // [AI MOD] 防護：ganZhi 應已是中文（甲子），而非 i18n 鍵（{tg.jia}{dz.zi}）
  if (!ganZhi || ganZhi.length < 2) {
    return { gan: '', zhi: '', hiddenGan: [], tenGod: '', hiddenTenGods: [] };
  }
  const gan = ganZhi.charAt(0);
  const zhi = ganZhi.charAt(1);
  const hiddenGan = ZHI_HIDE_GAN[zhi] || [];
  return { gan, zhi, hiddenGan, tenGod: '', hiddenTenGods: [] };
}

/** 設定所有柱位的十神 */
function setTenGods(pillars: Pillar[], dayMaster: string): Pillar[] {
  return pillars.map(pillar => {
    if (!pillar.gan || !pillar.zhi) {
      pillar.tenGod = '';
      pillar.hiddenTenGods = [];
      return pillar;
    }

    pillar.tenGod = getTenGod(dayMaster, pillar.gan);
    pillar.hiddenTenGods = pillar.hiddenGan.map(hGan => getTenGod(dayMaster, hGan));

    return pillar;
  });
}


export const DAY_MASTER_PERSONALITY: Record<string, string> = {
  '甲': '參天大樹。特質：直爽、堅強、有原則、剛正不阿、領導者、開創者、站姿挺拔、格局大、想做大事。不懂變通。',
  '乙': '藤蔓花草。特質：柔軟、靈活、執著度高、善於變通、借力使力、協調者、設計者、適應力強、懂得迂迴前進。',
  '丙': '太陽之火。特質：熱情、開朗、直接、照亮他人、喜歡照顧人、情緒鮮明、好勝、善關注、領導者、情緒外顯。',
  '丁': '燭光燈火。特質：溫暖、細膩、專注、溫柔體貼、持續穩定、照亮細節、內斂但持久、專注力強、療癒者、情緒內斂。',
  '戊': '高山大地。特質：穩重、包含、承載力強、可靠、有擔當、厚實、堅守原則、固執、守護者。',
  '己': '田園濕土。特質：滋養、細膩、靈活、善於培育、適應力強、溫厚務實、資源者。',
  '庚': '刀劍鋼鐵。特質：剛硬、果決、鋒利、正義感強、執行力高、改革者，不會藏事情。',
  '辛': '珠寶首飾。特質：敏銳、品味高雅、重視質感細節、做事追求完美、處事靈巧有彈性、品味者、專業技術。',
  '壬': '江河大海。特質：心胸格局開闊、流動、包容、智慧、適應力強、思維靈活、善於溝通、冒險者、智多星。',
  '癸': '雨露泉水。特質：默默堅持、長跑型選手、敏感體貼、細膩安靜、觀察入微、見解精闢、韌性強、堅持達成目標、支持者、顧問。',
};
