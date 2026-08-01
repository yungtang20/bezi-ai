import type { FiveElement } from './types';

export interface DeficientElementRemedy {
  element: FiveElement;
  dailyActions: string[];
  direction: string;
  directionsDetail: string;
  colors: string;
  luckyItems: string[];
  avoid: string[];
}

export const DEFICIENT_ELEMENT_REMEDIES: Record<FiveElement, DeficientElementRemedy> = {
  '金': {
    element: '金',
    dailyActions: [
      '多泡熱水澡、游泳、泡 SPA 池（避免泡溫泉，地熱屬火）',
      '多喝水'
    ],
    direction: '西方',
    directionsDetail: '往居住地的西 / 北邊國家旅遊（如歐美、加拿大、日韓、北歐等）',
    colors: '適合金、銀、白、灰（可多運用於辦公室/居家擺設、日常穿搭等）',
    luckyItems: [
      '生肖：鼠、猴、龍、雞、牛',
      '飾品：金飾、銀飾',
      '建議金屬、銅製材質'
    ],
    avoid: [
      '不宜紅、橘、黃、土、綠',
      '不宜熱帶國家'
    ]
  },
  '木': {
    element: '木',
    dailyActions: [
      '多泡熱水澡、游泳、泡 SPA 池（避免泡溫泉）',
      '多喝水',
      '多種植物、親近大自然'
    ],
    direction: '東方、北方 (水生木)',
    directionsDetail: '往北方寒帶國家旅遊（如歐美、加拿大、日韓、北歐等）',
    colors: '適合藍、黑、綠、藍綠色',
    luckyItems: [
      '生肖：龍、鼠、虎、兔、羊、豬',
      '飾品/配件：木頭串珠、木製家具',
      '建議木頭材質'
    ],
    avoid: [
      '不宜紅、橘、黃、土、白、灰',
      '不宜熱帶國家',
      '金剋木，不宜佩戴金屬物'
    ]
  },
  '水': {
    element: '水',
    dailyActions: [
      '多泡熱水澡、游泳、泡 SPA 池（避免泡溫泉）',
      '多喝水'
    ],
    direction: '北方',
    directionsDetail: '往北方寒帶國家旅遊（如歐美、加拿大、日韓、北歐等）',
    colors: '適合黑、藍、白、灰（白、灰屬金，以金生水）',
    luckyItems: [
      '生肖：鼠、猴、雞、龍、牛、豬',
      '飾品：金飾、銀飾',
      '建議金屬材質'
    ],
    avoid: [
      '不宜紅、橘、黃、土、綠',
      '不宜熱帶國家'
    ]
  },
  '火': {
    element: '火',
    dailyActions: [
      '多曬太陽、親近自然、戶外運動',
      '多泡硫磺型溫泉（如北投、陽明山、關子嶺）',
      '立冬～立春之間最「需」補火',
      '多種植物'
    ],
    direction: '南方',
    directionsDetail: '每年國曆 11/7～隔年 2/4 每次至少五到七天，宜靠近赤道之熱帶國家旅遊（如新加坡、東南亞、澳洲等）',
    colors: '適合紅、橘、黃、綠',
    luckyItems: [
      '生肖：馬、虎、狗、兔、羊、蛇',
      '飾品：珊瑚、琥珀、玉石、蜜蠟、木頭串珠',
      '建議木頭材質'
    ],
    avoid: [
      '不宜黑、藍、白、灰色',
      '不宜寒帶、北方國家（盡量夏天前往）',
      '少游泳、泡澡（僅東南亞/熱帶國家可玩水）'
    ]
  },
  '土': {
    element: '土',
    dailyActions: [
      '多曬太陽、戶外運動、多踩土地',
      '多泡硫磺型溫泉（如北投、陽明山）'
    ],
    direction: '中央、南方(火對應)',
    directionsDetail: '每年國曆 11/7～隔年 2/4 每次至少五到七天，宜靠近赤道之熱帶國家旅遊（如新加坡、東南亞等）',
    colors: '適合紅、橘、黃、土、咖啡色',
    luckyItems: [
      '生肖：馬、虎、狗、羊、蛇',
      '飾品：珊瑚、琥珀、玉石、蜜蠟、水晶',
      '建議玉石、瓷器、陶土材質'
    ],
    avoid: [
      '不宜黑、白、灰、藍、綠色',
      '不宜寒帶、北方國家（盡量夏天前往）',
      '少游泳、泡澡（僅東南亞/熱帶國家可玩水）'
    ]
  }
};
