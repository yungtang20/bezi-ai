// src/pattern.ts
// [AI MOD] 依照定格局.pdf 完整改寫排盤判斷格局邏輯
// 來源講義：定格局.pdf（10頁）、天干地支合化條件.pdf（2頁）、天干地支含刑沖破害.pdf（10頁）

import { BaziChart } from './paipan';
import { GAN_TO_ELEMENT, YANG_GANS, getYinYang, ELEMENT_GENERATES, ELEMENT_CONTROLS, ZHI_TO_ELEMENT } from './constants';

// ==================== 基礎對應表 ====================

export const ZHI_TYPE: Record<string, string> = {
  '寅': '長生', '申': '長生', '巳': '長生', '亥': '長生',
  '子': '帝旺', '午': '帝旺', '卯': '帝旺', '酉': '帝旺',
  '辰': '墓庫', '戌': '墓庫', '丑': '墓庫', '未': '墓庫',
};

// ==================== 藏干（依照講義精確百分比） ====================

// 來源：天干地支合化條件.pdf P1
// [AI MOD] 內部型別，不 export
interface HiddenStemRatio {
  gan: string;
  ratio: number;  // 百分比
}

// [AI MOD] 內部常數，不 export（外部使用 ZHI_HIDDEN）
const ZHI_HIDDEN_DETAIL: Record<string, HiddenStemRatio[]> = {
  '子': [{ gan: '癸', ratio: 100 }],
  '丑': [{ gan: '己', ratio: 34 }, { gan: '辛', ratio: 33 }, { gan: '癸', ratio: 33 }],
  '寅': [{ gan: '甲', ratio: 50 }, { gan: '丙', ratio: 40 }, { gan: '戊', ratio: 10 }],
  '卯': [{ gan: '乙', ratio: 100 }],
  '辰': [{ gan: '戊', ratio: 33 }, { gan: '乙', ratio: 33 }, { gan: '癸', ratio: 33 }],
  '巳': [{ gan: '丙', ratio: 50 }, { gan: '戊', ratio: 40 }, { gan: '庚', ratio: 10 }],
  '午': [{ gan: '丁', ratio: 50 }, { gan: '己', ratio: 50 }],
  '未': [{ gan: '己', ratio: 40 }, { gan: '丁', ratio: 40 }, { gan: '乙', ratio: 20 }],
  '申': [{ gan: '庚', ratio: 50 }, { gan: '壬', ratio: 40 }, { gan: '戊', ratio: 10 }],
  '酉': [{ gan: '辛', ratio: 100 }],
  '戌': [{ gan: '戊', ratio: 45 }, { gan: '辛', ratio: 10 }, { gan: '丁', ratio: 45 }],
  '亥': [{ gan: '壬', ratio: 60 }, { gan: '甲', ratio: 40 }],
};

// 簡易藏干列表（向後相容 paipan.ts 使用）
export const ZHI_HIDDEN: Record<string, string[]> = Object.fromEntries(
  Object.entries(ZHI_HIDDEN_DETAIL).map(([zhi, stems]) => [zhi, stems.map(s => s.gan)])
);

// ==================== 濕土 / 燥土 ====================
// 來源：定格局.pdf P4 — 濕土：丑、辰（會生金）；燥土：未、戌

const WET_SOIL = ['丑', '辰'];
const DRY_SOIL = ['未', '戌'];

function isWetSoil(zhi: string): boolean {
  return WET_SOIL.includes(zhi);
}

function isDrySoil(zhi: string): boolean {
  return DRY_SOIL.includes(zhi);
}

// ==================== 天干五合 ====================
// 來源：天干地支合化條件.pdf P1

// ==================== 天干五合 / 地支六合 ====================
// 來源：天干地支合化條件.pdf P1

interface Harmony {
  pair: [string, string];
  result: string;  // 合化五行
  requiredMonth?: string[];  // 需在辰戌丑未月（僅天干五合）
}

function findHarmonyInList(list: Harmony[], a: string, b: string): Harmony | null {
  return list.find(h =>
    (h.pair[0] === a && h.pair[1] === b) || (h.pair[0] === b && h.pair[1] === a)
  ) || null;
}

const STEM_HARMONIES: Harmony[] = [
  { pair: ['甲', '己'], result: '土', requiredMonth: ['辰', '戌', '丑', '未'] },
  { pair: ['乙', '庚'], result: '金', requiredMonth: ['申', '酉'] },
  { pair: ['丙', '辛'], result: '水' },
  { pair: ['丁', '壬'], result: '木' },
  { pair: ['戊', '癸'], result: '火' },
];

function findStemHarmony(gan1: string, gan2: string): Harmony | null {
  return findHarmonyInList(STEM_HARMONIES, gan1, gan2);
}

const BRANCH_HARMONIES: Harmony[] = [
  { pair: ['子', '丑'], result: '土' },   // 合化濕土
  { pair: ['寅', '亥'], result: '木' },   // 合化木
  { pair: ['卯', '戌'], result: '火' },   // 合化火
  { pair: ['辰', '酉'], result: '金' },   // 合化金
  { pair: ['巳', '申'], result: '水' },   // 合化水
  { pair: ['午', '未'], result: '火' },   // 合化燥火
];

function findBranchHarmony(zhi1: string, zhi2: string): Harmony | null {
  return findHarmonyInList(BRANCH_HARMONIES, zhi1, zhi2);
}

// ==================== 三合局 / 三會局 ====================
// 來源：天干地支合化條件.pdf P5

// [AI MOD] 內部型別，不 export
interface TriadFormation {
  branches: string[];
  result: string;
}

export const TRIAD_GROUPS: TriadFormation[] = [
  { branches: ['申', '子', '辰'], result: '水' },
  { branches: ['寅', '午', '戌'], result: '火' },
  { branches: ['亥', '卯', '未'], result: '木' },
  { branches: ['巳', '酉', '丑'], result: '金' },
];

export const TRIAD_MEETINGS: TriadFormation[] = [
  { branches: ['寅', '卯', '辰'], result: '木' },
  { branches: ['巳', '午', '未'], result: '火' },
  { branches: ['申', '酉', '戌'], result: '金' },
  { branches: ['亥', '子', '丑'], result: '水' },
];

// ==================== 地支六沖 ====================
// 來源：天干地支含刑沖破害.pdf P8

const OPPOSING_PAIRS: [string, string][] = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

// ==================== 地支相刑 ====================
// 來源：天干地支含刑沖破害.pdf P8-9

// 三刑組合
const THREE_PUNISHMENTS: string[][] = [
  ['寅', '巳', '申'],  // 無恩之刑
  ['丑', '戌', '未'],  // 恃勢之刑
];

// 相刑組合（力量較弱）
const MUTUAL_PUNISHMENTS: [string, string][] = [
  ['子', '卯'],   // 恩愛之刑
  ['辰', '辰'],   // 自刑
  ['午', '午'],   // 自刑
  ['酉', '酉'],   // 自刑
  ['亥', '亥'],   // 自刑
  ['寅', '巳'],   // 力量較大
  ['巳', '申'],   // 力量較大
  ['未', '丑'],   // 力量較大
  ['未', '戌'],   // 力量較大
  ['戌', '丑'],   // 力量較大
];

// [AI MOD] 通用配對檢查（合并 hasPair / findHarmPair / findBreakPair）
function hasPair(pairs: [string, string][], a: string, b: string): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

// ==================== 庫的啟動條件 ====================
// 來源：定格局.pdf P2
// 辰：單獨屬土，遇壬癸→水庫，遇甲乙→木庫
// 未：單獨屬土，遇丙丁→火庫，遇甲乙→木庫
// 戌：單獨屬土，遇丙丁→火庫，遇戊己→土庫
// 丑：單獨屬土，遇庚辛→金庫

interface TombActivation {
  zhi: string;
  trigger: string[];  // 觸發的天干
  result: string;     // 成為什麼庫
}

const TOMB_ACTIVATIONS: TombActivation[] = [
  { zhi: '辰', trigger: ['壬', '癸'], result: '水庫' },
  { zhi: '辰', trigger: ['甲', '乙'], result: '木庫' },
  { zhi: '未', trigger: ['丙', '丁'], result: '火庫' },
  { zhi: '未', trigger: ['甲', '乙'], result: '木庫' },
  { zhi: '戌', trigger: ['丙', '丁'], result: '火庫' },
  { zhi: '戌', trigger: ['戊', '己'], result: '土庫' },
  { zhi: '丑', trigger: ['庚', '辛'], result: '金庫' },
];

// ==================== 主要介面 ====================

export interface PatternResult {
  pattern: '身強' | '身弱' | '從強' | '從弱';
  favorable: string[];      // 喜用神
  unfavorable: string[];    // 忌神
  score: number;            // 0-100 強弱分數
  weakestElement: string;
  weakestElements: string[]; // [AI MOD] 所有最弱五行（含被旺神重剋者，可能多個）
  reason?: string;          // 判斷理由（前端顯示用）
}

export interface PatternScores {
  strong: number;
  weak: number;
  followStrong: number;
  followWeak: number;
}

// [AI MOD] 內部型別，不 export
interface TenGodCount {
  god: string;
  count: number;
  isMainStar: boolean;
}

// ==================== 輔助函式 ====================

/** 判斷某五行是否為日主的「印比」（生我或同我） */
function isSupporting(dayElement: string, other: string): boolean {
  return other === dayElement || ELEMENT_GENERATES[other] === dayElement;
}

/** 判斷某五行是否為日主的「剋洩耗」（剋我、我剋、我生） */
function isDraining(dayElement: string, other: string): boolean {
  return other !== dayElement && ELEMENT_GENERATES[other] !== dayElement;
}

/** 取得生我的五行（印星五行） */
function getGeneratingElement(dayElement: string): string {
  return Object.entries(ELEMENT_GENERATES).find(([_, v]) => v === dayElement)?.[0] || '';
}

// ==================== 刑沖合掃描 ====================
// 來源：定格局.pdf P1 — 優先級：刑 > 沖 > 合

interface PillarInteraction {
  type: '刑' | '沖' | '合' | '害' | '破';
  pillars: [number, number];  // 柱位索引 0=年 1=月 2=日 3=時
  result?: string;  // 合化後的五行
  description: string;
}

/**
 * 掃描命盤中所有柱位的刑沖合互動
 * 回傳被破壞或牽制的柱位索引集合
 */
function scanInteractions(chart: BaziChart): {
  interactions: PillarInteraction[];
  damagedPillars: Set<number>;
  harmonyResults: Map<number, string>;  // 柱位 → 合化後五行
} {
  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
  const gans = [chart.year.gan, chart.month.gan, chart.day.gan, chart.hour.gan];
  const interactions: PillarInteraction[] = [];
  const damagedPillars = new Set<number>();
  const harmonyResults = new Map<number, string>();

  // 所有柱位配對（只算相鄰+年日、月時，共6組）
  const pairs: [number, number][] = [
    [0, 1], [1, 2], [2, 3],  // 相鄰
    [0, 2], [1, 3], [0, 3],  // 間隔
  ];

  for (const [i, j] of pairs) {
    const zhiA = zhis[i];
    const zhiB = zhis[j];
    const ganA = gans[i];
    const ganB = gans[j];
    if (!zhiA || !zhiB || !ganA || !ganB) continue;

    // 1. 刑（最高優先級）
    const isPunishment = MUTUAL_PUNISHMENTS.some(p =>
      (p[0] === zhiA && p[1] === zhiB) || (p[0] === zhiB && p[1] === zhiA)
    );
    const isThreePunishment = THREE_PUNISHMENTS.some(triad =>
      triad.includes(zhiA) && triad.includes(zhiB)
    );
    if (isPunishment || isThreePunishment) {
      interactions.push({
        type: '刑',
        pillars: [i, j],
        description: `${zhiA}${zhiB}相刑`
      });
      damagedPillars.add(i);
      damagedPillars.add(j);
      continue;  // 刑優先，跳過後續判斷
    }

    // 2. 沖
    if (hasPair(OPPOSING_PAIRS, zhiA, zhiB)) {
      interactions.push({
        type: '沖',
        pillars: [i, j],
        description: `${zhiA}${zhiB}相沖`
      });
      damagedPillars.add(i);
      damagedPillars.add(j);
      continue;  // 沖優先於合
    }

    // 3. 合（地支六合）
    const branchHarmony = findBranchHarmony(zhiA, zhiB);
    if (branchHarmony) {
      // 檢查合化條件（是否相鄰、是否透干、化神是否被剋）
      const isAdjacent = Math.abs(i - j) === 1;
      if (isAdjacent) {
        // 檢查透干：合化五行需透出天干
        const resultElement = branchHarmony.result;
        const resultGans = Object.entries(GAN_TO_ELEMENT)
          .filter(([_, el]) => el === resultElement)
          .map(([gan, _]) => gan);
        const hasTouGan = resultGans.some(gan => gans.includes(gan));

        // 檢查化神是否被剋
        const controllingElement = ELEMENT_CONTROLS[resultElement];
        const controllingGans = Object.entries(GAN_TO_ELEMENT)
          .filter(([_, el]) => el === controllingElement)
          .map(([gan, _]) => gan);
        const isControlled = controllingGans.some(gan => gans.includes(gan));

        if (hasTouGan && !isControlled) {
          // 合化成功
          interactions.push({
            type: '合',
            pillars: [i, j],
            result: resultElement,
            description: `${zhiA}${zhiB}合化${resultElement}`
          });
          harmonyResults.set(i, resultElement);
          harmonyResults.set(j, resultElement);
        } else {
          // 合絆（合而不化）
          interactions.push({
            type: '合',
            pillars: [i, j],
            description: `${zhiA}${zhiB}合絆（不合化）`
          });
          damagedPillars.add(i);
          damagedPillars.add(j);
        }
      }
      continue;
    }
  }

  // 天干五合（獨立於地支）
  for (const [i, j] of pairs) {
    const stemHarmony = findStemHarmony(gans[i], gans[j]);
    if (stemHarmony) {
      // 天干合化條件較寬鬆，這裡記錄但不一定成立
      interactions.push({
        type: '合',
        pillars: [i, j],
        result: stemHarmony.result,
        description: `${gans[i]}${gans[j]}合化${stemHarmony.result}`
      });
    }
  }

  return { interactions, damagedPillars, harmonyResults };
}

// ==================== 三合/半合/三會掃描 ====================

interface CombinedFormation {
  type: '三合' | '半合' | '三會' | '暗拱';
  branches: string[];
  missing?: string;  // 半合/暗拱缺少的地支
  result: string;
  pillarIndices: number[];
}

function scanCombinedFormations(chart: BaziChart): CombinedFormation[] {
  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
  const formations: CombinedFormation[] = [];

  // 三會局（最優先，力量最大）
  for (const meeting of TRIAD_MEETINGS) {
    const found = meeting.branches.filter(b => zhis.includes(b));
    if (found.length === 3) {
      const indices = meeting.branches.map(b => zhis.indexOf(b));
      formations.push({
        type: '三會',
        branches: meeting.branches,
        result: meeting.result,
        pillarIndices: indices,
      });
    }
  }

  // 三合局
  for (const group of TRIAD_GROUPS) {
    const found = group.branches.filter(b => zhis.includes(b));
    if (found.length === 3) {
      const indices = group.branches.map(b => zhis.indexOf(b));
      formations.push({
        type: '三合',
        branches: group.branches,
        result: group.result,
        pillarIndices: indices,
      });
    } else if (found.length === 2) {
      // 半合或暗拱
      const missing = group.branches.find(b => !zhis.includes(b));
      const indices = found.map(b => zhis.indexOf(b));
      formations.push({
        type: '半合',
        branches: found,
        missing,
        result: group.result,
        pillarIndices: indices,
      });
    }
  }

  return formations;
}

// ==================== 庫的啟動判斷 ====================

interface TombInfo {
  zhi: string;
  pillarIndex: number;
  activated: boolean;
  tombType: string;
  element: string;
}

function checkTombActivation(chart: BaziChart): TombInfo[] {
  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
  const allGans = [chart.year.gan, chart.month.gan, chart.day.gan, chart.hour.gan];
  const tombs: TombInfo[] = [];

  zhis.forEach((zhi, idx) => {
    const activation = TOMB_ACTIVATIONS.find(a => a.zhi === zhi);
    if (activation) {
      const hasTrigger = activation.trigger.some(gan => allGans.includes(gan));
      tombs.push({
        zhi,
        pillarIndex: idx,
        activated: hasTrigger,
        tombType: hasTrigger ? activation.result : '未啟動',
        element: ZHI_TO_ELEMENT[zhi],
      });
    }
  });

  return tombs;
}

// ==================== 透干判斷 ====================
// 來源：定格局.pdf P2
// 透干 = 地支所藏能量顯現在天干上

interface TouGanInfo {
  zhi: string;
  hiddenStem: string;
  appearsInGan: boolean;
  ganPosition?: number;  // 出現在哪個柱位的天干
}

function checkTouGan(chart: BaziChart): TouGanInfo[] {
  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
  const gans = [chart.year.gan, chart.month.gan, chart.day.gan, chart.hour.gan];
  const result: TouGanInfo[] = [];

  zhis.forEach((zhi) => {
    const hiddenStems = ZHI_HIDDEN[zhi] || [];
    hiddenStems.forEach(hGan => {
      const pos = gans.indexOf(hGan);
      result.push({
        zhi,
        hiddenStem: hGan,
        appearsInGan: pos >= 0,
        ganPosition: pos >= 0 ? pos : undefined,
      });
    });
  });

  return result;
}

// ==================== 貪生忘剋 ====================
// 來源：定格局.pdf P4
// 貪生忘剋：只有在旁邊的柱才會引起，但最後一定要生到日主
// 例如：木 (生)←火 (生)←土 → 化解木剋土

/**
 * 檢查是否存在貪生忘剋的組合
 * 回傳被化解的相剋關係
 */
function checkShengWangKe(chart: BaziChart): { from: number; to: number; via: number; element: string }[] {
  const gans = [chart.year.gan, chart.month.gan, chart.day.gan, chart.hour.gan];
  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
  const resolved: { from: number; to: number; via: number; element: string }[] = [];

  // 簡化版：檢查天干
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i === j) continue;
      const elI = GAN_TO_ELEMENT[gans[i]];
      const elJ = GAN_TO_ELEMENT[gans[j]];
      if (!elI || !elJ) continue;
      // i 剋 j
      if (ELEMENT_CONTROLS[elI] === elJ) {
        // 找中間是否有「通關」的五行
        for (let k = 0; k < 4; k++) {
          if (k === i || k === j) continue;
          const elK = GAN_TO_ELEMENT[gans[k]];
          if (!elK) continue;
          // i 生 k, k 生 j → 貪生忘剋
          if (ELEMENT_GENERATES[elI] === elK && ELEMENT_GENERATES[elK] === elJ) {
            resolved.push({ from: i, to: j, via: k, element: elK });
          }
        }
      }
    }
  }

  return resolved;
}

// ==================== 核心：格局判定 ====================

/**
 * 根據加權分數，初始化四格局的起始分數
 */
export function initPatternScores(weightedScore: number): PatternScores {
  if (weightedScore > 80) return { strong: 20, weak: 20, followStrong: 80, followWeak: 20 };
  if (weightedScore < 20) return { strong: 20, weak: 20, followStrong: 20, followWeak: 80 };
  if (weightedScore >= 45) return { strong: 80, weak: 20, followStrong: 30, followWeak: 10 };
  return { strong: 20, weak: 80, followStrong: 10, followWeak: 30 };
}

/**
 * 取得當前最高分的格局名稱
 */
export function getPrimaryPattern(scores: PatternScores): '身強' | '身弱' | '從強' | '從弱' {
  const max = Math.max(scores.strong, scores.weak, scores.followStrong, scores.followWeak);
  if (scores.strong === max) return '身強';
  if (scores.weak === max) return '身弱';
  if (scores.followStrong === max) return '從強';
  return '從弱';
}

/**
 * 找最弱五行
 *
 * 邏輯：
 * 1. 先找命盤中數量最少的五行（minElement）
 * 2. 再檢查「旺神剋弱行」：當某五行極旺（>= 3.0），其「所剋」的五行若相對偏弱（<= 2.2），
 *    則被剋的五行必因重剋而成為健康最大威脅（如 土旺剋水）
 * 3. 若同時有多個五行並列為最大值，需逐一檢查其「所剋」五行，
 *    優先返回被剋且數量最少的五行（即健康威脅最大者）
 * 4. 最終若無上述條件，返回數量最少的五行
 */
// [AI MOD] 內部使用，不 export
// 回傳所有最弱五行（可能多個）：第一個是主要顯示用，其餘是同樣弱或同样被重剋的
function findWeakestElement(chart: BaziChart): string[] {
  const count = getAllElementsInChart(chart);
  let minElement = '木';
  let minValue = 999;

  Object.entries(count).forEach(([el, val]) => {
    if (val < minValue) {
      minValue = val;
      minElement = el;
    }
  });

  // [AI MOD] 旺神剋弱行優先提示：當某五行極旺（>= 3.0），受剋的五行若相對偏弱（<= 2.2），
  // 則被剋的五行必因重剋而成為健康最大威脅（如 土旺剋水）
  const maxCount = Math.max(...Object.values(count));
  if (maxCount >= 3.0) {
    const maxEntries = Object.entries(count).filter(([, v]) => v === maxCount);

    // 遍歷所有旺神，收集所有被剋且數量最少的五行（可能有多個同樣弱）
    const controlledCandidates: string[] = [];
    let weakestControlledValue = 999;
    for (const [maxEl] of maxEntries) {
      const controlled = ELEMENT_CONTROLS[maxEl];
      if (controlled && count[controlled] <= 2.2) {
        if (count[controlled] < weakestControlledValue) {
          controlledCandidates.length = 0;
          controlledCandidates.push(controlled);
          weakestControlledValue = count[controlled];
        } else if (count[controlled] === weakestControlledValue) {
          if (!controlledCandidates.includes(controlled)) {
            controlledCandidates.push(controlled);
          }
        }
      }
    }

    if (controlledCandidates.length > 0) {
      return controlledCandidates;
    }
  }

  // 若旺神剋弱行條件不滿足，收集所有數量 <= 1.5 的五行
  const allControlled = Object.entries(count)
    .filter(([, val]) => val <= 1.5)
    .sort((a, b) => a[1] - b[1]);
  if (allControlled.length > 0) {
    return allControlled.map(([el]) => el);
  }

  return [minElement];
}

/**
 * 計算命盤中各五行總量（僅含天干與地支本氣，不數支藏干，維持八字為整數個數）
 */
function getAllElementsInChart(chart: BaziChart): Record<string, number> {
  const count: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  const gans = [chart.year.gan, chart.month.gan, chart.day.gan, chart.hour.gan];
  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];

  // 天干
  gans.forEach(g => {
    const e = GAN_TO_ELEMENT[g];
    if (e) count[e]++;
  });

  // 地支：僅計算地支本氣，不數支藏干
  zhis.forEach(z => {
    const main = ZHI_TO_ELEMENT[z];
    if (main) count[main]++;
  });

  return count;
}

// ==================== 核心：determinePattern ====================

/**
 * 判定格局 — 依照定格局.pdf 完整規則
 *
 * 步驟：
 * 1. 掃描天干地支的所有互動（刑、沖、合）
 * 2. 根據優先級（刑 > 沖 > 合）決定哪些位置的能量被破壞或牽制
 * 3. 判斷互動後的「新屬性」是否為日主的「印比」
 * 4. 只有當新屬性是「印比」時，才執行「負變正」加分
 * 5. 計算加分項（生我、同我）的精確權重
 * 6. 計算扣分項（剋我、我剋、我生）
 * 7. 貪生忘剋、透干、庫、三合半合三會
 * 8. 依總分判定格局
 */
export function determinePattern(chart: BaziChart): PatternResult {
  const dayMaster = chart.dayMaster;
  const dayElement = GAN_TO_ELEMENT[dayMaster];

  const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
  const gans = [chart.year.gan, chart.month.gan, chart.day.gan, chart.hour.gan];
  const isHourEmpty = !chart.hour.gan || !chart.hour.zhi;

  // 權重（來源：定格局.pdf P1）
  // 天干：5% 5% 5% 5%（年/月/日/時）
  // 地支：10% 20% 35% 20%（年/月/日/時）
  const ganWeights = [5, 5, 5, isHourEmpty ? 0 : 5];
  const zhiWeights = [10, 20, 35, isHourEmpty ? 0 : 20];

  // 總分 = 加分項百分比（0~100）
  let positiveScore = 0;
  let negativeScore = 0;
  const reasons: string[] = [];

  // 1. 掃描刑沖合
  const { interactions, damagedPillars, harmonyResults } = scanInteractions(chart);

  // 2. 掃描三合/半合/三會
  const formations = scanCombinedFormations(chart);

  // 3. 掃描庫的啟動
  const tombs = checkTombActivation(chart);

  // 4. 透干
  const touGan = checkTouGan(chart);

  // 5. 貪生忘剋
  const shengWangKe = checkShengWangKe(chart);

  // 6. 逐柱計算
  for (let i = 0; i < 4; i++) {
    const ganEl = GAN_TO_ELEMENT[gans[i]];
    const zhiMain = ZHI_TO_ELEMENT[zhis[i]];
    const hiddenEls = (ZHI_HIDDEN[zhis[i]] || []).map(h => GAN_TO_ELEMENT[h]);

    // 檢查此柱是否被合化
    const harmonyResult = harmonyResults.get(i);
    const isDamaged = damagedPillars.has(i);

    // 天干加分/扣分
    let ganSupport = 0;
    if (harmonyResult) {
      // 合化後的新屬性
      if (isSupporting(dayElement, harmonyResult)) {
        ganSupport += ganWeights[i];
        reasons.push(`P${i+1}天干合化${harmonyResult}（印比）→ 負變正加分`);
      }
    } else if (!isDamaged) {
      if (isSupporting(dayElement, ganEl)) {
        ganSupport += ganWeights[i];
      } else {
        // 扣分項：剋我、我剋、我生
        negativeScore += ganWeights[i] * 0.5;
      }
    }

    // 地支加分/扣分
    let zhiSupport = 0;
    if (harmonyResult) {
      if (isSupporting(dayElement, harmonyResult)) {
        zhiSupport += zhiWeights[i];
        reasons.push(`P${i+1}地支合化${harmonyResult}（印比）→ 負變正加分`);
      }
    } else if (!isDamaged) {
      if (isSupporting(dayElement, zhiMain)) {
        zhiSupport += zhiWeights[i];
      } else {
        negativeScore += zhiWeights[i] * 0.5;
      }

      // 藏干加分
      hiddenEls.forEach(h => {
        if (isSupporting(dayElement, h)) {
          zhiSupport += zhiWeights[i] * 0.3;  // 藏干權重較低
        }
      });
    }

    positiveScore += ganSupport + zhiSupport;
  }

  // 7. 三合/三會加分（只計算對日主加分的）
  for (const formation of formations) {
    if (isSupporting(dayElement, formation.result)) {
      const bonus = formation.type === '三會' ? 15 : (formation.type === '三合' ? 10 : 5);
      positiveScore += bonus;
      reasons.push(`${formation.type}(${formation.branches.join('')})→${formation.result}（印比）+${bonus}`);
    }
  }

  // 8. 庫的加分
  for (const tomb of tombs) {
    if (tomb.activated) {
      // 庫被啟動，檢查啟動後的五行是否為日主加分
      const actualElement = tomb.tombType.replace('庫', '');
      if (isSupporting(dayElement, actualElement)) {
        positiveScore += 5;
        reasons.push(`${tomb.zhi}啟動為${tomb.tombType}（印比）+5`);
      }
    }
  }

  // 9. 透干加分
  for (const tg of touGan) {
    if (tg.appearsInGan) {
      const hElement = GAN_TO_ELEMENT[tg.hiddenStem];
      if (isSupporting(dayElement, hElement)) {
        positiveScore += 3;
        reasons.push(`${tg.zhi}藏${tg.hiddenStem}透干於P${tg.ganPosition!+1}+3`);
      }
    }
  }

  // 10. 貪生忘剋（化解扣分）
  for (const swk of shengWangKe) {
    negativeScore -= 2;
    reasons.push(`貪生忘剋：P${swk.from+1}→P${swk.via+1}→P${swk.to+1}（化解${swk.element}相剋）`);
  }

  // 11. 最終分數
  const scale = isHourEmpty ? (105 / 80) : 1;
  const scaledPositive = positiveScore * scale;
  const scaledNegative = negativeScore * scale;
  const finalScore = Math.max(0, Math.min(100, scaledPositive - scaledNegative));

  // 12. 判定格局
  let pattern: '身強' | '身弱' | '從強' | '從弱';
  let reason: string;

  // 從格嚴格判斷：需檢查是否有根
  const hasRoot = zhis.some(z => z && isSupporting(dayElement, ZHI_TO_ELEMENT[z]));

  if (finalScore > 80 && !hasRoot) {
    pattern = '從強';
    reason = `加分項超過80%且無強根 → 從強格（分數：${finalScore.toFixed(1)}）`;
  } else if (finalScore < 20 && !hasRoot) {
    pattern = '從弱';
    reason = `加分項少於20%且無強根 → 從弱格（分數：${finalScore.toFixed(1)}）`;
  } else if (finalScore >= 45) {
    pattern = '身強';
    reason = `加分項${finalScore.toFixed(1)}%（≥45%）→ 身強`;
  } else {
    pattern = '身弱';
    reason = `加分項${finalScore.toFixed(1)}%（<45%）→ 身弱`;
  }

  if (reasons.length > 0) {
    reason += ` | ${reasons.slice(0, 5).join('；')}`;
  }

  const { favorable, unfavorable } = getFavorableElements(dayMaster, pattern);
  const weakestElements = findWeakestElement(chart);

  return {
    pattern,
    favorable,
    unfavorable,
    score: Math.round(finalScore),
    weakestElement: weakestElements[0] || '木',
    weakestElements,
    reason,
  };
}

// ==================== 用神判斷 ====================

export function getFavorableElements(dayMaster: string, pattern: string): { favorable: string[]; unfavorable: string[] } {
  const dayElement = GAN_TO_ELEMENT[dayMaster];
  const generateMe = getGeneratingElement(dayElement);

  const supports = [generateMe, dayElement].filter(Boolean);
  const others = ['木', '火', '土', '金', '水'].filter(e => !supports.includes(e));

  // 來源：定格局.pdf P3
  // 身強：喜用神（剋我、我剋、我生）
  // 身弱：喜用神（生我、同我）
  // 從強：喜用神（生我、同我）— 與身弱相同
  // 從弱：喜用神（剋我、我剋、我生）— 與身強相同
  const useSupport = ['身弱', '從強'].includes(pattern);

  return {
    favorable: useSupport ? supports : others,
    unfavorable: useSupport ? others : supports,
  };
}

// ==================== 十神統計 ====================

export function countTenGods(chart: BaziChart): TenGodCount[] {
  const pillars = [
    { pillar: chart.year, isMain: true },
    { pillar: chart.month, isMain: true },
    { pillar: chart.day, isMain: true },
    { pillar: chart.hour, isMain: true },
  ];

  const countMap: Record<string, number> = {};
  for (const { pillar } of pillars) {
    if (pillar.tenGod) {
      countMap[pillar.tenGod] = (countMap[pillar.tenGod] || 0) + 1;
    }
  }

  return Object.entries(countMap).map(([god, count]) => ({
    god,
    count,
    isMainStar: true,
  }));
}

// ==================== 流年定盤 ====================

// 來源：定格局.pdf P2
const YEAR_CHECK_MAP: Record<string, { strong: number[]; weak: number[]; followStrong: number[]; followWeak: number[] }> = {
  '金': {
    strong: [2020, 2021],
    weak: [2018, 2025],
    followStrong: [2020, 2021],
    followWeak: [2018, 2025],
  },
  '木': {
    strong: [2023, 2024],
    weak: [2018, 2025],
    followStrong: [2020, 2021],
    followWeak: [2018, 2025],
  },
  '水': {
    strong: [2020, 2021],
    weak: [2018, 2025],
    followStrong: [2020, 2021],
    followWeak: [2018, 2025],
  },
  '火': {
    strong: [2018, 2025],
    weak: [2023, 2024],
    followStrong: [2020, 2021],
    followWeak: [2018, 2025],
  },
  '土': {
    strong: [2018, 2025],
    weak: [2023, 2024],
    followStrong: [2020, 2021],
    followWeak: [2018, 2025],
  },
};

export function getCheckYears(dayMasterElement: string, initialPattern: string): number[] {
  const map = YEAR_CHECK_MAP[dayMasterElement];
  if (!map) return [];

  const patternKeyMap: Record<string, keyof typeof map> = {
    '身強': 'strong',
    '身弱': 'weak',
    '從強': 'followStrong',
    '從弱': 'followWeak'
  };

  const key = patternKeyMap[initialPattern] || 'strong';
  return map[key];
}
