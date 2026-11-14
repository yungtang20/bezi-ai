# Bezi 刪除候選核准清單（T09 / #50）

- 狀態：**NEEDS_EXPLICIT_HUMAN_APPROVAL**，僅列調查候選，未執行任何刪除。
- 日期：2026-11-15；整合分支 `matt/bezi-quality-20261115`。
- 前置關係：#42–#49 的非破壞性修改、測試與 review。經 GitHub CI 可驗證。
- 授權規則：使用者已核准所有非破壞性工作，**沒有授權刪除檔案、資料、功能或不可逆清理**。不得解讀為已核准本清單的任何項目。

## 候選逐項核實

| ID | 候選 | 目前已知引用/用途 | 風險與來源限制 | 建議 / 核准條件 |
| --- | --- | --- | --- | --- |
| D01 | `src/data/lecture/lectureData.ts` 與 `packages/core/src/data/lecture/lectureData.ts` 兩份講義原始常數 | 前者被 `src/ai/knowledge/registry.ts` 引用；後者在 `packages/core/src/data/lecture/index.ts` 中匯出供 core 使用；Drift Gate 鎖定兩處 `UNKNOWN` 差異。 | 直接刪一份會造成匯入失敗、無來源合併或師法失真；兩處異文未經原講義逐字核定。 | **暫不建議刪除**。先取得原講義、定權威、建立導向一致的 import graph 與 golden 測試，提出逐檔移除案後再申請核准。 |
| D02 | `src/paipan.ts`、`src/pattern.ts`、`src/dayun.ts`、`src/dailyAnalysis.ts` 等相容 shim | `src/ai`、`src/components`、`tests/unit` 等可能透過 `src/*` 入口引用；公開匯入 interface 已存在。 | 刪除會破壞歷史 import 與測試；不能只憑檔案短小就判定無用。 | **暫不建議刪除**。先列舉所有 import usages 並將有需求的呼叫端遷移，同時回歸編譯與 E2E，另提精確批准。 |
| D03 | `docs/refactor/`、`TODO.md` 中的舊工作紀錄 | 事故回溯、既有設計取捨、歷史已解決缺陷都有佐證價值。 | 刪掉會失去決策歷史，無運行時效益；最理想是註記歷史/目前狀態。 | **保留**；若要重整，優先新增索引而非刪除。 |
| D04 | `LLM_WIKI.md` 中重複段落、過時映射 | 是講義來源與規則索引，亦為 AGENTS 記載的知識來源。 | 未取得原始教材與引用關係前，刪段落可能抹掉證據鏈。 | **保留**；先標出重複、來源、映射差異，再逐節另行提出具體移除核准。 |
| D05 | `data/bezi.db` demo Evidence | `src/lib/evidence/provider.ts` 會於服務啟動開啟唯讀 SQLite，demo `record_id` 測試依賴它。 | 直接刪除會造成啟動或 API 測試失敗；不屬死資料。 | **禁止刪除**，除非有經測試且已遷移的新 Evidence 儲存方案與明確批准。 |
| D06 | `tests/e2e/reports/verify/` 的歷史驗收 JSON | 已建立的可重放執行證據，`.agent/skills/verify-bezi/SKILL.md` 明確要求保留。 | 刪除會破壞驗證留存與稽核。 | **禁止刪除**。 |
| D07 | `package.json` 的重複 `vite` dependency 宣告（dependencies/devDependencies） | 實際 CI 與 build 使用 Vite；移出其一會改變套件安裝與 lockfile。 | 這不是已核定的 dead dependency，移除前必須驗證 Docker/CI 都不受影響。 | 可作後續瘦身候選，但沒有必要性證據前**不執行刪除或移動**。 |

## 執行前的客觀核准證據（每個 D 項都須個別完成）

1. 原始程式逐檔列出 import/reference（用 repo tree 與搜尋，含動態引用）。
2. 以原始教材頁碼證明刪除資料不會改變徐玉蘭規則；不可用模型口頭推論替代教材。
3. 事前留下相同案例的 baseline 實際輸出、必要的紅燈 repro 與歷史 commit SHA。
4. 明列刪除後的測試（typecheck、unit、API、drift、build、Playwright），以及失敗回滾策略。回滾不得丟失個資。
5. **使用者逐項明確核准後才能執行**；沒有核准就保留清單、關閉不了 #50。

## 已處理舊清單（避免重複開工）

`.scratch/ci-hardening/issues/07-deletion-list.md` 記錄了 2026-11-14 已批准並完成的 `@google/genai`、`mammoth` 等清理。那些項目不應再無故重複刪除。

## 本次執行狀態

- PR #51 中只新增本核准文件，沒有進行上述候選的刪除。
- T09 的「編列候選」已完成；**實際刪除 remains BLOCKED_ON_EXPLICIT_APPROVAL**。
