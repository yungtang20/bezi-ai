// useFamilyLogic — 家人頁計算邏輯（從 FamilyPage 抽出）。
// 純資料轉換：由 chart / pattern / 使用者偏好推導家人判斷所需全部中間狀態。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import { useMemo } from "react";
import { BaziChart } from "../../paipan";
import { getFamilyRole, SIBLING_RELATIONS, type FamilyRole } from "../../data";
import { getPalaceDecor } from "../../data/charts/homeDecorGuide";
import type { FiveElement } from "../../data/core/types";
import { getUpcomingDatesForCategory } from "../../dailyAnalysis";
import {
  checkLiuChong,
  checkLiuHai,
  checkLiuPo,
  checkXiangXing,
} from "../../matchmaking";
import { PartnerInfo } from "../../types";

export interface FamilyRelation {
  type: string;
  msg: string;
}

export interface ChildZhiTrait {
  trait: string;
  strategy: string;
}

export interface FamilyLogicResult {
  isMale: boolean;
  pillars: BaziChart["year"][];
  dayElement: string;
  tenGodCount: Record<string, number>;
  sortedTenGods: [string, number][];
  maxGod: string;
  maxCount: number;
  familyRole: FamilyRole | undefined;
  childStar: string;
  childLocation: string;
  childZhi: string;
  childZhiType: string;
  childTrait: ChildZhiTrait | undefined;
  isCesareanRisk: boolean;
  relations: FamilyRelation[];
  hasSiblingStar: boolean;
  isWeakPattern: boolean;
  siblingFortune: string;
  catCounts: {
    "財星較多": number;
    "官殺較多": number;
    "食傷較多": number;
    "比劫較多": number;
    "印星較多": number;
  };
  foodCount: number;
  hurtingCount: number;
  maxCat: string;
  matchingSiblingTrait: {
    tenGod: string;
    trait: string;
    strategy: string;
  };
  childPalaceDecor: {
    palace: string;
    location: string;
    colors: string;
    items: string[];
    material: string;
    directions: string[];
    zodiac: string;
    zodiacMaterial: string;
  } | undefined;
  upcomingMoveInDays: { date: string; ganZhi: string; isFavorable: boolean }[];
  topGod: string;
  secondGod: string;
}

export function useFamilyLogic({
  chart,
  primaryPattern,
  favorable,
  unfavorable,
  weakestElement,
  partners,
}: {
  chart: BaziChart;
  primaryPattern: string;
  favorable: string[];
  unfavorable: string[];
  weakestElement: string;
  weakestElements: string[];
  partners?: PartnerInfo[];
}): FamilyLogicResult {
  const isMale = chart.gender === "男";
  const pillars = [chart.year, chart.month, chart.day, chart.hour];

  const dayElement = useMemo(() => {
    const dm = chart.dayMaster;
    if (dm === "甲" || dm === "乙") return "木";
    if (dm === "丙" || dm === "丁") return "火";
    if (dm === "戊" || dm === "己") return "土";
    if (dm === "庚" || dm === "辛") return "金";
    return "水";
  }, [chart.dayMaster]);

  // 歲運入宅吉日（流日專屬入宅吉日預報）
  const upcomingMoveInDays = getUpcomingDatesForCategory(
    chart,
    "move_in",
    favorable,
    unfavorable,
    weakestElement,
    4,
    partners,
  );

  // 統計十神數量
  const tenGodCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of pillars) {
      if (p.tenGod) {
        counts[p.tenGod] = (counts[p.tenGod] || 0) + 1;
      }
    }
    return counts;
  }, [pillars]);

  const sortedTenGods = useMemo(() => {
    return Object.entries(tenGodCount).sort((a, b) => b[1] - a[1]);
  }, [tenGodCount]);

  // 找最多的十神類型
  let maxGod = "";
  let maxCount = 0;
  for (const [god, count] of Object.entries(tenGodCount)) {
    if (count > maxCount) {
      maxCount = count;
      maxGod = god;
    }
  }

  // 取得家人相處策略
  const familyRole = getFamilyRole(maxGod);

  // 子女星 — 來源：家人相處.pdf L515
  // 男命：官殺代表兒子、食傷代表女兒
  // 女命：食傷代表兒子、官殺代表女兒
  const childGods = ["正官", "七殺", "食神", "傷官"];
  let childStar = "";
  let childLocation = "";
  let childZhi = "";
  const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
  for (let i = 0; i < pillars.length; i++) {
    if (childGods.includes(pillars[i].tenGod)) {
      childStar = `${pillars[i].gan}${pillars[i].zhi}`;
      childLocation = pillarNames[i];
      childZhi = pillars[i].zhi;
      break;
    }
  }

  const ZHI_TYPE: Record<string, string> = {
    子: "四正",
    午: "四正",
    卯: "四正",
    酉: "四正",
    寅: "四長生",
    申: "四長生",
    巳: "四長生",
    亥: "四長生",
    辰: "四墓庫",
    戌: "四墓庫",
    丑: "四墓庫",
    未: "四墓庫",
  };

  const CHILD_ZHI_TRAITS: Record<string, ChildZhiTrait> = {
    四正: {
      trait: "個性鮮明直接、情緒寫在臉上、自尊心較強。",
      strategy: "孩子吃軟不吃硬，同理陪伴與傾聽。",
    },
    四長生: {
      trait: "活潑好動、好奇心強、電力十足。",
      strategy: "安排動態活動、釋放孩子電力。",
    },
    四墓庫: {
      trait: "安靜內斂、喜靜態活動、專注興趣，鑽研冷門知識。",
      strategy: "少參加社交場合、尊重鼓勵孩子興趣。",
    },
  };
  const childZhiType = ZHI_TYPE[childZhi] || "";
  const childTrait = CHILD_ZHI_TRAITS[childZhiType];

  // 判斷刑沖破害
  const zhiValues = pillars.map((p) => p.zhi);
  const relations: FamilyRelation[] = [];

  // 檢查相鄰柱 (年-月, 月-日, 日-時)
  const posNames = ["年", "月", "日", "時"];
  for (let i = 0; i < 3; i++) {
    const z1 = zhiValues[i];
    const z2 = zhiValues[i + 1];
    if (!z1 || !z2) continue;

    if (checkLiuChong(z1, z2))
      relations.push({
        type: "沖",
        msg: `${posNames[i]}${posNames[i + 1]}相沖：環境、宮位易有劇烈變動。`,
      });
    if (z1 === z2) continue; // ignore self duplicate
    if (checkLiuHai(z1, z2))
      relations.push({
        type: "害",
        msg: `${posNames[i]}${posNames[i + 1]}相害：溝通或相處易有隱性隔閡。`,
      });
    if (checkLiuPo(z1, z2))
      relations.push({
        type: "破",
        msg: `${posNames[i]}${posNames[i + 1]}相破：事多波折，需細心磨合。`,
      });
    if (checkXiangXing(z1, z2))
      relations.push({
        type: "刑",
        msg: `${posNames[i]}${posNames[i + 1]}相刑：法律或規範面的摩擦，需多一份體諒。`,
      });
  }

  // 特殊三刑 (跨柱檢查)
  const hasYinSiShen =
    zhiValues.includes("寅") && zhiValues.includes("巳") && zhiValues.includes("申");
  const hasChouXuWei =
    zhiValues.includes("丑") && zhiValues.includes("戌") && zhiValues.includes("未");
  if (hasYinSiShen) {
    relations.push({
      type: "刑",
      msg: "命局帶寅巳申三刑：主觀性強，注意與家人相處和諧、放慢情緒步伐。",
    });
  }
  if (hasChouXuWei) {
    relations.push({
      type: "刑",
      msg: "命局帶丑戌未三刑：自我施壓，需適時發洩或安排休閒。",
    });
  }

  // 計算是否易剖腹產 (女命且時支與日/月支有沖刑)
  const isCesareanRisk = !!(
    !isMale &&
    (checkLiuChong(zhiValues[3], zhiValues[2]) ||
      checkLiuChong(zhiValues[3], zhiValues[1]) ||
      checkXiangXing(zhiValues[3], zhiValues[2]) ||
      checkXiangXing(zhiValues[3], zhiValues[1]))
  );

  // 1. 手足關係與特質
  const hasSiblingStar =
    (tenGodCount["比肩"] || 0) > 0 || (tenGodCount["劫財"] || 0) > 0;
  const isWeakPattern =
    primaryPattern === "身弱" || primaryPattern === "從弱";
  const siblingFortune = isWeakPattern
    ? SIBLING_RELATIONS.fortune[0]
    : SIBLING_RELATIONS.fortune[1];

  const catCounts = {
    "財星較多": (tenGodCount["正財"] || 0) + (tenGodCount["偏財"] || 0),
    "官殺較多": (tenGodCount["正官"] || 0) + (tenGodCount["七殺"] || 0),
    "食傷較多": (tenGodCount["食神"] || 0) + (tenGodCount["傷官"] || 0),
    "比劫較多": (tenGodCount["比肩"] || 0) + (tenGodCount["劫財"] || 0),
    "印星較多": (tenGodCount["正印"] || 0) + (tenGodCount["偏印"] || 0),
  };
  let maxCat = "比劫較多";
  let maxCatCount = -1;
  for (const [cat, count] of Object.entries(catCounts)) {
    if (count > maxCatCount) {
      maxCatCount = count;
      maxCat = cat;
    }
  }
  const matchingSiblingTrait =
    SIBLING_RELATIONS.traits.find((t) => t.tenGod === maxCat) ||
    SIBLING_RELATIONS.traits[3];

  // 2. 2026年子息宮催旺（單一來源：src/data/charts/homeDecorGuide.ts 的 GENDER_PALACE_DECOR）
  const childPalaceDecor = getPalaceDecor(
    dayElement as FiveElement,
    "子息宮",
    isMale ? "男" : "女",
  );

  const topGod = sortedTenGods[0]?.[0] || "";
  const secondGod = sortedTenGods[1]?.[0] || "";

  return {
    isMale,
    pillars,
    dayElement,
    tenGodCount,
    sortedTenGods,
    maxGod,
    maxCount,
    familyRole,
    childStar,
    childLocation,
    childZhi,
    childZhiType,
    childTrait,
    isCesareanRisk,
    relations,
    hasSiblingStar,
    isWeakPattern,
    siblingFortune,
    catCounts,
    foodCount: tenGodCount["食神"] || 0,
    hurtingCount: tenGodCount["傷官"] || 0,
    maxCat,
    matchingSiblingTrait,
    childPalaceDecor,
    upcomingMoveInDays,
    topGod,
    secondGod,
  };
}
