// useHealthLogic — 健康頁計算邏輯（從 HealthPage 抽出）。
// 純資料轉換：由 chart / pattern / 使用者偏好推導健康判斷所需全部中間狀態。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import { useMemo } from "react";
import { BaziChart } from "../../paipan";
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from "../../constants";
import { calculateDaYun, getLiuNian, type DaYun, type LiuNian } from "../../dayun";
import { getHealthRemedy, HEALTH_DATA, HEALTH_PRESERVATION_GUIDE } from "../../data";
import { Solar } from "lunar-javascript";
import { PartnerInfo } from "../../types";

export interface HealthScanDate {
  date: string;
  ganZhi: string;
  comment: string;
}

export interface DaYunHealthDetail {
  status: string;
  desc: string;
  code: "good" | "bad" | "neutral";
}

export interface CombinedYearlyAnalysis {
  phrase: string;
  body: string;
}

export interface ScannedDates {
  extremeDaysList: HealthScanDate[];
  weakControlDaysList: HealthScanDate[];
}

export interface HealthLogicResult {
  dmEl: string;
  elementCount: Record<string, number>;
  weakElements: string[];
  excessElements: string[];
  currentYear: number;
  currentAge: number;
  allDaYun: DaYun[];
  currentDaYun: DaYun | undefined;
  currentLiuNian: LiuNian | undefined;
  targetWeakest: string[];
  daYunHealthDetails: DaYunHealthDetail;
  combinedYearlyAnalysis: CombinedYearlyAnalysis;
  scannedDates: ScannedDates;
}

export function useHealthLogic({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElement,
  weakestElements,
  partners,
}: {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];
  partners?: PartnerInfo[];
}): HealthLogicResult {
  const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || "土";

  // 1. 命盤五行分佈（純個數盤點，天干+地支本氣，不數支藏干）
  const elementCount = useMemo(() => {
    const count: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
    const pillars = [chart.year, chart.month, chart.day, chart.hour];
    for (const p of pillars) {
      if (!p) continue;
      const eGan = GAN_TO_ELEMENT[p.gan];
      if (eGan) count[eGan] += 1;
      const eZhi = p.zhi ? ZHI_TO_ELEMENT[p.zhi] : "";
      if (eZhi) count[eZhi] += 1;
    }
    return count;
  }, [chart]);

  // 偏弱五行（個數 <= 1）
  const weakElements = useMemo(() => {
    return Object.entries(elementCount)
      .filter(([, val]) => val <= 1)
      .map(([el]) => el);
  }, [elementCount]);

  // 過旺五行（個數 >= 3）
  const excessElements = useMemo(() => {
    return Object.entries(elementCount)
      .filter(([, val]) => val >= 3)
      .map(([el]) => el);
  }, [elementCount]);

  // 2. 當前大運 & 流年取得
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;
  const allDaYun = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = useMemo(() => {
    return allDaYun.find(d => currentAge >= d.startAge && currentAge <= d.startAge + 9);
  }, [allDaYun, currentAge]);
  const currentLiuNian = useMemo(() => getLiuNian(currentYear, chart.dayMaster), [
    currentYear,
    chart.dayMaster,
  ]);

  // 得出最需注意之五行資訊（以 weakestElements 為主，若無則取個數最少者）
  const targetWeakest = useMemo(() => {
    return weakestElements.length > 0 ? weakestElements : (weakElements.length > 0 ? weakElements : ["金"]);
  }, [weakestElements, weakElements]);

  // 計算大運健康推演
  const daYunHealthDetails: DaYunHealthDetail = useMemo(() => {
    const primaryWeak = targetWeakest[0];
    const dyInfo = HEALTH_DATA.DAYUN_HEALTH[primaryWeak as keyof typeof HEALTH_DATA.DAYUN_HEALTH];
    if (!dyInfo || !currentDaYun) return { status: "平穩", desc: "大運氣場平穩，日常注意保養即可。", code: "neutral" as const };

    const dyGanEl = GAN_TO_ELEMENT[currentDaYun.gan] || "";
    const dyZhiEl = ZHI_TO_ELEMENT[currentDaYun.zhi] || "";

    const isGood = dyInfo.good.includes(dyGanEl) || dyInfo.good.includes(dyZhiEl);
    const isBad = dyInfo.bad.includes(dyGanEl) || dyInfo.bad.includes(dyZhiEl);

    if (isGood) {
      return {
        status: "穩定好轉",
        desc: `大運五行運轉至「${dyGanEl}${dyZhiEl}」，五行屬性與被補元素相合（屬 ${dyInfo.good.join("、")}），得到充沛補養，先天健康弱項獲得修復契機，體質呈穩定上升趨勢。`,
        code: "good" as const,
      };
    } else if (isBad) {
      return {
        status: "健康警訊",
        desc: `大運五行運轉至「${dyGanEl}${dyZhiEl}」，引動剋洩氣場（屬 ${dyInfo.bad.join("、")}）。先天弱項 ${primaryWeak} 能量被抑制或耗損過度：${dyInfo.badDesc}。`,
        code: "bad" as const,
      };
    }
    return { status: "平穩保持", desc: "大運氣場平順，健康無明顯克洩。", code: "neutral" as const };
  }, [targetWeakest, currentDaYun]);

  // 計算大運 X 流年綜合健康推論（先差後好 / 穩定但小恙 / 旺上加旺 / 雙凶護航）
  const combinedYearlyAnalysis = useMemo(() => {
    const primaryWeak = targetWeakest[0];
    const dyInfo = HEALTH_DATA.DAYUN_HEALTH[primaryWeak as keyof typeof HEALTH_DATA.DAYUN_HEALTH];
    if (!dyInfo || !currentDaYun || !currentLiuNian) {
      return { phrase: "歲運平健", body: "大運與流年五行流動和諧，維持常態保養即可。" };
    }

    const dyGanEl = GAN_TO_ELEMENT[currentDaYun.gan] || "";
    const dyZhiEl = ZHI_TO_ELEMENT[currentDaYun.zhi] || "";
    const lnGanEl = GAN_TO_ELEMENT[currentLiuNian.gan] || "";
    const lnZhiEl = ZHI_TO_ELEMENT[currentLiuNian.zhi] || "";

    const dyGood = dyInfo.good.includes(dyGanEl) || dyInfo.good.includes(dyZhiEl);
    const lnGood = dyInfo.good.includes(lnGanEl) || dyInfo.good.includes(lnZhiEl);

    if (!dyGood && lnGood) {
      return {
        phrase: "先差後好",
        body: `【大運逢警訊，流年送甘霖】目前十年間大運與先天弱項「${primaryWeak}」相悖，健康時受小恙拖累；但今年歲君「${currentLiuNian.ganZhi}」能量屬「${lnGanEl}/${lnZhiEl}」迎來健康好轉之星，利復原與調理，呈現『先差後好，先苦後甘』之象。`,
      };
    } else if (dyGood && !lnGood) {
      return {
        phrase: "穩定但小恙",
        body: `【大限底氣足，流年值金傷】十年大運底氣充足、健康穩定；但今年歲君「${currentLiuNian.ganZhi}」帶來暫時克制沖犯，需留意細小突發痼疾（如疲勞感冒、關節扭傷、上火發炎）。大象平穩而偶有小坎，防微杜漸即可。`,
      };
    } else if (dyGood && lnGood) {
      return {
        phrase: "健康及時雨（雙吉補強）",
        body: `【大運引流，流年相扶】大限與歲君雙雙為喜神，能提供極富成效的修復能量。是積極進補、調理身心、恢復元氣的黃金之年。`,
      };
    } else {
      return {
        phrase: "警訊疊加，切忌過勞",
        body: `【大運洩耗，歲君重克】大下限與今年流年均對先天弱項「${primaryWeak}」形成克洩交加。容易出現免疫水平低下、器官超負荷運作。務必保持充足睡眠、忌熬夜暴食，並安排全面健康檢查。`,
      };
    }
  }, [targetWeakest, currentDaYun, currentLiuNian]);

  // 3. 掃描未來 120 天日曆中，極端能量流日 & 弱五行受克流日
  const scannedDates = useMemo(() => {
    const extremeDaysList: HealthScanDate[] = [];
    const weakControlDaysList: HealthScanDate[] = [];

    const dmElLocal = GAN_TO_ELEMENT[chart.dayMaster] || "土";

    // 日主對應極端能量
    const HEALTH_WARNING_DAYS: Record<string, string[]> = {
      木: ["甲寅", "乙卯"],
      火: ["丙午", "丁巳"],
      土: ["戊辰", "己丑", "戊戌", "己未"],
      金: ["庚申", "辛酉"],
      水: ["壬子", "癸亥"],
    };
    const dmExtremeDays = HEALTH_WARNING_DAYS[dmElLocal] || [];

    // 最弱五行被剋流日組合列表
    const WEAK_CONTROL_DAYS: Record<string, string[]> = {
      金: ["丙寅", "丙午", "丙戌", "丁巳", "丁未"],
      木: ["庚申", "辛酉", "辛丑"],
      水: ["戊戌", "戊辰", "戊午", "己未", "己丑", "己巳"],
      火: ["壬子", "壬申", "壬辰", "癸亥", "癸酉", "癸丑"],
      土: ["甲寅", "甲子", "甲辰", "乙卯", "乙亥", "乙未"],
    };

    const primaryWeak = targetWeakest[0];
    const weakCtrlDays = WEAK_CONTROL_DAYS[primaryWeak] || [];

    const today = new Date();
    // 遍歷 120 天，找出符合的日辰
    for (let i = 0; i < 120 && (extremeDaysList.length < 5 || weakControlDaysList.length < 5); i++) {
      const scanDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const solar = Solar.fromDate(scanDate);
      const lunar = solar.getLunar();
      const baZi = lunar.getEightChar();
      const gan = baZi.getDayGan();
      const zhi = baZi.getDayZhi();
      const ganZhi = `${gan}${zhi}`;

      const formattedLabel = `${solar.getMonth()}月${solar.getDay()}日`;

      if (dmExtremeDays.includes(ganZhi) && extremeDaysList.length < 5) {
        let extremeDesc = "";
        if (dmElLocal === "木") extremeDesc = "命理觀察：可留意腸胃感受。";
        if (dmElLocal === "火") extremeDesc = "命理觀察：可留意燥熱與呼吸感受。";
        if (dmElLocal === "土") extremeDesc = "命理觀察：可留意代謝與水腫感受。";
        if (dmElLocal === "金") extremeDesc = "命理觀察：可留意焦慮與關節緊繃感受。";
        if (dmElLocal === "水") extremeDesc = "命理觀察：可留意血壓與眼部疲勞。";

        extremeDaysList.push({
          date: formattedLabel,
          ganZhi,
          comment: extremeDesc,
        });
      }

      if (weakCtrlDays.includes(ganZhi) && weakControlDaysList.length < 5) {
        const weakDetails = HEALTH_DATA.WEAK_ADVICE[primaryWeak as keyof typeof HEALTH_DATA.WEAK_ADVICE];
        weakControlDaysList.push({
          date: formattedLabel,
          ganZhi,
          comment: `弱五行「${primaryWeak}」受克。注意：${weakDetails?.organs || ""}`,
        });
      }
    }

    return { extremeDaysList, weakControlDaysList };
  }, [chart.dayMaster, targetWeakest]);

  return {
    dmEl,
    elementCount,
    weakElements,
    excessElements,
    currentYear,
    currentAge,
    allDaYun,
    currentDaYun,
    currentLiuNian,
    targetWeakest,
    daYunHealthDetails,
    combinedYearlyAnalysis,
    scannedDates,
  };
}
