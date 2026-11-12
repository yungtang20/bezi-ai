# bezi-ai 徐玉蘭方法：全模組修正與證據驗收台帳（2026-11-12）

本文件是軟體實作範圍及證據門檻，並非宣稱已經重建徐玉蘭本人完整斷法。命理屬文化與教學系統，本文測試只驗證**對指定來源輸出的再現程度**，不構成現實事件的科學預測認證。

## 來源及可信度
- P1（限原始講義已抽核）：「七字權重」「水日主用神表」；原始講義不隨公開程式碼上傳。
- P2：「定格局.docx」「天干地支合化條件.docx」「天干地支含刑沖破害.docx」整理稿；未能等同教師逐字原音。
- 帶時碼逐字稿（未校聽原音）：`1-3 10:06–10:28` 權重、`qa-0410 47:29–47:59` 檢查刑沖破害順序、`qa-0106 27:31–28:26` 合化與合絆區別。
- 唯一可重播的**完整網站個案**：`https://masterhsu.sat.cool/strength/explain` 使用者提供12張去重截圖；甲子／丁丑／癸酉／癸丑，七字45、步驟5–7不變、月丑+35/時丑+10、步驟9顯示90及從強格。原圖與付費材料不在公開儲存庫。
- 技能來源：`hsu-yulan-bazi` v0.3.2（2026-11-12）與其 `references/research/site-strength-2026-11-12/site-case.json`、`references/research/evidence-intake-2026-11-11/rule-registry.json`。

## 實作台帳

| 類別 | 實作／防護 | 核實狀態 | 禁止外推 |
|---|---|---|---|
| 七字基礎分 | `handoutStrength.ts`：5/20/5/35/0/20/5/10，日干0 | P2講義＋逐字稿文字 | 基礎分不等於正式定格局 |
| 網站單盤 | `handoutStrength.ts`：45→90，逐位置覆寫 | 只觀察上述四柱的網站截圖 | 不把雙酉丑半合算法推廣為所有命盤通則 |
| 刑、沖、破、害、自刑 | `evidenceInteractions.ts`：全柱兩兩配對，保留位置 | P2候選 | 不自動減分、預測事件或判競合勝負 |
| 六合 | `evidenceInteractions.ts`：只排除不相鄰／透干必要條件不符 | P2必要條件 | 透干不代表化神旺、不受剋或一定合化；失敗不代表合絆成立 |
| 半合、暗拱、三合、三會 | `evidenceInteractions.ts`：候選掃描；網站單盤另行閘門 | 網站單盤＋其餘P2候選 | 未核實優先序不得改分 |
| 四庫、透干 | `pattern.ts` 不再用 `.find` 靜默選第一種庫；`evidenceInteractions.ts` 列出透干線索 | P2候選 | 多種庫同時符合時不得自選勝負 |
| 合絆／貪生忘剋 | 候選與未決警示，無全域權重宣稱 | P2文字，教師原音未確認 | 六合失敗不可視為合絆；不自動取消貪生忘剋 |
| 用神 | `PatternResult.verificationStatus`、`handoutTrace`、`interactionTrace` | 網站個案顯示與整理資料不同層 | 非完整已驗證格局不輸送至 AI 的 `chartContext.pattern` |
| 大運／流年 | 禁用單一癸男壬午示例的全域 override，保留日期/干支及暫算品質 | calendar/十神另由專屬測試檢查 | 不把歲運互動當健康、升遷、財富事件預言 |
| AI 回覆 | `src/ai/prompts.ts` 修正「完整老師斷法」及身分、來源、未知狀態 | 教學輔助、不冒充本人 | 無證據不得引用、不把主觀回顧視作盲測 |
| UI/校準 | `Dashboard.tsx`、`CalibrationPanel.tsx`、`PatternSwitchNotice.tsx` 顯示候選標籤 | 可程式測試及人工檢查 | 打卡／歷史吻合度不得稱為獨立預測準確率 |
| CI | `npm ci`、`npm run typecheck`、ESLint、Vitest、API、build、production smoke；Dependabot | GitHub Actions 依 commit 顯示 | CI PASS 不等於教師判法來源驗證 |

## 決策狀態與停止條件

- `OBSERVED_SITE_CASE`：僅指特定網站單一四柱輸出已可逐步重現。不是教師本人全套判法認證，也不應宣稱對人生事件具預測能力。
- `PROVISIONAL_REVIEW`：舊引擎的分數、格局、喜忌都是**暫算**；新的關係掃描只產生候選、不改分。AI 不能據此宣稱已定格局。
- `INCOMPLETE`：命盤缺必要資料；不得自動補造四柱或宣稱100分定盤。
- 整理稿與網站示例相衝突時，先保留雙來源，不把舊教材用一般命書或個人印象靜默覆蓋。
- 講義未完成核實的藏干30%、透干+3、刑沖固定扣分與順序、合會固定+5/+10/+15、貪生忘剋-2，都屬**舊引擎暫算**，不是本輪取得證據的正式校定公式。

## 驗收

執行 `npm ci`、`npm run typecheck`、`npm run lint`、`npm test`、`npm run test:api`、`npm run build`、`npx playwright test tests/e2e/specs/prod-smoke.spec.ts`。

核心回歸：`tests/unit/handoutStrength.test.ts`、`tests/unit/evidenceInteractions.test.ts`、`tests/unit/dayun.test.ts`。

## 仍無法聲稱已完成的事項

1. 徐老師原音抽段逐秒人工核對及跨案例完整規則取捨。
2. 未在講義、網站、Skill 或討論中曝光的**獨立教師盲測至少3例**，先鎖模型輸出SHA-256才解封老師答案；目前合格獨立案例0筆。
3. 完整「三合、三會、暗拱、合絆、刑沖拆合、貪生忘剋、四庫」**定量且可證明的通用決策優先序**；目前明確列出候選與必要條件，但沒有捏造通用公式。
4. 全五行用神投影片逐頁重核、所有大運流年完整教師案例重播、公開部屬端版本行為比對。
5. 授權條款由儲存庫擁有人選定；未獲明確授權前不代選 LICENSE。

免費 API 假設依使用者提供資訊處理；本 PR 沒有修改任何 API 的費用、額度、金鑰或限流設定。免費不代表資安不需保護，所以原有驗證與金鑰保護保持不變。
