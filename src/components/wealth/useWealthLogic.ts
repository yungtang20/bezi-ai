// useWealthLogic — 財富頁計算邏輯（從 WealthPage 抽出）。
// 純資料轉換：由 chart / pattern / 使用者偏好推導財富判斷所需全部中間狀態。
import { useMemo } from "react";
import { BaziChart } from "../../paipan";
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from "../../constants";
import { determinePattern, getPatternLabel } from "../../pattern";
import { calculateDaYun, getLiuNian } from "../../dayun";
import { Solar } from "lunar-javascript";
import { WEALTH_GUIDELINES } from "../../data/charts/wealthGuidelines";
import { LECTURE_DATA } from "../../data/lecture/lectureData";

export interface WealthLogicResult {
  tenGodCounts: Record<string, number>;
  sortedTenGods: [string, number][];
  topGod1: string;
  topCount1: number;
  topGod2: string;
  topCount2: number;
  wealthLocations: { pillar: string; type: string; desc: string }[];
  isNoWealth: boolean;
  isStrong: boolean;
  isWeak: boolean;
  patternResult: ReturnType<typeof determinePattern>;
  patternLabel: string;
  isContinuum: boolean;
  currentYear: number;
  currentAge: number;
  allDaYun: ReturnType<typeof calculateDaYun>;
  currentDaYun: ReturnType<typeof calculateDaYun>[number] | undefined;
  currentLiuNian: ReturnType<typeof getLiuNian>;
  daYunWealthDetails: {
    status: string;
    desc: string;
    tone: "good" | "bad" | "neutral";
  };
  customWealthGuide: typeof WEALTH_GUIDELINES[keyof typeof WEALTH_GUIDELINES];
  combinedWealthAnalysis: { phrase: string; body: string };
  scannedDates: { date: string; ganZhi: string; comment: string }[];
  zhiCount: { "寅申巳亥": number; "辰戌丑未": number; "子午卯酉": number };
  dominantZhiType: string;
  baziLossDetails: {
    wealthStar: string;
    chongDesc: string;
    heDesc: string;
    keDesc: string;
  };
}

export function useWealthLogic({
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
}): WealthLogicResult {
  // 1. 判斷依據：命盤十神分布（天干與地支本氣）
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
    // 地支本氣十神 (僅計算地支第一主氣，排除中氣與餘氣)
    if (chart.year.hiddenTenGods && chart.year.hiddenTenGods[0]) add(chart.year.hiddenTenGods[0]);
    if (chart.month.hiddenTenGods && chart.month.hiddenTenGods[0]) add(chart.month.hiddenTenGods[0]);
    if (chart.day.hiddenTenGods && chart.day.hiddenTenGods[0]) add(chart.day.hiddenTenGods[0]);
    if (chart.hour.hiddenTenGods && chart.hour.hiddenTenGods[0]) add(chart.hour.hiddenTenGods[0]);
    return counts;
  }, [chart]);

  const sortedTenGods = useMemo(() => {
    return Object.entries(tenGodCounts).sort((a, b) => b[1] - a[1]);
  }, [tenGodCounts]);

  const topGod1 = sortedTenGods[0]?.[0] || "無";
  const topCount1 = sortedTenGods[0]?.[1] || 0;
  const topGod2 = sortedTenGods[1]?.[0] || "";
  const topCount2 = sortedTenGods[1]?.[1] || 0;

  // 2. 先天財富特質
  const wealthLocations = useMemo(() => {
    const locations: { pillar: string; type: string; desc: string }[] = [];
    const pillars = [
      { name: "年柱", p: chart.year },
      { name: "月柱", p: chart.month },
      { name: "日柱", p: chart.day },
      { name: "時柱", p: chart.hour },
    ];
    pillars.forEach((item) => {
      let found = false;
      let types: string[] = [];
      // 檢查天干
      if (item.p.tenGod === "正財" || item.p.tenGod === "偏財") {
        types.push(item.p.tenGod);
        found = true;
      }
      // 檢查地支
      if (item.p.hiddenTenGods) {
        if (item.p.hiddenTenGods.includes("正財") && !types.includes("正財")) types.push("正財");
        if (item.p.hiddenTenGods.includes("偏財") && !types.includes("偏財")) types.push("偏財");
      }
      if (types.length > 0) {
        let text = "";
        if (item.name === "時柱") text = "後代財富豐厚、晚年財富穩健，家庭和諧。";
        if (item.name === "日柱") text = "自身或伴侶善於賺錢、伴侶起點高或家境佳、夫妻攜手同心拼搏。";
        if (item.name === "月柱") text = "容易獲得父母或長輩傳承財富，或有機會得到外人優質投資與合夥機會。";
        if (item.name === "年柱") text = "家族企業繁榮、傳承祖宗蔭庇遺產。";
        locations.push({
          pillar: item.name,
          type: types.join("、"),
          desc: text,
        });
      }
    });
    return locations;
  }, [chart]);

  const isNoWealth = wealthLocations.length === 0;

  // 身強/身弱判定
  const isStrong = useMemo(() => primaryPattern.includes("身強"), [primaryPattern]);
  const isWeak = useMemo(() => primaryPattern.includes("身弱"), [primaryPattern]);
  // 徐玉蘭口徑：40-55% 屬連續體，顯示「偏平衡」而不是把工具分數講成定論
  const patternResult = useMemo(() => determinePattern(chart), [chart]);
  const patternLabel = getPatternLabel(patternResult, primaryPattern);
  const isContinuum = patternResult.isContinuum && primaryPattern === patternResult.pattern;

  // 3. 歲運推演：當前大運 & 流年取得
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;
  const allDaYun = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = useMemo(() => {
    return allDaYun.find((d) => currentAge >= d.startAge && currentAge <= d.startAge + 9);
  }, [allDaYun, currentAge]);
  const currentLiuNian = useMemo(() => getLiuNian(currentYear, chart.dayMaster), [currentYear, chart.dayMaster]);

  // 大運與流年五行屬性判定財富走向
  const daYunWealthDetails = useMemo<{
    status: string;
    desc: string;
    tone: "good" | "bad" | "neutral";
  }>(() => {
    if (!currentDaYun) return { status: "平穩", desc: "大運氣場平穩，建議常規累積。", tone: "neutral" };
    const dy = currentDaYun;
    const dyGanEl = GAN_TO_ELEMENT[dy.gan] || "";
    const dyZhiEl = ZHI_TO_ELEMENT[dy.zhi] || "";
    const hasFavorable = favorable.includes(dyGanEl) || favorable.includes(dyZhiEl);
    const hasUnfavorable = unfavorable.includes(dyGanEl) || unfavorable.includes(dyZhiEl);
    if (hasFavorable) {
      return {
        status: "求財好運 (吉利大運)",
        desc: `大運運轉至「${dy.ganZhi}」。此運五行（${dyGanEl}/${dyZhiEl}）生扶喜用，求財底氣極足、財源廣進，思路清晰、善能得到貴人指引。是開拓事業版圖或理財投資的核心黃金歲月。`,
        tone: "good",
      };
    } else if (hasUnfavorable) {
      return {
        status: "求財克洩 (忌神大運)",
        desc: `大運運轉至「${dy.ganZhi}」。五行屬性（${dyGanEl}/${dyZhiEl}）處被克洩、忌神肆虐，求財阻力與隱性支出大。尤其容易因衝動投資、親友借貸而受損。應以此十年作累積防守、切防輕浮起舞。`,
        tone: "bad",
      };
    }

    return {
      status: "中平守正 (平健大運)",
      desc: `大運行至「${dy.ganZhi}」，金流波動有限、處平順流動狀態。適合在已有本行深耕、防範無謂支出即可。`,
      tone: "neutral",
    };
  }, [currentDaYun, favorable, unfavorable]);

  // 大運 × 流年（財富領域綜合判定）
  const combinedWealthAnalysis = useMemo(() => {
    if (!currentDaYun || !currentLiuNian) {
      return { phrase: "中平守正", body: "流年與大運金流平順，宜穩打穩紮累積底氣。" };
    }

    const dyGanEl = GAN_TO_ELEMENT[currentDaYun.gan] || "";
    const dyZhiEl = ZHI_TO_ELEMENT[currentDaYun.zhi] || "";
    const lnGanEl = GAN_TO_ELEMENT[currentLiuNian.gan] || "";
    const lnZhiEl = ZHI_TO_ELEMENT[currentLiuNian.zhi] || "";

    const dyGood = favorable.includes(dyGanEl) || favorable.includes(dyZhiEl);
    const lnGood = favorable.includes(lnGanEl) || favorable.includes(lnZhiEl);

    if (dyGood && lnGood) {
      return {
        phrase: "雙吉臨盤（財富高歌）",
        body: `【大運引路，流年相扶】大限與流年歲君雙雙落入財富第一層用神星位。今年是資金周轉極其暢快、利擴張、投資與決策的高回報之年。`,
      };
    } else if (dyGood && !lnGood) {
      return {
        phrase: "大象安穩，偶有小耗",
        body: `【大運有底牌，歲君值耗金】十年大限財基無虞，求財環境穩實。但今年歲君「${currentLiuNian.ganZhi}」帶來暫時性花銷大或短暫項目受卡，屬『賺多也花多』，小耗無傷大局。`,
      };
    } else if (!dyGood && lnGood) {
      return {
        phrase: "大運雖阻，流年迎春（歲君甘霖）",
        body: `【大運雖受阻，流年送驚喜】大運雖不旺，但今年歲君助攻，在重重阻力中獲得突破性的短線投資回報或副業起色，是利求財變現、扭虧為盈的好年份。`,
      };
    } else {
      return {
        phrase: "雙忌守盤，保守規避",
        body: `【大限被洩，流年逢壓】大限與歲君皆對求財氣場不利，最易遭受突發性大宗破財。本年嚴禁盲目創業、跟風投機，守本保全為上。`,
      };
    }
  }, [currentDaYun, currentLiuNian, favorable, unfavorable]);

  // 當前日主對應的開運風水指引
  const dmElement = GAN_TO_ELEMENT[chart.dayMaster] || "金";
  const customWealthGuide = useMemo(() => {
    return WEALTH_GUIDELINES[dmElement as keyof typeof WEALTH_GUIDELINES];
  }, [dmElement]);

  // 4. 動態掃描未來 120 天專屬得財日
  const scannedDates = useMemo(() => {
    const list: { date: string; ganZhi: string; comment: string }[] = [];
    const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || "土";

    // PDF 規定的日主特殊得財流日组合
    const SPECIAL_WEALTH_DAYS: Record<string, string[]> = {
      金: ["甲寅", "甲子", "乙卯", "甲辰", "壬寅", "癸卯", "乙未"],
      木: ["丙寅", "丙午", "丙戌", "丁未", "丁巳", "戊戌", "戊寅", "戊午", "己未", "己巳"],
      水: ["甲寅", "丙辰", "乙未", "乙巳", "甲午", "甲戌", "丙午", "丙戌", "丙寅", "丁未", "丁巳"],
      火: ["庚辰", "辛丑", "己丑", "戊申", "庚申", "辛酉"],
      土: ["壬申", "壬子", "壬辰", "癸酉", "癸丑", "癸亥", "庚子", "庚辰", "庚申", "辛亥"],
    };

    const targetDays = SPECIAL_WEALTH_DAYS[dmEl] || [];
    const today = new Date();

    for (let i = 0; i < 120 && list.length < 6; i++) {
      const scanDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const solar = Solar.fromDate(scanDate);
      const lunar = solar.getLunar();
      const baZi = lunar.getEightChar();
      const gan = baZi.getDayGan();
      const zhi = baZi.getDayZhi();
      const ganZhi = `${gan}${zhi}`;

      if (targetDays.includes(ganZhi)) {
        list.push({
          date: `${solar.getMonth()}月${solar.getDay()}日`,
          ganZhi,
          comment: `財星旺氣相生，天干地支五行同旺，適合談判、簽約、投資、高值金流決策。`,
        });
      }
    }
    return list;
  }, [chart.dayMaster]);

  // 地支合適工作數量盤點
  const zhiCount = useMemo(() => {
    const counts: { "寅申巳亥": number; "辰戌丑未": number; "子午卯酉": number } = {
      "寅申巳亥": 0,
      "辰戌丑未": 0,
      "子午卯酉": 0,
    };
    const pillars = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
    for (const z of pillars) {
      if (!z) continue;
      if ("寅申巳亥".includes(z)) counts["寅申巳亥"] += 1;
      else if ("辰戌丑未".includes(z)) counts["辰戌丑未"] += 1;
      else if ("子午卯酉".includes(z)) counts["子午卯酉"] += 1;
    }
    return counts;
  }, [chart]);

  const sortedZhiTypes = useMemo(() => {
    return Object.entries(zhiCount).sort((a, b) => b[1] - a[1]);
  }, [zhiCount]);

  const dominantZhiType = sortedZhiTypes[0]?.[0] || "寅申巳亥";

  // 根據日主動態計算破財時的天干地支事件，提供高度個人化的直接干支指示
  const baziLossDetails = useMemo(() => {
    const dmEl = GAN_TO_ELEMENT[chart.dayMaster] || "金";
    switch (dmEl) {
      case "金":
        return {
          wealthStar: "木（天干：甲、乙，地支：寅、卯）",
          chongDesc: '地支遇「申 (猴)」、「酉 (雞)」（如大運/流年地支為申、酉，與命盤寅、卯發生寅申相沖、卯酉相沖），主財根不穩，資金流失。',
          heDesc: '地支遇「亥 (豬)」（寅亥合）、「戌 (狗)」（卯戌合），或天干遇「己」（與甲合）、「庚」（與乙合），財星被合走絆住，資金容易被套牢或他人瓜分。',
          keDesc: '天干遇「庚 (金)」、「辛 (金)」，地支遇「申 (猴)」、「酉 (雞)」之比劫奪財（金剋木）。此時競爭壓力大，極易發生因友破財、投資受騙。',
        };
      case "木":
        return {
          wealthStar: "土（天干：戊、己，地支：辰、戌、丑、未）",
          chongDesc: '地支遇「戌 (狗)」（辰戌相沖）、「辰 (龍)」（戌辰相沖）、「未 (羊)」（丑未相沖）、「丑 (牛)」（未丑相沖），財根受激烈衝撞，不宜進行大宗投機轉帳。',
          heDesc: '地支遇「酉 (雞)」（辰酉合）、「卯 (兔)」（卯戌合）、「子 (鼠)」（子丑合）、「午 (馬)」（午未合），財星元氣受合，合約容易產生無形牽制或無法如期回流。',
          keDesc: '天干遇「甲 (木)」、「乙 (木)」，地支遇「寅 (虎)」、「卯 (兔)」之比劫奪財（木剋土）。日主同氣極旺奪財，開銷開支倍增，極端忌諱與熟人投機或借貸。',
        };
      case "水":
        return {
          wealthStar: "火（天干：丙、丁，地支：巳、午）",
          chongDesc: '地支遇「亥 (豬)」（巳亥相沖）、「子 (鼠)」（子午相沖），財氣之根重創，也主心焦急躁，極易失誤蒙受巨大財務清算或破財。',
          heDesc: '地支遇「申 (猴)」（巳申合）、「未 (羊)」（午未合），天干遇「辛」（丙辛合）、「壬」（丁壬合），資金流動性被鎖住，注意合夥合約糾紛或他人拖欠。',
          keDesc: '天干遇「壬 (水)」、「癸 (水)」，地支遇「亥 (豬)」、「子 (鼠)」之比劫奪財（水剋火）。大水來襲、群劫分金，絕對忌諱合夥投機或盲目創業。',
        };
      case "火":
        return {
          wealthStar: "金（天干：庚、辛，地支：申、酉）",
          chongDesc: '地支遇「寅 (虎)」（寅申相沖）、「卯 (兔)」（卯酉相沖），本命財根被正面回沖，動盪不穩，嚴禁在這些時日做重大融資決策。',
          heDesc: '地支遇「巳 (蛇)」（巳申合）、「辰 (龍)」（辰酉合），天干遇「乙」（乙庚合）、「丙」（丙辛合），財星受合絆窒礙，注意感情事件或親友牽連導向的破財。',
          keDesc: '天干遇「丙 (火)」、「丁 (火)」，地支遇「巳 (蛇)」、「午 (馬)」之比劫奪財（火剋金）。烈火鎔金，生意上有強烈惡性競爭、資金流失飛快。',
        };
      case "土":
        return {
          wealthStar: "水（天干：壬、癸，地支：子、亥）",
          chongDesc: '地支遇「午 (馬)」（子午相沖）、「巳 (蛇)」（巳亥相沖），財水之根遭遇衝擊干擾。投資容易半途夭折，或者主動面對大宗意外罰單、保險理賠。',
          heDesc: '地支遇「丑 (牛)」（子丑合）、「寅 (虎)」（寅亥合），天干遇「丁」（丁壬合）、「戊」（戊癸合），財氣遭合走，往往有被動借代、退水、融資失敗或死帳。',
          keDesc: '天干遇「戊 (土)」、「己 (土)」，地支遇「辰、戌、丑、未 (土)」之比劫奪財（土克水）。群土阻水，水流不暢，財富極端被動。要注意朋友圈、親戚手足大額消費連帶損耗。',
        };
      default:
        return {
          wealthStar: "本命財星",
          chongDesc: '地支財星被沖，根基不穩，容易發生周轉不順或突發重耗，不宜在對沖日做大宗交易。',
          heDesc: '天干/地支財星被相合，往往被套、融資卡關、或合建不順，承諾難以兌現。',
          keDesc: '遇比肩、劫財同氣天干地支重臨，掠奪財源，嚴格規避高風險投資。',
        };
    }
  }, [chart.dayMaster]);

  return {
    tenGodCounts,
    sortedTenGods,
    topGod1,
    topCount1,
    topGod2,
    topCount2,
    wealthLocations,
    isNoWealth,
    isStrong,
    isWeak,
    patternResult,
    patternLabel,
    isContinuum,
    currentYear,
    currentAge,
    allDaYun,
    currentDaYun,
    currentLiuNian,
    daYunWealthDetails,
    combinedWealthAnalysis,
    customWealthGuide,
    scannedDates,
    zhiCount,
    dominantZhiType,
    baziLossDetails,
  };
}
