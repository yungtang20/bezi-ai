import type { FiveElement } from '../core/types';

export interface WealthGuide {
  dayMaster: FiveElement;
  wealthElement: FiveElement;
  wealthStems: string;
  wealthBranches: string;
  goodWealthDays: {
    stems: string;
    branches: string;
    combinations: string;
    combinationsDetail: string[];
  };
  fengShui: {
    directions: string[];
    colors: string;
    setup: string[];
    luckyItems: string;
    boostActions: string[];
  };
}

export const WEALTH_GUIDELINES: Record<FiveElement, WealthGuide> = {
  '金': {
    dayMaster: '金',
    wealthElement: '木',
    wealthStems: '甲、乙',
    wealthBranches: '寅、卯、辰、未、亥',
    goodWealthDays: {
      stems: '甲、乙、壬、癸',
      branches: '辰、寅、卯、亥、子、未 (含水、木)',
      combinations: '木＋木 / 木＋水',
      combinationsDetail: ['甲寅', '甲子', '乙卯', '甲辰', '壬寅', '癸卯', '乙未']
    },
    fengShui: {
      directions: ['東北方', '正東方', '東南方', '正北方'],
      colors: '綠色、藍綠色',
      setup: ['水缸', '地毯', '植栽、萬年青、竹子', '綠色水晶、翡翠', '綠色系燈具、玻璃水杯'],
      luckyItems: '豬、兔、羊、虎、龍的木製擺件',
      boostActions: ['財位水缸換水', '清潔擦拭財位擺件', '修剪、整理植栽']
    }
  },
  '木': {
    dayMaster: '木',
    wealthElement: '土',
    wealthStems: '戊、己',
    wealthBranches: '寅、辰、巳、午、未、申、戌',
    goodWealthDays: {
      stems: '丙、丁、戊、己',
      branches: '寅、午、戌、未、巳 (含土、火)',
      combinations: '土＋土 / 火＋土',
      combinationsDetail: ['丙寅', '丙午', '丙戌', '丁未', '丁巳', '戊戌', '戊寅', '戊午', '己未', '己巳']
    },
    fengShui: {
      directions: ['東北方', '東南方', '正南方', '西南方', '西北方'],
      colors: '土色系：紅、橘、黃、土黃',
      setup: ['水缸', '土色系掛畫、水杯', '土色系琉璃/水晶/玉石/陶土', '土色系地毯', '紅/紫花', '紅色燈具'],
      luckyItems: '馬、狗、羊、蛇、龍、牛的陶製/玉石擺件 或紅/橘/黃色布偶',
      boostActions: ['財位水缸換水', '清潔擦拭財位擺件']
    }
  },
  '水': {
    dayMaster: '水',
    wealthElement: '火',
    wealthStems: '丙、丁',
    wealthBranches: '寅、巳、午、未、戌',
    goodWealthDays: {
      stems: '甲、乙、丙、丁',
      branches: '寅、卯、辰、巳、午、未、戌 (含木、火)',
      combinations: '火＋火 / 木＋火',
      combinationsDetail: ['甲寅', '丙辰', '乙未', '乙巳', '甲午', '甲戌', '丙午', '丙戌', '丙寅', '丁未', '丁巳']
    },
    fengShui: {
      directions: ['正東方', '東南方', '正南方', '西南方'],
      colors: '火色系：紅、黃、橘、綠色',
      setup: ['水缸', '火色系陶瓷品', '火色系掛畫', '火色系地毯', '紅/紫色瓶身香氛、花、植栽', '紅色燈具、鹽燈'],
      luckyItems: '馬、虎、狗、羊、蛇木製擺件 或紅/橘/黃色布偶',
      boostActions: ['財位水缸換水', '清潔擦拭財位擺件']
    }
  },
  '火': {
    dayMaster: '火',
    wealthElement: '金',
    wealthStems: '庚、辛',
    wealthBranches: '丑、巳、申、酉、戌',
    goodWealthDays: {
      stems: '庚、辛、戊、己',
      branches: '丑、辰、申、酉 (含金、土)',
      combinations: '金＋金 / 土＋金',
      combinationsDetail: ['庚辰', '辛丑', '己丑', '戊申', '庚申', '辛酉']
    },
    fengShui: {
      directions: ['正西方', '西北方', '西南方', '東北方'],
      colors: '金色系：白、灰、金、銀色',
      setup: ['水缸', '金色系掛畫', '金色系燈罩燈具', '白瓶身香氛', '金銀元素物件'],
      luckyItems: '蛇、猴、雞、牛的金飾擺件',
      boostActions: ['財位水缸換水', '清潔擦拭財位擺件']
    }
  },
  '土': {
    dayMaster: '土',
    wealthElement: '水',
    wealthStems: '壬、癸',
    wealthBranches: '子、丑、辰、申、亥',
    goodWealthDays: {
      stems: '庚、辛、壬、癸',
      branches: '申、酉、子、丑、亥、辰 (含金、水)',
      combinations: '水＋水 / 金＋水',
      combinationsDetail: ['壬申', '壬子', '壬辰', '癸酉', '癸丑', '癸亥', '庚子', '庚辰', '庚申', '辛亥']
    },
    fengShui: {
      directions: ['正北方', '正西方', '西北方', '東北方'],
      colors: '水色系：藍、黑、藍綠、白、灰、金、銀',
      setup: ['水缸', '冷色系、金屬擺飾', '白瓶身香氛', '水色系燈具/鹽燈'],
      luckyItems: '鼠、豬、龍、雞、牛、猴的擺件',
      boostActions: ['財位水缸換水', '清潔擦拭財位擺件']
    }
  }
};

export const WEALTH_PILLAR_MEANINGS = {
  '時柱': {
    title: '子息宮',
    details: ['後代財富豐厚']
  },
  '日柱': {
    title: '夫妻宮',
    details: ['自身或伴侶善於賺錢', '伴侶家境佳', '與伴侶共同打拼賺錢']
  },
  '月柱': {
    title: '父母宮',
    details: ['父母留財', '獲外人投資']
  },
  '年柱': {
    title: '祖業宮',
    details: ['家族企業', '傳承祖產']
  }
};

export const NO_WEALTH_REMEDIES = {
  '食傷生財': '以專業技術、表達來得財',
  '正官七殺多': '透過工作人脈、資源得財',
  '正印偏印多': '受長輩照顧、從父母親戚處得財',
  '比肩劫財多': '從朋友處得財（⚠️留意合夥失財，建議獨資或採合作分潤）'
};

export const SOLVE_MONEY_LOSS = [
  {
    title: '主動破財',
    details: [
      '保本投資：ETF、儲蓄、買房',
      '債務清償：提早還房貸',
      '汰舊換新：添購新設備家具、車輛換新或保養',
      '佈施行善：愛心捐款、幫助他人',
      '進修學習：學習新知、提升自我'
    ]
  },
  {
    title: '破財大運/流年避做重大財務決定',
    details: [
      '不建議開店、創業、合夥、借貸（尤其當財星被沖）'
    ]
  },
  {
    title: '積極補充用神能量',
    details: [
      '當財星、用神被沖/合/剋，多補充用神能量（身強可補財星能量）',
      '加強風水財位佈置'
    ]
  }
];

export const WEALTH_LOST_TIMING = {
  strong: [
    '財星被沖：財星地支被流年/大運相沖。例如八字有寅(財)，走到申年(沖寅)，容易破財、投資失利。',
    '財星於天干，地支被沖：天干為財星，但同柱地支被流年沖。財根不穩，錢財容易流失。',
    '地支財星被合絆：地支財星與流年/大運相合(三合/六合)。表示錢財容易受人牽連，或有大筆資金被卡住。',
    '天干財星被合絆：天干財星與流年/大運天干五合。代表錢財在檯面上被人分走、借走或合夥糾紛。'
  ],
  weak: [
    '大運為忌神 (官殺、食傷) 時：走到財星、官殺、食傷的流年，因日主無法承擔過度耗洩，容易因龐大開銷、意外破財或投資判斷錯誤導致損失。',
    '財星被沖：雖然身弱不擔財，但財星代表養命之源，被沖破依然會有財務波動或損財狀況。',
    '地支財星被合絆：原本就不多的錢財被卡住，資金周轉困難。'
  ]
};
