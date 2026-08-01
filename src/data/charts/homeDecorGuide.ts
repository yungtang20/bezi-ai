/**
 * 軟裝添運對照表 — 來源：新增資料夾/2-3~2-7 各命人軟裝添運對照表.pdf
 * 涵蓋：金、木、水、火、土 五行命人的家居擺設與水缸開運建議
 */

import type { FiveElement } from '../core/types';

// [AI MOD] 抽出通用的 generalTips，避免五行重複
const GENERAL_TIPS: string[] = [
  '使用指南針先辨識家中朝向，並標示方位於空白處，找出方位即可以對應家中區域，為祈求運勢擺放合適的添運色彩擺件',
  '添運擺設眾多，在佈局上可注意以下兩原則：',
  '1. 若所求運勢有多個建議，可在空間允許的前提下，多佈置幾項做加成',
  '2. 擺設的挑選是很彈性的，主核心技巧是對的方位＋對的屬性色系擺件'
];

// [AI MOD] 水缸通用基底，各五行只覆寫差異欄位
const BASE_WATER_TANK = {
  size: '長方形｜60x30x30、圓形｜直徑 40 公分',
  waterLevel: '8~9 分滿',
  pump: '需要加裝馬達、濾水器，或時常換水，保持水的清新和流動，才能帶動運勢',
  changeFrequency: '使用馬達的水缸一週換一次水即可，若空間較小可用裝水玻璃杯代替，但要記得每天換水',
  notes: ['不要加蓋、不需要照明']
};

/** 宮位類型 */
export type PalaceType = '財位' | '事業貴人位' | '文昌宮' | '子息宮' | '桃花宮';

/** 單一宮位的擺設建議 */
export interface PalaceDecor {
  palace: PalaceType;
  location: string;           // 佈置地點
  colors: string;             // 建議顏色
  items: string[];            // 建議擺設物品
  material: string;           // 材質建議
  directionsHeaven?: string[]; // 標準五行大運開運位（天時）
  directions: string[];        // 徐氏軟裝磁場開運位（地利）
  zodiac: string;             // 生肖擺件
  zodiacMaterial: string;     // 生肖擺件材質
  flowerSide?: string;        // 鮮花擺放位置
}

/** 五行命人的完整軟裝添運 */
export interface HomeDecorGuide {
  element: FiveElement;
  palaces: PalaceDecor[];
  waterTank: WaterTankGuide;
  generalTips: string[];
}

/** 水缸佈置說明 */
export interface WaterTankGuide {
  size: string;
  material: string;
  color: string;
  waterLevel: string;
  contents: string;
  pump: string;
  changeFrequency: string;
  notes: string[];
}

// ==================== 1. 性別專屬宮位定義 (桃花宮、子息宮) ====================
export const GENDER_PALACE_DECOR: Record<FiveElement, {
  '桃花宮': { 'male': PalaceDecor; 'female': PalaceDecor };
  '子息宮': { 'male': PalaceDecor; 'female': PalaceDecor };
}> = {
  '金': {
    '桃花宮': {
      'male': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '綠色、藍綠色系',
        items: ['掛畫（綠色、藍綠色系）', '地毯', '燈具', '水晶', '翡翠', '同色系瓶身香氛', '水缸或裝水玻璃杯', '植栽', '萬年青', '竹子', '同色系床單與枕頭套'],
        material: '宜選擇木質、木製材質',
        directionsHeaven: ['正東方', '東北方', '東南方'],
        directions: ['南', '東南', '西南', '東', '西'],
        zodiac: '虎、兔、龍、羊、豬',
        zodiacMaterial: '宜選擇木質、木製材質擺飾',
        flowerSide: '躺下來的右側床邊櫃可擺放鮮花'
      },
      'female': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '紅、黃、粉、橘色系',
        items: ['掛畫（紅、黃、粉、橘色系）', '地毯', '紅色香氛蠟燭/燈具/香水', '紅/紫色鮮花', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇木製、陶瓷材質',
        directionsHeaven: ['正南方', '西南方', '東南方'],
        directions: ['南', '東南', '西南'],
        zodiac: '虎、蛇、馬、羊、狗',
        zodiacMaterial: '宜選擇木製、陶瓷材質，以紅、橘、黃色為主',
        flowerSide: '躺下來的左側床邊櫃可擺放鮮花'
      }
    },
    '子息宮': {
      'male': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '紅、黃、橘、綠色系',
        items: ['掛畫（紅、黃、橘、綠色系）', '地毯', '紅色香氛或燈具', '臥室床單則以太太子息宮色彩為主'],
        material: '宜選擇木質、陶瓷材質',
        directionsHeaven: ['南', '東南', '西南'],
        directions: ['南', '東南', '西南'],
        zodiac: '虎、蛇、馬、羊、狗',
        zodiacMaterial: '宜選擇木質、陶瓷材質，以紅、橘、黃色為主'
      },
      'female': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '藍、藍綠、黑色系',
        items: ['流動的水缸或裝水玻璃杯', '藍、藍綠、黑色系的床單、枕頭套'],
        material: '宜選擇玻璃、水晶材質',
        directionsHeaven: ['東北', '西北', '北'],
        directions: ['東北', '西北', '北'],
        zodiac: '鼠、龍、猴、豬',
        zodiacMaterial: '宜選擇玻璃、水晶材質擺設'
      }
    }
  },
  '木': {
    '桃花宮': {
      'male': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '紅、橘、黃、土黃色系',
        items: ['掛畫（紅、橘、黃、土黃色系）', '紅/橘色地毯', '紅/紫色瓶身香氛與鮮花', '紅色燈具', '天然黃土色玉石', '同色系床單與枕頭套'],
        material: '宜選擇陶瓷、玉石製材質',
        directionsHeaven: ['東北', '東南', '正南', '西南', '西北'],
        directions: ['南', '東南', '西南'],
        zodiac: '牛、龍、蛇、馬、羊、狗',
        zodiacMaterial: '宜選擇陶瓷、玉石製材質',
        flowerSide: '躺下來的右側床邊櫃可擺放鮮花'
      },
      'female': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '白、灰、金、銀色系',
        items: ['掛畫（白、灰、金、銀色系）', '燈具', '白色瓶身的香氛', '香水百合', '金屬鬧鐘/錢幣/風鈴/音樂盒', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇金屬材質',
        directionsHeaven: ['正西方', '西北方', '西南方', '東北方'],
        directions: ['西', '西北', '西南', '東北'],
        zodiac: '牛、蛇、猴、雞',
        zodiacMaterial: '宜選擇金屬材質器物',
        flowerSide: '躺下來的左側床邊櫃可擺放鮮花'
      }
    },
    '子息宮': {
      'male': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '白、灰、金、銀色系',
        items: ['掛畫（白、灰、金、銀色系）', '地毯', '燈具', '白色瓶身香氛', '金屬鬧鐘/風鈴/音樂盒', '臥室床單則以太太子息宮色彩為主'],
        material: '宜選擇金屬材質',
        directionsHeaven: ['西', '西北', '西南', '東北'],
        directions: ['西', '西北', '西南', '東北'],
        zodiac: '牛、蛇、猴、雞',
        zodiacMaterial: '宜選擇金屬材質器物'
      },
      'female': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '紅、橘、黃色系',
        items: ['紅、橘、黃色系的床單、枕頭套、地毯', '紅/紫色的鮮花與燈具', '紅色瓶身香氛'],
        material: '宜選擇陶瓷、玉石製材質或同色系生肖布偶',
        directionsHeaven: ['南', '東南', '西南'],
        directions: ['南', '東南', '西南'],
        zodiac: '蛇、馬、羊、狗',
        zodiacMaterial: '宜選擇陶瓷、玉石製材質或同色系生肖布偶'
      }
    }
  },
  '水': {
    '桃花宮': {
      'male': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '紅、橘、黃、綠色系',
        items: ['地毯', '掛畫', '香氛', '紅花、紫花、綠色盆栽', '紅/紫色鮮花', '紅色燈具/鹽燈', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇木製材質或紅、橘、黃色系生肖布偶',
        directionsHeaven: ['正南方', '東南方', '西南方'],
        directions: ['南', '東南', '西南', '東'],
        zodiac: '虎、蛇、馬、羊、狗',
        zodiacMaterial: '宜選擇木製材質或紅、橘、黃色系生肖布偶',
        flowerSide: '躺下來的右側床邊櫃可擺放鮮花'
      },
      'female': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '紅、黃、橘、土黃色系',
        items: ['掛畫（紅、黃、橘、土黃色系）', '地毯', '紅/紫/土黃色瓶身香氛', '紅色燈具/鹽燈', '陶瓷、玉石、陶土擺件', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇陶瓷、玉石製材質',
        directionsHeaven: ['東北', '西北', '西南', '東南', '正南方'],
        directions: ['南', '東南', '西南'],
        zodiac: '牛、龍、蛇、馬、羊、狗',
        zodiacMaterial: '宜選擇陶瓷、玉石製材質',
        flowerSide: '躺下來的左側床邊櫃可擺放鮮花'
      }
    },
    '子息宮': {
      'male': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '紅、黃、橘、土黃色系',
        items: ['掛畫（紅、黃、橘、土黃色系）', '地毯', '紅/紫/土黃色瓶身香氛', '紅色燈具/鹽燈', '陶瓷、玉石、陶土擺件', '臥室床單則以太太子息宮色彩為主'],
        material: '宜選擇陶瓷、玉石製材質',
        directionsHeaven: ['東北', '正東', '東南'],
        directions: ['南', '東南', '西南'],
        zodiac: '牛、龍、蛇、馬、羊、狗',
        zodiacMaterial: '宜選擇陶瓷、玉石製材質'
      },
      'female': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '紅、黃、橘、土黃色系',
        items: ['紅、黃、橘、土黃色系的床單、枕頭套、地毯', '紅/紫/土黃色系瓶身香氛', '紅色燈具/鹽燈', '陶瓷、玉石、陶土擺件'],
        material: '宜選擇陶瓷、玉石、陶土材質',
        directionsHeaven: ['東北', '西北', '西南', '東南', '正南'],
        directions: ['東北', '西北', '西南', '東南', '正南'],
        zodiac: '馬、狗、羊、蛇、龍、牛',
        zodiacMaterial: '宜選擇陶瓷、玉石、陶土材質'
      }
    }
  },
  '火': {
    '桃花宮': {
      'male': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '白、灰、金、銀色系',
        items: ['地毯（白、灰、金、銀色系）', '同色系瓶身香氛', '藍/白/灰/金/銀色燈具', '白色鮮花', '金屬鬧鐘/錢幣/風鈴/音樂盒', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇金屬製材質',
        directionsHeaven: ['西北', '正西', '西南', '東北'],
        directions: ['南', '西南', '西', '西北'],
        zodiac: '牛、蛇、猴、雞',
        zodiacMaterial: '宜選擇金屬製材質',
        flowerSide: '躺下來的右側床邊櫃可擺放鮮花'
      },
      'female': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '藍、藍綠、黑、白、灰、金、銀色系',
        items: ['掛畫（藍、藍綠、黑、白、灰、金、銀色系）', '地毯', '藍/白/灰/金/銀色燈具', '金屬製品', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇金屬、玻璃、水晶製材質',
        directionsHeaven: ['正北方', '西北', '東北', '正西方'],
        directions: ['南', '東南', '西南', '東', '西', '北'],
        zodiac: '鼠、牛、龍、猴、雞、豬',
        zodiacMaterial: '宜選擇金屬、玻璃、水晶製材質',
        flowerSide: '躺下來的左側床邊櫃可擺放鮮花'
      }
    },
    '子息宮': {
      'male': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '藍、藍綠、黑、白、灰、金、銀色系',
        items: ['掛畫（藍、藍綠、黑、白、灰、金、銀色系）', '地毯', '同色系瓶身香氛', '藍/白/灰/金/銀色燈具', '金屬製品', '水缸或裝水玻璃杯', '臥室床單則以太太子息宮色彩為主'],
        material: '宜選擇金屬、玻璃、水晶製材質',
        directionsHeaven: ['正北', '正西', '西北', '東北'],
        directions: ['南', '東南', '西南', '東', '西', '北'],
        zodiac: '鼠、牛、龍、猴、雞、豬',
        zodiacMaterial: '宜選擇金屬、玻璃、水晶製材質'
      },
      'female': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '白、灰、金、銀色系',
        items: ['白、灰、金、銀色系的床單、枕頭套、地毯', '白/灰/金/銀色瓶身香氛', '同色系燈具', '白色鮮花', '金屬製音樂盒/錢幣/風鈴', '金製或金屬、鋼、銅製擺件'],
        material: '宜選擇金製或金屬、鋼、銅製材質',
        directionsHeaven: ['西北', '正西', '西南', '東北'],
        directions: ['西北', '正西', '西南', '東北'],
        zodiac: '蛇、猴、雞、牛',
        zodiacMaterial: '宜選擇金製或金屬、鋼、銅製材質'
      }
    }
  },
  '土': {
    '桃花宮': {
      'male': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '藍、藍綠、黑、白、灰、金、銀色系',
        items: ['掛畫（藍、藍綠、黑、白、灰、金、銀色系）', '同色系瓶身香氛', '白/灰/金/銀色燈具', '白/灰色地毯', '白色鮮花', '金屬鬧鐘/風鈴/音樂盒/錢幣', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇金屬製材質',
        directionsHeaven: ['正北', '西北', '東北', '正西方'],
        directions: ['南', '西南', '西', '西北'],
        zodiac: '鼠、牛、龍、猴、雞、豬',
        zodiacMaterial: '宜選擇金屬製材質',
        flowerSide: '躺下來的右側床邊櫃可擺放鮮花'
      },
      'female': {
        palace: '桃花宮',
        location: '臥室 / 個人空間',
        colors: '藍、藍綠、綠色系',
        items: ['掛畫（藍、藍綠、綠色系）', '地毯', '燈具', '同色系瓶身香氛', '綠色水晶', '翡翠', '木製品', '尤其推薦使用同色系床單與枕頭套'],
        material: '宜選擇木製材質',
        directionsHeaven: ['正東', '東北', '東南方'],
        directions: ['正東', '東北', '東南方'],
        zodiac: '虎、兔、龍、羊、豬',
        zodiacMaterial: '宜選擇木製材質',
        flowerSide: '躺下來的左側床邊櫃可擺放鮮花'
      }
    },
    '子息宮': {
      'male': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '藍、藍綠、綠色系',
        items: ['掛畫（藍、藍綠、綠色系）', '地毯', '燈具', '同色系瓶身香氛', '綠色水晶', '翡翠', '木製品', '臥室床單則以太太子息宮色彩為主'],
        material: '宜選擇木製材質',
        directionsHeaven: ['正東', '東北', '東南方'],
        directions: ['東北', '東', '東南', '北'],
        zodiac: '虎、兔、龍、羊、豬',
        zodiacMaterial: '宜選擇木製材質'
      },
      'female': {
        palace: '子息宮',
        location: '臥室 / 個人空間',
        colors: '白、灰、金、銀色系',
        items: ['白、灰、金、銀色系的床單、枕頭套、地毯', '掛畫', '同色系瓶身香氛', '金屬鬧鐘/風鈴/音樂盒/錢幣'],
        material: '宜選擇金製材質',
        directionsHeaven: ['南', '西南', '西', '西北'],
        directions: ['南', '西南', '西', '西北'],
        zodiac: '牛、蛇、猴、雞',
        zodiacMaterial: '宜選擇金製材質擺飾'
      }
    }
  }
};

// ==================== 2. 五行日主通用配置大綱 (財位、事業、文昌等) ====================

// 金命人配置大綱 (五種宮位，此處子息、桃花做預設男性設定，Resolver 會依性別隨時抽取)
export const METAL_DECOR: HomeDecorGuide = {
  element: '金',
  palaces: [
    {
      palace: '財位',
      location: '客廳 / 個人空間',
      colors: '綠、藍綠色系',
      items: ['綠、藍綠色系的地毯', '燈具', '水晶', '翡翠', '水缸或裝水玻璃杯', '植栽', '竹子', '萬年青'],
      material: '宜選擇木製材質及擺飾',
      directions: ['南', '東南', '西南', '東', '西'],
      zodiac: '豬、兔、羊、虎、龍',
      zodiacMaterial: '宜選擇木製材質，且五行屬木'
    },
    {
      palace: '事業貴人位',
      location: '客廳/書房/個人空間',
      colors: '紅、黃、橘、綠色系',
      items: ['紅、黃、橘、綠色系的地毯', '同色系瓶身的香氛蠟燭', '燈具', '紅/紫色鮮花'],
      material: '宜選擇木製材質或同色系生肖布偶',
      directions: ['南', '東南', '西南', '東', '西'],
      zodiac: '虎、蛇、馬、羊、狗',
      zodiacMaterial: '宜選擇木製材質或同色系生肖布偶'
    },
    {
      palace: '文昌宮',
      location: '書房/小孩房間/個人空間',
      colors: '藍、藍綠、黑色系',
      items: ['藍、藍綠、黑色系的地毯', '水缸或是裝水玻璃杯', '同色系掛畫'],
      material: '宜選擇玻璃、水晶材質或同色系生肖布偶',
      directions: ['南', '東南', '西南', '東', '西'],
      zodiac: '鼠、龍、猴、豬',
      zodiacMaterial: '宜選擇玻璃、水晶材質或同色系生肖布偶'
    },
    // 子息與桃花宮（預設為男，之後解析時依實算命主性別覆蓋）
    GENDER_PALACE_DECOR['金']['子息宮']['male'],
    GENDER_PALACE_DECOR['金']['桃花宮']['male'],
  ],
  waterTank: {
    ...BASE_WATER_TANK,
    material: '陶瓷或玻璃製',
    color: '綠色、藍綠色最佳',
    contents: '水草',
    notes: [
      ...BASE_WATER_TANK.notes,
      '對照說明書第 2 頁的財運位內容，挑選出自己較偏好的擺設來促進財運磁場'
    ]
  },
  generalTips: GENERAL_TIPS
};

// 木命人配置大綱
export const WOOD_DECOR: HomeDecorGuide = {
  element: '木',
  palaces: [
    {
      palace: '財位',
      location: '客廳 / 個人空間',
      colors: '紅、橘、黃、土黃色系',
      items: ['掛畫（紅、橘、黃、土黃色系）', '水缸或裝水玻璃杯（設置細節參考 p.3）', '天然玉石', '陶土物件', '紅/橘色地毯', '紅/紫色鮮花和瓶身香氛', '紅色燈具'],
      material: '宜選擇陶瓷、玉石材質或同色系生肖布偶',
      directions: ['南', '東南', '西南'],
      zodiac: '牛、龍、蛇、馬、羊、狗',
      zodiacMaterial: '宜選擇陶瓷、玉石材質或同色系生肖布偶'
    },
    {
      palace: '事業貴人位',
      location: '客廳/書房/個人空間',
      colors: '白、灰、金、銀色系',
      items: ['白、灰、金、銀色系的瓶身香氛', '金/銀色燈具', '金屬製的鬧鐘/錢幣/風鈴/音樂盒'],
      material: '宜選擇金屬材質器物',
      directions: ['西', '西北', '西南', '東北'],
      zodiac: '牛、蛇、猴、雞',
      zodiacMaterial: '宜選擇金屬材質零件'
    },
    {
      palace: '文昌宮',
      location: '書房/小孩房間/個人空間',
      colors: '紅、黃、橘色系',
      items: ['紅、黃、橘色系的地毯、掛畫', '紅/紫色鮮花與香氛', '紅色燈具'],
      material: '宜選擇陶瓷、玉石材質或同色系生肖布偶',
      directions: ['南', '東南', '西南'],
      zodiac: '蛇、馬、羊、狗',
      zodiacMaterial: '宜選擇陶瓷、玉石材質或同色系生肖布偶'
    },
    GENDER_PALACE_DECOR['木']['子息宮']['male'],
    GENDER_PALACE_DECOR['木']['桃花宮']['male'],
  ],
  waterTank: {
    ...BASE_WATER_TANK,
    material: '陶瓷製',
    color: '紅色、橙色、黃色、土黃色最佳',
    contents: '玉石、石頭、水晶',
    notes: [
      ...BASE_WATER_TANK.notes,
      '對照說明書中的財運位與水缸說明，挑選合意擺設促進財運磁場'
    ]
  },
  generalTips: GENERAL_TIPS
};

// 水命人配置大綱
export const WATER_DECOR: HomeDecorGuide = {
  element: '水',
  palaces: [
    {
      palace: '財位',
      location: '客廳 / 個人空間',
      colors: '紅、橘、黃、綠色系',
      items: ['掛畫（紅、橘、黃、綠色系）', '陶瓷品', '地毯', '水缸或裝水玻璃杯', '紅/紫色瓶身香氛與鮮花', '紅色燈具/鹽燈', '綠色植栽', '萬年青', '竹子', '綠色水晶/翡翠'],
      material: '宜選擇木製材質或紅、黃、橘色系生肖布偶',
      directions: ['南', '東南', '西南', '東'],
      zodiac: '虎、蛇、馬、羊、狗',
      zodiacMaterial: '宜選擇木製材質或紅、黃、橘色系生肖布偶'
    },
    {
      palace: '事業貴人位',
      location: '客廳/書房/個人空間',
      colors: '紅、黃、橘、土黃色系',
      items: ['紅、黃、橘、土黃色系的地毯', '紅/紫色鮮花與香氛蠟燭', '紅色燈具/鹽燈', '天然玉石', '黃土色石頭'],
      material: '宜選擇陶瓷、玉石製材質',
      directions: ['南', '東南', '西南'],
      zodiac: '牛、龍、蛇、馬、羊、狗',
      zodiacMaterial: '宜選擇陶瓷、玉石製材質'
    },
    {
      palace: '文昌宮',
      location: '書房/小孩房間/個人空間',
      colors: '綠、藍綠色系',
      items: ['綠、藍綠色系的地毯、掛畫', '綠色植栽', '萬年青', '竹子', '綠色水晶/翡翠/燈具'],
      material: '宜選擇木製材質或同色系生肖布偶',
      directions: ['東北', '東', '東南', '北'],
      zodiac: '虎、兔、龍、羊、豬',
      zodiacMaterial: '宜選擇木製材質或同色系生肖布偶'
    },
    GENDER_PALACE_DECOR['水']['子息宮']['male'],
    GENDER_PALACE_DECOR['水']['桃花宮']['male'],
  ],
  waterTank: {
    ...BASE_WATER_TANK,
    material: '陶瓷或玻璃製',
    color: '綠色最佳',
    contents: '水草',
    notes: [
      ...BASE_WATER_TANK.notes,
      '水命人財位用水養木，對照財位內容，挑選出適合的綠色植栽及水缸促旺財運'
    ]
  },
  generalTips: GENERAL_TIPS
};

// 火命人配置大綱
export const FIRE_DECOR: HomeDecorGuide = {
  element: '火',
  palaces: [
    {
      palace: '財位',
      location: '客廳 / 個人空間',
      colors: '白、灰、金、銀色系',
      items: ['白、灰、金、銀色系的掛畫', '燈具', '水缸或裝水玻璃杯', '白色瓶身香氛', '金屬鬧鐘/錢幣/風鈴/音樂盒'],
      material: '宜選擇金屬製材質',
      directions: ['南', '西南', '西', '西北'],
      zodiac: '牛、蛇、猴、雞',
      zodiacMaterial: '宜選擇金屬製材質飾品'
    },
    {
      palace: '事業貴人位',
      location: '客廳/書房/個人空間',
      colors: '藍、藍綠、黑、白、灰、金、銀色系',
      items: ['藍、藍綠、黑、白、灰、金、銀色系的地毯', '燈具', '白色鮮花/香氛蠟燭', '金屬擺件'],
      material: '宜選擇金屬、玻璃、水晶製材質',
      directions: ['南', '東南', '西南', '東', '西', '北'],
      zodiac: '鼠、牛、龍、猴、雞、豬',
      zodiacMaterial: '宜選擇金屬、玻璃、水晶製材質飾品'
    },
    {
      palace: '文昌宮',
      location: '書房/小孩房間/個人空間',
      colors: '紅、黃、橘、土黃色系',
      items: ['紅、黃、橘、土黃色系的地毯、掛畫', '陶瓷、玉石、陶土', '紅/紫/土黃色瓶身香氛', '紅色燈具/鹽燈'],
      material: '宜選擇陶瓷、玉石製材質或同色系生肖布偶',
      directions: ['南', '東南', '西南', '東北', '西北'],
      zodiac: '牛、龍、蛇、馬、羊、狗',
      zodiacMaterial: '宜選擇陶瓷、玉石製材質或同色系生肖布偶'
    },
    GENDER_PALACE_DECOR['火']['子息宮']['male'],
    GENDER_PALACE_DECOR['火']['桃花宮']['male'],
  ],
  waterTank: {
    ...BASE_WATER_TANK,
    material: '陶瓷、玻璃、金屬製',
    color: '白、灰色最佳',
    contents: '銅幣、錢幣與過濾石',
    notes: [
      ...BASE_WATER_TANK.notes,
      '極佳地用金屬和灰色洩燥金，配合氣流流動推升家庭財祿運勢'
    ]
  },
  generalTips: GENERAL_TIPS
};

// 土命人配置大綱
export const EARTH_DECOR: HomeDecorGuide = {
  element: '土',
  palaces: [
    {
      palace: '財位',
      location: '客廳 / 個人空間',
      colors: '藍、藍綠、黑、白、灰、金、銀色系',
      items: ['藍、藍綠、黑、白、灰、金、銀色系的掛畫', '水缸或裝水玻璃杯', '白/灰/金/銀色燈具', '白色瓶身香氛', '金屬鬧鐘/錢幣/風鈴/音樂盒'],
      material: '宜選擇金屬製材質器物',
      directions: ['南', '西南', '西', '西北'],
      zodiac: '鼠、牛、龍、猴、雞、豬',
      zodiacMaterial: '宜選擇金屬製材質（如金飾/金屬配件）'
    },
    {
      palace: '事業貴人位',
      location: '客廳/書房/個人空間',
      colors: '綠、藍綠色系',
      items: ['綠、藍綠色系的鮮花', '香氛蠟燭', '水晶', '翡翠', '綠色燈具', '木製品'],
      material: '宜選擇木製材質擺飾',
      directions: ['東北', '東', '東南', '北'],
      zodiac: '虎、兔、龍、羊、豬',
      zodiacMaterial: '宜選擇木製材質'
    },
    {
      palace: '文昌宮',
      location: '書房/小孩房間/個人空間',
      colors: '白、灰、金、銀色系',
      items: ['白、灰、金、銀色系的地毯、掛畫', '燈具', '鹽燈', '白色系瓶身香氛', '金屬鬧鐘/風鈴/音樂盒/錢幣'],
      material: '宜選擇金屬製材質或同色系生肖布偶',
      directions: ['南', '西南', '西', '西北'],
      zodiac: '牛、蛇、猴、雞',
      zodiacMaterial: '宜選擇金屬製材質或同色系生肖布偶'
    },
    GENDER_PALACE_DECOR['土']['子息宮']['male'],
    GENDER_PALACE_DECOR['土']['桃花宮']['male'],
  ],
  waterTank: {
    ...BASE_WATER_TANK,
    material: '陶瓷、玻璃或金屬製',
    color: '藍、黑、白、灰色最佳',
    contents: '銅幣或五帝錢',
    notes: [
      ...BASE_WATER_TANK.notes,
      '土命人以水為財，保持財位水質乾淨並加裝金屬與銅錢，利用金生水旺財'
    ]
  },
  generalTips: GENERAL_TIPS
};

// ==================== 3. 整合對照表 ====================
export const HOME_DECOR_GUIDES: Record<FiveElement, HomeDecorGuide> = {
  '金': METAL_DECOR,
  '木': WOOD_DECOR,
  '水': WATER_DECOR,
  '火': FIRE_DECOR,
  '土': EARTH_DECOR,
};

// ==================== 4. 輔助函式 (結合性別動態派發) ====================

/**
 * 依五行與性別取得軟裝添運指南
 * 會自動將子息宮與桃花宮替換成最正確的性別方案
 */
export function getHomeDecorGuide(element: FiveElement, genderStr?: string): HomeDecorGuide {
  const baseGuide = HOME_DECOR_GUIDES[element];
  if (!baseGuide) return baseGuide;

  // 識別性別 (男 / 女 ／ male / female)
  let gender: 'male' | 'female' = 'male';
  if (genderStr === '女' || genderStr === 'female') {
    gender = 'female';
  }

  const gKey = gender;
  const genderSpecificPalaces = baseGuide.palaces.map(p => {
    if (p.palace === '桃花宮' || p.palace === '子息宮') {
      const spec = GENDER_PALACE_DECOR[element][p.palace][gKey];
      return spec;
    }
    return p;
  });

  return {
    ...baseGuide,
    palaces: genderSpecificPalaces
  };
}

/** 依五行、宮位與性別取得擺設建議 */
export function getPalaceDecor(element: FiveElement, palace: PalaceType, genderStr?: string): PalaceDecor | undefined {
  const guide = getHomeDecorGuide(element, genderStr);
  return guide.palaces.find(p => p.palace === palace);
}
