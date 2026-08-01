// src/data/wealthCareers.ts

export interface CareerMapping {
  tenGodType: string;       // 十神類型
  tenGodName: string;       // 具體十神
  suitableCareers: string;  // 適合行業
  wealthStyle: string;      // 財富模式
  partnerAdvice: string;    // 合夥建議
}

export const wealthCareers: CareerMapping[] = [
  {
    tenGodType: "財星",
    tenGodName: "正財",
    suitableCareers: "穩定累積型：會計、公務員、工程師、財務管理。適合固定薪資、長期積累。",
    wealthStyle: "穩健務實，重視穩定收入與儲蓄，不喜高風險。正財二個以上時性質轉偏財，不依賴固定收入。",
    partnerAdvice: "適合制度完善的合作，權責分明。正財多者建議獨資或明確主導權。"
  },
  {
    tenGodType: "財星",
    tenGodName: "偏財",
    suitableCareers: "高流動收入型：業務、創業、投資、接案、副業。以績效人脈得財。",
    wealthStyle: "用財大膽，敢冒風險，偏好機會財與投資。靈活收入，如業務、投資、分紅。",
    partnerAdvice: "注意權責與退場機制。身強者可主導，身弱者需慎選合夥人。"
  },
  {
    tenGodType: "官殺",
    tenGodName: "正官",
    suitableCareers: "制度完善的大公司、公務體系、固定場所型。重視規範與流程，易成模範員工、升主管。",
    wealthStyle: "透過職位、權力、管理獲取財富。收入與職務高低直接相關。",
    partnerAdvice: "適合與食傷多的夥伴互補（一人管流程、一人做創意）。"
  },
  {
    tenGodType: "官殺",
    tenGodName: "七殺",
    suitableCareers: "高壓、高變動環境：危機處理、軍警、消防、管理職、顧問公司、專案經理。",
    wealthStyle: "擅危機處理，不喜拖泥帶水的管理。創業宜B2B、與政府往來。",
    partnerAdvice: "適合與印星多的夥伴互補（印星提供後勤規劃、耐心支援）。"
  },
  {
    tenGodType: "食傷",
    tenGodName: "食神",
    suitableCareers: "創意、美食、娛樂、藝術、教育、自媒體。工作氛圍重於一切。",
    wealthStyle: "以技術、表達、創意換取財富。食傷生財，適合諮詢、仲介、團購。",
    partnerAdvice: "適合與官殺多的夥伴互補（官殺訂方向、管進度）。"
  },
  {
    tenGodType: "食傷",
    tenGodName: "傷官",
    suitableCareers: "創意、設計、自由業、律師、民意代表。不喜被管束，適合獨立接案。",
    wealthStyle: "以專業技術、創意突破獲得財富。主星有傷官，擅表達，適合自媒體。",
    partnerAdvice: "適合與印星多的夥伴互補（印星整理架構、深化內容）。慎選合夥，避免兩方皆傷官。"
  },
  {
    tenGodType: "印星",
    tenGodName: "正印",
    suitableCareers: "教育、研究、行政內勤、醫療、宗教。需要靜心深耕的領域。",
    wealthStyle: "受長輩照顧、從父母親戚處得財。重視私領域、安全感。",
    partnerAdvice: "適合繼承家族企業。與食傷多的夥伴互補（印星提供規劃，食傷提供創意）。"
  },
  {
    tenGodType: "印星",
    tenGodName: "偏印",
    suitableCareers: "宗教、玄學、心理、專業技術、冷門知識領域。需要深度洞察。",
    wealthStyle: "受長輩照顧。適合醫療產業、專業變現。",
    partnerAdvice: "適合與財星多的夥伴互補（財星助專業變現）。印星多者公私界線分明。"
  },
  {
    tenGodType: "比劫",
    tenGodName: "比肩",
    suitableCareers: "團隊合作型：銷售、接案、房仲、保險、創業。不宜單打獨鬥。",
    wealthStyle: "透過朋友、人脈得財。創業宜輕資產、賺轉手財、仲介費。",
    partnerAdvice: "慎選合作對象。身強者建議獨資，身弱者朋友多為貴人適合合夥。"
  },
  {
    tenGodType: "比劫",
    tenGodName: "劫財",
    suitableCareers: "公關、行銷、業務、採購、自營電商。善於運用群體力量。",
    wealthStyle: "人際活躍，但易破財。資金應保本，宜做花費類型工作。",
    partnerAdvice: "注意金流控管、進銷存、預算。身弱者比劫幫身，適合合夥。"
  }
];

// 輔助查詢函式
export function getWealthCareer(tenGodName: string): CareerMapping | undefined {
  return wealthCareers.find(r => r.tenGodName === tenGodName);
}

export function getWealthCareersByType(tenGodType: string): CareerMapping[] {
  return wealthCareers.filter(r => r.tenGodType === tenGodType);
}
