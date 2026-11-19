# Bezi 領域術語（2026-11-15）

此文件用於讓 AI Agent 與人類描述同一概念；文化命理規則不等同可獨立驗證的自然科學模型。

| 術語 | 定義與 interface | 不得混淆 |
| --- | --- | --- |
| 出生輸入 Birth Input | 西元出生年月日、時辰（可未知）、性別及可選的出生地經度。由 server 驗證後才可重排。 | 不包含姓名；不能把使用者提交的最終四柱當伺服器真值。 |
| 四柱命盤 Chart | @bezi/core 的年/月/日/時柱與日主；未提供時辰時不得假造時柱。 | 不等於回饋後的定盤結論。 |
| 真太陽時 True Solar Time | 選經度時由引擎調整民用出生時間，部分日期跨午夜會改變日柱。 | 原始民用時間和校正後時刻均有用途，不能互換。 |
| 原始格局 Engine Pattern | 引擎按現有學派規則計算的格局候選及分數。 | 不應默認為老師對個案的最終口頭判斷。 |
| 校準 Calibration | 使用者對往年事件或打卡的回饋，以分數調整格局候選；為使用者自述依據。 | 不等於可直接供 AI 宣稱的 server-side independent Evidence。 |
| Evidence Bundle | 伺服器從授權 Session 與可信的排盤／demo 資料源建立的命盤證據集合。 | 不接受客戶端偽造 Bundle。 |
| Knowledge Item | 從本專案既存命理規則/講義摘錄檢索的條目，具有 sourceId。 | 條目存在不表示已核對原始老師講義。 |
| SourceId 存在性 | 驗證引用的來源編號確實在本次 Bundle/知識集合。 | 不等於語意 grounding 或事實正確。 |
| Fact Check | 確定性地抽取 AI 答案中的部分命盤事實並對照命盤；抽不到屬 no_facts。 | 非整篇文章的語意評估，未發現錯誤不代表全面正確。 |
| 紀錄吻合度 | 已輸入打卡內容與當日系統規則方向的樣本內一致百分比。 | 不是事前預測的外部效度、因果或科學準確率。 |
| Lecture Drift | `src/data/lecture` 與 `packages/core/src/data/lecture` 的資料差異。 | 目前兩筆已知差異是 UNKNOWN，不能猜哪一版正確。 |
| 模型呼叫預算 | 針對單一 server instance、跨路由與模型重試的呼叫量和併發上限。 | 非 token 或費用的精準帳本。 |
| Blind Evaluation | 事前固定案例、預測、規則與來源；後來才用隔離觀察評分。 | 未有新觀察時不能宣稱準確率。 |

預定介面 seam：`@bezi/core.calculateChart`、`POST /api/evidence/current`、`POST /api/chat`、`validateAIOutput`、`npm run check:drift`。測試優先走最外層可觀察行為，避免只測內部實作細節。
