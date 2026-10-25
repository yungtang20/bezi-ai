# 發布記錄 — 知識管線（K 系列）

## 版本
- 2026-10-26，工作樹變更（未提交；提交與推送需授權）
- 基線：`4ae21c9 feat: AI 回答決定性事實檢查層（Q4 證據鏈）`

## 可上線內容
### 新增
- `src/ai/knowledge/types.ts`：管線共用型別（QueryCategory / QueryClassification / KnowledgeItem / ChartContext）
- `src/ai/knowledge/classifier.ts`：查詢分類器（純規則，無 LLM；10 類主題 + 十神/五行關鍵詞抽取）
- `src/ai/knowledge/registry.ts`：知識條目註冊表（src/data core/charts/rules/lecture 全部來源，每條附 sourceId 與 matchedWhy）
- `src/ai/knowledge/chartContext.ts`：從 EvidenceData 派生 ChartContext（日主五行、determinePattern 格局）
- `src/ai/knowledge/retriever.ts`：檢索器（分類 + 命盤 → 知識條目；無結果 → 明示推論區）
- `tests/api-knowledge-pipeline.test.mjs`：5 支整合測試（mock Agnes + 虛構案情）

### 修改
- `server.ts`：createChatHandler 接管線（分類→檢索→附加 system message→合併驗證 bundle）
- `src/ai/prompts.ts`：三端點 prompt 加入引用規則（CITATION_RULE），結論須溯源到 kb:/sql:/mcp:/computed: 來源

### 行為變更（使用者可見）
- AI 回答的每個關鍵主張現在可追溯：knowledge items 以 `kb:模組:鍵` 編號注入 prompt
- 模型引用未提供的編號 → 拒答（「模型輸出未通過結構化引用驗證」）
- 無知識條目時 → 明說「僅依命盤證據推論」，不靜默補白
- 管線任何例外 → 降級為「無知識條目」，聊天不中斷

## 上線檢查表
- [x] 提交 git commit：`541e9e1`（知識管線）+ `95b7135`（CI runner 修復），已推 origin/pr-base
- [x] CI 通過：run 40234308590 全綠（含新 test:api step）
- [x] PR #17 合併（merge commit `6a6dabc`，fast-forward 路徑可清）
- [x] Render `bezi-ai-api` 重新部署：正式站驗證通過（匿名 token → records → chat SSE 全鏈 OK）
- [x] `npm run lint`（tsc --noEmit）0 錯
- [x] `npm test` vitest 123/123
- [x] API 整合測試 24/24（5 檔 node:test）
- [x] `npm run build` 成功（dist 產物完整）
- [ ] 提交 git commit（需授權）
- [ ] CI 通過（push 後）
- [ ] Render `bezi-ai-api` 重新部署（需授權）

## 回退方式
知識管線全為附加式：`server.ts` 移除 4 行匯入與管線區塊、`prompts.ts` 還原 CITATION_RULE，即回到 4ae21c9 行為。無 schema、無 API 變更、無新 dependency。
