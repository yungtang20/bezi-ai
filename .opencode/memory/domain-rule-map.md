# bezi 領域規則溯源表

## 目的
追蹤 `src/data/` 程式碼規則 ↔ `LLM_WIKI.md` 章節 ↔ 原始來源檔案（PDF/DOCX），確保知識層一致性與可審計性。

## 使用說明
1. **新增規則** → 檢查 `LLM_WIKI.md` 是否有對應章節 → 若無，提交至 CEO 審核
2. **修改規則** → 同步更新對應章節與來源檔案說明
3. **刪除規則** → 註記為 `deprecated`，保留記錄勿刪除

## 對應表

### 1. 五行格局判斷

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `getPatternType()` | `src/pattern.ts` | `01_基礎理論` | `1-1 地支藏干表.pdf`、`定格局.docx` |
| `isFromStrong / isFromWeak` | `src/paipan.ts` | `01_基礎理論` | 同上 |
| `determineFavoredElement()` | `src/paipan.ts` | `01_基礎理論` | `1-5 五行補運講義.pdf` |

### 2. 十神計算

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `calculateTenGod()` | `src/paipan.ts` | `01_基礎理論` | `1-6、2-0 五行關係十神表.pdf`、`十神.docx` |
| `tenGodRelationship()` (相生相克) | `src/data/core/tenGodRelationships.ts` | `01_基礎理論` | 同上 |
| `getGodRelation(jia, Yi)` | `src/data/core/tenGodRelationships.ts` | `01_基礎理論` | 同上 |

### 3. 大運流年

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `calculateDayun()` | `src/dayun.ts` | `08_大運流年` | `大運流年補運架構/` 10 個 PDF |
| `calculateLiuNian()` | `src/dailyAnalysis.ts` | `08_大運流年` | 同上 |
| `getTaiSuiXingZhou(year)` | `src/data/rules/taiSui.ts` | `08_大運流年` | `taiSui.pdf`、`2000-2030 流年五行對照表.pdf` |
| `isChongPeiHe( year1, year2)` | `src/data/rules/dailyFlowDays.ts` | `08_大運流年` | 同上 |

### 4. 桃花/合盤

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `checkHarmony()` | `src/matchmaking.ts` | `04_感情姻緣` | `八字｜5-2_講義.pdf`、`桃花流年與合盤法則` |
| `compatibilityScore()` | `src/data/rules/compatibilityRules.ts` | `03_事業 / 04_感情姻緣` | `compatibilityRules.pdf` |
| `peachBlossomTiming()` | `src/data/rules/peachBlossomTiming.ts` | `04_感情姻緣` | 同上 |

### 5. 財富/事業

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `judgeWealth()` | `src/pattern.ts` | `02_財運` | `八字｜3-1_講義.pdf`、`3-2_講義.pdf` |
| `careerMatching()` | `src/data/charts/careerGuidelines.ts` | `03_事業` | `八字｜4-1_講義.pdf`、`4-2_講義.pdf` |
| `wealthRemedy()` | `src/data/charts/wealthRemediesData.ts` | `02_財運 / 05_健康` | `財富篇.docx`、`健康篇.docx` |

### 6. 健康

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `organByElement()` | `src/data/charts/healthData.ts` | `05_健康` | `健康篇.docx` |
| `bingByThreeCriminal()` | `src/data/charts/healthData.ts` | `05_健康` | 同上 |
| `flowDayHealthWarning()` | `src/dailyAnalysis.ts` | `05_健康` | 同上 |

### 7. 人際/人緣

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `familyInteractionMatrix()` | `src/data/charts/familyInteraction.ts` | `06_人際` | `家人相處.docx` |
| `friendSupportLevel()` | `src/data/charts/friendSupport.ts` | `06_人際` | `朋友助力.docx` |
| `childrenGuidelines()` | `src/data/rules/childrenGuidelines.ts` | `04_感情姻緣` | `八字｜6-2_講義.pdf` |

### 8. 風水/環境

| 程式碼規則 | 檔案 | LLM_WIKI 章節 | 來源檔案 |
|-----------|------|--------------|----------|
| `fengShui2026Guidance()` | `src/data/charts/fengShui2026.ts` | `07_軟裝風水` | `4.風水/2-3~2-7 金木水火土命人軟裝添運對照表.pdf` |
| `homeDecorSuggestion()` | `src/data/charts/homeDecorGuide.ts` | `07_軟裝風水` | 同上 |

## 3. 異動紀錄

| 日期 | 變更 | 檔案 | 影響範圍 | 審核人 |
|------|------|------|----------|--------|
| 2026-06-05 | 初始建檔 | 本檔 | — | CEO |
| 2026-10-20 | 新增 `elementRemedyHelper.ts` 對應 | `elementRemedyHelper.ts` | `05_健康` | Architect |

## 4. 審核原則

> ⚠️ **LLM_WIKI.md / src/data/ 知識變更 → 需上拋至 CEO 批准**（AGENTS.md）

> ⚠️ **新增/修改規則無對應 Wiki 章節 → 拒絕合併**（防止知識蒼白）

> ✅ **程式碼變更 → 必須同步更新本溯源表**（圖書管理員職責）