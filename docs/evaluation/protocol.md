# 預鎖盲測合約｜Bezi（2026-11-15）

## Purpose and limits

本文件提供**工程計分與證據封存框架**，不是「徐玉蘭老師已認證」或「八字能預測真實人生」的宣稱。目前五筆案例全部是 SYNTHETIC PROTOCOL TEST，沒有真實未來觀察，任何 accuracy 輸出必須是 `null` 並列 `INSUFFICIENT_DATA`。測試用的 synthetic observations 僅測試計分公式，應標 `SYNTHETIC_DEMO_ONLY`。

## Contract and lock

- `fixtures/locked-cases-v1.json`：事前鎖定假設、時間窗、分類與方向，且固定來源 `SYNTHETIC_NOT_TEACHER_VERIFIED`。
- `fixtures/locked-cases-v1.sha256`：原始檔 bytes 的 SHA-256，CLI 在任何評估前比對；不符直接失敗。
- `fixtures/observations-template.json`：只有未填的後驗觀察，**不是**評估證據。
- `tests/fixtures/blind-synthetic-observations.json`：mock 成功/失敗實例；禁止拿它對外聲稱真實準確率。
- `node scripts/eval-blind-contract.mjs`：預設輸出 `INSUFFICIENT_DATA`。測試評分用 `--observations <file>`。
- `node --test tests/blind-eval-contract.test.mjs`：驗證鎖版、無觀察不給分、mock 比例、錯誤 SHA 必須擋下。

## Future real-world replay protocol

1. 先收合法且自願的資料、去識別；不得把私人出生資料放公開 repo。正式資料另存受控私有資料源。
2. 先鎖定與教材來源可追溯的預測輸入、模型版次、假設、評分準則、SHA-256、案例的 calibration/holdout split；時間窗結束前不得修改。
3. 在每個時間窗結束後，才讓**未參與預測或校準的**觀察者記錄結果、時間及來源。缺失、拒答、模糊不可評分都須揭露，不得填成成功。
4. 報告 raw correct/eligible、missing/total、校準 vs holdout、信賴區間（有足夠樣本時）、選擇偏差、事前註冊與時間點。樣本不足則標為未知。
5. 對任何「受老師講義支持」主張需獨立核對原始講義頁碼/逐字稿與條件，不可把工程 CI 通過當教師授權或命理效度。

## No data leakage

`locked-cases-v1.json` **沒有觀察值**；`observations-template.json` 與 mock fixture 是不同檔。校準集在本 synthetic 合約中為空，五例全數 holdout。不得查看未來觀察後修改原預測或使用者回饋分數來「預先」訓練同一批 holdout。
