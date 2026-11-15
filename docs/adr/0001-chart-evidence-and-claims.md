# ADR-0001 — Canonical Chart Evidence and Validation Semantics

- Status: Accepted (2026-11-15, Matt quality plan #41)
- Context: 前端可用經度進行真太陽時排盤，AI 後端原本僅收到日期/時辰/性別；引用存在性及事實錯誤標記也無法獨立保證回答可信度。
- Decision: `@bezi/core` 為四柱機械排盤的實作來源。前端出生地經度以可選數值參數送至 `POST /api/evidence/current`；後端驗證後自行重算，不接受客戶端直接提交四柱或命盤 Evidence。
- Decision: 伺服器 AI Evidence 結合 session ownership；已確定與命盤不符的模型答案應 fail closed；sourceId 的存在性和命理推論的語意支持分開揭露。
- Decision: 前端使用者對年份與日誌的校準結果屬另一證據層，目前不得稱為由後端重新驗證的格局。
- Decision: 講義雙源已知差異以 manifest 鎖定 UNKNOWN，未核原始教材不能擅改。
- Consequences: 使用者選出生城市時，前後端的四柱能使用同一個經度校正；資料量增加一個可選的座標值。未來若需真正統一校準格局，須新增獨立 ticket + 將校準事件以可重播、具 ownership 的結構送入後端。
- Verification: `tests/api-knowledge-pipeline.test.mjs` 的 1990-02-10 午夜台北回歸、`tests/unit/trueSolarTime.test.ts`、錯誤日主拒答、講義 drift gate。
- Not claimed: 不能由此證明每一個命理推論符合老師教材或有獨立預測效度。
