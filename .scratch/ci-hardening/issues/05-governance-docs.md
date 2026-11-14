# 05: 治理文件重寫：project-context 與 LLM_WIKI 映射

**What to build:** 未來 agent 不會因過期文件採取錯誤行動；memory 反映現況，LLM_WIKI 指向實際實作路徑。

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `project-context.md` 反映 React 19、三個 chat 端點、git repo 已初始化、~175 unit tests。
- [ ] `LLM_WIKI.md` 中仍指向 `src/paipan.ts` 等的映射改為 `packages/core/src/` 對應路徑。
- [ ] 不重寫整份 LLM_WIKI；只改映射表與自述重複章節的指向。
