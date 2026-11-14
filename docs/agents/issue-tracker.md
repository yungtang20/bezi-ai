# Matt Issue Tracker — Bezi-AI

**Repository:** https://github.com/yungtang20/bezi-ai
**Tracked in:** GitHub Issues（本 Repo，不得發到 mattpocock/skills）。
**Parent:** #41；**Tickets:** #42–#50；**Draft PR:** #51。
**Plan:** `docs/plans/2026-11-15-bezi-quality-matt.md`

- 所有 specs/tickets 寫進 GitHub Issues。建立後更新內文中的 Blocked by: #N；未設 native blocking edges 的情況以內文為準。
- 每張 ticket 包含 user-visible outcome、可重放 acceptance criteria、blockers、CI evidence link。
- Work frontier：只有 blockers 全部完成才能開始；任何刪除都屬 #50，須在最後另獲使用者明確核准。
- GitHub MCP 連線可直接作為 gh CLI 替代；API/CLI 不支援的 native dependency 或 label 請在 Issue body 明示，而不是假稱已建立。
- TDD red-green，每張 ticket 的實際 GitHub Actions run 連結為驗收基準；不直接把 README 或 Agent 的聲明當作驗證。
- 禁止改寫 main、force push、清空資料庫或刪除檔案以解決目前的品質問題。工作整合在 branch 和 PR，完成驗證後才 merge（本次非破壞性合併已獲授權）。
- **PRs as triage request surface:** no。
