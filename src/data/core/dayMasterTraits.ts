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

export const DAY_MASTER_TRAITS: Record<HeavenlyStem, DayMasterTrait> = {
  '甲': {
    stem: '甲',
    element: '木',
    yinYang: '陽',
    image: '參天大樹',
    trait: '直爽、堅強、有原則、剛正不阿、領導者、開創者、站姿挺拔、格局大、想做大事。不懂變通。',
    strong: '直爽、堅強、有原則、格局大', // Can map properly if needed
    weak: '不懂變通'
  },
  '乙': {
    stem: '乙',
    element: '木',
    yinYang: '陰',
    image: '藤蔓花草',
    trait: '柔軟、靈活、執著度高、善於變通、借力使力、協調者、設計者、適應力強、懂得迂迴前進。',
    strong: '直率主觀、喜歡表達、希望成長突破、較固執傲慢、欠缺周全性。',
    weak: '缺乏自信與主見、容易猶豫不決、成長動力不足、不敢爭取。'
  },
  '丙': {
    stem: '丙',
    element: '火',
    yinYang: '陽',
    image: '太陽之火',
    trait: '熱情、開朗、直接、照亮他人、喜歡照顧人、情緒鮮明、好勝、善關注、領導者、情緒外顯。',
    strong: '熱情、開朗、直接',
    weak: '情緒外顯'
  },
  '丁': {
    stem: '丁',
    element: '火',
    yinYang: '陰',
    image: '燭光燈火',
    trait: '溫暖、細膩、專注、溫柔體貼、持續穩定、照亮細節、內斂但持久、專注力強、療癒者、情緒內斂。',
    strong: '熱情直接、喜歡表現、行事急躁、欠缺深思熟慮。',
    weak: '過於注重和諧、怕衝突、性格溫和、缺少行動力與熱情、表達力不足。'
  },
  '戊': {
    stem: '戊',
    element: '土',
    yinYang: '陽',
    image: '高山大地',
    trait: '穩重、包含、承載力強、可靠、有擔當、厚實、堅守原則、固執、守護者。',
    strong: '穩重、可靠、有擔當',
    weak: '固執'
  },
  '己': {
    stem: '己',
    element: '土',
    yinYang: '陰',
    image: '田園濕土',
    trait: '滋養、細膩、靈活、善於培育、適應力強、溫厚務實、資源者。',
    strong: '穩重實在、注重承諾、保守固執、思考僵化、原則性太強。',
    weak: '善變靈活、隨機應變、缺乏安全感、難以堅持、責任感較弱。'
  },
  '庚': {
    stem: '庚',
    element: '金',
    yinYang: '陽',
    image: '刀劍鋼鐵',
    trait: '剛硬、果決、鋒利、正義感強、執行力高、改革者，不會藏事情。',
    strong: '果決、鋒利、正義感強',
    weak: '剛硬、不藏事情'
  },
  '辛': {
    stem: '辛',
    element: '金',
    yinYang: '陰',
    image: '珠寶首飾',
    trait: '敏銳、品味高雅、重視質感細節、做事追求完美、處事靈巧有彈性、品味者、專業技術。',
    strong: '果斷有行動力、敢衝敢拼、過於強硬、得理不饒人、嫉惡如仇。',
    weak: '注重圓融、待人客氣、缺乏魄力、猶豫不決、是非不明、看不出喜好。'
  },
  '壬': {
    stem: '壬',
    element: '水',
    yinYang: '陽',
    image: '江河大海',
    trait: '心胸格局開闊、流動、包容、智慧、適應力強、思維靈活、善於溝通、冒險者、智多星。',
    strong: '心胸格局開闊、流動、包容',
    weak: '適應力強、思維靈活'
  },
  '癸': {
    stem: '癸',
    element: '水',
    yinYang: '陰',
    image: '雨露泉水',
    trait: '默默堅持、長跑型選手、敏感體貼、細膩安靜、觀察入微、見解精闢、韌性強、堅持達成目標、支持者、顧問。',
    strong: '聰明靈活、適應力強、過於善變、容易想太多、行動力低。',
    weak: '直接、單純、心思不複雜、不夠靈活變通、容易被表象欺騙、太相信別人。'
  }
};
