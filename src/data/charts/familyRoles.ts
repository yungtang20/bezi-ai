export interface FamilyRole {
  tenGodType: string;
  tenGodName: string;
  parentInteraction: string;
  childInteraction: string;
}

export const familyRoles: FamilyRole[] = [
  {
    tenGodType: '印星',
    tenGodName: '正印',
    parentInteraction: '重視個人空間與界線、不管閒事，尊重孩子決定、比較佛系。相處策略：在意長幼有序、做足禮貌、孝順。只要報備，原則不干涉。',
    childInteraction: '懶散、行動力低、喜歡獨處，不喜溝通。相處策略：瞭解孩子興趣，多聊天、協助培養執行力與時間觀念、把想法落實。'
  },
  {
    tenGodType: '印星',
    tenGodName: '偏印',
    parentInteraction: '重視個人空間與界線、不管閒事，尊重孩子決定、比較佛系。相處策略：在意長幼有序、做足禮貌、孝順。只要報備，原則不干涉。',
    childInteraction: '懶散、行動力低、喜歡獨處，不喜溝通。相處策略：瞭解孩子興趣，多聊天、協助培養執行力與時間觀念、把想法落實。'
  },
  {
    tenGodType: '財星',
    tenGodName: '正財',
    parentInteraction: '性格務實、重視理財儲蓄觀念、信用評分好不好。相處策略：說明經濟方面的「實質計劃」、交流、請教理財決策。',
    childInteraction: '對金錢敏感、在乎財務公平分配。相處策略：及早教導理財觀念、培養金錢以外的安全感，避免太勢利。'
  },
  {
    tenGodType: '財星',
    tenGodName: '偏財',
    parentInteraction: '性格務實、重視理財儲蓄觀念。相處策略：說明經濟方面的「實質計劃」、交流、請教理財決策。',
    childInteraction: '對金錢敏感、在乎財務公平分配。相處策略：及早教導理財觀念、培養金錢以外的安全感，避免太勢利。'
  },
  {
    tenGodType: '官殺',
    tenGodName: '正官',
    parentInteraction: '性格正派、在意社會眼光、守信、重規矩不喜混亂。相處策略：報備行蹤、守承諾、展現自律。',
    childInteraction: '天生自律、自我要求高、壓力大。自律模範生。相處策略：減壓、多鼓勵陪伴，讓孩子放鬆。'
  },
  {
    tenGodType: '官殺',
    tenGodName: '七殺',
    parentInteraction: '性格威嚴，重視輸贏。嚴厲自律、目標導向，講求效率。相處策略：溝通不找藉口，講重點。',
    childInteraction: '自我要求高，執行力強，但給自己壓力過大，易急躁、偏激。相處策略：減壓、多鼓勵陪伴，讓孩子放鬆。'
  },
  {
    tenGodType: '食傷',
    tenGodName: '食神',
    parentInteraction: '孩子氣、像朋友般相處，喜歡溝通聊天。在意孩子快樂成長，一起吃喝玩樂。相處策略：多聊天交流，分享興趣。',
    childInteraction: '興趣廣泛、好奇心強盛，但專注力低，需練習專注。相處策略：花時間陪伴探索興趣、需大量的陪伴、互動。'
  },
  {
    tenGodType: '食傷',
    tenGodName: '傷官',
    parentInteraction: '孩子氣、像朋友般相處。好勝心較強，在意孩子成績表現，會教你怎麼做。相處策略：多聊天交流，分享興趣。',
    childInteraction: '興趣廣泛、好奇心強盛。個性急躁，需教導耐心。相處策略：花時間陪伴探索興趣、需大量的陪伴、互動。'
  },
  {
    tenGodType: '比劫',
    tenGodName: '比肩',
    parentInteraction: '朋友多，重義氣、愛面子。相處策略：保持嘴甜、多幫父母做面子、可尋求父母人脈協助。',
    childInteraction: '重視同儕關係、朋友影響力大於家庭。相處策略：篩選環境、朋友圈。多安排團體運動，幫助放電。'
  },
  {
    tenGodType: '比劫',
    tenGodName: '劫財',
    parentInteraction: '朋友多，重義氣、愛面子。相處策略：保持嘴甜、多幫父母做面子、可尋求父母人脈協助。',
    childInteraction: '重視同儕關係、朋友影響力大於家庭。固執、體力好。相處策略：篩選環境、朋友圈。多安排團體運動，幫助放電。'
  }
];

export function getFamilyRole(tenGodName: string): FamilyRole | undefined {
  return familyRoles.find(fr => fr.tenGodName === tenGodName);
}

export interface RelativesMapping {
  male: Record<string, string>;
  female: Record<string, string>;
}

export const SIBLING_RELATIONS = {
  fortune: [
    '比劫為喜用神 (身弱/從強)：兄弟姐妹可陪伴傾聽，提供好建議。',
    '比劫為忌神 (身強/從弱)：兄弟姐妹關係糾紛、相處累。'
  ],
  weakConnection: [
    '命盤無「比劫」：長大後較無交集。',
    '比劫星離日主遠 (例如在年柱)：與手足居住地較遠。',
    '比劫該柱遭流年或大運沖/刑：易與手足鬧不愉快，聚少離多。提醒手足出入平安，注意健康狀況。'
  ],
  traits: [
    { tenGod: '財星較多', trait: '在乎付出回報要平衡。善投資理財。', strategy: '平等互惠，有來有往。' },
    { tenGod: '官殺較多', trait: '作息規律，按步就班。', strategy: '尊重倫理，配合步調。長幼有序。' },
    { tenGod: '食傷較多', trait: '重視興趣，追求快樂。', strategy: '聊手足感興趣的話題。諮詢煩惱。' },
    { tenGod: '比劫較多', trait: '朋友多、人緣佳。', strategy: '融入手足朋友圈，請手足介紹人脈。' },
    { tenGod: '印星較多', trait: '心地善良，不喜管閒事，注重界線。', strategy: '主動開口，請手足提供協助。' },
  ]
};

export const FAMILY_CHANGES = {
  moving: [
    '大運與年支(國家)相沖：可能在國外生活、頻繁奔波外國、移民海外、長距離移動。',
    '大運與日支(住所)相沖：外派其他城市工作，「家」變動，經常國內奔波、搬家出差 (短距離移動)。',
    '流年地支與日柱相沖：經常國內奔波、常搬家、出差、重新裝潢。',
    '流年地支與日支相刑：裝修房子易鬧糾紛。',
    '搬家吉日建議：農民曆找「宜入宅」或「移徙」的吉日，務必避開與家人生肖相沖的流日。'
  ],
  members: [
    '流年與月柱(父母宮)相沖：該年父母常旅遊外出或房子裝修、搬家。',
    '大運與月柱(父母宮)相沖：大運的十年間父母變動頻繁或長年居住國外。',
    '日支與時支相沖 (或大運流年沖時支)：小孩長大後離家較遠，如去外地讀書、工作、移民。',
    '日支與月支相沖：與原生家庭較有距離，因工作或學業較早搬離家中。',
    '日支與月支相刑：與家人易有衝突摩擦，因情緒不悅導致想搬家。'
  ]
};
export const RELATIVES_MAPPING: RelativesMapping = {
  male: {
    '正財': '錢財、男性長輩/父親、婚姻/感情/另一半',
    '偏財': '錢財、男性長輩/父親、婚姻/感情/另一半',
    '正官': '工作/老闆、小孩',
    '七殺': '工作/老闆、小孩',
    '食神': '文昌/考試運、員工/客戶/商品',
    '傷官': '文昌/考試運、員工/客戶/商品',
    '正印': '女性長輩、母親',
    '偏印': '女性長輩、母親',
    '比肩': '平輩、朋友、兄弟姐妹',
    '劫財': '平輩、朋友、兄弟姐妹'
  },
  female: {
    '正財': '錢財、男性長輩/父親',
    '偏財': '錢財、男性長輩/父親',
    '正官': '工作/老闆、婚姻/感情/另一半',
    '七殺': '工作/老闆、婚姻/感情/另一半',
    '食神': '文昌/考試運、員工/客戶/商品、小孩',
    '傷官': '文昌/考試運、員工/客戶/商品、小孩',
    '正印': '女性長輩、母親',
    '偏印': '女性長輩、母親',
    '比肩': '平輩、朋友、兄弟姐妹',
    '劫財': '平輩、朋友、兄弟姐妹'
  }
};
