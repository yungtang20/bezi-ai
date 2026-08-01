// src/data/familyRoles.ts

export interface FamilyRole {
  tenGodType: string;       // 十神類型
  role: string;             // 角色（父母/子女）
  traits: string;           // 特質描述
  strategy: string;         // 相處策略
}

export const familyRoles: FamilyRole[] = [
  // ===== 父母相處 =====
  {
    tenGodType: "財星",
    role: "父母",
    traits: "性格務實、重視理財儲蓄觀念、信用良好",
    strategy: "闡明經濟方面的「實質計劃」。交流、請教理財決策，展現你的經濟規劃能力。"
  },
  {
    tenGodType: "官殺",
    role: "父母",
    traits: "自律、有責任感、喜按部就班生活。正官：在意社會眼光、守信。七殺：重視輸贏、目標導向。",
    strategy: "正官多：記得報備行蹤、守承諾、展現自律。七殺多：溝通不找藉口，講重點，展現面對挑戰的勇氣與執行力。"
  },
  {
    tenGodType: "食傷",
    role: "父母",
    traits: "孩子氣、像朋友般相處。喜歡溝通、聊天。傷官：好勝心較強，在意孩子表現。食神：在意孩子快樂成長。",
    strategy: "多聊天交流、分享生活與興趣。傷官多的父母：展現你的成長與學習。食神多的父母：一起吃喝玩樂。"
  },
  {
    tenGodType: "印星",
    role: "父母",
    traits: "重視個人空間與界線、不干涉孩子決定、比較佛系",
    strategy: "在意長幼有序、做足禮貌與孝順。只要報備，他們原則上不干涉。不要催促他們。"
  },
  {
    tenGodType: "比劫",
    role: "父母",
    traits: "朋友多、重義氣、愛面子",
    strategy: "保持嘴甜、多幫父母做面子。可尋求父母人脈協助。"
  },

  // ===== 子女相處 =====
  {
    tenGodType: "財星",
    role: "子女",
    traits: "對金錢敏感、在乎財務公平分配",
    strategy: "及早教導理財觀念。培養金錢以外的安全感，避免過於勢利。"
  },
  {
    tenGodType: "官殺",
    role: "子女",
    traits: "正官：自律模範生，太過謹慎小心。七殺：自我要求高，易急躁偏激。天生自律，壓力大。",
    strategy: "正官多：適度放鬆標準，鼓勵犯錯。七殺多：協助減壓、多鼓勵陪伴，幫孩子放鬆享受快樂。"
  },
  {
    tenGodType: "食傷",
    role: "子女",
    traits: "興趣廣泛、好奇心強。傷官：個性急躁。食神：專注力低。",
    strategy: "花時間陪伴探索興趣。需要大量的陪伴與互動。傷官多的孩子需教導耐心。食神多的孩子需練習專注。"
  },
  {
    tenGodType: "印星",
    role: "子女",
    traits: "懶散、行動力低。喜歡獨處，不喜溝通。",
    strategy: "了解孩子興趣，多聊天。協助培養執行力與時間觀念。把想法落實，多鼓勵行動。"
  },
  {
    tenGodType: "比劫",
    role: "子女",
    traits: "重視同儕關係、朋友影響力大於家庭、體力好、固執",
    strategy: "慎選環境與朋友圈。多安排團體運動，幫助放電，學習社交。"
  }
];

export function getFamilyRole(tenGodType: string, role: string): FamilyRole | undefined {
  return familyRoles.find(r => r.tenGodType === tenGodType && r.role === role);
}
