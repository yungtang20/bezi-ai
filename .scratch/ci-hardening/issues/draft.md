# Ticket 拆解草稿

依 to-tickets 規則拆成 tracer-bullet 垂直切片。每張可獨立驗收，尺寸 fits one context window。

## 提案

| #   | Title                                               | Blocked by   | What it delivers                                                                               |
| --- | --------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| 01  | 講義 drift 檢查接進 npm scripts 與 CI               | None         | `npm run check:drift` 可執行；CI 跑 drift check（`continue-on-error: true` 暫不擋 merge）。    |
| 02  | Evidence ownership 與 session 過期 API 測試         | None         | 新增 integration test 檔，證明跨 token 拒絕、過期 token 拒絕。                                 |
| 03  | Rate limit 429 API 測試                             | None         | 證明超過 chat rate limit 回 429。                                                              |
| 04  | CI 強化：嚴格 lockfile、build、prod smoke、core tsc | None         | CI 用 `npm ci` 不 fallback；加入 build + prod-smoke + core `tsc --noEmit` 步驟。               |
| 05  | 治理文件重寫：project-context 與 LLM_WIKI 映射      | None         | memory 反映 React 19 / 三 chat 端點 / git repo；LLM_WIKI 指向 `packages/core/` 而非已刪 shim。 |
| 06  | README API section 補 evidence ownership 說明       | None         | 讀者知道 computed evidence 是 owner-scoped，短 token。                                         |
| 07  | 刪除候選清單（最後）                                | 01–06 完成後 | 列出 unused deps 與 dead files，等使用者核准。**不執行刪除。**                                 |

## Blocking edges 說明

- **01–06 互不依賴**：各自是完整垂直切片，可並行。
- **07 blocked by 01–06**：刪除清單要等前面完成，避免清單漏掉執行過程中新增的死碼。

## 粒度檢查

- 03 是否該併進 02？兩者都是 API tests，但 03 涉及觸發 rate limit 的時間成本，獨立 fail-fast 較好。**維持分開**。
- 05 是否該拆 project-context 和 LLM_WIKI？兩者都是治理文件更新，同一主题。**維持合併**。
- 07 不是 tracer bullet（無新行為），是清單交付。**保留為非程式工單**。
