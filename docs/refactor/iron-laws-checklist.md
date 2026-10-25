# 六條鐵律查證 — 知識管線（K 系列）

逐條對照，附證據位置：

## 1. 描述是釣鉤
- 適用範圍：本次改動未新增「skill」；對應物是 **prompt 措辭** 與 **classifier 關鍵詞**。
- `src/ai/prompts.ts` 的 CITATION_RULE 寫的是使用者會說的話（「每個關鍵主張」「如實填入」「不得為了通過檢查而填入不相關的編號」），不是內部架構摘要。
- `src/ai/knowledge/classifier.ts` 關鍵詞表（財運/桃花/跳槽/身體…）以台灣使用者用語建立，命中的正是使用者會說出口的話。
- **判定：通過**（prompt 層）。

## 2. 本文只放地圖
- `src/ai/knowledge/` 每個檔頭 3~5 行註解說明「這是什麼、邊界在哪」，細節在檔案內。
- 主文件 `docs/refactor/stage1-plan.md` / `stage2-design.md` 是架構地圖；`round-log.md` / `incident` / `release` 是分項記錄，主檔未塞詳細步驟。
- `src/ai/prompts.ts` 主 prompt 短（約 300 字 ×3），引用規則拆成共用常數 `CITATION_RULE` 重複利用。
- **判定：通過。**

## 3. 確定的事交給腳本
- 分類：`classifyQuery` 純規則函式（無 LLM）。
- 檢索：`retrieveKnowledge` 同步純函式（無 LLM）。
- 事實檢查：`checkFactualClaims` 決定性抽取（無 LLM-as-judge）。
- 引用真實性：`validateAIOutput` + 合併 bundle，決定性集合檢查。
- LLM 只負責「組合已檢索條目生成回答」，不負責決定查什麼、查到了什麼、引用是否存在。
- **判定：通過。**

## 4. 解釋為什麼，勝過用大寫壓人
- `server.ts` 管線區塊註解：「管線任何失敗都降級為『無知識條目』，不中斷聊天」——說明後果。
- `prompts.ts` CITATION_RULE 第 3 條：「若某段內容…都没有依據，請明確寫出『此為依命盤的推論』」——解釋為什麼不罰無依據的段落（因為無依據 = 推論，要標明而不是禁止）。
- `factChecker.ts` 頭註：「不用大視窗掃描，避免抓到與 label 無關的干支」——解釋設計原因。
- **判定：通過。**

## 5. 會被抄的捷徑先寫死堵住
- 模型可能的藉口清單（`prompts.ts` CITATION_RULE 明禁）：
  - 「為了通過檢查而填入不相關的編號」→ 明禁（第 2 條）
  - 「引用沒提供的來源」→ 明禁（第 1、2 條）
  - 「把無依據的推論偽裝成知識條目結論」→ 明禁（第 3 條：無依據段不得進 claims）
- 引擎層（`validateAIOutput`）：虛構 sourceId 一律拒答，模型繞不過去。
- **判定：通過。**

## 6. 寫完一定要測
- 裸跑：Round 1 先跑 5 支管線測試，抓到 3 個卡點（grounding 拒收 kb 來源、HEALTH_DATA cast、port 共搶暫態）。
- 重測：修復後 5/5；全量 24/24 API + 123/123 vitest + lint 0 錯 + build 成功。
- 每輪記錄在 `round-log.md`。
- **判定：通過。**

## 結論
6/6 通過。
