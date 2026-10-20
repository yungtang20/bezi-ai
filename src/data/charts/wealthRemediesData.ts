// src/data/wealthRemediesData.ts

export interface WealthFengShui {
  dayMasterElement: string;
  remedyElement: string;
  directions: string;
  spaces: string;
  colors: string;
  decorations: string;
  zodiacs: string;
  actions: string[];
  wealthLuckyDays: string[];
}

export interface WealthDayGuide {
  colorSuite: string;
  amulets: string;
  direction: string;
  nobleZodiacs: string;
  remedyActions?: string;
}

export interface WealthRemedyDetail {
  fengShui: WealthFengShui;
  dayGuide: WealthDayGuide;
}

export const WEALTH_REMEDIES_DATA: Record<string, WealthRemedyDetail> = {
  '金': {
    fengShui: {
      dayMasterElement: '金',
      remedyElement: '木',
      directions: '東北、東南、正東、正北方',
      spaces: '客廳或個人空間',
      colors: '綠色系 (綠、藍綠色)',
      decorations: '水缸、地毯、植栽（萬年青、竹子）、綠色水晶、翡翠、綠色系燈具、玻璃水杯',
      zodiacs: '生肖 豬、兔、羊、虎、龍 的木製擺件',
      actions: ['財位水缸換水', '整理清潔擦拭財位擺件', '修剪、整理盆栽'],
      wealthLuckyDays: ['甲寅', '甲子', '乙卯', '甲辰', '壬寅', '癸卯', '乙未']
    },
    dayGuide: {
      colorSuite: '金、銀、白、灰',
      amulets: '金飾、銀飾、金屬擺件',
      direction: '西方、西北方',
      nobleZodiacs: '猴、雞、牛、龍',
      remedyActions: '多穿搭金、銀、白、灰，配戴金銀飾'
    }
  },
  '木': {
    fengShui: {
      dayMasterElement: '木',
      remedyElement: '土',
      directions: '東北、東南、西北、西南、正南方',
      spaces: '客廳或個人空間',
      colors: '土色系 (黃、土黃、紅、橘)',
      decorations: '水缸、土色系掛畫、水杯、土色系玻璃/水晶/玉石/陶土/地毯、紅/紫花、紅色燈具',
      zodiacs: '生肖 馬、狗、羊、蛇、龍、牛 的玻璃/水晶/陶製/玉石擺件，或紅/橘/黃色布偶',
      actions: ['財位水缸換水', '整理清潔擦拭財位擺件'],
      wealthLuckyDays: ['丙寅', '丙午', '丙戌', '丁未', '丁巳', '戊戌', '戊寅', '戊午', '己未', '己巳']
    },
    dayGuide: {
      colorSuite: '綠、藍綠',
      amulets: '木製品、綠色植栽',
      direction: '東方、東南方',
      nobleZodiacs: '虎、兔、豬、龍',
      remedyActions: '接觸大自然、栽種植栽、使用木製品'
    }
  },
  '水': {
    fengShui: {
      dayMasterElement: '水',
      remedyElement: '火',
      directions: '正南、正東、東南、西南方',
      spaces: '客廳或個人空間',
      colors: '火色系 (紅、橘、黃、綠)',
      decorations: '水缸。火色系陶瓷品/掛畫/地毯。紅/紫色瓶身香氛、花、植栽。紅色燈具、鹽燈',
      zodiacs: '生肖 馬、虎、狗、羊、蛇 的木製擺件，或紅/橘/黃色布偶',
      actions: ['財位水缸換水', '整理清潔擦拭財位擺件'],
      wealthLuckyDays: ['甲寅', '丙辰', '乙未', '乙巳', '甲午', '甲戌', '丙午', '丙戌', '丙寅', '丁未', '丁巳']
    },
    dayGuide: {
      colorSuite: '黑、藍',
      amulets: '金屬/玻璃/水晶製品、水缸',
      direction: '北方',
      nobleZodiacs: '鼠、猴、龍、豬',
      remedyActions: '日常接觸水：游泳、泡澡、多接觸水'
    }
  },
  '火': {
    fengShui: {
      dayMasterElement: '火',
      remedyElement: '金',
      directions: '西北、正西、西南、東北方',
      spaces: '客廳或個人空間',
      colors: '金色系 (白、灰、金、銀)',
      decorations: '水缸。金色系掛畫/燈罩燈具。白色瓶身香氛。金銀元素物件 (金屬的鬧鐘/錢幣/風鈴/音樂盒)',
      zodiacs: '生肖 蛇、猴、雞、牛 的金飾擺件',
      actions: ['財位水缸換水', '整理清潔擦拭財位擺件'],
      wealthLuckyDays: ['庚辰', '辛丑', '己丑', '戊申', '庚申', '辛酉']
    },
    dayGuide: {
      colorSuite: '紅、橘',
      amulets: '木製擺件、紅色系裝飾',
      direction: '南方',
      nobleZodiacs: '馬、蛇、羊、虎、狗',
      remedyActions: '多接觸陽能量、戶外運動、使用火色系物品'
    }
  },
  '土': {
    fengShui: {
      dayMasterElement: '土',
      remedyElement: '水',
      directions: '正北、西北、正西、東北方',
      spaces: '客廳或個人空間',
      colors: '水色系 (藍、黑、藍綠、白、灰、金、銀)',
      decorations: '水缸、冷色系、金屬擺飾 (金屬的鬧鐘/錢幣/風鈴/音樂盒)、白色瓶身香氛。水色系燈具/鹽燈',
      zodiacs: '生肖 鼠、豬、龍、雞、牛、猴 的金屬/玻璃/水晶製品',
      actions: ['財位水缸換水', '整理清潔擦拭財位擺件'],
      wealthLuckyDays: ['壬申', '壬子', '壬辰', '癸酉', '癸丑', '癸亥', '庚子', '庚辰', '庚申', '辛亥']
    },
    dayGuide: {
      colorSuite: '黃、土黃',
      amulets: '天然玉石、陶瓷器皿、黃色系裝飾',
      direction: '中央、西南方、東北方',
      nobleZodiacs: '牛、龍、羊、狗、馬、蛇',
      remedyActions: '多接觸大自然、使用土色系與陶瓷玉石物品'
    }
  }
};
