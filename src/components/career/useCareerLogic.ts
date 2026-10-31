// useCareerLogic — 事業頁計算邏輯（從 CareerPage 抽出）。
// 純資料轉換：由 chart / pattern / 使用者偏好推導事業判斷所需全部中間狀態。
import { useMemo } from "react";
import { BaziChart } from "../../paipan";
import { GAN_TO_ELEMENT } from "../../constants";
import { DaYun, calculateDaYun, getTenGodForDaYun } from "../../dayun";
import {
  determinePattern,
  getPatternLabel,
  type PatternResult,
} from "../../pattern";
import {
  LECTURE_DATA,
  getWealthCareer,
  getCareerRole,
  type CareerMapping,
  type CareerRole,
} from "../../data";

export interface CareerFengShui {
  element: string;
  directions: string[];
  colors: string[];
  items: string;
}

export interface JobChangeAdvice {
  condition: string;
  detail: string;
}

export interface CareerLogicResult {
  tenGodCount: Record<string, number>;
  sortedTenGods: [string, number][];
  topGod1: string;
  topCount1: number;
  topGod2: string;
  topCount2: number;
  maxGod: string;
  secGod: string | null;
  roleData: CareerRole | undefined;
  careerInfo: CareerMapping | undefined;
  isStrong: boolean;
  isWeak: boolean;
  patternResult: PatternResult;
  patternLabel: string;
  isContinuum: boolean;
  dmElement: string;
  customCareerFengShui: CareerFengShui;
  currentYear: number;
  currentAge: number;
  daYunList: DaYun[];
  currentDaYun: DaYun | undefined;
  jobChangeAdvice: JobChangeAdvice;
}

export function useCareerLogic({
  chart,
  primaryPattern,
  favorable: _favorable,
  unfavorable: _unfavorable,
  weakestElements,
}: {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElements: string[];
}): CareerLogicResult {
  // 1. 統計十神，找出前兩名最多的類型 (僅計算天干 3 個及地支本氣 4 個，排除中餘氣，共計最多 7 個十神關係)
  const tenGodCount = useMemo(() => {
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

    // 地支本氣十神 (僅計算地支第一主氣，排除中氣與餘氣)
    if (chart.year.hiddenTenGods && chart.year.hiddenTenGods[0])
      add(chart.year.hiddenTenGods[0]);
    if (chart.month.hiddenTenGods && chart.month.hiddenTenGods[0])
      add(chart.month.hiddenTenGods[0]);
    if (chart.day.hiddenTenGods && chart.day.hiddenTenGods[0])
      add(chart.day.hiddenTenGods[0]);
    if (chart.hour.hiddenTenGods && chart.hour.hiddenTenGods[0])
      add(chart.hour.hiddenTenGods[0]);

    return counts;
  }, [chart]);

  const sortedTenGods = useMemo(() => {
    return Object.entries(tenGodCount).sort((a, b) => b[1] - a[1]);
  }, [tenGodCount]);

  const topGod1 = sortedTenGods[0]?.[0] || "無";
  const topCount1 = sortedTenGods[0]?.[1] || 0;
  const topGod2 = sortedTenGods[1]?.[0] || "";
  const topCount2 = sortedTenGods[1]?.[1] || 0;

  const maxGod = topGod1 || chart.month.tenGod || "正官";
  const secGod = topGod2 || null;

  const roleData = getCareerRole(maxGod);
  // 取得對應的職業建議 (利用前二名的十神組合)
  const careerInfo = getWealthCareer(maxGod, secGod);

  // 身強/身弱判定
  const isStrong = useMemo(() => primaryPattern.includes("身強"), [primaryPattern]);
  const isWeak = useMemo(() => primaryPattern.includes("身弱"), [primaryPattern]);
  // 徐玉蘭口徑：40-55% 屬連續體，顯示「偏平衡」而不是把工具分數講成定論
  const patternResult = useMemo(() => determinePattern(chart), [chart]);
  const patternLabel = getPatternLabel(patternResult, primaryPattern);
  const isContinuum = patternResult.isContinuum && primaryPattern === patternResult.pattern;

  const dmElement = GAN_TO_ELEMENT[chart.dayMaster] || "金";

  // 2. 專屬事業風水佈置指南 (講義第 9 & 10 頁)
  const customCareerFengShui = useMemo(() => {
    const data: Record<string, CareerFengShui> = {
      金: {
        element: "火（以火生官殺）",
        directions: ["東北", "東南", "正南", "西南方"],
        colors: ["紅色", "黃色", "橙色", "綠色系"],
        items: '佈置馬、虎、狗、羊、蛇的木製擺件。亦可擺設紅、黃、橙色的精緻陶瓷擺件，助旺官運與氣勢。',
      },
      木: {
        element: "金（以金煉木為官）",
        directions: ["正西", "西北", "東北", "西南方"],
        colors: ["白色", "灰色", "金色", "銀色系"],
        items: '置放蛇、猴、雞、牛的金屬材質生肖擺件。亦可選用金屬製鬧鐘/錢幣/風鈴/音樂盒，白色、灰色或金色瓶身的優雅香氛，或金銀色燈罩的燈具。',
      },
      水: {
        element: "土（以土止水為官）",
        directions: ["東北", "西南", "東南", "西北方"],
        colors: ["紅色", "黃色", "橘色", "土黃色系"],
        items: '擺設馬、狗、羊、蛇、龍、牛的生肖雕件(材質以紅/橙/黃色陶瓷、玉石或原色陶土為最佳)。可搭配紅、黃、橘色地毯、紅紫色瓶身香氛或紅色鹽燈/燈具。',
      },
      火: {
        element: "水（以水濟火為官）",
        directions: ["正北", "西北", "正西", "東北方"],
        colors: ["黑色", "藍色", "藍綠色", "白色", "灰色", "金色", "銀色系"],
        items: '置放鼠、豬、龍、雞、牛、猴的生肖件(材質以金屬、玻璃或水晶製為佳)。宜在辦公桌或客廳顯眼處布置一個盛水的透明水缸或常補乾淨清水的玻璃水杯。',
      },
      土: {
        element: "木（以木疏土成器）",
        directions: ["東北", "正東", "東南方"],
        colors: ["綠色", "藍綠色系"],
        items: '置放豬、兔、羊、虎、龍的木雕擺件。十分推薦養育富貴竹、萬年青或黃金葛等綠色盆栽，並擺放綠水晶、翡翠，或使用綠色燈罩。',
      },
    };
    return data[dmElement] || data["金"];
  }, [dmElement]);

  // 3. 轉職時機判定 (講義第 10 頁)
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;
  const daYunList = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = useMemo(
    () => daYunList.find((dy) => currentAge >= dy.startAge && currentAge <= dy.startAge + 9),
    [daYunList, currentAge],
  );

  const jobChangeAdvice = useMemo(() => {
    const el = dmElement as keyof typeof LECTURE_DATA.JOB_CHANGE["身強"];
    let detail = "";
    let condition = "";

    if (isWeak) {
      let isBalanced = false;
      if (currentDaYun) {
        const tenGod = getTenGodForDaYun(chart.dayMaster, currentDaYun.gan);
        if (["正印", "偏印", "比肩", "劫財"].includes(tenGod)) {
          isBalanced = true;
        }
      }
      if (isBalanced) {
        condition = `身弱命格，當前大運「${currentDaYun?.ganZhi || ""}」具有生扶力量，達到平衡。`;
        detail = `流年宜遇【${LECTURE_DATA.JOB_CHANGE["身弱_平衡"][el]}】之能量，能承擔官財之耗，利於跳槽和升職。`;
      } else {
        condition = `身弱命格，當前大運耗損日主氣場，處於失衡防守。`;
        detail = `流年宜遇【${LECTURE_DATA.JOB_CHANGE["身弱_不平衡"][el]}】（即生扶自身之印星/比劫歲運）時轉職，才不易因變動落入泥淖。`;
      }
    } else {
      condition = "身強命格，本身底氣充足，可隨時主動出擊衝刺。";
      detail = `流年宜逢【${LECTURE_DATA.JOB_CHANGE["身強"][el]}】（剋洩自身之官殺/財星/食傷歲運），最能大展拳腳、轉換到高回報跑道。`;
    }

    return { condition, detail };
  }, [chart, isWeak, dmElement, currentDaYun]);

  return {
    tenGodCount,
    sortedTenGods,
    topGod1,
    topCount1,
    topGod2,
    topCount2,
    maxGod,
    secGod,
    roleData,
    careerInfo,
    isStrong,
    isWeak,
    patternResult,
    patternLabel,
    isContinuum,
    dmElement,
    customCareerFengShui,
    currentYear,
    currentAge,
    daYunList,
    currentDaYun,
    jobChangeAdvice,
  };
}
