// src/data/careerRemediesData.ts

export interface CareerFengShui {
  dayMasterElement: string;
  careerElement: string;
  directions: string;
  colors: string;
  decorations: string;
  zodiacs: string;
  actions: string;
}

export const CAREER_REMEDIES_DATA: Record<string, CareerFengShui> = {
  '金': {
    dayMasterElement: '金',
    careerElement: '火',
    directions: '東北、東南、正南、西南方',
    colors: '紅、黃、橙、綠',
    decorations: '馬、虎、狗、羊、蛇的木製擺件。紅、黃、橙色的陶瓷擺件。',
    zodiacs: '馬、虎、狗、羊、蛇',
    actions: '坐於官殺方位寫提案、開會，整理並清潔擦拭事業宮位的布置擺件'
  },
  '木': {
    dayMasterElement: '木',
    careerElement: '金',
    directions: '正西、西北、東北、西南方',
    colors: '白、灰、金、銀',
    decorations: '蛇、猴、雞、牛的金屬擺件。金屬製鬧鐘/錢幣/風鈴/音樂盒。白/灰/金/銀色瓶身香氛。金銀色燈罩的燈具。',
    zodiacs: '蛇、猴、雞、牛',
    actions: '坐於官殺方位整理資料、規劃行程，擦拭並保養事業宮位的金屬擺件'
  },
  '水': {
    dayMasterElement: '水',
    careerElement: '土',
    directions: '東北、西南、東南、西北方',
    colors: '紅、黃、土黃',
    decorations: '馬、狗、羊、蛇、龍、牛的生肖擺件（紅、橙、黃色陶瓷/玉石/原色陶土）。紅/黃/橘色地毯。紅/紫色瓶身香氛。紅/紫花、植物。紅色燈具/鹽燈。',
    zodiacs: '馬、狗、羊、蛇、龍、牛',
    actions: '坐於官殺方位寫提案、開會，整理並清潔擦拭事業宮位的布置擺件'
  },
  '火': {
    dayMasterElement: '火',
    careerElement: '水',
    directions: '正北、正西、東北、西北方',
    colors: '黑、藍、藍綠、白、灰、金、銀',
    decorations: '鼠、豬、龍、雞、牛、猴的金屬/玻璃/水晶製品。裝水的水缸或玻璃水杯。',
    zodiacs: '鼠、豬、龍、雞、牛、猴',
    actions: '坐於官殺方位寫提案、開會，整理並清潔擦拭事業宮位的布置擺件'
  },
  '土': {
    dayMasterElement: '土',
    careerElement: '木',
    directions: '東北、正東、東南方',
    colors: '綠、藍綠色',
    decorations: '豬、兔、羊、虎、龍的木製品。綠色盆栽（如竹子、萬年青）。綠色燈具。綠水晶、翡翠。',
    zodiacs: '豬、兔、羊、虎、龍',
    actions: '坐於官殺方位寫提案、開會，整理並清潔擦拭事業宮位的布置擺件'
  }
};
