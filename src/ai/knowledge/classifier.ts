// src/ai/knowledge/classifier.ts
// [鐵律3] 查詢分類器：固定步驟、唯一答案 → 純規則函式，不用 LLM。
// 未匹配任何主題規則 → general_bazi + low confidence；完全無法理解 → other。

import type { QueryCategory, QueryClassification } from './types';

/** 主題關鍵詞規則表（台灣用語）。命中任一關鍵詞即計入該分類。 */
const CATEGORY_KEYWORDS: Array<{ category: QueryCategory; keywords: string[] }> = [
  {
    category: 'spouse',
    keywords: ['感情', '姻緣', '婚姻', '桃花', '配偶', '老公', '老婆', '妻子', '丈夫', '另一半', '戀愛', '分手', '對象', '結婚', '相親', '曖昧'],
  },
  {
    category: 'wealth',
    keywords: ['財運', '財富', '賺錢', '投資', '破財', '存款', '理財', '偏財', '正財', '收入', '生意', '創業', '買房'],
  },
  {
    category: 'career',
    keywords: ['事業', '工作', '職業', '轉職', '跳槽', '升遷', '考試', '求職', '合夥', '上司', '老闆', '同事', '創業方向', '公職'],
  },
  {
    category: 'health',
    keywords: ['健康', '身體', '疾病', '生病', '養生', '醫療', '睡眠', '疲勞', '體質', '開刀'],
  },
  {
    category: 'family',
    keywords: ['家人', '父母', '兄弟', '姊妹', '子女', '小孩', '親子', '朋友', '人際', '貴人', '小人', '手足', '長輩'],
  },
  {
    category: 'dayun_liunian',
    keywords: ['大運', '流年', '十年', '太歲', '犯太歲', '明年', '今年運勢', '未來', '歲運', '起運'],
  },
  {
    category: 'daily',
    keywords: ['今天', '今日', '流日', '每日運勢', '本日', '今天的運'],
  },
  {
    category: 'general_bazi',
    keywords: ['命盤', '八字', '格局', '日主', '五行', '十神', '命格', '性格', '個性', '天干', '地支', '藏干', '四柱'],
  },
];

/** 十神名（含簡稱）→ 標準名 */
const TEN_GOD_ALIASES: Record<string, string> = {
  '比肩': '比肩', '劫財': '劫財', '食神': '食神', '傷官': '傷官',
  '偏財': '偏財', '正財': '正財', '七殺': '七殺', '正官': '正官',
  '偏印': '偏印', '正印': '正印', '梟神': '偏印', '官殺': '官殺', '印星': '印星',
};

const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'];

// 風水主題關鍵詞（風水系統與八字系統分離，僅作為 topics 供 fengshuiBuilder gate）
const FENG_SHUI_KEYWORDS = ['風水', '居家', '擺設', '朝向', '方位', '收銀', '店面', '辦公室', '紫白', '飛星', '入宅', '動工', '裝修', '明堂', '穿堂'];

/**
 * 對使用者查詢做決定性分類。
 * @param query 查詢文字（多則訊息合併）
 */
export function classifyQuery(query: string): QueryClassification {
  const text = (query || '').trim();
  if (!text) return { category: 'other', topics: [], confidence: 'low' };

  const topics: string[] = [];
  const hits = new Map<QueryCategory, number>();

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    let count = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        count++;
        if (!topics.includes(kw)) topics.push(kw);
      }
    }
    if (count > 0) hits.set(category, count);
  }

  // 抽命理專有名詞（十神/五行）
  for (const [alias, standard] of Object.entries(TEN_GOD_ALIASES)) {
    if (text.includes(alias) && !topics.includes(standard)) topics.push(standard);
  }
  for (const el of FIVE_ELEMENTS) {
    // 避免把日常用語當五行（如「今天」含「天」不含五行字本身）
    if (text.includes(el) && !topics.includes(el)) topics.push(el);
  }

  for (const kw of FENG_SHUI_KEYWORDS) {
    if (text.includes(kw) && !topics.includes(kw)) topics.push(kw);
  }

  if (hits.size === 0) {
    // 無主題關鍵詞但有命理詞 → general_bazi；完全無 → other
    const hasBaziTerm = topics.some(t => TEN_GOD_ALIASES[t] || FIVE_ELEMENTS.includes(t));
    return { category: hasBaziTerm ? 'general_bazi' : 'other', topics, confidence: 'low' };
  }

  // 取命中數最多的分類；平手時依規則表順序（前 = 更具體）
  let best: QueryCategory | null = null;
  let bestCount = 0;
  for (const { category } of CATEGORY_KEYWORDS) {
    const count = hits.get(category) || 0;
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }

  // 命中 2 個以上關鍵詞 = high；僅 1 個 = medium
  const confidence = bestCount >= 2 ? 'high' : 'medium';
  return { category: best as QueryCategory, topics, confidence };
}
