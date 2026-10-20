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
| `npm test` | ✅ 通過（13 檔、45 測試全過） |
| API 驗證（.mjs） | ✅ 12 項全過（chat-validation 4 + evidence-pipeline 7 + dev-auth-bypass 1） |
| Playwright E2E | ✅ 9/9 全過（含 1 鍵範例命盤試玩、分享圖產出、production 煙霧） |
| `npm run build` | ✅ 通過（前端 + 後端 bundle 26.6kb） |
| chunk 大小 | ✅ 已優化（manualChunks 切分 vendor/core/charts，無 >500kB 警告） |
| codebase-memory-mcp | ✅ 已索引（2,407 節點、8,043 邊、16 層） |
| git repo | ✅ 完成（2026-10-21 經授權 init + push；remote `origin` → `github.com/yungtang20/bezi`，private，branch `main`） |
| CI/CD | ✅ 完成（2026-10-21 ci.yml 已推送；首次 CI Pipeline 執行 success 57s——lint + test + build 每次 push 自動跑） |
| Production 煙霧關卡 | ✅ 完成（2026-10-21 新增：build → prod smoke，跑 dist/server.cjs 驗 React 掛載／無 runtime 錯誤／無 CORS 403） |
| 正式部署 | ✅ 上線（2026-10-21）Render `bezi-ai-api` → https://bezi-ai-api.onrender.com，匿名授權已啟用，端到端驗證通過（token／records／SSE AI 回答） |

## 📝 本輪完成工作（2026-10-21）

1. `src/ai/prompts.ts` — 三組用途分離 system prompt
2. `server.ts` — `createChatHandler()` 工廠重構 + 三端點分流（各自限流 bucket）
3. `tests/e2e/specs/chat-flow.spec.ts` — 新增 2 個分流端點 E2E 測試
4. `.opencode/memory/` — project-context / knowledge-index / domain-rule-map / domain-module-contracts 四份記憶檔
5. `vite.config.ts` — manualChunks 優化
6. `TODO.md` — 本檔

## 📝 激活用意願批次（2026-10-21 晚）

**#3 拆授權牆**：server `ENABLE_ANONYMOUS_CHAT` ＋ 前端靜默授權 ＋ 401 自動換發 token
**#1 今日首屏**：`dashboard/TodayEnergyCard.tsx` 今日能量卡（吉凶徽章/干支十神/農曆/建議/警示/CTA）
**範例試玩**：`App.tsx` 一鍵範例命盤（1984-03-25 10:00 男 → 甲子年戊午日，與 demo-001 證據一致）
**時辰提示**：`App.tsx` 「不知道出生時辰也沒關係」常駐提示（引擎 `isHourUnknown` 早已支援）
**🐛 重大 bug 修復**：`validateBirthInput` 只接受 `HH:mm`，但主表單儲存的是小時 → **填了時辰的使用者完全無法送出表單**（已支援 HH/HH:mm/HHmm 三格式 + 9 項回歸測試 `tests/unit/validation.test.ts`）

**🐛 正式站全白修復（上線後才發現）**：
1. CORS：module script 帶 `crossorigin` → 瀏覽器連同源請求也帶 Origin → 前端資源全 403 → React 無法掛載。修正：同源永不阻擋（新增 `tests/api-cors.test.mjs` 4 項）
2. `manualChunks`：字串模糊匹配把 `motion/react` 誤歸入 vendor-react → 跨 chunk 循環 → production 崩潰（dev 不重現）。修正：移除自訂分包，改用 Vite 預設
3. 防火牆：新增 production bundle 煙霧測試並接上 CI（`tests/e2e/specs/prod-smoke.spec.ts`）

**分享卡片（裂變）**：`src/lib/shareText.ts`＋`src/hooks/useShareImage.ts`＋`src/components/share/{ShareImage,DailyShareCard,SynastryShareCard}.tsx`；今日能量卡與合盤頁各有分享按鈕，Web Share API（手機→LINE）→ 桌機降級下載＋LINE 分享按鈕。分享卡全程 inline hex 樣式（html2canvas 不支援 oklch）。正式站實測通過。