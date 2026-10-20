/**
 * 家人相處 — 來源：家人相處.pdf
 * 涵蓋：父母/孩子互動、子女緣份、手足關係、家庭變動、健康警訊
 */

// 十神與父母/孩子互動策略
export interface FamilyInteraction {
  tenGodType: string;       // 十神類型（財星、官殺、食傷、印星、比劫）
  tenGodSubtype: string;    // 正星/副星（正財、偏財、正官、七殺...）
  parentTrait: string;      // 父母特質
  parentStrategy: string;   // 對父母相處策略
  childTrait: string;       // 孩子特質
  childStrategy: string;    // 對孩子相處策略
}

export const FAMILY_INTERACTIONS: FamilyInteraction[] = [
  {
    tenGodType: '財星',
    tenGodSubtype: '正財',
    parentTrait: '性格務實、重視理財儲蓄觀念、信用評分好不好',
    parentStrategy: '說明經濟方面的「實質計劃」、交流、請教理財決策',
    childTrait: '對金錢敏感、在乎財務公平分配',
    childStrategy: '及早教導理財觀念、培養金錢以外的安全感，避免太勢利'
  },
  {
    tenGodType: '財星',
    tenGodSubtype: '偏財',
    parentTrait: '性格務實、重視理財儲蓄觀念',
    parentStrategy: '說明經濟方面的「實質計劃」、交流、請教理財決策',
    childTrait: '對金錢敏感、在乎財務公平分配',
    childStrategy: '及早教導理財觀念、培養金錢以外的安全感，避免太勢利'
  },
  {
    tenGodType: '官殺',
    tenGodSubtype: '正官',
    parentTrait: '嚴肅自律、有責任感、喜按部就班生活',
    parentStrategy: '報備（讓父母掌握行蹤）、守承諾、展現自律、事情條理有規畫',
    childTrait: '天生自律、自我要求高、壓力大。正官＝自律模範生（優）。缺＝太過謹慎小心，怕做錯事。思想僵化。',
    childStrategy: '減壓、多鼓勵、陪伴。讓孩子放鬆，享受快樂。'
  },
  {
    tenGodType: '官殺',
    tenGodSubtype: '七殺',
    parentTrait: '性格威嚴，重視輸贏。嚴厲自律、目標導向，講求效率與結果。',
    parentStrategy: '溝通不找藉口，講重點，結果是什麼。展現面對挑戰的勇氣與執行力。',
    childTrait: '自我要求高，執行力強。優：自我要求高，執行力強。缺：給自己壓力過大，易急躁、偏激。',
    childStrategy: '減壓、多鼓勵、陪伴。讓孩子放鬆，享受快樂。'
  },
  {
    tenGodType: '食傷',
    tenGodSubtype: '食神',
    parentTrait: '孩子氣、像朋友般相處。喜歡溝通、聊天。有沒有在學習新的東西、進步。在意孩子快樂成長，一起吃喝玩樂。',
    parentStrategy: '多聊天交流、分享生活、興趣。',
    childTrait: '興趣廣泛、好奇心強盛。食神：專注力低，需練習專注。',
    childStrategy: '花時間陪伴探索興趣。需大量的陪伴、互動。'
  },
  {
    tenGodType: '食傷',
    tenGodSubtype: '傷官',
    parentTrait: '孩子氣、像朋友般相處。好勝心較強，在意孩子成績、表現。會教你怎麼做。',
    parentStrategy: '多聊天交流、分享生活、興趣。',
    childTrait: '興趣廣泛、好奇心強盛。傷官：個性急躁，需教導耐心。',
    childStrategy: '花時間陪伴探索興趣。需大量的陪伴、互動。'
  },
  {
    tenGodType: '印星',
    tenGodSubtype: '正印/偏印',
    parentTrait: '重視個人空間與界線、不管閒事，尊重孩子決定、比較佛系。',
    parentStrategy: '在意長幼有序、做足禮貌、孝順。只要報備，原則不干涉。',
    childTrait: '懶散、行動力低、喜歡獨處，不喜溝通。',
    childStrategy: '瞭解孩子興趣，多聊天。協助培養執行力與時間觀念。把想法落實。'
  },
  {
    tenGodType: '比劫',
    tenGodSubtype: '比肩/劫財',
    parentTrait: '朋友多，重義氣、愛面子。',
    parentStrategy: '保持嘴甜、多幫父母做面子。可尋求父母人脈協助。',
    childTrait: '重視同儕關係、朋友影響力大於家庭。比劫多體力好、固執。',
    childStrategy: '篩選環境、朋友圈。多安排團體運動，幫助放電，學習社交。'
  }
];

// 子女緣份 — 子息宮與子息星
export const FERTILITY_INFO = {
  // 子息宮：時柱
  palace: '時柱',

  // 子息星：男命以官殺代表兒子、食傷代表女兒；女命以食傷代表兒子、官殺代表女兒
  // 來源：家人相處.pdf L515
  star: {
    male: '官殺（兒子星）、食傷（女兒星）',
    female: '食傷（兒子星）、官殺（女兒星）'
  },

  // 子息星判讀原則
  judgment: [
    '天干：與子女緣分強、求子順利。',
    '地支主氣(支藏干中比例最高的)：與子女緣分、求子運皆不錯。',
    '中氣亦可參考，e.g.水：60%、木：40%=>佔比差不多',
    '地支餘氣：低參考價值。'
  ],

  // 若命盤中無子息星
  noStar: [
    '看夫妻兩方命盤：',
    '1.男無子息星、女有子息星=>有機會。',
    '2.男有子息星、女無子息星=>求子難。',
    '等待大運、流年補上子息運。'
  ],

  // 子女性別與數量（來源：家人相處.pdf L520-527）
  genderCount: [
    '食神代表女、傷官代表男。',
    '母親命盤：食神、傷官皆有=>兒女雙全。例：食神x2、傷官x1=男x2 女x1or 女x2 男x1。',
    '只有食神或只有傷官=>性別單一，孩子都是同性別。',
    '天地同源公式：子女星所在之時柱，若時柱天干與地支的五行完全相同（例如女命時柱為甲寅，甲與寅皆屬木，且皆為女命之食傷），預測孩子未來人緣極佳、長輩緣好，容易受到長輩提攜。',
    '剖腹產風險診斷：',
    '- 時支與日支或月支相刑或相沖（如時支丑、日支未）',
    '- 時支遭遇流年地支相刑或相沖（例如原局時支為卯，流年遇酉年）',
    '求子安產與擇日調理：',
    '- 夫妻雙方命盤合參，於流年天干或地支主氣補上女方食傷運時進行調理備孕。',
    '- 避開與產婦日支/生肖相沖之流日，挑選五行氣場平衡不偏枯之吉日。'
  ],

  // 子息星坐落的地支性格
  branchTraits: {
    '辰戌丑未': {
      name: '四墓庫',
      traits: ['安靜內斂', '喜靜態活動', '專注興趣，鑽研冷門知識'],
      strategy: ['少參加社交場合', '尊重鼓勵孩子興趣'],
      warning: '遇相刑流年：注意孩子人際關係、健康狀況。'
    },
    '寅申巳亥': {
      name: '四長生、驛馬',
      traits: ['活潑好動', '好奇心強', '電力十足'],
      strategy: ['安排動態活動', '釋放孩子電力'],
      warning: '遇相刑流年：孩子可能跌倒、外傷、出入留意安全。'
    },
    '子午卯酉': {
      name: '四正、桃花位、帝旺',
      traits: ['個性鮮明直接、情緒寫在臉上', '自尊心較強'],
      strategy: ['孩子吃軟不吃硬，同理陪伴與傾聽'],
      warning: '遇相刑流年：注意孩子意外跌倒或運動受傷。'
    }
  }
};

// 易懷孕時機
export const FERTILITY_TIMING = {
  male: '官殺「透干」之流年，地支主氣為官殺之流年。',
  female: '食傷「透干」之流年，地支主氣為食傷之流年。',
  table: [
    { element: '木', femaleFire: '丙、丁', femaleBranch: '巳(蛇)、午(馬)', maleMetal: '庚、辛', maleBranch: '申(猴)、酉(雞)' },
    { element: '火', femaleEarth: '戊、己', femaleBranch: '辰(龍)、戌(狗)、丑(牛)、未(羊)', maleWater: '壬、癸', maleBranch: '亥(豬)、子(鼠)' },
    { element: '土', femaleMetal: '庚、辛', femaleBranch: '申(猴)、酉(雞)', maleWood: '甲、乙', maleBranch: '寅(虎)、卯(兔)' },
    { element: '金', femaleWater: '壬、癸', femaleBranch: '亥(豬)、子(鼠)', maleFire: '丙、丁', maleBranch: '巳(蛇)、午(馬)' },
    { element: '水', femaleWood: '甲、乙', femaleBranch: '寅(虎)、卯(兔)', maleEarth: '戊、己', maleBranch: '辰(龍)、戌(狗)、丑(牛)、未(羊)' }
  ]
};

// 十神代表大家庭角色
export const FAMILY_ROLES = {
  '我剋': '財星 = 財、父親、姻緣(男)',
  '剋我': '官殺 = 官、事業、老闆、姻緣(女)、子息(男)',
  '我生': '食傷 = 創造力、讀書文昌、專業、子息(女)',
  '生我': '印星 = 母親',
  '同我': '比劫 = 平輩、兄弟姐妹、朋友'
};

// 家人健康警訊
export const FAMILY_HEALTH_WARNINGS = {
  clash: '沖=動盪、分離、衝撞、突發性、快速性。',
  punishment: '刑=糾結、折磨、傷害。',
  rules: [
    '①家人星該柱地支與大運/流年相沖：注意：家人跌倒、車關，突發疾病。注意：出入平安。',
    '②家人星該柱地支與大運流年相刑：'
  ],
  branchWarnings: {
    '寅申巳亥': {
      name: '驛馬',
      symbol: '動能、速度',
      warning: '車關、跌倒、突發疾病、意外傷害',
      advice: '放慢速度'
    },
    '辰戌丑未': {
      name: '四庫',
      symbol: '停滯、累積、收藏',
      warning: '體內長結石、腫瘤、息肉或患癌、慢性病、憂鬱症',
      advice: '健康檢查'
    }
  },
  weakBody: '身弱遇財旺流年/大運：破財、父親健康或財務有狀況、(男)伴侶狀況。'
};

// 輔助函式：根據十神類型取得互動策略
export function getFamilyInteraction(tenGodType: string): FamilyInteraction[] {
  return FAMILY_INTERACTIONS.filter(fi => fi.tenGodType === tenGodType);
}

// 輔助函式：根據地支取得子女性格特質
export function getChildTraits(branch: string): { name: string; traits: string[]; strategy: string[]; warning: string } | null {
  for (const [key, value] of Object.entries(FERTILITY_INFO.branchTraits)) {
    if (key.includes(branch)) {
      return value;
    }
  }
  return null;
}
