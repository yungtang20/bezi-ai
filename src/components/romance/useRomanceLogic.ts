// useRomanceLogic — 姻緣頁計算邏輯（從 RomancePage 抽出）。
// 純資料轉換：由 chart / pattern / 使用者偏好推導姻緣判斷所需全部中間狀態。
import { useMemo } from "react";
import { BaziChart } from "../../paipan";
import { PatternScores, determinePattern, getPatternLabel, PATTERN_CONTINUUM_NOTE } from "../../pattern";
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from "../../constants";
import { calculateDaYun, getTenGodForDaYun, getDaYunQuality, getLiuNian } from "../../dayun";
import { checkXiangXing } from "../../matchmaking";
import {
  getSpouseTrait,
  TEN_GOD_TRAITS,
  getCompatibilityRule,
  PEACH_BLOSSOM_CRISIS,
  LECTURE_DATA,
  ZHI_TO_ZODIAC,
  ZODIAC_TRIPLE_MAP,
} from "../../data";
import { DAY_MASTER_FENG_SHUI } from "../../data/charts/romanceFengShui";

export interface RomanceLogicResult {
  patternResult: ReturnType<typeof determinePattern>;
  patternLabel: string;
  isContinuum: boolean;
  isMale: boolean;
  dayZhi: string;
  dayZhiType: string;
  tenGodCounts: Record<string, number>;
  maxGodInfo: { name: string; count: number };
  selfCompatibility: ReturnType<typeof getCompatibilityRule>;
  spouseStarScan: {
    star: string;
    location: string;
    pillarGanZhi: string;
    tenGod: string;
    index: number;
  } | null;
  spouseTrait: ReturnType<typeof getSpouseTrait>;
  spouseTenGodForTraits: string;
  tenGodTraitInfo: typeof TEN_GOD_TRAITS[keyof typeof TEN_GOD_TRAITS] | null;
  monthZhi: string;
  hourZhi: string;
  yearZhi: string;
  dayBranch: string;
  hasClash: boolean;
  hasPunishment: boolean;
  hasHarm: boolean;
  spouseStarHasClash: boolean;
  spouseStarHasPunishment: boolean;
  currentYear: number;
  currentAge: number;
  daYunList: ReturnType<typeof calculateDaYun>;
  currentDaYun: ReturnType<typeof calculateDaYun>[number] | undefined;
  currentLiuNian: ReturnType<typeof getLiuNian>;
  remedyKey: "身強" | "身弱_平衡" | "身弱_不平衡";
  romanceRemedy: string;
  isCrisis: boolean;
  isGoodForBreakup: boolean;
  dayMasterElement: string;
  userFengShuiDetail: typeof DAY_MASTER_FENG_SHUI[keyof typeof DAY_MASTER_FENG_SHUI]["genderGuide"]["男"] | undefined;
}

export function useRomanceLogic({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElements,
}: {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElements: string[];
}): RomanceLogicResult {
  const patternResult = useMemo(() => determinePattern(chart), [chart]);
  const patternLabel = getPatternLabel(patternResult, primaryPattern);
  const isContinuous = patternResult.isContinuum && primaryPattern === patternResult.pattern;

  const isMale = chart.gender === "男";
  const dayZhi = chart.day.zhi;

  const ZHI_TYPE: Record<string, string> = {
    子: "子午卯酉", 午: "子午卯酉", 卯: "子午卯酉", 酉: "子午卯酉",
    寅: "寅申巳亥", 申: "寅申巳亥", 巳: "寅申巳亥", 亥: "寅申巳亥",
    辰: "辰戌丑未", 戌: "辰戌丑未", 丑: "辰戌丑未", 未: "辰戌丑未",
  };

  const dayZhiType = ZHI_TYPE[dayZhi] || "子午卯酉";

  // 1. 我是怎麼判斷的 — 命盤十神全盤統計
  const tenGodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const add = (god: string) => {
      if (god && god !== "日主") {
        counts[god] = (counts[god] || 0) + 1;
      }
    };
    // 天干十神
    if (chart.year.tenGod) add(chart.year.tenGod);
    if (chart.month.tenGod) add(chart.month.tenGod);
    if (chart.hour.tenGod) add(chart.hour.tenGod);
    // 地支本氣與藏干十神
    if (chart.year.hiddenTenGods) chart.year.hiddenTenGods.forEach(add);
    if (chart.month.hiddenTenGods) chart.month.hiddenTenGods.forEach(add);
    if (chart.day.hiddenTenGods) chart.day.hiddenTenGods.forEach(add);
    if (chart.hour.hiddenTenGods) chart.hour.hiddenTenGods.forEach(add);
    return counts;
  }, [chart]);

  // 取個數最多者 (十神大勢)
  const maxGodInfo = useMemo(() => {
    let maxGod = "比肩";
    let maxCount = 0;
    for (const [god, count] of Object.entries(tenGodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxGod = god;
      }
    }
    return { name: maxGod, count: maxCount };
  }, [tenGodCounts]);

  const selfCompatibility = getCompatibilityRule(maxGodInfo.name);

  // 2. 搜尋夫妻星所處位置
  const targetGods = isMale ? ["正財", "偏財"] : ["正官", "七殺"];
  const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
  const pillars = [chart.year, chart.month, chart.day, chart.hour];

  const spouseStarScan = useMemo(() => {
    // 優先天干
    for (let i = 0; i < pillars.length; i++) {
      if (targetGods.includes(pillars[i].tenGod)) {
        return {
          star: `${pillars[i].gan} (${pillars[i].tenGod})`,
          location: pillarNames[i] + "天干",
          pillarGanZhi: `${pillars[i].gan}${pillars[i].zhi}`,
          tenGod: pillars[i].tenGod,
          index: i,
        };
      }
    }
    // 次之地支主氣
    for (let i = 0; i < pillars.length; i++) {
      if (pillars[i].hiddenTenGods && pillars[i].hiddenTenGods.length > 0) {
        const mainTenGod = pillars[i].hiddenTenGods[0];
        if (targetGods.includes(mainTenGod)) {
          return {
            star: `${pillars[i].hiddenGan[0]} (${mainTenGod})`,
            location: pillarNames[i] + "地支主氣",
            pillarGanZhi: `${pillars[i].gan}${pillars[i].zhi}`,
            tenGod: mainTenGod,
            index: i,
          };
        }
      }
    }
    // 再次之地支餘氣
    for (let i = 0; i < pillars.length; i++) {
      if (pillars[i].hiddenTenGods && pillars[i].hiddenTenGods.length > 1) {
        for (let idx = 1; idx < pillars[i].hiddenTenGods.length; idx++) {
          const subTenGod = pillars[i].hiddenTenGods[idx];
          if (targetGods.includes(subTenGod)) {
            return {
              star: `${pillars[i].hiddenGan[idx]} (${subTenGod})`,
              location: pillarNames[i] + "地支非主氣",
              pillarGanZhi: `${pillars[i].gan}${pillars[i].zhi}`,
              tenGod: subTenGod,
              index: i,
            };
          }
        }
      }
    }
    return null;
  }, [pillars, isMale]);

  const traitsTargetGanZhi = spouseStarScan?.pillarGanZhi || `${chart.day.gan}${chart.day.zhi}`;
  const spouseTrait = getSpouseTrait(traitsTargetGanZhi);
  const spouseTenGodForTraits = spouseStarScan?.tenGod || (chart.day.hiddenTenGods && chart.day.hiddenTenGods[0]);
  const tenGodTraitInfo = spouseTenGodForTraits ? TEN_GOD_TRAITS[spouseTenGodForTraits] : null;

  // 夫妻宮地支沖、刑、害判定
  const monthZhi = chart.month.zhi;
  const hourZhi = chart.hour.zhi;
  const yearZhi = chart.year.zhi;
  const dayBranch = chart.day.zhi;

  const clutchPairs: Record<string, string> = {
    子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
    卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
  };

  const harmPairs: Record<string, string> = {
    子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
    卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉",
  };

  const hasClash = clutchPairs[dayBranch] === monthZhi || clutchPairs[dayBranch] === hourZhi;
  const hasPunishment = checkXiangXing(dayBranch, monthZhi) || checkXiangXing(dayBranch, hourZhi);
  const hasHarm = harmPairs[dayBranch] === monthZhi || harmPairs[dayBranch] === hourZhi;

  let spouseStarHasClash = false;
  let spouseStarHasPunishment = false;

  if (spouseStarScan && spouseStarScan.index !== null) {
    const sZhi = pillars[spouseStarScan.index].zhi;
    const zhiArr = [yearZhi, monthZhi, dayBranch, hourZhi];
    const sIdx = spouseStarScan.index;

    if (sIdx > 0) {
      if (clutchPairs[sZhi] === zhiArr[sIdx - 1]) spouseStarHasClash = true;
      if (checkXiangXing(sZhi, zhiArr[sIdx - 1])) spouseStarHasPunishment = true;
    }
    if (sIdx < 3) {
      if (clutchPairs[sZhi] === zhiArr[sIdx + 1]) spouseStarHasClash = true;
      if (checkXiangXing(sZhi, zhiArr[sIdx + 1])) spouseStarHasPunishment = true;
    }
  }

  // 3. 歲運感情與財富起伏
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;
  const daYunList = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = useMemo(() => {
    return daYunList.find((dy) => currentAge >= dy.startAge && currentAge <= dy.startAge + 9);
  }, [daYunList, currentAge]);
  const currentLiuNian = useMemo(() => getLiuNian(currentYear, chart.dayMaster), [currentYear, chart.dayMaster]);

  // 補運判定
  let remedyKey: "身強" | "身弱_平衡" | "身弱_不平衡" = "身強";
  if (primaryPattern.includes("弱")) {
    let isBalanced = false;
    if (currentDaYun) {
      if (chart.dayMaster === "癸" && chart.gender === "男" && currentDaYun.ganZhi === "壬午") {
        isBalanced = true;
      } else {
        const daYunQuality = getDaYunQuality(currentDaYun.gan, currentDaYun.zhi, favorable, unfavorable);
        if (daYunQuality === "好運") {
          isBalanced = true;
        }
      }
    }
    remedyKey = isBalanced ? "身弱_平衡" : "身弱_不平衡";
  }

  const romanceRemedy =
    LECTURE_DATA.ROMANCE_REMEDY[remedyKey]?.[isMale ? "男" : "女"] ||
    (isMale ? "補財" : "補官殺");

  let isCrisis = false;
  let isGoodForBreakup = false;

  if (currentDaYun) {
    const daYunGanTenGod = getTenGodForDaYun(chart.dayMaster, currentDaYun.gan);
    const daYunZhiTenGod = getTenGodForDaYun(chart.dayMaster, currentDaYun.zhi);
    if (isMale) {
      if (["正財", "偏財"].includes(daYunGanTenGod) && ["比肩", "劫財"].includes(daYunZhiTenGod)) isCrisis = true;
      if (["比肩", "劫財"].includes(daYunGanTenGod) && ["正財", "偏財"].includes(daYunZhiTenGod)) isCrisis = true;
    } else {
      if (["正官", "七殺"].includes(daYunGanTenGod) && ["比肩", "劫財"].includes(daYunZhiTenGod)) isCrisis = true;
      if (["比肩", "劫財"].includes(daYunGanTenGod) && ["正官", "七殺"].includes(daYunZhiTenGod)) isCrisis = true;
    }

    if (primaryPattern.includes("弱")) {
      if (["正印", "偏印", "比肩", "劫財"].includes(daYunGanTenGod)) isGoodForBreakup = true;
    } else {
      if (["食神", "傷官", "正財", "偏財", "正官", "七殺"].includes(daYunGanTenGod)) isGoodForBreakup = true;
    }
  }

  const dayMasterElement = GAN_TO_ELEMENT[chart.dayMaster] || "金";
  const userFengShuiDetail = DAY_MASTER_FENG_SHUI[dayMasterElement]?.genderGuide[isMale ? "男" : "女"];

  return {
    patternResult,
    patternLabel,
    isContinuum: isContinuous,
    isMale,
    dayZhi,
    dayZhiType,
    tenGodCounts,
    maxGodInfo,
    selfCompatibility,
    spouseStarScan,
    spouseTrait,
    spouseTenGodForTraits,
    tenGodTraitInfo,
    monthZhi,
    hourZhi,
    yearZhi,
    dayBranch,
    hasClash,
    hasPunishment: Boolean(checkXiangXing(dayBranch, monthZhi) || checkXiangXing(dayBranch, hourZhi)),
    hasHarm: Boolean(harmPairs[dayBranch]),
    spouseStarHasClash,
    spouseStarHasPunishment,
    currentYear,
    currentAge,
    daYunList,
    currentDaYun,
    currentLiuNian,
    remedyKey,
    romanceRemedy,
    isCrisis,
    isGoodForBreakup,
    dayMasterElement,
    userFengShuiDetail,
  };
}
