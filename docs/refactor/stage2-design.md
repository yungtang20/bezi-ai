# 階段2 工件：Design — 管線 spec 與介面約定（2026-10-26）

## 架構（目標流程）

```
使用者查詢
   │
   ▼
[1] classifyQuery（分類器，純函式）
   │  輸入：查詢字串＋用途（bazi/synastry/dayun）
   │  輸出：QueryClassification { category, topics, confidence }
   ▼
[2] retrieveKnowledge（檢索器，純函式）
   │  輸入：分類結果＋EvidenceData（命盤）
   │  輸出：KnowledgeItem[]（每條含 sourceId/title/content/matchedWhy）
   ▼
[3] 組 prompt：命盤證據 + 檢索到的知識條目 + 引用要求
   ▼
[4] 呼叫 Agnes LLM（現況不變）
   ▼
[5] validateAIOutput（現況不變）＋ 新增：claims.sourceIds ⊆ 檢索結果∪bundle
   ▼
[6] checkFactualClaims（現況不變）
   ▼
SSE 回傳
```

## 介面約定

### QueryClassification（新增 `src/ai/knowledge/types.ts`）

```ts
export type QueryCategory =
  | 'spouse' | 'wealth' | 'career' | 'health'
  | 'dayun_liunian' | 'daily' | 'general_bazi' | 'other';

export interface QueryClassification {
  category: QueryCategory;
  topics: string[];        // 抽到的命理關鍵詞（十神/五行/宮位/干支）
  confidence: 'high' | 'medium' | 'low';
}
```

### KnowledgeItem（新增）

```ts
export interface KnowledgeItem {
  sourceId: string;        // 如 'kb:careerGuidelines:金'
  title: string;
  content: string;         // 檢索到的實際內容文字
  matchedWhy: string;      // 為什麼檢索到（供模型理解與人類審計）
}
```

### classifyQuery（新增 `src/ai/knowledge/classifier.ts`）

- 純函式、同步、不依賴 LLM（關鍵詞規則表，固定步驟唯一答案 → 符合鐵律3「確定的事交給腳本」）
- 規則表寫死在模組頂部，未匹配任何規則 → `general_bazi` + low confidence
- 決不猜測：查詢完全看不懂 → other

### retrieveKnowledge（新增 `src/ai/knowledge/retriever.ts`）

- 純函式、同步
- 輸入分類 category → 從註冊表選出對應知識源（`src/data/charts/*` 對應主題、`src/data/lecture/*` 對應學理、`src/data/core/*` 對應基礎）
- 再用 topics + 命盤（日主五行、身強身弱、十神分佈）過濾/挑選條目
- 每條輸出必附 sourceId 與 matchedWhy
- 檢索不到（topics 無命中且無法用命盤推薦）→ 回空陣列，prompt 明說「無可用知識條目，僅能就命盤證據回答」

### 註冊表（`src/ai/knowledge/registry.ts`）

- 每個 category 對應一組 builder 函式：`(evidence: EvidenceData) => KnowledgeItem[]`
- builder 只讀 `src/data/**` 既有匯出，不改知識內容
- sourceId 命名固定 `kb:<來源模組>:<鍵>`，寫成常數產生器，避免手寫拼錯

### prompt 變更（`src/ai/prompts.ts`）

- 三組 prompt 加一段：「回答中的每個主張必須引用下方『檢索到的命理知識』或『命盤證據』的編號；不得引用未提供的編號；無對應知識時明確說明此段為推論」

### server.ts 變更

- `createChatHandler` 在取得 evidenceBundle 之後、組 openAiMessages 之前插入 分類→檢索
- 檢索結果以第三條 system message 加入（與命盤證據分開，方便測試與未來替換）
- `validateAIOutput` 後加檢查：claims.sourceIds 不得含未提供給模型的 ID（來源集合 = bundle items + 檢索 items）
- 不改 SSE 幀格式（前端不用動）

## 邊界與錯誤處理

- 分類/檢索任何例外 → 捕捉後降級為「無知識條目」繼續原流程，不讓聊天中斷（管線增強失敗 ≠ 拒答）
- 知識條目內容在組 prompt 前 JSON.stringify，不含使用者輸入（無注入面）
- 自定義 customPrompt 維持現況字串型別淨化

## 測試策略

- 單測：classifier（各類別關鍵詞、未匹配、混和查詢）、retriever（各 category 對應知識源、空結果、matchedWhy 非空）
- 整合：mock Agnes + 虛構案情，驗證 server 端管線順序、claims 引用檢查、拒答路徑
- 回歸：既有 123 項單測、E2E、build 全過
