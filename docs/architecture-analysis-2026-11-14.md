# bezi 架構分析決策紀錄（2026-11-14）

## 盤點

- 確認 repo、HEAD `ec2349606173e8fccc9d3b8ba04ede51174d123d` 與 5 修改 + 4 未追蹤檔案的髒工作區；不改動。
- 盤點 `packages/core`、`src/data`、`server.ts`、`src/ai`、測試與部署檔；主要資料流為 React client → local storage → `/api/evidence/current` → session Evidence → Agnes SSE → grounding/factCheck → 前端 sanitize。

## 查核

- 核心計算以 golden 測試與講義 pin 測試為主；已知 `determinePattern` 公開輸出為含互動與藏干的最終分，未與七字合會前基礎分混比。
- AI 邊界確認 server-side Evidence、knowledge sourceId gate、輸出 schema gate、前端 DOMPurify。發現 record ownership gate 已存在；README API 表未列 `record_id` ownership 限制。
- 發現 `.opencode/memory/project-context.md` 有舊狀態（React 18、單端點、未初始化 git、測試數過舊），`LLM_WIKI.md` 自述含重複章節且部分映射仍指舊 `src/*.ts` 檔案。

## 驗證

- 實跑 `npm run lint`：通過。
- 實跑定向 Vitest 4 檔 23 測試：通過（含髒區 `harmony-control`、`dailyFlowDays`、`paipan`、`pattern`）。
- 實跑 `npm run test:api`：26/26 通過。
- 實跑 `node scripts/check-lecture-drift.mjs`：exit 1，兩處講義資料差異；未納入 `package.json`、lint-staged 或 CI。
- 未執行完整 `npm test`、build 或 e2e；避免重複花時間且本次非發布驗收。

## 主要建議

1. 清理依賴與死檔：`@google/genai`、`@typescript-eslint/*`、`mammoth`、`workbox-window` 未搜尋到使用；`fetch-latest.js`、`bun.lock` 疑似殘留。刪除前先確認影響與核准。
2. 補測試：computed evidence 跨 token 拒絕、session 過期、`/api/records` 可能外洩出生日摘要、rate-limit 邊界。
3. 收斂資料與治理：`lectureData` 兩份差異先定權威，drift 檢查接進檢查管線；同時重寫 stale memory/wiki 引用，避免誤導 agent。
4. CI 提升為發布關卡：鎖定 `npm ci`、加入 build + prod smoke、核心 `tsc -p packages/core/tsconfig.json --noEmit`，必要時加入 e2e 全套。
