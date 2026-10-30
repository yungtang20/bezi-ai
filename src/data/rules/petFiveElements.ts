// src/data/rules/petFiveElements.ts — 寵物與五行（v2.2 skill §2.12）
// 口徑來源：徐玉蘭 skill v2.2 §2.12（qa-0410 [58:24]–[58:57] ＋ YouTube EP91 公開口徑）。
// 鐵律：寵物在命盤當「食神傷官」看；挑選邏輯＝先看命盤需要哪種五行，再對應動物屬性；
// 責任心永遠比開運更重要（EP91 [08:56]）——不得把挑寵物講成改運保證。

export interface PetElementGuide {
  /** 該組動物補的五行 */
  element: '木' | '火' | '土' | '金' | '水';
  /** 適合的寵物（口徑：貓=木火、兔=木、狗=火土；缺金水→鳥、倉鼠、蛇、魚、龜） */
  pets: string[];
  /** 給命主的說明 */
  note: string;
}

export const PET_ELEMENT_GUIDES: PetElementGuide[] = [
  {
    element: '木',
    pets: ['貓（帶木火）', '兔（屬木）'],
    note: '命盤需要木的人，貓、兔是常見的選擇方向。',
  },
  {
    element: '火',
    pets: ['貓（帶木火）', '狗（帶火土）'],
    note: '命盤需要火的人，貓、狗帶木火／火土之氣。',
  },
  {
    element: '土',
    pets: ['狗（帶火土）'],
    note: '命盤需要土的人，狗帶火土之氣。',
  },
  {
    element: '金',
    pets: ['鳥', '倉鼠'],
    note: '缺金水的人，可從鳥、倉鼠等方向理解。',
  },
  {
    element: '水',
    pets: ['魚', '烏龜', '蛇', '倉鼠'],
    note: '缺水的人，魚、龜屬水，魚缸亦與財位連動；蛇、倉鼠同屬金水方向。',
  },
];

/** 依命主日主五行取最需要補的五行（呼應 elementRemedyHelper 的最弱五行邏輯），回傳對應寵物建議。 */
export function getPetAdvice(
  neededElement: '木' | '火' | '土' | '金' | '水'
): PetElementGuide | null {
  return PET_ELEMENT_GUIDES.find((g) => g.element === neededElement) || null;
}

/** 通用提醒（每次回答寵物相關問題都必須附上）。 */
export const PET_REMINDERS: string[] = [
  '寵物在八字中當「食神傷官」看；食傷被沖或相刑的年份，小孩與寵物都較容易有狀況（qa-0410 [58:24]）。',
  '挑選邏輯：先看命盤需要哪種五行，再對應動物屬性（EP91 [03:03]）。',
  '責任心永遠比開運更重要；決定照顧一個生命，就要負責到底（EP91 [08:56]）。',
];
