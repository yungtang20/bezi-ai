# 02: Evidence ownership 與 session 過期 API 測試

**What to build:** 維護者可以證明跨 token 的 computed evidence 拒絕，以及過期 session token 拒絕，且這些 regression 被 test 抓住。

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] 新增 integration test 檔，用 token A 建 evidence、用 token B 存取，斷言拒絕。
- [ ] 測試過期 session token 拒絕（可直接操作 TTL 或 mock clock）。
- [ ] 沿用現有 spawn-server + mock Agnes + fetch 模式，port 隔離。
- [ ] 不修改 production code；測試先行（若現有行為不對，回報而不是改 production）。
