# bezi 專案上下文

> 2026-11-14 重寫：反映目前實際狀態，取代過期舊檔。舊檔曾寫「React 18、單一 /api/chat、非 git repo、36 測試」，皆已不成立。

## 專案身份
- 專案名：bezi（八字能量日誌）
- 本機根目錄：以實際 clone 位置為準（舊路徑僅歷史參考）
- GitHub repo：`github.com/yungtang20/bezi-ai`（目前 public）；本次品質改善整合分支 `matt/bezi-quality-20261115`
- 套件：`bezi-ai`，npm workspace 包含 `packages/*`

## 技術架構

### 前端
- React 19 + Vite + Tailwind CSS（client-side）
- 入口：`index.html` → `src/main.tsx` → `App.tsx`
- 狀態：React hooks + localStorage / sessionStorage / IndexedDB（無 Redux/Zustand）

### 後端
- Express + SSE proxy（`server.ts`，~930 行）
- 端點：`/api/auth/token`、`/api/records`、`/api/evidence/current`、`/api/chat`、`/api/chat/synastry`、`/api/chat/dayun`
- 信任邊界：server-side Evidence（SQLite 或 session-computed），computed evidence 綁定發放 token（owner check），session TTL 60 分鐘
- 匿名模式：`ENABLE_ANONYMOUS_CHAT=true` 時免 client_secret 發 token，仍受 per-IP rate limit（chat 30 次/60 秒）

### Domain Modules（`packages/core/`）
| 模組 | 責任 |
|------|------|
| `paipan.ts` | 子平八字排盤 |
| `pattern.ts` | 格局判定 + 用神查表 |
| `dayun.ts` | 大運流年 |
| `dailyAnalysis.ts` | 流日能量 |
| `trueSolarTime.ts` | 真太陽時校正 |
| `chartTransform.ts` | 圖表轉換 |

`src/paipan.ts` 等為 shim，實際實作在 `@bezi/core`。`src/matchmaking.ts`、`src/calibration.ts` 為真實實作（未進 core）。

### Knowledge Layer（`src/data/`）
分層：`core/`（基礎常數）、`charts/`（分類知識）、`rules/`（判斷規則）、`lecture/`（講義資料）。
**已知雙源**：`src/data/lecture/lectureData.ts` 與 `packages/core/src/data/lecture/lectureData.ts` 有兩處語意差異，用 `npm run check:drift` 檢查（2026-11-15 起 CI 鎖定已知 UNKNOWN baseline，新/變動差異擋 merge；詳 `docs/knowledge/known-lecture-drift.json`）。

## 驗收關卡
```bash
npm run lint                       # tsc --noEmit
npm test                           # vitest run（2026-11-15 CI 27 檔 205 例）
npm run test:api                   # 7 檔 node --test（含 ownership、rate limit）
npm run check:drift                # 講義雙源漂移偵測
npm run build                      # vite build + esbuild server bundle
npx playwright test tests/e2e/specs/prod-smoke.spec.ts  # production smoke
```
完整驗證：`npm run verify`（lint + unit + api + build + prod smoke + stress）。

## 關鍵約束
1. 前後端分離：`src/` 僅 client；`server.ts` 僅 server
2. AI 輸出須通過 `validateAIOutput`（sourceId gate）與 DOMPurify sanitize
3. API key 僅 server-side env；嚴禁硬編碼或用 `VITE_` 傳遞
4. `/api/chat` 必須 rate limit + input validation
5. 知識內容變更 → 更新 `LLM_WIKI.md` 並同步溯源表
6. 本輪非破壞性改動均已授權；刪除檔案、資料或既有功能仍須使用者另行核准（#50）

## 測試現況（2026-11-14）
- lint：通過
- unit：2026-11-15 CI 27 檔 205 tests
- API integration：2026-11-15 CI 8 檔 35 例（含 evidence ownership、rate limit、model budget）
- E2E：4 spec 26 例
- CI：`npm ci` + core tsc + lint + drift + unit + API + build + prod smoke

## 2026-11-15 Matt 品質改善

- Plan：`docs/plans/2026-11-15-bezi-quality-matt.md`、GitHub #41、draft PR #51。
- Backend Evidence 重排盤使用前端傳入且經驗證的出生地經度。注意：前端校準所得格局仍不同於伺服器重新計算的原始格局，不能假稱已完全一致。
- AI 對確定性錯誤事實 fail closed；來源編號存在 ≠ 語意支持；legacy markdown footer 不再自動合成 claim。
- `src/ai/modelBudget.ts` 在單一實例計算跨路由與重試的 provider-call 額度（不是 token 或金額計費）。
- 打卡報告顯示「紀錄方向吻合度」，不可宣稱獨立預測效度。
- 講義兩份已知差異維持 UNKNOWN 並釘死門檻；任何 teacher rule 修正需核對原始講義。
