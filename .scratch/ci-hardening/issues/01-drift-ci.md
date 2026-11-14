# 01: 講義 drift 檢查接進 npm scripts 與 CI

**What to build:** 維護者可以在本機與 CI 用同一命令檢查兩份講義資料是否漂移；CI log 中可見差異但不擋 merge。

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `npm run check:drift` 可執行，exit code 反映 drift。
- [ ] CI workflow 包含 drift check step，`continue-on-error: true`。
- [ ] 不修改講義資料內容。
