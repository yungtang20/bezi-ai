// src/data/careerRoles.ts

export interface CareerRole {
  tenGod: string;           // 十神
  role: string;             // 職場角色
  suitable: string;         // 適合環境
  advice: string;           // 發展建議
}

export const careerRoles: CareerRole[] = [
  {
    tenGod: "正官",
    role: "天生的管理者",
    suitable: "制度完善的大公司、公務體系，重視規範與流程",
    advice: "按部就班易升遷，適合管理職。與食傷多者合作可補創意不足。"
  },
  {
    tenGod: "七殺",
    role: "高壓環境的征服者",
    suitable: "挑戰性強、變動快的環境，軍警、消防、危機處理",
    advice: "能在危機中脫穎而出。身強者易成行業權威，身弱者需多補充能量。"
  },
  {
    tenGod: "正財",
    role: "穩健的執行者",
    suitable: "固定收入、穩定累積型，會計、公務員、工程師",
    advice: "財務管理能力強。正財二個以上性質轉偏財，可嘗試靈活收入模式。"
  },
  {
    tenGod: "偏財",
    role: "機會的獵人",
    suitable: "業務、創業、投資等高流動收入環境",
    advice: "敢冒風險，適合績效導向工作。注意風險控管，勿過度自信。"
  },
  {
    tenGod: "食神",
    role: "創意的享受者",
    suitable: "美食、娛樂、藝術、教育、自媒體",
    advice: "工作氛圍重於一切。適合有創意空間的環境，不宜高壓管理。"
  },
  {
    tenGod: "傷官",
    role: "規則的突破者",
    suitable: "創意、設計、自由業，不喜被管束的環境",
    advice: "適合獨立接案或創業。避免墨守成規的工作，注意禍從口出。"
  },
  {
    tenGod: "正印",
    role: "知識的沉澱者",
    suitable: "教育、研究、行政內勤，需要靜心深耕的領域",
    advice: "適合有完善SOP的工作。學習力強，適合持續進修與專業深化。"
  },
  {
    tenGod: "偏印",
    role: "冷門的鑽研者",
    suitable: "宗教、玄學、心理、專業技術等需要深度洞察的領域",
    advice: "適合獨立作業。重視個人空間，不適合高壓或需大量社交的環境。"
  },
  {
    tenGod: "比肩",
    role: "團隊的先鋒",
    suitable: "重視夥伴與平等關係的工作，適合與人並肩作戰",
    advice: "不宜單打獨鬥。廣結善緣、多方合作，身弱者朋友多為貴人。"
  },
  {
    tenGod: "劫財",
    role: "人際的連結者",
    suitable: "公關、行銷、業務，善於運用群體力量",
    advice: "人脈即資源。注意金錢界線，避免因朋友破財。適合廣結善緣。"
  }
];

export function getCareerRole(tenGod: string): CareerRole | undefined {
  return careerRoles.find(r => r.tenGod === tenGod);
}
