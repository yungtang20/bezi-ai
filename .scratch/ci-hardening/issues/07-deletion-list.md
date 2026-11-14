# 07: 刪除候選清單（最後）

**What to build:** 維護者得到一份具體的 unused deps 與 dead files 清單，等使用者核准後才能執行刪除。

**Blocked by:** 01, 02, 03, 04, 05, 06。

**Status:** done_scoped_list_only

## 候選清單

| 項目                                         | Evidence                                                                                                                                                                                      | 風險                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `@google/genai`（dependency）                | `rg "@google/genai"` 在 `src/`、`server.ts`、`scripts/`、`packages/`、`tests/`、`vite.config.ts`、`vitest.config.ts`、`playwright.config.ts` 均無 import                                      | 純 bundle 減量；無運行時影響                                             |
| `@typescript-eslint/eslint-plugin`（devDep） | `package.json` 有宣告；`rg "@typescript-eslint"` 除 package.json 與 lockfile 外無引用。**無 ESLint config 檔**（僅 `lint-staged` 跑 prettier），且 `npm run lint` 是 `tsc --noEmit` 非 ESLint | 無；lint 工具實際未使用                                                  |
| `@typescript-eslint/parser`（devDep）        | 同上                                                                                                                                                                                          | 無                                                                       |
| `mammoth`（devDep）                          | `rg "mammoth"` 在 src/server/scripts/packages/tests 均無 import                                                                                                                               | 無；僅安裝減量                                                           |
| `workbox-window`（devDep）                   | `rg "workbox-window"` 在 src/server/scripts/packages/tests、`vite.config.ts` 均無 import                                                                                                      | 無；PWA 插件 `vite-plugin-pwa` 可能間接使用，需在刪除後跑 build 確認     |
| `bun.lock`（根目錄）                         | `package.json` 無 `bun` script；CI 與 Dockerfile 用 npm；`rg "bun"` 僅命中 ubuntu 名稱                                                                                                        | 若任何人本機用 bun 安裝會失去 lockfile；刪除後應在 README 註明僅支援 npm |
| `fetch-latest.js`（根目錄）                  | `rg "fetch-latest"` 在 package.json、scripts、src、tests、.github 均未引用                                                                                                                    | 無運行時影響；可能是歷史暫存腳本                                         |

## 執行條件

全部須使用者核准後才動手。刪除 deps 後執行 `npm install` 重生 lockfile，並跑 `npm run verify:logic` + `npm run build` + `npx playwright test tests/e2e/specs/prod-smoke.spec.ts` 確認無破壞。

## 執行結果（2026-11-14，已核准）

- 已從 `package.json` 移除：`@google/genai`、`@typescript-eslint/eslint-plugin`、`@typescript-eslint/parser`、`mammoth`、`workbox-window`（直接 devDep）。`npm install` 後共移除 73 個套件。
- `workbox-window` 仍存在於 lockfile：它是 `vite-plugin-pwa` 的 **peer + dependency**，屬 transitive，須保留。
- 已刪除：`bun.lock`（git rm + rm，並加入 `.gitignore` 註明僅用 npm）、`fetch-latest.js`（git rm + rm；initial commit 後無再變更）。
- 驗證：`verify:logic` ALL GREEN；`npm run build` 成功（2918 modules）；prod-smoke **2/2 passed**。
- lockfile 檢查：genai/mammoth/@typescript-eslint/eslint-plugin 已不在 lockfile。
