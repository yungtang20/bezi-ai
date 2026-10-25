# 階段1 工件：Plan — 重構 intent 與成功標準（2026-10-26）

## 要改哪一層

目標方向（先分類→再檢索→再解析→結論可溯源）套用到命理 domain，逐層盤點：

| 層 | 現況 | 要不要改 |
|---|---|---|
| 知識層 | `src/data/{core,charts,rules,lecture}` 4,891 行結構化命理知識，已有分類（core=基礎、rules=規則、charts=主題、lecture=講義） | **不改內容**。已有分類就是檢索對象，沿用 |
| 行為層 | 模型行為由 system prompt 約束，但無檢索證據輔助，模型靠命盤 JSON 推論 | **要改**。prompt 要改成要求引用檢索到的知識條目 |
| 流程層 | 現況：命盤 Evidence 全塞 system message → 模型一次生成。無分類、無檢索、無解析 | **主要重構對象**。加查詢分類 → 知識檢索 → 用語解析 → grounding 輸出 |
| 品味層 | 輸出格式已定（Markdown + JSON footer），claims 有 sourceId | **小改**。claims 的 sourceId 要指向檢索到的知識條目，非空殼 bundle item |
| 誠實層 | factChecker 驗決定性事實；validateAIOutput 驗引用存在性 | **要加強**。引用必須真實對應檢索結果，不得虛構或全補「低信心」繞過 |

## Intent（一句話）

`/api/chat` 系列端點在呼叫 LLM 前，先把使用者查詢**分類**（問伴侶/事業/健康/財富/大運流年/每日運勢/學理），依分類**檢索** `src/data` 知識庫中相關知識條目，把命盤證據與**檢索到的知識條目**一起放進 prompt，並要求模型的每個主張引用檢索到的知識條目 ID；server 驗證引用真實性，未通過一律拒答。

## 成功標準（可驗證）

1. **分類可測**：`classifyQuery` 純函式，輸入查詢字串，輸出穩定分類（含信心），虛構案情測試全過
2. **檢索可測**：`retrieveKnowledge` 純函式，輸入分類+命盤，輸出知識條目陣列（每條含 sourceId、title、content、matchedWhy），可單測
3. **管線順序可測**：server 端的執行順序固定為 分類→檢索→組 prompt→呼叫 LLM→驗證引用→事實核對；mock Agnes 測試能觀察到順序
4. **拒答路徑可測**：模型主張引用不存在的知識條目 → server 拒答（沿用 missingEvidenceOutput）
5. **結論可溯源可測**：SSE 回傳的 claims.sourceIds 100% 對應檢索結果與 Evidence bundle；factCheck 幀保留
6. **既有功能不回歸**：`npm run lint`、`npm test`、`npm run build`、Playwright E2E 全過

## 範圍

- 改：`server.ts`（createChatHandler 管線）、`src/ai/prompts.ts`（prompt 加知識引用要求）
- 新增：`src/ai/knowledge/classifier.ts`（分類）、`src/ai/knowledge/retriever.ts`（檢索）、`src/ai/knowledge/index.ts`（知識條目統一註冊）
- 不改：`src/data/**` 內容、前端、資料庫 schema、`src/ai/factChecker.ts`、`src/ai/grounding.ts` 介面
- 不引入新 dependency

## 非目標

- 不做向量檢索/embedding（知識庫僅 ~4,900 行，關鍵字+分類過濾足夠，避免引入向量庫依賴）
- 不做多輪對話狀態管理（現況無此需求）
- 不改 Render 部署設定（管線改動對部署透明）
