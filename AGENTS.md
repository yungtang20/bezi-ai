# Project Mapping — bezi（Agent OS Batch 3）

Agent OS Compatibility: **Agent OS Core v0.1.0**（Policy Precedence 與 Decision Matrix 以 Core 為準，本檔不複製 Core）。

本檔為 `D:\徐玉蘭\bezi`（git repo；remote: `github.com/yungtang20/bezi`）的 **Primary Mapping**。

---

# Project Identity

- project_name: bezi（Bezi 八字命理分析與大運流年推算系統）
- project_root: `D:\徐玉蘭\bezi`
- git_root: `D:\徐玉蘭\bezi`（2026-10-21 經授權 git init；remote: `origin` → `github.com/yungtang20/bezi`，private；branch `main`）
- package: name=`bezi-ai`（`package.json`，type=module）
- project_type: TypeScript full-stack（React/Vite + Express）八字命理 Web 應用

# Agent OS Compatibility

- agent_os_version: 0.1.0
- status: mapped-not-enforced

# Project Type

子平八字排盤（`paipan.ts` / `pattern.ts` / `dayun.ts` / `dailyAnalysis.ts`）、五行格局分析、十年大運/流年推算、合盤配對，與 Agnes AI OpenAI-compatible SSE 即時 AI 命理解析。

# Project Rules

- **前端/後端邊界**：`src/`（React 18 + Vite + Tailwind，client-side）與 `server.ts`（Express + SSE proxy，server-side）分離。
- **domain module 邊界**：排盤/格局/大運/流年邏輯在 `src/*.ts`（paipan/pattern/dayun/dailyAnalysis/matchmaking/calibration）；知識內容在 `src/data/`（見 Knowledge 節）。
- **XSS 防護**：前端渲染 AI 回應必須經 DOMPurify sanitize。
- **API key 安全**：嚴禁硬編碼憑證；僅支援後端環境變數（`AGNES_API_KEY`，見 `.env.example`）。
- **Rate limiting / input sanitization**：`/api/chat` 必須校驗請求頻率、訊息長度與筆數上限。
- AI 回應渲染的原始來源以 `LLM_WIKI.md` 為 domain rule provenance。

# Role Mapping

- **CEO**：scope=八字命理分析平台；domain source changes（`LLM_WIKI.md` / `src/data/` 知識內容變更）與 schema/AI model/config 變更需 escalation。
- **Architect**：frontend/backend boundary；domain module boundary；`src/data` knowledge architecture（core/charts/rules/lecture 分層）。
- **Developer**：React/TS/Express implementation（`src/`、`server.ts`、`src/data/`）。
- **Reviewer**：`npm run typecheck`（lint）、`npm test`（vitest）、Playwright（`playwright.config.ts`）、`npm run build`、API validation（`tests/api-chat-validation.test.mjs`）。
- **Librarian**：`LLM_WIKI.md`；source lecture knowledge（`src/data/lecture/`）；`src/data` knowledge；domain rule provenance。

# Knowledge

- Knowledge root（明確）:
  - `D:\徐玉蘭\bezi\LLM_WIKI.md`（source inventory + domain rule 來源）
  - `D:\徐玉蘭\bezi\src\data\`（core/ charts/ rules/ lecture/ 知識資料層）
  - `README.md`（架構）
- Knowledge graph: **not yet provisioned**（本輪不建立）

# Memory

- 候選：`D:\徐玉蘭\bezi\.opencode\memory`
- 尚未 provision / 未 migrate。

# Validation

- `npm run lint`（= `tsc --noEmit`）
- `npm test`（= `vitest run`；排盤、格局、大運流年與十神常數測試）
- Playwright（`playwright.config.ts` 設定存在）
- `npm run build`（vite build + esbuild server bundle）
- API validation：`tests/api-chat-validation.test.mjs`

# Human Approval Overrides

- domain source / `LLM_WIKI.md` / `src/data/` 知識內容變更 → 上拋
- schema / AI model config（`server.ts`、`src/config.ts`）變更 → 上拋
- API key / credential 處理變更 → 上拋
- 刪除檔案 / 新 dependency → 上拋

# Tools

- npm / bun / tsx / vite / vitest / playwright
- SSE chat：`POST /api/chat`（Express + Agnes AI）

# Forbidden Cross-Project Actions

- 不得寫入 twse / twstock / twse-anytara / D:\工作用 之 Knowledge。
- 不得把本專案命理 domain rules 套用到其他專案。
- 不得跨專案搬移知識管理內容。

# Evidence / Sources

- `D:\徐玉蘭\bezi\README.md`（架構/API/資安）
- `D:\徐玉蘭\bezi\LLM_WIKI.md`（55,769 B，source inventory + domain rules）
- `D:\徐玉蘭\bezi\package.json`（scripts: dev/build/start/clean/lint/test）
- `D:\徐玉蘭\bezi\src\data\`（core/charts/rules/lecture + elementRemedyHelper）
- `D:\徐玉蘭\bezi\server.ts`、`vite.config.ts`、`tsconfig.json`、`playwright.config.ts`、`vitest.config.ts`
- `D:\徐玉蘭\bezi\.github\workflows\ci.yml`（lint + test + build；**尚未推送至遠端**——需 token workflow scope）
- 2026-10-21 經授權 `git init` 並推送遠端（private repo `github.com/yungtang20/bezi`）；正常提交即可，勿 force push
