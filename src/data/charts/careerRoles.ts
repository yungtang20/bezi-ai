export interface CareerRole {
  tenGodType: string;
  tenGodName: string;
  role: string;
  suitable: string;
  advice: string;
}

export const careerRoles: CareerRole[] = [
  {
    tenGodType: '官殺',
    tenGodName: '正官',
    role: '規則守護者 / 領導幹部',
    suitable: '遵守制度、重視紀律，處事穩重有耐心，適合規範明確、流程嚴謹的環境。',
    advice: '穩定發展，升遷按部就班。可適度增加彈性，學習應變能力。'
  },
  {
    tenGodType: '官殺',
    tenGodName: '七殺',
    role: '危機處理專家 / 開拓將領',
    suitable: '抗壓性強、危機處理能力佳，在競爭與壓力環境中更能激發潛能。',
    advice: '敢衝敢拚，但不宜與人衝突過大。'
  },
  {
    tenGodType: '財星',
    tenGodName: '正財',
    role: '穩健執行長 / 守成者',
    suitable: '性格保守、按部就班，做事穩健踏實，重視穩定與積累，適合制度化的環境。',
    advice: '穩紮穩打是你的強項，但也需培養宏觀視野，不怕改變舒適圈。'
  },
  {
    tenGodType: '財星',
    tenGodName: '偏財',
    role: '資源整合者 / 投資家',
    suitable: '做事結果導向、展現開拓精神，靈活變通，適合需要創新與突破的環境。',
    advice: '機會多但誘惑也多，投資需做好風險控管，避免貪多嚼不爛。'
  },
  {
    tenGodType: '食傷',
    tenGodName: '食神',
    role: '生活品味家 / 快樂創作者',
    suitable: '積極營造輕鬆氛圍，擅長溝通協調，適合需要團隊互動與和諧氣氛的環境。',
    advice: '發揮才華時需培養持久力，有時可多一些功利心來獲取該得的報酬。'
  },
  {
    tenGodType: '食傷',
    tenGodName: '傷官',
    role: '打破體制者 / 創新鬼才',
    suitable: '主動提供創新大膽點子，反應快、喜歡突破框架，適合需要變革與創意的環境。',
    advice: '才華洋溢但易恃才傲物，在團體中需學習收斂鋒芒，以免遭忌。'
  },
  {
    tenGodType: '印星',
    tenGodName: '正印',
    role: '知識傳遞者 / 幕後推手',
    suitable: '處事穩重、有耐心，善學習且包容力強，適合需要深度與長期投入的環境。',
    advice: '有耐性且包容力強，但應避免過度保護他人而失去自我成長動力。'
  },
  {
    tenGodType: '印星',
    tenGodName: '偏印',
    role: '深度洞察者 / 專項職人',
    suitable: '善於深度思考、鑽研專業，適合需要專注研究與長期深耕的環境。',
    advice: '擁有一門深入技術，但不喜迎合世俗，建議與他人合作，互補不足。'
  },
  {
    tenGodType: '比劫',
    tenGodName: '比肩',
    role: '穩健合夥人 / 獨立工作者',
    suitable: '重視夥伴關係、團隊合作，講義氣且好勝不服輸，適合需要協作與夥伴關係的環境。',
    advice: '有堅持到底的毅力，但有時過於重視自身觀點而難被說服。'
  },
  {
    tenGodType: '比劫',
    tenGodName: '劫財',
    role: '公關外交官 / 競爭突圍者',
    suitable: '善於運用群體力量，人際交往能力強，在競爭環境中能逆勢成長。',
    advice: '人際能量強大，但須注意別因人情壓力而損害自身利益。'
  }
];

export function getCareerRole(tenGodName: string): CareerRole | undefined {
  return careerRoles.find(cr => cr.tenGodName === tenGodName);
}
