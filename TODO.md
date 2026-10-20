# bezi 專案待辦清單

## 🔴 必須完成（基礎建設）

- [x] **驗收全通** — lint + test + build 皆通過
- [ ] **建立 git repo** → clone from remote `github.com/yungtang20/bezi`（受 AGENTS.md 限制，本機不得 `git init`）
- [ ] **初始化 memory 系統** → `.opencode/memory/` 結構已建立（project-context.md、knowledge-index.md、domain-rule-map.md）

## 🟡 應該完成（開發體驗）

- [ ] **優化建置 chunk** — `vite.config.ts` 已設定 `manualChunks`（vendor 切分、chunkSizeWarningLimit: 800），建置報告顯示 chunks 縮小
- [ ] **設定 codebase-memory-mcp** → 連接專案記憶體到 MCP 伺服器
- [ ] **建立領域規則溯源表** → 已建立 `domain-rule-map.md`（對應 LLM_WIKI.md ↔ src/data/ 程式碼規則）

## 🟢 可選完成（架構演進）

- [x] **拆分 `/api/chat` 端點** → 完成（2026-10-21）：新增 `src/ai/prompts.ts`（BAZI/SYNASTRY/DAYUN 三組 prompt）、`server.ts` 改為 `createChatHandler()` 工廠 + 三條路由 `/api/chat`、`/api/chat/synastry`、`/api/chat/dayun`，各自獨立限流 bucket
- [x] **定義 domain module 介面契約** → 完成：`.opencode/memory/domain-module-contracts.md`（paipan/pattern/dayun/dailyAnalysis 經 `@bezi/core` workspace shim；matchmaking/calibration 為真實實作；含邊界審查結論）
- [x] **補齊 Playwright E2E** → 完成：`chat-flow.spec.ts` 從 3 測試擴充至 5（新增分流端點 401 保護 + 授權後 SSE grounding 驗證）

## 📌 當前狀態摘要（2026-10-21 更新）

| 檢查項目 | 結果 |
|----------|------|
| `npm run lint` | ✅ 通過（tsc --noEmit） |
| `npm test` | ✅ 通過（12 檔、36 測試全過） |
| API 驗證（.mjs） | ✅ 12 項全過（chat-validation 4 + evidence-pipeline 7 + dev-auth-bypass 1） |
| Playwright E2E | ✅ 5/5 全過（含 2 個新分流端點測試） |
| `npm run build` | ✅ 通過（前端 + 後端 bundle 26.6kb） |
| chunk 大小 | ✅ 已優化（manualChunks 切分 vendor/core/charts，無 >500kB 警告） |
| codebase-memory-mcp | ✅ 已索引（2,407 節點、8,043 邊、16 層） |
| git repo | ✅ 完成（2026-10-21 經授權 init + push；remote `origin` → `github.com/yungtang20/bezi`，private，branch `main`） |
| CI/CD | ⏳ 待補（`.github/workflows/ci.yml` 本機就緒；推送需 token workflow scope：`gh auth refresh -h github.com -s workflow` 後 `git add .github/workflows/ci.yml && git commit && git push`） |

## 📝 本輪完成工作（2026-10-21）

1. `src/ai/prompts.ts` — 三組用途分離 system prompt
2. `server.ts` — `createChatHandler()` 工廠重構 + 三端點分流（各自限流 bucket）
3. `tests/e2e/specs/chat-flow.spec.ts` — 新增 2 個分流端點 E2E 測試
4. `.opencode/memory/` — project-context / knowledge-index / domain-rule-map / domain-module-contracts 四份記憶檔
5. `vite.config.ts` — manualChunks 優化
6. `TODO.md` — 本檔