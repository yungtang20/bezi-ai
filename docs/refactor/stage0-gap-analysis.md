# 階段0 工件：現況 vs 目標方向 差距分析（2026-10-26）

## 前置四問（這行最厲害的人會多做什麼？）

1. **會多做什麼我沒交代的事？** 這行（RAG/知識檢索系統審查）最厲害的人會先確認「這個專案究竟是什麼領域」再談重構。bezi 是**八字命理系統**，不是法律系統。目標方向中「法規、判解、函釋、裁判書、起訴書」五類資料源、以及「不得直接猜罪名」的流程規範，是**法律檢索系統**的驗收標準，與本 repo 的 domain 完全不符。
2. **先翻哪些第一手資料？** `server.ts`（AI 呼叫鏈）、`src/ai/prompts.ts`（system prompt）、`src/ai/grounding.ts`（Evidence Bundle 驗證）、`src/lib/evidence/provider.ts`（證據來源）、`src/ai/factChecker.ts`（事實核對）、`LLM_WIKI.md`、`TODO.md`、`tests/api-evidence-pipeline.test.mjs`。已翻完。
3. **用哪些方法工具？** 讀原始碼追資料流（不是讀文件自述）；grep 全 repo 搜尋「法律/裁判書/起訴/罪名/法條」確認無任何法律 domain 模組；比對目標方向五類資料源與現有知識層（`src/data/`：core/charts/rules/lecture，全部是命理內容）。
4. **不靠 AI 自述也不靠感覺，拿什麼證明是對的？**
   - 「bezi 無法律功能」的證據：`grep "法律|裁判書|起訴|罪名|法條"` 全 repo，僅命運文案中「法律糾紛」「法律行業」等命理用語出現，無任何法學資料結構、無裁判書 parser、無法規 table。
   - 「現有 AI 管線長相」的證據：`server.ts:314-470` createChatHandler 完整程式碼；`src/ai/prompts.ts` 三組 system prompt；`src/ai/grounding.ts` validateAIOutput/validateEvidenceBundle；`src/lib/evidence/provider.ts` SqliteEvidenceSource。
   - 「現有系統有無先分類再檢索」的證據：無。server.ts 380-381 把 EvidenceData+EvidenceBundle 直接塞進 system message，不分類、不檢索、無查詢解析。

## 現況（事實）

### 系統定位
- bezi = 八字排盤 + 命理 AI 解析（Agnes AI，OpenAI-compatible SSE）
- 知識層：`src/data/{core,charts,rules,lecture}`，全部命理內容（十神、五行、大運規則、講義）
- AI 管線：`server.ts` createChatHandler → Agnes AI，SSE 回傳

### AI 回應產生流程（現況）
1. 前端送 `{messages, record_id, customPrompt}` → `/api/chat|/api/chat/synastry|/api/chat/dayun`
2. server 以 `record_id` 從 SQLite/computed session 取 EvidenceData
3. `createEvidenceBundle(data, query)` 包成 EvidenceBundle
4. **不分類、不檢索、不解析查詢**——直接把 EvidenceData+EvidenceBundle 全文塞進 system message
5. 呼叫 Agnes，收到後：
   - `parseAgnesResponse` 抽 JSON footer
   - `validateAIOutput` 驗 claims 的 sourceId 是否存在於 bundle（存在性檢查，非語意 grounding）
   - `checkFactualClaims` 驗「日主/四柱/生肖/五行/大運干支」等**決定性命理事實**（純函式，golden 驗證過）
6. 通過就 SSE 回傳，未通過就回 refusal

### 有做到的部分（與目標方向相容）
- Evidence Bundle 強制 server-side 建立（client 不得偽造）
- claims 必須引用存在的 sourceId
- 決定性事實（非 AI 自述）由 factChecker 抽驗
- 未通過驗證一律拒答，不放行

### 缺口（對照目標方向）

| 目標要求 | 現況 | 差距 |
|---|---|---|
| 1. 拆進結構化資料（法規/判解/函釋/裁判書/起訴書） | 結構化資料 = 命盤（EvidenceData），非法律文件 | 領域不符 |
| 2. 先分類 | 無分類步驟 | 缺 |
| 3. 再檢索 | 無檢索步驟，全文塞 system prompt | 缺 |
| 4. 法條與裁判用語解析 | 無此模組 | 領域不符 |
| 5. 結論可追溯來源 | sourceId 存在性檢查有，但無語意 grounding（claim 是否真的被 evidence 支持） | 部分 |

## 根本判斷

**bezi 不是法律系統**。目標方向是法律檢索系統的驗收基準。直接套到 bezi 會出現兩種錯誤做法：
1. 硬在命理系統上加「法規/判解/函釋」欄位 → 污染 domain，知識層全錯
2. 假裝命理 = 法律 → 等於沒做重構

正確做法有兩條路，需要你決定。

## 待決定（需用戶選擇）

請見 ask 提問。
