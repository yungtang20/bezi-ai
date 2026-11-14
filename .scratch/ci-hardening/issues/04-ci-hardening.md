# 04: CI 強化：嚴格 lockfile、build、prod smoke、core tsc

**What to build:** CI 只安裝 lockfile 內的依賴，並在 merge 前驗證 production bundle 可掛載與 core 型別正確。

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] CI 安裝步驟改為 `npm ci`，無 fallback。
- [ ] CI 加入 `npm run build`（production）。
- [ ] CI 加入 `npx playwright test tests/e2e/specs/prod-smoke.spec.ts`。
- [ ] CI 加入 `npx tsc -p packages/core/tsconfig.json --noEmit`。
- [ ] 本地先跑 `npm run verify:logic` 確認無破壞。
