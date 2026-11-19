# Bezi 品質與證據一致性改善計畫（Matt / to-spec）

- 日期：2026-11-15（Asia/Taipei）
- 唯讀基準：`main@7bc1b085615814605e9da380a2c0b34760df5246`
- 整合分支：`matt/bezi-quality-20261115`
- Tracker：GitHub Issues（本計畫為 Parent Spec）；完成標準以可重現測試與 CI 為準。
- 授權：可新增、修改、重構、寫測試、建立 Issues/PR、執行 CI；**任何刪除檔案／資料／舊功能或破壞性操作均另求核准，列為最後一張 ticket，之前一律不執行。**

## Problem Statement

Bezi 能產生八字命盤、徐玉蘭方法的解讀、日誌、AI 問答，但「畫面所示命盤」「後端 AI Evidence」「校準後解讀」未完全共用相同的已驗證真值。AI 的 sourceId 存在性門檻與事實核對徽章亦不足以保證結論受到來源支持；已知錯誤仍可能送往使用者。講義有雙源差異且 CI 不阻擋；吻合度可能被誤解為獨立預測準確率；匿名 AI 花費缺少跨端點及並發總額控制；Agent 導航文件部分過時。

## Solution

從最窄的實際故障路徑開始，先讓現有前端與 session Evidence 對齊並建回歸測試，再讓 AI 錯誤不能被標示成已驗證的正確答案。以「原始教材可溯源」修補雙源漂移；用「使用者紀錄吻合度」取代過度宣稱；補成本防護、Agent 記憶與離線回測框架。保留現有功能與資料；清除舊檔只在最後獨立審批。

## User Stories

1. 作為使用者，我選擇出生城市後，希望 AI 讀到的四柱、日主、五行及大運與畫面一致，不受真太陽時邊界錯算影響。
2. 作為使用者，即使不輸入出生時辰，也希望 AI 不假造時柱或精確起運。
3. 作為使用者，我希望校準後的格局有可見證據來源；尚未被後端重現的校準結果不得冒稱伺服器驗證真值。
4. 作為使用者，AI 若把日主或四柱說錯，希望系統阻止該錯誤被當作已驗證解讀。
5. 作為使用者，我希望能區分「引用存在」「引用真正支持」「無法驗證的命理推論」。
6. 作為使用者，我希望徐玉蘭口徑能追溯到特定教材；有歧義時保留未知，不擅改講義。
7. 作為使用者，我希望「打卡吻合度」不被宣稱為經獨立驗證的預測準確率。
8. 作為維護者，我希望匿名聊天有可測試的成本及限額保護。
9. 作為本地 AI Agent，我希望導航文件、指令與最新 repo 現況一致，避免修改錯的程式。
10. 作為維護者，我希望每次修改有綠燈證據，並以原始資料和事前鎖定的評分規則回測。
11. 作為儲存庫擁有者，我希望所有刪除候選在最後獨立列案，取得明確核准前保持原樣。

## Implementation Decisions

- 測試 seam 優先使用既有 `POST /api/evidence/current` → `/api/chat`、既有 `@bezi/core` 命盤計算接口、AI 輸出驗證接口、知識漂移 CLI 及瀏覽器公開入口。不得為測試引入大量淺薄包裝。
- 真太陽時以已選擇之經度作為 birth input 的明確、型別化欄位；由後端獨立驗證輸入後重新計算，不接受前端直接提交成品命盤。
- 客戶端原局格局與生活回饋校準屬不同證據層。校準結果視為使用者回饋，若未以可重放事件在後端驗證，明示為校準建議，不得偽裝成已驗證原始格局。
- 模型輸出先完成結構驗證與確定性事實檢查，再公開回答；失敗要以可理解的拒答/更正行為處理，不能只顯示紅色徽章。
- `sourceId` 僅能驗證存在性；不得把它標示為語意支持或講義事實正確性的證明。加入獨立標籤與針對性測試，後續可擴展 semantic grounding，但不得聲稱已實現。
- 講義雙源以原始教材逐筆定權威，未取得佐證時保持差異並阻止新變更悄悄擴大；不進行無來源覆寫。
- 打卡報告維持原百分比公式，但標籤與說明聚焦「記錄吻合」，增加零樣本和多重樣本測試。
- 匿名聊天的成本限制要涵蓋模型實際呼叫（含重試）、跨端點總額及並發，並以既有單實例部署為前提；不在沒有需要時新增 Redis 等依賴。
- 獨立保留教材等權威資料；任何法律 domain 的工作不可被混入本八字產品。
- 不需要讀取實際使用者生日或登入憑證；測試只用虛構 golden fixtures。
- 不修改 main，先開整合分支和 draft PR，CI 綠後才可判定已驗收。

## Testing Decisions

- Red → green：每個行為先寫會失敗的回歸案例，再做最小修復。若無執行環境，CI 上先記錄失敗，再修復與驗證。
- 主 seam：API 黑箱、核心公開計算接口、AI output 狀態與使用者可見行為。不要只測內部函式。
- 既有可重用測試：`tests/unit/trueSolarTime.test.ts`、`tests/api-evidence-pipeline.test.mjs`、`tests/unit/factChecker.test.ts`、`tests/api-knowledge-pipeline.test.mjs`、`tests/e2e/specs/chat-flow.spec.ts`。
- 驗收：`npm run lint`、`npm test`、`npm run test:api`、`npm run build`、production smoke；其他 E2E 與真實 AI 測試依項目補充。
- 累積型日誌不等於因果或預測效度；有效獨立回測須鎖定假設、輸入、預測日期、來源、計分和 SHA-256，避免用已看過結果調參。

## Tickets / Blocking graph

1. T01 — 真太陽時與後端 Evidence 一致（無 blocker）。
2. T02 — AI 事實錯誤不得作為已驗證回答放行（T01）。
3. T03 — AI 引用宣稱降級為可稽核的「存在性」與未驗證判斷，補測試（T02）。
4. T04 — 講義雙源差異明細、來源核對與 CI 防新漂移（無 blocker；不可未經來源直接覆寫）。
5. T05 — 打卡「記錄吻合度」用語與未驗證範圍一致（無 blocker）。
6. T06 — 匿名 AI 成本、總配額與併發保護（T02）。
7. T07 — Agent 導航文件、專案 glossary、CI 實際數據更新（T01、T04）。
8. T08 — 命理獨立盲測與預先鎖定評分契約（T04、T05）。
9. T09 — 刪除候選檔案/舊規則清單與明確核准 Gate（T01–T08；只列提案，**本階段不得刪除**）。

## Out of Scope

- 不變更學派口徑、無來源地變更命理公式或預測值。
- 不新增不必要的 framework / Agent OS / 大規模 rewrite。
- 不將「測試通過」聲稱為命理預測有科學效度。
- 不做不必要的登入、個資蒐集、資料庫覆寫或刪除。

## Evidence and Unknowns

- 基準 commit：`7bc1b085`；2026-11-14 GitHub Actions 顯示 CI success。存放驗證 JSON 內可見 unit 200/200、API 30/30，但**本計畫開始時尚未另跑完整 test**。
- `useBirthChart` 呼叫 `calculateChart(..., longitude)`；`AIChatPanel` 的 `createCurrentEvidence` 只傳生日/時辰/性別；`server.ts` 亦未傳 longitude。
- `server.ts` 已在 `checkFactualClaims` 後仍直接 `writeSseContent(answerText, factCheck)`；引用檢查主要驗證 sourceId 集合。
- `check:drift` 在 CI 設為 `continue-on-error: true`，2026-11-14 審查文件記錄兩處語意差。
- 本階段無法直接存取全部教師原始教材；原始講義對照仍有 UNKNOWN，任何規則改寫需先補來源。
- 本輪採完整可重現 log/CI，不以程式或 Agent 自述為驗收。
