import type { FiveElement } from '../core/types';

export interface CareerGuide {
  dayMaster: FiveElement;
  goodDays: {
    stems: string;
    branches: string;
    combinations: string[];
  };
  fengShui: {
    element: FiveElement;
    directions: string[];
    colors: string;
    luckyItems: string[];
  };
  boostActions: string;
}

export const CAREER_GUIDELINES: Record<FiveElement, CareerGuide> = {
  '金': {
    dayMaster: '金',
    goodDays: {
      stems: '丙、丁 (官殺)',
      branches: '寅、巳、午、未、戌 (含火)',
      combinations: ['丙寅', '丁巳', '丙午', '丁未', '丙戌']
    },
    fengShui: {
      element: '火',
      directions: ['東北方', '正南方', '東南方', '西南方'],
      colors: '紅色、黃色、橙色、綠色',
      luckyItems: ['馬、虎、狗、羊、蛇的木製擺件', '紅色、橙色、黃色的陶瓷擺件']
    },
    boostActions: '坐官殺方位寫提案、開會。整理事業宮位的佈置擺件。'
  },
  '木': {
    dayMaster: '木',
    goodDays: {
      stems: '庚、辛 (官殺)',
      branches: '丑、巳、申、酉、戌 (含金) ＋ 辰 (濕土可生金)',
      combinations: ['庚申', '庚戌', '辛丑', '辛巳', '辛酉', '庚辰']
    },
    fengShui: {
      element: '金',
      directions: ['正西方', '西南方', '西北方', '東北方'],
      colors: '白色、灰色、金色、銀色',
      luckyItems: ['蛇、猴、雞、牛的金屬擺件', '金屬製鬧鐘、錢幣、風鈴、音樂盒', '白/灰/金/銀色瓶身香氛', '金銀色燈罩的燈具']
    },
    boostActions: '坐官殺方位寫提案、開會。整理事業宮位的佈置擺件。'
  },
  '水': {
    dayMaster: '水',
    goodDays: {
      stems: '戊、己 (官殺)',
      branches: '丑、寅、辰、巳、午、未、申、戌 (含土)',
      combinations: ['戊寅', '戊辰', '戊午', '戊申', '戊戌', '己巳', '己丑', '己未']
    },
    fengShui: {
      element: '土',
      directions: ['東北方', '西南方', '東南方', '西北方'],
      colors: '紅色、黃色、橘色、土黃色',
      luckyItems: ['馬、狗、羊、蛇、龍、牛生肖擺件（紅橙黃色陶瓷/玉石/原色陶土）', '紅/黃/橘地毯', '紅/紫色瓶身香氛', '紅/紫花、植物', '紅色燈具或鹽燈']
    },
    boostActions: '坐官殺方位寫提案、開會。整理事業宮位的佈置擺件。'
  },
  '火': {
    dayMaster: '火',
    goodDays: {
      stems: '壬、癸 (官殺)',
      branches: '子、丑、辰、申、亥 (含水)',
      combinations: ['壬子', '癸丑', '壬辰', '壬申', '癸亥']
    },
    fengShui: {
      element: '水',
      directions: ['正北方', '西北方', '正西方', '東北方'],
      colors: '藍色、黑色、藍綠色、白色、灰色、金色、銀色',
      luckyItems: ['鼠、豬、龍、雞、牛、猴之金屬、玻璃、水晶製品', '裝水的水缸或玻璃水杯']
    },
    boostActions: '坐官殺方位寫提案、開會。整理事業宮位的佈置擺件。'
  },
  '土': {
    dayMaster: '土',
    goodDays: {
      stems: '甲、乙 (官殺)',
      branches: '寅、卯、辰、未、亥 (含木)',
      combinations: ['甲寅', '乙卯', '甲辰', '乙未', '乙亥']
    },
    fengShui: {
      element: '木',
      directions: ['東北方', '正東方', '東南方'],
      colors: '綠色、藍綠色',
      luckyItems: ['豬、兔、羊、虎、龍的木製品', '綠色植栽（如：萬年青、竹子）', '綠水晶、翡翠', '綠色燈具']
    },
    boostActions: '坐官殺方位寫提案、開會。整理事業宮位的佈置擺件。'
  }
};

export const BRANCH_CAREER_SUITABILITY = [
  {
    type: '寅申巳亥多 (四馬地)',
    trait: '宜動態、移動類型',
    details: ['工作地點或內容常有變動', '常出差、四處移動']
  },
  {
    type: '辰戌丑未多 (四墓庫)',
    trait: '宜靜態、穩定型',
    details: ['宜定點、獨處工作', '適合深耕專精領域或易與宗教有緣']
  },
  {
    type: '子午卯酉多 (四桃花)',
    trait: '舞台位、桃花地',
    details: ['宜對外曝光、展露自我', '例：時尚精品、娛樂、演藝、公關、自媒體']
  }
];

export const JOB_TRANSFER_TIMING = {
  strong: '身強轉職時機：宜轉職流年為「財、官殺、食傷」的五行。因身強需「耗洩日主」能量，所以在這些流年工作表現佳，適合轉換跑道把握好流年。',
  weak_balanced: '身弱轉職時機 (若大運幫扶日主，五行平衡)：宜轉職流年一樣為「財、官殺、食傷」的五行。此時因大運幫身平衡，故可承擔耗洩，能順利轉換。',
  weak_unbalanced: '身弱轉職時機 (若大運削弱日主，五行不平衡)：宜轉職流年為「印、比劫」的五行。此時需幫扶日主，不宜單打獨鬥，轉職後宜分工支援。'
};

export const CAREER_CROSS_MATCHING: Record<string, { type: string; title: string; desc: string; }[]> = {
  '財星': [
    { type: '食傷', title: '以技術專業、創意、表達得財，非貨物貿易', desc: '創意型：設計、企劃、教育\n溝通型：諮詢、仲介、業務' },
    { type: '官殺', title: '大組織/大企業，或 B2B 生意', desc: '官殺透干到主星，適合財務管理金流/業績/客戶\n官殺在主星易升官、當管理職\n創業者適合 B2B 生意，如批發、工程建設' },
    { type: '印星', title: '繼承家業、祖產', desc: '善讀書，適合醫療產業、繼承家族企業或祖產' },
    { type: '比劫', title: '團隊工作、連結人脈得財', desc: '團隊工作、連結人脈得財。例：獅子會、扶輪社、商會、仲介' }
  ],
  '官殺': [
    { type: '財星', title: '主責財務、B2B 生意', desc: '適合在大公司主責財務，官殺在主星易升官。\n創業者適合 B2B (批發、代理、產業鏈)，不適合零售' },
    { type: '食傷', title: '領導導向、策略規劃', desc: '領導風格鮮明，適合在大公司擔任領導者、負責策略規劃。\n※留意傷官見官：易與長官不合，需多正面思考' },
    { type: '印星', title: '身殺兩停、高機率升官', desc: '長官緣佳，高機率升官、領域權威。\n適合特助、大公司內勤，例如：人資、行政、倉管' },
    { type: '比劫', title: '領導團隊、人脈', desc: '官殺(領導權威) + 比劫(團體、人脈)\n適合在大公司內領導團隊' }
  ],
  '食傷': [
    { type: '財星', title: '面對大眾、toC', desc: '技術、服務、創意、溝通型\n例：諮詢、仲介業務、服務產業、翻譯' },
    { type: '官殺', title: '挑戰公權力、民意代表', desc: '主星有傷官，擅表達、喜挑戰公權力\n適合當律師、民意代表' },
    { type: '印星', title: 'SOP 與多方溝通', desc: '耐性佳、擅多方溝通，適合有完善 SOP 的工作。\n例：客服、倉管物流、設計、企劃' },
    { type: '比劫', title: '人脈經營型', desc: '溝通協調、人脈經營型(客戶一個介紹一個)\n例：專案管理、商會。收入以人脈支撐' }
  ],
  '印星': [
    { type: '財星', title: '從醫、醫療產業', desc: '適合從醫、醫療產業，需要高度同理心與專注。' },
    { type: '官殺', title: '內勤管理職', desc: '任職大公司、擔任管理職\n例：內勤部門主管、公關、特助' },
    { type: '食傷', title: '有完整 SOP 的工作', desc: '有完整 SOP 的工作，做事能按部就班\n例：供應鏈、物流、倉儲、客服' },
    { type: '比劫', title: '行政文書、營運後勤', desc: '重視公私界線、作息穩定\n例：營運後勤、行政文書。不適合高彈性或責任制' }
  ],
  '比劫': [
    { type: '財星', title: '銷售接案、自營商', desc: '需透過人脈得財，善觀察市場、適合跑客戶、掌握資源\n例：銷售、接案、房仲、保險、創業、自營電商' },
    { type: '官殺', title: '嚴謹制度、激發管理', desc: '嚴謹制度、階級分明組織可激發管理能力\n例：法務、稽核、風險控管、軍警、消防、專案經理' },
    { type: '食傷', title: '發揮口才、創業', desc: '不喜管束、要有彈性。適合發揮口才、專業、創意。' },
    { type: '印星', title: '有固定流程、支援', desc: '適合規律、有固定流程\n例：支援、後勤、營運型。X責任模糊、快速創新工作' }
  ]
};

// 身強轉職流年：財、官殺、食傷。從五行找。這對應到身強的好運(洩剋耗)
// 身弱轉職流年：印、比劫。對應到身弱的好運(生扶)
// 此處直接結合 fiveElementsBalance.ts 的邏輯即可，故不再重複定義死資料。
