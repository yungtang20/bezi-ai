# 事故記錄與改進建議 — 知識管線（K 系列）

## 事故 1：validateAIOutput 拒收合法知識引用
- **症狀**：管線測試 3/5 失敗，AI 回答被拒答「引用不存在的 sourceId」。
- **根因**：`src/ai/grounding.ts` 的 `validateAIOutput` 只認 Evidence bundle 的 sourceId 集合；知識條目（`kb:` 編號）不在其中。
- **初版錯誤修法**：在 server.ts 另建 `allowedSourceIds` Set 做第二軌 fabricated 檢查 → 雙軌邏輯，維護成本高。
- **最終修法**：`server.ts` 建立 `validationBundle = {...evidenceBundle, items: [bundle items + 知識條目(轉 computed EvidenceItem, schemaVersion kb-entry-v1)]}`，`validateAIOutput(parsedOutput, validationBundle)` 單一來源。重複檢查整段移除。
- **教訓**：引用真實性檢查屬 grounding 職責；新增來源類型時應擴充「驗證用的 bundle」，不要在呼叫端另蓋一層平行驗證。

## 事故 2：HEALTH_DATA 型別 cast 錯誤
- **症狀**：`tsc` 報 registry.ts:136-137，`HEALTH_DATA` 不能直接 cast 成 `Record<string, Record<string, string>>`（ORGANS 是 string、WARNINGS 是巢狀物件）。
- **修法**：經 `unknown` 中間 cast，欄位逐一取出。
- **教訓**：knowledge registry 對 src/data 常數的 shape 假設，typecheck 是唯一的防線；每新增一個來源模組，先跑 lint。

## 事故 3：chartContext 用假生日重排盤
- **症狀**：第一版 chartContext 從 Evidence 的出生日期重新呼叫排盤引擎，會與 Evidence 四柱真值不一致（時辰未知時時柱不同、節氣邊界日不同）。
- **修法**：改為「Evidence 四柱為唯一真值，格局判定直接喂引擎 determinePattern」。
- **教訓**：Evidence（server 端引擎實排）與前端顯示若不一致，管線必須選一為真值，且必須選 Evidence。

## 事故 4（暫態）：5 支 API 測試合併跑 7/24 失敗
- **症狀**：`api-chat-validation` 卡在 `waitForServer`（port 3000 共搶 + tsx 冷啟動 15s 期限）。
- **判定**：單獨跑 7/7、其餘 4 檔 17/17 全過；重試 5 檔合併 24/24 全過。屬基礎設施暫態，非代碼回歸。
- **改進**：測試檔的 mock port 各自獨立（4011/4012…），server port 可用 `PORT` 環境變數分離，避免多檔合併跑的 port 共搶。

## 事故 5：快速校準 delta 表接反，身強 + 順利卡死身強（2026-10-26）
- **症狀**：1985-02-03 02:00 男（日主癸水，引擎 68.5% 身強）。講義口徑 2020/2021（水日主支持年）「順利」應往弱方推，但 App 快速校準不管選「順利」或「不順」，主格局都停身強。
- **根因**：`App.tsx` 內嵌 CALIBRATION_DELTAS 對「身強」行寫成 `順利: { strong: +10, weak: -5 }`——順利反而加身強分；從強初值 30 追不上身強 80。
- **講義對照**：`D:\徐玉蘭\八字\定格局.docx` 流年定盤表：45% 區間「順遂」→ 身弱、>80% 區間「順遂」→ 從強。68.5% 屬灰色地帶，使用者決策：**從強與身弱並推、不預設答案**，由打卡證據決勝負。
- **修法**：delta 表抽成 `calibration.applyCalibrationDelta`（純函數）：身強+順利 → 身強−20、身弱+10、從強+10；身強+不順 → 身強+10（確認）；其餘格局行維持舊行為。7 支新單元測試 + 端到端模擬（兩年順利 → 從強 50 勝出）。
- **教訓**：埋在 React 元件內的決定性表格不可測、不可驗；抽成純函數後「兩路徑都卡死」這種 bug 一支模擬腳本就能抓到。

## 改進建議（未做）
1. **CI 加 API 整合測試**：~~未入 CI~~（2026-10-26 已入：`test:api` step + 各檔獨立 port 3100-3104；runner 固定 ubuntu-24.04）。
2. **知識條目 schema 型別化**：`kb-entry-v1` 目前以 string 混入 EvidenceBundle.items；可於 grounding 加 `schemaVersion` 白名單檢查。
3. **classifier 召回率量測**：目前純關鍵詞；可建 30~50 條查詢的 golden set，量測各類別 hit rate，作為鐵律「拿證據證明對錯」的下一步。
4. **真實模型 e2e**：`scripts/eval-ai-factual.mjs` 可接真實 Agnes key 跑引用率/虛構率量測（需授權 + key）。
5. **知識條目長度預算**：目前 prompt 注入全部檢索條目無截斷；條目內容 grow 後需加 token 預算與優先序截斷。
