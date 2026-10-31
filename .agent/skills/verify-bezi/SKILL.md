# verify-bezi — bezi 驗證 skill（agent 用）

> 靈感：Lauren Tan（poteto）pstack / Control Glass 模式 —
> agent 說「我做完了」不是證據；從**真的跑起來的 app** 擷取的輸出、截圖與 repro 才是。
> 本 skill 是 bezi 的「Control Glass」：agent 必須用這裡的固定 CLI 啟動、驅動、蒐證、清理。

## 鐵律

1. **宣告 done 之前必須先跑 verify**。沒跑過的驗證 = 草稿，不是交付物。
2. ** evidence 不可刪**：`tests/e2e/reports/verify/` 是證據目錄，cleanup 只殺你自己起的 process。
3. **failing-before / passing-after**：修 bug 時先留存失敗輸出，修完貼同一個 repro 的通過輸出。
4. 不可逆動作（force push、刪 branch、改 `.env*`、動 `data/bezi.db`）→ 停下來問人。

## Launch — 啟動 app

```bash
# 正式產物模式（與 Render 部署一致；需先 npm run build）
npm run build && PORT=3990 node dist/server.cjs

# dev 模式（tsx，不需 build）
PORT=3990 npm run dev
```

就緒判準：`curl -fsS http://127.0.0.1:3990/api/health`（或 HTTP 200 首頁 `curl -fsS http://127.0.0.1:3990/`）。
dev 模式要啟用匿名授權：`ENABLE_ANONYMOUS_CHAT=true ENABLE_DEV_AUTH_BYPASS=true`（見 `.env.example`）。

## Doctor — 值得開車嗎（唯讀健檢）

```bash
npm run lint        # tsc --noEmit，0 錯才繼續
npm test            # vitest 195+
npm run test:api    # 5 檔 26 測試
```

任一失敗 → 先修這個，不要在其上疊新功能。

## Drive — 實際驅動 app（證據在這一步產生）

```bash
npm run build
npx playwright test tests/e2e/specs/prod-smoke.spec.ts     # production 掛載 + CORS
npx playwright test tests/e2e/specs/onboarding.spec.ts     # 建盤主流程
npx playwright test tests/e2e/specs/stress.spec.ts         # 全功能走查（最重，~2 分鐘）
npx playwright test tests/e2e/specs/chat-flow.spec.ts      # AI 問答 SSE（需 mock Agnes；spec 自帶）
```

- 全套：`npm run test:e2e`（30 案，收 pageerror=0）。
- UI 變更（樣式/版面/文案）**必須**跑對應 spec 並開 `trace: on` 或看截圖 —
  `tests/e2e/reports/` 有 HTML report；單測試截圖在 `test-results/`。
- 手動開車：`browser.open http://127.0.0.1:3990`，用假資料走 onboarding → dashboard，
  截圖存 `tests/e2e/reports/verify/`。

## Evidence — 要留下什麼

| 變更類型                                 | 最低證據                                                       |
| ---------------------------------------- | -------------------------------------------------------------- |
| 邏輯（paipan/dayun/pattern/calibration） | 對應 vitest 檔全綠 + 新增案例的實際輸出貼進報告                |
| UI（任何 className/文案/版面）           | 對應 e2e spec 綠 + 截圖一張（改前/改後各一更佳）               |
| AI 管線（prompts/retriever/server）      | `test:api` 全綠 + `eval:ai-factual` 或 knowledge-pipeline 輸出 |
| Bug fix                                  | failing-before 輸出 + passing-after 輸出（同一 repro）         |
| 依賴/建置                                | `npm run build` + `prod-smoke` 綠                              |

## Cleanup — 收尾

```bash
# 殺 process（只殺自己起的）
npx kill-port 3990   # 或 taskkill //PID <pid> //F
```

- 刪 throwaway script；不刪 `tests/e2e/reports/`、不 reset DB。
- 永久新增的測試要 deterministic、隔離（見 CONTRIBUTING.md）。

## Feature map（agent 快速導航）

| 功能             | 入口 step | 元件                                        | e2e 覆蓋                   |
| ---------------- | --------- | ------------------------------------------- | -------------------------- |
| 建盤 onboarding  | 1–3       | `App.tsx` 表單                              | onboarding A/B/C、stress A |
| 今日能量         | 4         | `Dashboard` + `TodayEnergyCard`             | stress B/E                 |
| 探索（六大專項） | 11→7      | `ExplorePage` → `SpecialtyNav`              | stress B                   |
| 大運流年         | 6         | `TimelinePage`                              | stress B                   |
| 近期日子         | 8         | `DailyForecastPage`                         | stress B/D/E               |
| 合盤             | 9         | `SynastryPage`                              | stress B/F                 |
| 學習             | 10        | `ReferenceTablePage`（含風水軟裝/古籍書單） | stress B                   |
| 我的命盤         | 12        | `Dashboard view="profile"`                  | stress B                   |
| AI 問答          | Drawer    | `AIChatPanel` + `useSSEChat`                | chat-flow、stress G        |
| 知識管線         | server    | `src/ai/knowledge/*` + `server.ts`          | api-knowledge-pipeline     |

改哪個功能 → 先看上表，跑到對應 spec，證據落 `tests/e2e/reports/verify/`。
