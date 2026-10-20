export interface CompatibilityRule {
  tenGodType: string;       // 十神類型
  tenGodName: string;       // 具體十神名稱
  traits: string;           // 特質描述
  weaknesses: string;       // 缺點
  strategy: string;         // 相處策略
}

// 依照講義 姻緣篇 第10-11頁
export const compatibilityRules: CompatibilityRule[] = [
  // ===== 財星 =====
  {
    tenGodType: "財星",
    tenGodName: "正財",
    traits: "誠實守信、任勞任怨、腳踏實地、重視穩定與社會信用",
    weaknesses: "保守拘謹、安於現狀、斤斤計較、缺乏改變現狀的勇氣",
    strategy: "鼓勵跨出舒適圈、嘗試新思維。交流投資理財想法，建立經濟安全感。"
  },
  {
    tenGodType: "財星",
    tenGodName: "偏財",
    traits: "辦事圓滑、人緣極佳、生意頭腦佳、慷慨大方、拿得起放得下",
    weaknesses: "奢侈浪費、物慾高、過度自信、輕忽風險、愛面子",
    strategy: "協助控管風險、強迫儲蓄。一起享受生活，但適時踩煞車。"
  },

  // ===== 官殺 =====
  {
    tenGodType: "官殺",
    tenGodName: "正官",
    traits: "品行端正、責任心強、知禮守法、重視紀律與社會功名",
    weaknesses: "墨守成規、不知變通、優柔寡斷、太在乎別人看法",
    strategy: "協助放鬆減壓、協助決策。守時、守信、尊重規則，給他安全感。"
  },
  {
    tenGodType: "官殺",
    tenGodName: "七殺",
    traits: "果斷威嚴、英雄主義、自我要求高、執行力強",
    weaknesses: "過於強勢、同理心弱、目標感太強、不近人情",
    strategy: "溝通放軟、給予壓力緩衝區。展現面對挑戰的勇氣，但不要跟他硬碰硬。"
  },

  // ===== 食傷 =====
  {
    tenGodType: "食傷",
    tenGodName: "食神",
    traits: "溫和享樂、喜愛美食生活、富藝術氣息、有才華",
    weaknesses: "易分心、三分鐘熱度、過於安逸、做事憑感覺顯得懶散",
    strategy: "傾聽想法、協助排序事務優先順序。一同享受美食、探索生活樂趣。"
  },
  {
    tenGodType: "食傷",
    tenGodName: "傷官",
    traits: "反應靈敏、不甘平凡、聰明叛逆、有才華、照顧別人",
    weaknesses: "叛逆好勝、衝撞權威、想法跳躍、生活不能無聊",
    strategy: "避免正面衝突、多讚美他。欣賞他的才華，給他舞台發揮。"
  },

  // ===== 印星 =====
  {
    tenGodType: "印星",
    tenGodName: "正印",
    traits: "待人寬厚、不喜爭執、重和諧、喜歡被照顧、淡泊名利",
    weaknesses: "易被動、過於依賴、缺乏獨立思考、易懶散",
    strategy: "帶領行動，跨出舒適圈。溫柔引領、陪伴傾聽，他是典型的慢郎中。"
  },
  {
    tenGodType: "印星",
    tenGodName: "偏印",
    traits: "觀察敏銳、直覺強、與玄學宗教有緣、重視界線",
    weaknesses: "獨來獨往、悲觀負面、鑽牛角尖、不善社交",
    strategy: "引導正向思考、多出門散心、給予私人空間。不要催促他，尊重他的節奏。"
  },

  // ===== 比劫 =====
  {
    tenGodType: "比劫",
    tenGodName: "比肩",
    traits: "強硬不服輸、重朋友、自尊心強、講義氣、愛面子",
    weaknesses: "固執己見、容易感情用事、公私界線模糊",
    strategy: "給足面子、大力支持。把他當自己人，融入他的朋友圈。"
  },
  {
    tenGodType: "比劫",
    tenGodName: "劫財",
    traits: "反應靈敏、號召力強、應變能力佳、樂於助人、重情重義",
    weaknesses: "魯莽行動、不善理財、易因朋友陷入困境、太愛面子",
    strategy: "給足面子、留意朋友借貸。協助強迫儲蓄或置產，幫他守住錢財。"
  }
];

// 輔助查詢函式：根據十神名稱取得相處策略
export function getCompatibilityRule(tenGodName: string): CompatibilityRule | undefined {
  return compatibilityRules.find(r => r.tenGodName === tenGodName);
}

// 輔助查詢函式：根據十神類型取得所有子類型
export function getCompatibilityByType(tenGodType: string): CompatibilityRule[] {
  return compatibilityRules.filter(r => r.tenGodType === tenGodType);
}
