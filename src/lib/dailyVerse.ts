// src/lib/dailyVerse.ts
// [AI MOD] 「每日一句」規則引擎：依十神日型 × 用戶格局 × 今日打卡狀態，
// 產生一句生活語言的 daily narrative + 一個「留到明天」的鉤子。
// deterministic、離線、可 golden test（不用 LLM，可進 push）。

export interface DailyVerseInput {
  dayTenGodType: string;        // 今日十神（財星/官殺/食傷/比劫/印星）
  dayBranchElement: string;     // 日支五行（木火土金水）
  pattern: string;              // 用戶格局（身強/身弱/從強/從弱）
  checkedToday: boolean;
  recentOutcome: 'good' | 'bad' | null; // 最近一次打卡方向
  isSteady: boolean;            // 今日理論方向是否「平穩」（無可評估方向）
}

export interface DailyVerse {
  headline: string;
  context: string;
  hook: string;
  stamp: { tenGod: string; element: string };
}

const HEADLINES: Record<string, string> = {
  '財星': '今天錢的事會主動找你。',
  '官殺': '今天有人掌權，你把話放對位置。',
  '食傷': '今天你的話有重量。',
  '比劫': '今天身邊人多，留意「分」。',
  '印星': '今天適合吸收，不必急着行動。',
};

const CONTEXTS: Record<string, Record<string, string>> = {
  '財星': {
    '身強': '你扛得住，主動談條件、推一件事，勝算比較高。',
    '身弱': '先確認資源夠不夠，別一次全押。',
    '從強': '順著錢的走向走，別逆。',
    '從弱': '借力，別自己硬扛。',
  },
  '官殺': {
    '身強': '你壓得住，適合談判、拍板。',
    '身弱': '對方話語權比較大，先聽完再回應。',
    '從強': '主動把主導權拿過來。',
    '從弱': '先觀察誰在決策。',
  },
  '食傷': {
    '身強': '把想說的說出來，今天說出口比較有力。',
    '身弱': '創意多，但先挑一件落地，別全做。',
    '從強': '放膽輸出，別自我審查。',
    '從弱': '找一個懂你的人先講。',
  },
  '比劫': {
    '身強': '人多力量大，適合合做，但帳要算清。',
    '身弱': '有同行相扶，別孤軍。',
    '從強': '拉隊友一起。',
    '從弱': '借對方的力，別搶。',
  },
  '印星': {
    '身強': '今天學到的東西會沉澱，別急著用。',
    '身弱': '多充電，明天再用。',
    '從強': '安靜下來。',
    '從弱': '找個靠得住的資訊源。',
  },
};

const HOOKS: Record<string, string> = {
  '財星': '那筆要還的帳，留到明天官殺日再談。',
  '官殺': '想反駁的話，留到明天財星日，理更直。',
  '食傷': '那封沒發出的信，留到明天印星日再寫。',
  '比劫': '那個要拒絕的人，留到明天官殺日說。',
  '印星': '想動手做的那件事，留到明天財星日動。',
};

export function buildDailyVerse(input: DailyVerseInput): DailyVerse {
  const { dayTenGodType, dayBranchElement, pattern, checkedToday, recentOutcome, isSteady } = input;
  const headline = HEADLINES[dayTenGodType] ?? `今天是「${dayTenGodType}」日。`;
  const context = CONTEXTS[dayTenGodType]?.[pattern] ?? `依你的命盤，今天能量偏「${dayBranchElement}」。`;

  let hook = HOOKS[dayTenGodType] ?? '今天先觀察，明天再動。';
  if (checkedToday && recentOutcome) {
    hook = recentOutcome === 'good'
      ? '你今天記了一筆「順利」——明天同一時間回來看它準不準。'
      : '你今天記了一筆「不順」——明天看它有沒有翻轉。';
  } else if (isSteady) {
    hook = `今天方向偏平穩，先觀察；明天「${dayBranchElement}」氣再來再動。`;
  }

  return {
    headline,
    context,
    hook,
    stamp: { tenGod: dayTenGodType, element: dayBranchElement },
  };
}
