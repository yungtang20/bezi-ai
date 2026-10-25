# 壓力測試與除錯記錄（品質迴圈）

## Round 1 — 2026-10-26

### 測試項目
- `tests/api-knowledge-pipeline.test.mjs`（新增）：mock Agnes + 虛構案情（demo-001 戊土身強 / demo-002 壬水），覆蓋：
  1. 知識 prompt 在 Evidence 之後、且含檢索原因（`kb:wealthGuidelines:wealth-土` 出現）
  2. 有效 `kb:` sourceId 通過引用驗證
  3. 虛構 `kb:` sourceId 被拒答（`模型輸出未通過結構化引用驗證`）
  4. 不可分類查詢降級 general_bazi、聊天仍可用
  5. 完整命盤記錄含 pattern 相依條目

### 發現的問題
1. **`validateAIOutput` 只認 Evidence bundle 的 sourceId**（grounding.ts:80-89）：知識條目（`kb:`）引用被誤判「引用不存在的 sourceId」→ 3 個測試失敗。
2. server.ts 初版另加重複的 fabricated 檢查（`allowedSourceIds` Set），與 grounding 邏輯雙軌 → 移除。
3. 首次全測 0/5 通過（問題 1 連帶影響）。

### 修改內容
- `server.ts`：建立 `validationBundle = { ...evidenceBundle, items: bundle items + 知識條目(轉為 computed EvidenceItem, schemaVersion kb-entry-v1) }`；`validateAIOutput(parsedOutput, validationBundle)` 取代兩軌檢查。單一來源集合，引用真實性檢查併回 grounding。
- 結果：5/5 通過。

### 回歸確認
- `tests/api-evidence-pipeline.test.mjs`：7/7 通過（既有管線無回歸）。
- `npm run lint`（tsc --noEmit）：0 錯。
- `npm test`（vitest）：123/123 通過（21 檔）。
- `npm run build`：成功（59.94s，dist 產物完整；CI 同款流程通過）。

### 未做（已知限制）
- 知識條目轉 EvidenceItem 用 `sourceType: 'computed'`；`kb-entry-v1` schemaVersion 未擴充 grounding 型別（grounding 只查 sourceId 集合，未查 schema 名稱）。
- 真實 Agnes 模型回傳格式未驗證（mock 覆蓋結構；`eval-ai-factual.mjs` 可用真實 key 加測）。

## Round 2 — 2026-10-26

### 測試項目
- 全量 API 整合測試：`api-chat-validation` + `api-cors` + `api-dev-auth-bypass` + `api-evidence-pipeline` + `api-knowledge-pipeline`（24 支）
- 逐檔隔離跑 + 合併重試，排除 port 共搶暫態

### 發現的問題
1. 初次 5 檔合併跑 17/24：`api-chat-validation` 6 支 + CORS 1 支卡 `waitForServer`（port 3000 共搶 + tsx 冷啟動 15s 期限）。
2. 判定為暫態基礎設施問題：隔離跑 4 檔 17/17、`api-chat-validation` 單檔 7/7，重試 5 檔合併 24/24 全過。

### 結果
- 零缺陷（重試後 24/24 通過；lint 0 錯；vitest 123/123；build 成功）。
- 已知限制：5 支 API 測試檔未入 CI；建議下一輪加 port 隔離（`PORT` 環境變數）後納入。

## Round 3 — 2026-10-26

### 測試項目
- 全量 5 檔 API 整合測試（24 支）
- Playwright 正式產物煙霧測試（`prod-smoke.spec.ts`，2 支）

### 結果
- 24/24 通過；prod smoke 2/2 通過（React 正常掛載、同源資源無 CORS 403）。
- 零缺陷。與 Round 2 連續兩輪全量測試零缺陷，達成交付條件。

## Round 4 — 2026-10-26

### 測試項目
- port 隔離改造後 5 檔 API 整合測試（各檔獨立 server port：3100-3104）
- CI 新增 `test:api` step 全量
- 真實模型量測：`scripts/eval-ai-factual.mjs`（15 斷言）+ 新增 `scripts/eval-knowledge-real.mjs`（真實 Agnes key × 知識管線，3 查詢 × 4 斷言）

### 發現的問題
1. **port 共搶根因確認**：`.env.local` 含 `PORT=3000`；server.ts `dotenv.config({ path: '.env.local', override: true })` 會覆蓋未明確傳 PORT 的子程序 → 5 檔併跑共搶 3000。修復：各測試檔 spawn env 明確傳 `PORT`（明確環境變數勝於 dotenv override）。
2. **evidence 測試檔 spawn 區塊被先前 sed 事故弄壞**（`env:` 行遺漏，child 未收到 PORT）→ 重建 spawn 區塊；加 ENV-PROBE 診斷定位後清除腳手架。
3. **CI ubuntu-latest → 26.04，Playwright 1.60 不支援**（10-25 既有失敗）→ 固定 `ubuntu-24.04`。
4. `npm run test:api` 初跑 1 支 flake，重試 + 連跑 3 次 24/24（冷啟動暫態，port 隔離後未再現）。

### 修改內容
- 5 支 API 測試檔：port 隔離（3100-3104）+ 等待期限 90s
- `package.json`：新增 `test:api` script；`ci.yml`：新增 Run API Integration Tests step、runner 固定 ubuntu-24.04
- 新增 `scripts/eval-knowledge-real.mjs`（真實模型量測）

### 結果
- lint 0 錯；vitest 123/123；API 24/24（連續 2 輪 + 3 次重試）；prod smoke 2/2。
- 真實模型量測：eval-ai-factual 15/15 PASS；eval-knowledge-real 14/14 PASS（分類 wealth/spouse/general_bazi 全對、檢索 3/3/2 條、factCheck 無錯誤事實）。
- 提交 `541e9e1` + `95b7135` 推送 origin；PR #17 合併（`6a6dabc`）；Render 正式站全鏈驗證通過。
