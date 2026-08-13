// src/constants.ts
// Shared lookup tables — single source of truth for elemental mappings

export const GAN_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

export const ZHI_TO_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

export const YANG_GANS = ['甲', '丙', '戊', '庚', '壬'];
const YIN_GANS = ['乙', '丁', '己', '辛', '癸'];

export function isSameYinYang(gan1: string, gan2: string): boolean {
  const yinYang1 = getYinYang(gan1);
  const yinYang2 = getYinYang(gan2);
  return yinYang1 !== null && yinYang2 !== null && yinYang1 === yinYang2;
}

/** 取得天干陰陽：0=陽, 1=陰, null=未知 */
export function getYinYang(gan: string): 0 | 1 | null {
  if (YANG_GANS.includes(gan)) return 0;
  if (YIN_GANS.includes(gan)) return 1;
  return null;
}

// 五行相生：key 生 value
export const ELEMENT_GENERATES: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

// 五行相剋：key 剋 value
export const ELEMENT_CONTROLS: Record<string, string> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

// 十神基礎關係表（同陰陽）— [AI MOD] 內部使用，不 export
const BASE_TEN_GOD_MAP: Record<string, Record<string, string>> = {
  '木': { '木': '比肩', '火': '食神', '土': '偏財', '金': '七殺', '水': '偏印' },
  '火': { '火': '比肩', '土': '食神', '金': '偏財', '水': '七殺', '木': '偏印' },
  '土': { '土': '比肩', '金': '食神', '水': '偏財', '木': '七殺', '火': '偏印' },
  '金': { '金': '比肩', '水': '食神', '木': '偏財', '火': '七殺', '土': '偏印' },
  '水': { '水': '比肩', '木': '食神', '火': '偏財', '土': '七殺', '金': '偏印' },
};

// [AI MOD] 內部使用，不 export
const YIN_YANG_TEN_GOD_SWAP: Record<string, string> = {
  '比肩': '劫財', '食神': '傷官', '偏財': '正財', '七殺': '正官', '偏印': '正印',
};

/**
 * 計算十神（相對於日主天干）
 */
export function getTenGod(dayGan: string, otherGan: string): string {
  const dayElement = GAN_TO_ELEMENT[dayGan];
  const otherElement = GAN_TO_ELEMENT[otherGan];
  if (!dayElement || !otherElement) return '未知';

  const base = BASE_TEN_GOD_MAP[dayElement]?.[otherElement];
  if (!base) return '未知';
  return isSameYinYang(dayGan, otherGan) ? base : (YIN_YANG_TEN_GOD_SWAP[base] ?? base);
}

/**
 * 十神分類（財星、官殺、食傷、印星、比劫）
 */
type TenGodCategory = '財星' | '官殺' | '食傷' | '印星' | '比劫';

export function getTenGodCategory(tenGod: string): TenGodCategory | '未知' {
  const map: Record<string, TenGodCategory> = {
    '正財': '財星', '偏財': '財星',
    '正官': '官殺', '七殺': '官殺',
    '食神': '食傷', '傷官': '食傷',
    '正印': '印星', '偏印': '印星',
    '比肩': '比劫', '劫財': '比劫',
  };
  return map[tenGod] ?? '未知';
}

// Alias for backward compatibility
export function getTenGodType(tenGod: string): TenGodCategory | '未知' {
  return getTenGodCategory(tenGod);
}

/**
 * 時辰對照表 — [AI MOD] 內部使用，不 export
 */
const SHI_CHEN_MAP: Record<number, string> = {
  0: '子時', 1: '丑時', 2: '丑時',
  3: '寅時', 4: '寅時', 5: '卯時', 6: '卯時',
  7: '辰時', 8: '辰時', 9: '巳時', 10: '巳時',
  11: '午時', 12: '午時', 13: '未時', 14: '未時',
  15: '申時', 16: '申時', 17: '酉時', 18: '酉時',
  19: '戌時', 20: '戌時', 21: '亥時', 22: '亥時',
  23: '子時（跨日）',
};

export function getShiChen(hourStr: string): string {
  if (!hourStr && hourStr !== '0') return '';
  const hour = parseInt(hourStr, 10);
  return SHI_CHEN_MAP[hour] || '';
}
