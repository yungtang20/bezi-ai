# 03: Rate limit 429 API 測試

**What to build:** 維護者可以證明超過 chat rate limit 的請求回 429。

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] 新增 integration test 檔，超過 chat rate limit 後斷言 429。
- [ ] 不觸發真實 Agnes 呼叫（用 mock 或直接觸發 limit 邏輯）。
- [ ] 沿用現有 port 隔離模式。
- [ ] 不修改 production code。
