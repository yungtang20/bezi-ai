// src/ai/knowledge/retriever.ts
// [鐵律3] 知識檢索器：分類 + 命盤 → 知識條目。純函式、同步、不依賴 LLM。
// 檢索不到 → 回空陣列（prompt 明說僅能就命盤證據回答）；任何例外由呼叫端降級。

import { REGISTRY } from './registry';
import { buildChartContext } from './chartContext';
import type { EvidenceData } from '../../lib/evidence/provider';
import type { ChartContext, KnowledgeItem, QueryCategory, QueryClassification } from './types';

/** 每類最多檢索條數（控制 prompt 大小） */
const MAX_ITEMS_PER_CATEGORY = 6;

export interface RetrievalResult {
  items: KnowledgeItem[];
  /** 實際用於檢索的命盤上下文（null = Evidence 缺日主等必要欄位） */
  context: ChartContext | null;
}

export function retrieveKnowledge(
  classification: QueryClassification,
  evidence: EvidenceData,
  fallbackCategory: QueryCategory = 'general_bazi',
): RetrievalResult {
  const context = buildChartContext(evidence);
  if (!context) return { items: [], context: null };

  // other/無命中 → 退回 general_bazi 基礎知識；仍由 builder 決定有無內容
  const category: QueryCategory =
    classification.category === 'other' ? fallbackCategory : classification.category;

  const builders = REGISTRY[category] || [];
  const items: KnowledgeItem[] = [];
  const seen = new Set<string>();

  for (const build of builders) {
    let built: KnowledgeItem[];
    try {
      built = build(context, classification.topics);
    } catch {
      continue; // 單一 builder 失敗不影響其他來源
    }
    for (const knowledgeItem of built) {
      if (seen.has(knowledgeItem.sourceId)) continue;
      if (!knowledgeItem.content || !knowledgeItem.sourceId) continue;
      seen.add(knowledgeItem.sourceId);
      items.push(knowledgeItem);
    }
  }

  return { items: items.slice(0, MAX_ITEMS_PER_CATEGORY), context };
}

/** 把檢索結果序列化為 system message 內容（含引用編號說明） */
export function formatKnowledgeForPrompt(items: KnowledgeItem[]): string {
  if (items.length === 0) {
    return '（本次查詢無命理知識庫檢索結果；請僅根據命盤證據回答，並在回答中說明此段為依命盤的推論。）';
  }
  return items
    .map(i => `[${i.sourceId}] ${i.title}\n${i.content}\n（檢索原因：${i.matchedWhy}）`)
    .join('\n\n');
}
