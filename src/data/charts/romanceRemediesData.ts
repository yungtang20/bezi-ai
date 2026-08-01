// src/data/romanceRemediesData.ts

export interface RomanceFengShui {
  elementName: string;
  direction: string;
  colors: string;
  decorations: string;
  zodiacs: string;
}

export const ROMANCE_FENG_SHUI_DATA: Record<string, { 男: RomanceFengShui; 女: RomanceFengShui }> = {
  '金': {
    '男': {
      elementName: '木(財)',
      direction: '正東方、東北方、東南方',
      colors: '綠、藍綠色',
      decorations: '綠植（萬年青、竹子）、綠水晶、翡翠、綠色瓶身香氛/香水',
      zodiacs: '木製擺件：生肖 豬、兔、羊、虎、龍'
    },
    '女': {
      elementName: '火(官)',
      direction: '正南方、西南方、東南方',
      colors: '紅、黃、粉、橘、暖色系',
      decorations: '紅花、紫花、紅色系香氛蠟燭、燈具、粉色系床單、枕頭套',
      zodiacs: '陶瓷製擺件：生肖 馬、虎、狗、羊、蛇'
    }
  },
  '木': {
    '男': {
      elementName: '土(財)',
      direction: '東北、西北、西南、東南、南',
      colors: '紅、橘、黃、土黃色',
      decorations: '黃土色系天然玉石、陶瓷器皿、紅色燈具',
      zodiacs: '陶瓷 / 玉製擺件：生肖 馬、狗、羊、蛇、龍、牛'
    },
    '女': {
      elementName: '金(官)',
      direction: '西北、正西、西南、東北',
      colors: '白、灰、金、銀色',
      decorations: '香水百合、金屬材質物品（鬧鐘/音樂盒/風鈴）、金屬底座/白色燈罩之燈具、白色香氛瓶',
      zodiacs: '金屬 / 銅製擺件：生肖 蛇、猴、雞、牛'
    }
  },
  '水': {
    '男': {
      elementName: '火(財)',
      direction: '正南、東南、西南',
      colors: '紅、黃、橘、綠色',
      decorations: '紅花、紫花、紅/紫香氛、綠色盆栽',
      zodiacs: '木製擺件：生肖 馬、虎、狗、羊、蛇'
    },
    '女': {
      elementName: '土(官)',
      direction: '東北、西北、西南、東南、正南',
      colors: '紅、黃、橘、土黃色',
      decorations: '紅/黃/橘/土色系掛畫、紅/紫香氛',
      zodiacs: '陶瓷 / 玉石 / 陶土製擺件：生肖 馬、狗、羊、蛇、龍、牛'
    }
  },
  '火': {
    '男': {
      elementName: '金(財)',
      direction: '西北、正西、西南、東北',
      colors: '白、灰、金、銀色',
      decorations: '白色鮮花、金屬音樂盒/錢幣/風鈴、白色地毯',
      zodiacs: '金屬製擺件：生肖 蛇、猴、雞、牛'
    },
    '女': {
      elementName: '水(官)',
      direction: '正北、西北、東北、正西',
      colors: '藍、黑、白、灰色',
      decorations: '藍色 / 白色鮮花、水缸、玻璃水杯（需正常換水）',
      zodiacs: '金屬 / 玻璃 / 水晶製擺件：生肖 鼠、豬、龍、雞、牛、猴'
    }
  },
  '土': {
    '男': {
      elementName: '水(財)',
      direction: '正北、西北、東北、正西',
      colors: '藍、藍綠、黑、白、金色',
      decorations: '水缸（不加蓋、裝水八到九分滿）、藍/白/黑色地毯、白色鮮花、金屬音樂盒/錢幣/風鈴',
      zodiacs: '金屬製擺件：生肖 鼠、豬、龍、雞、牛、猴'
    },
    '女': {
      elementName: '木(官)',
      direction: '正東、東北、東南',
      colors: '綠、藍綠色',
      decorations: '綠植（萬年青、竹子）、綠水晶、翡翠',
      zodiacs: '木製擺件：生肖 豬、兔、羊、虎、龍'
    }
  }
};
