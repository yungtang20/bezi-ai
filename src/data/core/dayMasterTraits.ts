import type { HeavenlyStem } from './types';

export interface DayMasterTrait {
  stem: HeavenlyStem;
  element: string;
  yinYang: string;
  image: string;
  trait: string;
  strong: string;
  weak: string;
}

/**
 * 講義 1-1 [44:49]–[50:56] 講的是「五行偏旺／偏弱對性格的影響」，
 * 不是逐干各講一套。因此同一個五行底下的陽干與陰干，strong／weak 必須逐字相同；
 * 逐干的差異只表現在 trait（日主本身的物象與性格，1-1 [22:19]–[38:17]）。
 *
 * 曾經的錯誤：把「金偏旺」的性格寫在辛金（陰干）身上、卻把庚金（陽干）寫成
 * 「剛硬、不藏事情」當成身弱；丙、戊、庚、壬 也各有一半是憑印象補的。
 * 這裡改成以講義原文為單一來源，兩干共用，避免再各寫各的。
 */
const ELEMENT_STRENGTH_TRAITS: Record<string, { strong: string; weak: string }> = {
  木: {
    strong: '直率、主觀性強、喜歡表達、很希望成長突破、比較固執、比較衝動、做事比較快速、比較沒耐性、比較欠缺周全性。',
    weak: '比較柔軟、依賴性太強、比較容易配合、缺乏自信、比較不敢去爭取屬於自己的東西。'
  },
  火: {
    strong: '熱情、直接、外放、行動力很強、太急躁、太情緒化、喜歡表現自己、不把事情放在心上，容易因欠缺思考而做錯決定。',
    weak: '太注重和諧、很怕衝突、個性非常溫和、缺少動力與行動力、缺少熱情、表達力不足。'
  },
  土: {
    strong: '非常穩重、非常實在、非常保守、非常固執、思考容易僵化、原則性太強、非常注重承諾、變通性比較少。',
    weak: '比較善變、很靈活、很能隨機應變、容易變來變去、比較沒有安全感、比較難以堅持、比較沒有責任感。'
  },
  金: {
    strong: '非常果斷、非常有行動力、敢衝敢拼、對的事情據理力爭、夠意思、過於強硬、得理不饒人、嫉惡如仇。',
    weak: '注重圓融、懂得妥協、待人非常客氣、看不出喜好、該斷不斷、猶豫不決、比較沒有魄力。'
  },
  水: {
    strong: '非常聰明、非常靈活、適應力非常好、善於思考、瞬息萬變、情緒起伏大、想太多、容易多慮、行動力比較差。',
    weak: '很直接、很單純、心思不複雜、變動性比較差、比較不夠靈活、缺少謀略、容易被表面的假象騙、太相信別人。'
  }
};

export const DAY_MASTER_TRAITS: Record<HeavenlyStem, DayMasterTrait> = {
  '甲': {
    stem: '甲',
    element: '木',
    yinYang: '陽',
    image: '參天大樹',
    trait: '直爽、堅強、有原則、剛正不阿、領導者、開創者、站姿挺拔、格局大、想做大事。不懂變通。',
    ...ELEMENT_STRENGTH_TRAITS['木']
  },
  '乙': {
    stem: '乙',
    element: '木',
    yinYang: '陰',
    image: '藤蔓花草',
    trait: '柔軟、靈活、執著度高、善於變通、借力使力、協調者、設計者、適應力強、懂得迂迴前進。',
    ...ELEMENT_STRENGTH_TRAITS['木']
  },
  '丙': {
    stem: '丙',
    element: '火',
    yinYang: '陽',
    image: '太陽之火',
    trait: '熱情、開朗、直接、照亮他人、喜歡照顧人、情緒鮮明、好勝、善關注、領導者、情緒外顯。',
    ...ELEMENT_STRENGTH_TRAITS['火']
  },
  '丁': {
    stem: '丁',
    element: '火',
    yinYang: '陰',
    image: '燭光燈火',
    trait: '溫暖、細膩、專注、溫柔體貼、持續穩定、照亮細節、內斂但持久、專注力強、療癒者、情緒內斂。',
    ...ELEMENT_STRENGTH_TRAITS['火']
  },
  '戊': {
    stem: '戊',
    element: '土',
    yinYang: '陽',
    image: '高山大地',
    trait: '穩重、包含、承載力強、可靠、有擔當、厚實、堅守原則、固執、守護者。',
    ...ELEMENT_STRENGTH_TRAITS['土']
  },
  '己': {
    stem: '己',
    element: '土',
    yinYang: '陰',
    image: '田園濕土',
    trait: '滋養、細膩、靈活、善於培育、適應力強、溫厚務實、資源者。',
    ...ELEMENT_STRENGTH_TRAITS['土']
  },
  '庚': {
    stem: '庚',
    element: '金',
    yinYang: '陽',
    image: '刀劍鋼鐵',
    trait: '剛硬、果決、鋒利、正義感強、執行力高、改革者，不會藏事情。',
    ...ELEMENT_STRENGTH_TRAITS['金']
  },
  '辛': {
    stem: '辛',
    element: '金',
    yinYang: '陰',
    image: '珠寶首飾',
    trait: '敏銳、品味高雅、重視質感細節、做事追求完美、處事靈巧有彈性、品味者、專業技術。',
    ...ELEMENT_STRENGTH_TRAITS['金']
  },
  '壬': {
    stem: '壬',
    element: '水',
    yinYang: '陽',
    image: '江河大海',
    trait: '心胸格局開闊、流動、包容、智慧、適應力強、思維靈活、善於溝通、冒險者、智多星。',
    ...ELEMENT_STRENGTH_TRAITS['水']
  },
  '癸': {
    stem: '癸',
    element: '水',
    yinYang: '陰',
    image: '雨露泉水',
    trait: '默默堅持、長跑型選手、敏感體貼、細膩安靜、觀察入微、見解精闢、韌性強、堅持達成目標、支持者、顧問。',
    ...ELEMENT_STRENGTH_TRAITS['水']
  }
};
