# Project Mapping — Bezi-AI（React 19 / Express；2026-11-15 verified）

Agent OS Compatibility: **Agent OS Core v0.1.0**（Policy Precedence 與 Decision Matrix 以 Core 為準，本檔不複製 Core）。

本檔描述 **GitHub 儲存庫** `https://github.com/yungtang20/bezi-ai` 的程式碼；舊本機路徑只是歷史紀錄，不能推定任何 Agent 已取得使用者電腦存取權限。

---

# Project Identity

- project_name: bezi（Bezi 八字命理分析與大運流年推算系統）
- project_root: 以實際 clone 所在目錄為準；不可寫死本機磁碟位置
- git remote: `https://github.com/yungtang20/bezi-ai`（GitHub 存放庫目前 public，預設分支 `main`；本次品質調整分支見 #41）
- package: name=`bezi-ai`（`package.json`，type=module）
- project_type: TypeScript full-stack（React/Vite + Express）八字命理 Web 應用

# Agent OS Compatibility

- agent_os_version: 0.1.0
- status: mapped-not-enforced

# Project Type

子平八字排盤（`paipan.ts` / `pattern.ts` / `dayun.ts` / `dailyAnalysis.ts`）、五行格局分析、十年大運/流年推算、合盤配對，與 Agnes AI OpenAI-compatible SSE 即時 AI 命理解析。

# Project Rules

- **前端/後端邊界**：`src/`（React 19 + Vite + Tailwind，client-side）與 `server.ts`（Express + SSE proxy，server-side）分離。
- **domain module seam**：四柱、格局、大運、流日、真太陽時的權威引擎在 `packages/core/src/`，`src/paipan.ts` 等為相容 shim；`src/matchmaking.ts`、`src/calibration.ts` 為專案獨立實作。知識內容在 `src/data/`，仍有兩份 lectureData 來源未定之差異（見 `docs/knowledge/known-lecture-drift.json`）。
- **XSS 防護**：前端渲染 AI 回應必須經 DOMPurify sanitize。
- **API key 安全**：嚴禁硬編碼憑證；僅支援後端環境變數（`AGNES_API_KEY`，見 `.env.example`）。
- **Rate limiting / input sanitization**：`/api/chat` 必須校驗請求頻率、訊息長度與筆數上限。
- AI 回應使用伺服器 session-owned Evidence；`sourceId` 存在性不等於語意支持，已知命盤事實不符須 fail closed。`LLM_WIKI.md` 是索引而非已獨立證實的老師口徑。

# Role Mapping

- **CEO**：scope=八字命理分析平台；domain source changes（`LLM_WIKI.md` / `src/data/` 知識內容變更）與 schema/AI model/config 變更需 escalation。
- **Architect**：frontend/backend boundary；domain module boundary；`src/data` knowledge architecture（core/charts/rules/lecture 分層）。
- **Developer**：React/TS/Express implementation（`src/`、`server.ts`、`src/data/`）。
- **Reviewer**：`npm run lint`（= TypeScript `tsc --noEmit`）、`npm test`（Vitest）、`npm run test:api`（Node API integration）、`npm run check:drift`（已知教材雙源差異 gate）、`npm run build` 與 Playwright；核對 GitHub Actions 及原始來源。
- **Librarian**：`LLM_WIKI.md`；source lecture knowledge（`src/data/lecture/`）；`src/data` knowledge；domain rule provenance。

# Knowledge

- Knowledge root（明確）:
  - `LLM_WIKI.md`（命理規則來源索引，不取代原始教材）
  - `src/data/`（core/charts/rules/lecture）
  - `packages/core/src/`（排盤及真太陽時核心）
  - `README.md`（當前公開架構）、`docs/plans/2026-11-15-bezi-quality-matt.md`（本輪規格）
- Knowledge graph: **not yet provisioned**（本輪不建立）

# Memory

- `.opencode/memory/` 已存在；其中歷史紀錄不得覆蓋目前 repo 原始碼、CI 或 `AGENTS.md` 的較新狀態。

# Validation

- `npm run lint`（= `tsc --noEmit`）
- `npm test`（= `vitest run`；2026-11-15 CI 觀察 27 檔 205 測試）
- Playwright（`playwright.config.ts` 設定存在）
- `npm run build`（vite build + esbuild server bundle）
- API validation：`npm run test:api`（2026-11-15 CI 觀察 35 項），另 `npm run check:drift` + `node --test tests/lecture-drift-gate.test.mjs`

# Human Approval Overrides（2026-11-15 使用者最新授權）

- 使用者已授權非破壞性的 plan、tickets、測試、程式修正、schema 設定、Skill/MCP 研究、PR 與部署操作；不須逐個小步驟請求批准。
- **只有刪除檔案、資料、功能或不可逆破壞性操作，須在最後由使用者另行明確核准。** 本輪所有刪除候選集中於 #50，不可先執行。
- 命理內容仍應按原始教材核實；若缺來源須保留 UNKNOWN，不可用使用者的概括授權代替證據。
- 機密憑證不得複製到 repo、issue、CI log；權限與安全要求不得因一般授權而繞過。

# Tools

- npm（Node.js 24）/ tsx / vite / vitest / playwright；GitHub Issues 為 Matt tracker
- SSE chat：`POST /api/chat`（Express + Agnes AI）

# Forbidden Cross-Project Actions

- 不得寫入 twse / twstock / twse-anytara / D:\工作用 之 Knowledge。
- 不得把本專案命理 domain rules 套用到其他專案。
- 不得跨專案搬移知識管理內容。

# Evidence / Sources

- `README.md`、`LLM_WIKI.md`、`package.json`、`server.ts`、`packages/core/src/`、`.github/workflows/ci.yml`。
- 本輪 CI 來源：https://github.com/yungtang20/bezi-ai/actions/runs/43641876703（曾驗證 27 檔 205 unit、35 API；之後以 PR HEAD CI 為準）。
- 正式部署來源：`render.yaml` 指向 Render `bezi-ai-api`；切換 main 可觸發自動部署，部署後另須 smoke test。

## Agent skills

### Issue tracker

GitHub Issues `yungtang20/bezi-ai`；計畫 #41，tickets #42–#50。規範見 `docs/agents/issue-tracker.md`。

### Triage labels

採 `needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix` 五種概念；標籤是否已在 GitHub 建立需先查核，未建立時以 Issue body 狀態為準。見 `docs/agents/triage-labels.md`。

### Domain docs

單一命理領域 glossary：`GLOSSARY.md`，重要決策放 `docs/adr/`，消費規則見 `docs/agents/domain.md`。
