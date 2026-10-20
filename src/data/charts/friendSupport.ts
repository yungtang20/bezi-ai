/**
 * 朋友助力 — 來源：朋友助力.pdf
 * 涵蓋：合夥/朋友選擇、溝通模式、十神職場相處策略
 */

// 朋友/合夥人選擇 — 依日主強弱找互補
export interface CompanionMatch {
  dayMaster: string;      // 日主五行
  pattern: string;        // 格局（身強/身弱/從強/從弱）
  complementaryElement: string;  // 互補五行
  complementaryDayMasters: string[];  // 互補日主
}

export const COMPANION_MATCHING: CompanionMatch[] = [
  { dayMaster: '火', pattern: '身強', complementaryElement: '金、水', complementaryDayMasters: ['金身強', '水身強', '火身弱'] },
  { dayMaster: '火', pattern: '身弱', complementaryElement: '火、木', complementaryDayMasters: ['火身強', '木身強'] },
  { dayMaster: '木', pattern: '身強', complementaryElement: '土、金', complementaryDayMasters: ['土身強', '金身強', '木身弱'] },
  { dayMaster: '木', pattern: '身弱', complementaryElement: '水、木', complementaryDayMasters: ['水身強', '木身強'] },
  { dayMaster: '金', pattern: '身強', complementaryElement: '火、木', complementaryDayMasters: ['火身強', '木身強', '金身弱'] },
  { dayMaster: '金', pattern: '身弱', complementaryElement: '土、金', complementaryDayMasters: ['土身強', '金身強'] },
  { dayMaster: '水', pattern: '身強', complementaryElement: '土、火', complementaryDayMasters: ['土身強', '火身強', '水身弱'] },
  { dayMaster: '水', pattern: '身弱', complementaryElement: '金、水', complementaryDayMasters: ['水身強', '金身強'] },
  { dayMaster: '土', pattern: '身強', complementaryElement: '水、木', complementaryDayMasters: ['水身強', '木身強', '土身弱'] },
  { dayMaster: '土', pattern: '身弱', complementaryElement: '火、土', complementaryDayMasters: ['火身強', '土身強'] },
];

// 依格局與五行找互補生肖
export const COMPANION_ZODIAC: Record<string, { elements: string[]; zodiacs: string[] }> = {
  '火身強': { elements: ['金'], zodiacs: ['猴', '雞', '牛', '龍'] },
  '火身弱': { elements: ['木'], zodiacs: ['虎', '兔', '龍', '羊'] },
  '木身強': { elements: ['水'], zodiacs: ['豬', '鼠', '牛', '龍'] },
  '木身弱': { elements: ['水'], zodiacs: ['豬', '鼠', '牛', '龍'] },
  '金身強': { elements: ['火'], zodiacs: ['蛇', '馬', '羊', '狗'] },
  '金身弱': { elements: ['火'], zodiacs: ['蛇', '馬', '羊', '狗'] },
  '水身強': { elements: ['土'], zodiacs: ['龍', '狗', '羊', '牛'] },
  '水身弱': { elements: ['土'], zodiacs: ['龍', '狗', '羊', '牛'] },
  '土身強': { elements: ['木'], zodiacs: ['虎', '兔', '龍', '羊'] },
  '土身弱': { elements: ['木'], zodiacs: ['虎', '兔', '龍', '羊'] },
};

// 出生地找夥伴、貴人
export const BIRTHPLACE_COMPANION: Record<string, string> = {
  '水': '找出生在你北方國家的朋友',
  '火': '找出生在你南方國家的朋友',
  '木': '找出生在你東方國家的朋友',
  '金': '找出生在你西方國家的朋友',
  '土': '找出生在你中方國家的朋友',
};

// 從格找夥伴
export const CONG_PATTERN_COMPANION = {
  fromStrong: '從強與身強找相同屬性',
  fromWeak: '從弱與身弱找相同屬性',
  principle: '運勢：順勢而為，找貴人朋友：互補類型'
};

// 適合獨資 vs 合夥
export const BUSINESS_PATTERN = {
  solo: [
    '身強：性格較有主見、盡量獨資，若要合夥，必須主導事業。',
    '從弱：比劫為忌神，盡量獨資，若要合夥，必須主導事業。'
  ],
  partnership: [
    '身弱：比劫幫身，適合合夥。朋友多為貴人',
    '從強：順勢而為，比劫為加分'
  ]
};

// 溝通模式 — 依十神類型
export interface CommunicationStyle {
  tenGod: string;
  trait: string;
  toSuperior: string;     // 對上級
  toPeer: string;         // 對平級
  toSubordinate: string;  // 對下屬
}

export const COMMUNICATION_STYLES: CommunicationStyle[] = [
  {
    tenGod: '正財',
    trait: '性格保守，按部就班，實務、不喜失誤，做事僅慎小心',
    toSuperior: '以上級意見為主、保守務實、理性思維、不冒險、搭配數據提出見解。',
    toPeer: '提供具體建議、避免影響正財利益、在乎公司規定、不喜歡冒險。',
    toSubordinate: '工作指令需明確具體、分清權責範圍、重視公私分明。'
  },
  {
    tenGod: '偏財',
    trait: '敢冒險賺錢、做事效率佳、討厭浪費時間。',
    toSuperior: '做事結果導向、展現開拓精神、社交熱情、務必達成業績與目標、做事大氣宏觀',
    toPeer: '不喜被約束、做事沒有章法、沒有什麼依循的規則，不夠仔細細心努力，溝通時瞭解重點、合作需協助注意細節',
    toSubordinate: '不需要強調職位階級、協助設定目標、設定分級獎勵機制，得到相等回報'
  },
  {
    tenGod: '正官',
    trait: '自律、待人嚴格、重視形象、道德規範、注重公平與細節',
    toSuperior: '使命必達、主動回報、計畫合法，決定權在他、喜歡掌握權力的感覺',
    toPeer: '務必守時、遵守承諾',
    toSubordinate: '設定明確工作範圍與內容（不要要求創意類）、讓下屬穩定升遷（在乎權力與頭銜）'
  },
  {
    tenGod: '七殺',
    trait: '不畏挑戰、具控制慾、征服欲、嚴肅果斷、抗壓性強、內在掌控渴望跟征服的快感',
    toSuperior: '鐵面教官、非常有目標感、注重自律，敢於挑戰、不喜唯唯諾諾、展視抗壓性',
    toPeer: '有確定目標、溝通時條列事項、建立革命情感、切忌負面、自我貶低',
    toSubordinate: '提供不同挑戰、解決困難後給予更高權力或頭銜'
  },
  {
    tenGod: '食神',
    trait: '重視情緒、性格樂觀、享受生活，興趣多元、喜研究美食',
    toSuperior: '工作氛圍輕鬆、但說話容易天馬行空，抓出溝通重點、容易公私不分，喜歡聊興趣、分享美食',
    toPeer: '有自己的節奏，比較慢，不喜歡被催促，任務期限需較寬裕、保留彈性，多聊美食、興趣',
    toSubordinate: '有創意但易失焦，需適時引導，避免臨時交辦急事，放在創意型崗位。'
  },
  {
    tenGod: '傷官',
    trait: '富才華、創意無限、叛逆傲慢、不喜歡管束',
    toSuperior: '提供創新、大膽點子，避免先拒絕老闆想法，講話直、易傷人、在乎結果、展現自信。',
    toPeer: '創意發想或擬定謀略，需協助掌控進度。',
    toSubordinate: '避免上對下權威壓制，給他清楚的範圍與目標，不限制傷官作法，放在創意突破、拼業務崗位，不要放在墨守成規的地方。'
  },
  {
    tenGod: '正印',
    trait: '溫和、有同理心、重視精神層面，不爭不搶。',
    toSuperior: '佛系、隨緣、不盯細節。自行設目標、管時程，展現自律積極。',
    toPeer: '默默把事情做完，避免嘮叨八卦、過度催促',
    toSubordinate: '尊重下屬私人時間，給明確規範'
  },
  {
    tenGod: '偏印',
    trait: '喜歡觀察人群、有距離感、喜孤獨、喜神祕學、冷門知識',
    toSuperior: '佛系、隨緣、不盯細節。不必猜測上司想法，按照自身節奏做事。不要拿瑣碎的抱怨煩他。',
    toPeer: '喜歡安靜完成工作，可以聊哲學、宗教、玄學，對世俗的名牌、八卦無感。',
    toSubordinate: '不鬧事也不強出頭，提供明確目標、不打擾私領域，他們默默把事情做完'
  },
  {
    tenGod: '比肩',
    trait: '自尊心強，重視平等，愛恨分明，講義氣。公私界線模糊',
    toSuperior: '融入上司社交圈，情義相挺、讓老闆視為自己人，不要分的太清楚',
    toPeer: '不計較、表現大方',
    toSubordinate: '把下屬當朋友相處，關心下屬家庭、生活。'
  },
  {
    tenGod: '劫財',
    trait: '善變、冒險家性格，富好奇心、行動力',
    toSuperior: '展現野心、膽識，耐心配合策略調整',
    toPeer: '樂於互相支援工作，不計較你我',
    toSubordinate: '充滿體力跟野心，給下屬發揮的舞台，訓練劫財下屬耐性與全盤思考'
  }
];

// 十神職場相處策略總表
export const WORKPLACE_STRATEGY = {
  conservative: { name: '保守型', gods: ['正財', '正官'], strategy: '給數據、守規矩、講誠信' },
  pioneer: { name: '開拓型', gods: ['偏財', '劫財'], strategy: '給結果、講義氣、展現企圖心' },
  creative: { name: '才華型', gods: ['食神', '傷官'], strategy: '給空間、聊興趣、避免權威壓制' },
  buddhist: { name: '佛系', gods: ['正印', '偏印'], strategy: '尊重隱私、獨立作業' },
  aggressive: { name: '衝鋒型', gods: ['比肩', '七殺'], strategy: '當自己人，給高難度舞台' }
};

// 輔助函式：依日主與格局取得互補建議
export function getCompanionAdvice(dayMaster: string, pattern: string): CompanionMatch | undefined {
  return COMPANION_MATCHING.find(cm => cm.dayMaster === dayMaster && cm.pattern === pattern);
}

// 輔助函式：依十神取得溝通風格
export function getCommunicationStyle(tenGod: string): CommunicationStyle | undefined {
  return COMMUNICATION_STYLES.find(cs => cs.tenGod === tenGod);
}

// 輔助函式：依十神取得職場類型
export function getWorkplaceType(tenGod: string): { name: string; strategy: string } | undefined {
  for (const ws of Object.values(WORKPLACE_STRATEGY)) {
    if (ws.gods.includes(tenGod)) {
      return { name: ws.name, strategy: ws.strategy };
    }
  }
  return undefined;
}
