# CI 強化與治理一致性 Spec

## Problem Statement

前次分析確認五個可修復問題：講義知識資料雙源漂移未進 CI 關卡、CI 允許 lockfile 漂移且跳過 production 驗證、API 信任邊界缺 regression tests、治理文件與現行程式矛盾、未使用依賴殘留。任何一項漏掉，未來變更都可能靜默引入回歸。

## Solution

強化驗證管線與治理文件，讓所有未來變更被確定性關卡擋住：drift 檢查接進 CI、CI 改嚴格 lockfile + build + prod smoke、補上 evidence ownership 與 session 過期測試、重寫過期 memory/wiki 引用。unused deps 與 dead files 的刪除**不在本 spec 範圍**，另列清單等使用者核准。

## Seams

沿用現有 seam，不新增：

1. **CI workflow** — 現有 `.github/workflows/ci.yml`，加入 drift 與 build/prod-smoke steps。
2. **npm scripts** — 現有 `check-lecture-drift.mjs` 加進 `package.json` scripts，成為 `npm run check:drift`。
3. **API integration tests** — 沿用 `tests/api-*.test.mjs` 模式（spawn server + fetch 斷言），新增 ownership/expiry/rate-limit 案例。
4. **治理文件** — `.opencode/memory/project-context.md` 與 `LLM_WIKI.md` 的過期引用直接修正。

## User Stories

1. As a maintainer, I want lecture data drift to fail CI, so that two copies of `LECTURE_DATA` can't silently diverge.
2. As a maintainer, I want CI to use strict `npm ci` without fallback, so that installed deps always match the lockfile.
3. As a maintainer, I want CI to run `npm run build` and prod-smoke, so that production-only chunking bugs are caught before merge.
4. As a reviewer, I want CI to run the core package's `tsc --noEmit`, so that `@bezi/core` type regressions are caught separately from the app.
5. As a security reviewer, I want a test proving that evidence created with token A cannot be read with token B, so that the ownership gate is regression-protected.
6. As a security reviewer, I want a test proving that expired session tokens are rejected, so that session TTL is regression-protected.
7. As a security reviewer, I want a test proving that rate limits return 429, so that the per-IP limiter is regression-protected.
8. As a future agent, I want `.opencode/memory/project-context.md` to reflect the current stack (React 19, three chat endpoints, git initialized, 175+ tests), so that I don't act on stale constraints.
9. As a future agent, I want `LLM_WIKI.md` module references to point at `packages/core/` instead of deleted `src/*.ts` shims, so that I can navigate to the real implementation.
10. As a contributor, I want the README API section to note that computed evidence is owner-scoped, so that I understand the security contract before changing auth.
11. As a CI operator, I want all checks to run in a single deterministic order, so that failures are reproducible across local and CI.
12. As a release manager, I want a deletion candidate list at the end, so that removing unused dependencies requires explicit user approval.

## Implementation Decisions

- **Drift detector**：把現有 `scripts/check-lecture-drift.mjs` 註冊為 `npm run check:drift`，加入 CI workflow。腳本已 exit 1 on differences，只缺 wiring。**不修改資料本身**——兩處差異的權威來源未定，合併是刪除範疇。
- **CI 強化**：`npm ci || npm install` 改為 `npm ci`。加入 `npm run build`（production）+ `npx playwright test tests/e2e/specs/prod-smoke.spec.ts` 步驟。加入 `npx tsc -p packages/core/tsconfig.json --noEmit`。
- **API tests**：新增 `tests/api-evidence-ownership.test.mjs`，涵蓋 cross-token evidence 拒絕、session 過期、rate limit 429。沿用現有 spawn-server + fetch 模式，port 隔離。
- **治理文件**：`project-context.md` 重寫為現況（React 19、三 chat 端點、git repo、~175 unit tests）。`LLM_WIKI.md` 中仍指向 `src/paipan.ts` 等的映射改為 `packages/core/src/` 對應路徑。
- **不修改命理計算公式**（pattern.ts、dayun.ts 等）。本 spec 只處理驗證管線與治理。
- **刪除範疇**（等使用者核准）：`@google/genai`、`@typescript-eslint/eslint-plugin`、`@typescript-eslint/parser`、`mammoth`、`workbox-window`（package.json 依賴）；`bun.lock`、`fetch-latest.js`（repo 根目錄）。

## Testing Decisions

- **好測試**：只斷言外部可觀察行為（HTTP status、response body、exit code），不測內部實作細節。
- **API tests**：沿用 `tests/api-evidence-pipeline.test.mjs` 的 spawn + mock Agnes + fetch 模式。每檔獨立 port。
- **Drift check**：以 exit code 1 斷言失敗。CI 中只要 exit 非 0 就 fail。
- **CI 驗證**：本地先跑 `npm run verify:logic` 確認無破壞，再提交。CI 推上後由 GitHub Actions 執行完整管線。
- **不新增**：教師盲測、pattern formula tests、E2E stress（已有，CI 暫不含因時間考量）。

## Out of Scope

- 刪除任何檔案、依賴或資料（等使用者核准）。
- 修改命理計算公式或知識資料內容。
- 教師方法認證（屬 `bezi-skill` 專案範疇）。
- E2E stress test 納入 CI（時間考量， prod-smoke 已足夠捕捉 chunk 循環）。
- 部署流程變更（Render 設定不動）。

## Further Notes

- 前次分析已實跑 lint + 4 檔 23 tests + 26 API tests 全綠，作為 baseline。
- 工作區目前有 5 modified + 4 untracked 檔案（使用者先前變更），本 spec 不覆蓋或回復。
- `check-lecture-drift.mjs` 目前 exit 1 是**預期行為**（反映已知差異）；接進 CI 前需先確認：若 CI 直接跑會紅，但這正是目的——讓差異可見，直到使用者決定權威來源。若要 CI 先綠，可在 drift step 加 `continue-on-error: true` 暫時容忍，或等權威確認後合併資料再移除。本 spec 選擇 **`continue-on-error: true`**，讓差異在 CI log 可見但不擋 merge，直到使用者核准合併。
