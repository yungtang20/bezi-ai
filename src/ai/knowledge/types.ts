// src/ai/knowledge/types.ts
// 知識管線共用型別：查詢分類 → 知識檢索 → grounding 引用。

/** 查詢主題分類（對應 src/data 知識源分層與前端頁面分區） */
export type QueryCategory =
  | 'spouse'        // 感情姻緣
  | 'wealth'        // 財運
  | 'career'        // 事業
  | 'health'        // 健康
  | 'family'        // 家人/人際
  | 'dayun_liunian' // 大運流年
  | 'daily'         // 每日運勢
  | 'general_bazi'  // 一般命盤解讀
  | 'other';        // 無法分類

export interface QueryClassification {
  category: QueryCategory;
  /** 抽到的命理關鍵詞（十神、五行、宮位、干支、主題詞） */
  topics: string[];
  confidence: 'high' | 'medium' | 'low';
}

/** 檢索到的知識條目：供 LLM 引用的最小單位 */
export interface KnowledgeItem {
  /** 穩定 ID，格式 kb:<來源模組>:<鍵>；claims.sourceIds 必須引用此 ID */
  sourceId: string;
  title: string;
  /** 檢索到的實際內容（已序列化為可讀文字） */
  content: string;
  /** 為什麼檢索到這條（供模型理解引用脈絡、供人類審計） */
  matchedWhy: string;
}

/** 命盤檢索上下文：從 EvidenceData 派生的分類/檢索輸入 */
export interface ChartContext {
  dayMaster: string;
  dayElement: string;
  /** '身強' | '身弱' | '從強' | '從弱'；時辰未知時可能為 null */
  pattern: string | null;
  /** 十神 → 數量（>0 者） */
  tenGods: Record<string, number>;
  /** 五行 → 相對值 */
  fiveElements: Record<string, number>;
  /** 命主性別 */
  gender: string;
}
