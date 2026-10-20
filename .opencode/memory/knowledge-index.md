# bezi 知識圖譜索引

## 結構說明
本索引對應 `LLM_WIKI.md` 的「來源講義 → Wiki 知識頁 → 程式碼」圖譜，建構在 `src/data/` 目錄結構之上。

## 1. 核心模組

### `src/data/core/` ── 十神、五行、日主特質
| 程式碼檔 | 對應 Wiki 章節 | 備註 |
|--------|---------------|------|
| `dayMasterTraits.ts` | 01_基礎理論 | 日主性格、五行屬性 |
| `earthlyBranchTraits.ts` | 01_基礎理論 | 地支藏干、六親關係 |
| `fiveElementsBalance.ts` | 01_基礎理論 | 五行平衡判斷 |
| `fiveElementsRemedies.ts` | 01_基礎理論 | 五行補救、調理方案 |
| `tenGodRelationships.ts` | 01_基礎理論 | 十神相生相克關係 |
| `types.ts` | 01_基礎理論 | 型別定義（TenGod, DayMaster, etc.） |

### `src/data/lecture/` ── 講義語料對照
| 程式碼檔 | 對應 Wiki 章節 | 來源檔案 |
|--------|---------------|----------|
| `lectureData.ts` | 總覽 | 所有 PDF/DOCX 語料彙總 |
| `tenGodTraits.ts` | 01_基礎理論 | 十神特質 |
| `childrenGuidelines.ts` | 06_人際 | 子女緣、家庭互動 |
| `compatibilityRules.ts` | 03_事業 / 04_感情姻緣 | 桃花、合盤規則 |
| `dayunLiunian.ts` | 08_大運流年 | 大運流年計算規則 |
| `peachBlossomTiming.ts` | 04_感情姻緣 | 桃花流年 |
| `taiSui.ts` | 08_大運流年 | 太歲、流年衝冲 |

### `src/data/rules/` ── 判斷規則與邏輯
| 程式碼檔 | 對應 Wiki 章節 | 適用場景 |
|--------|---------------|----------|
| `compatibilityRules.ts` | 03_事業 / 04_感情姻緣 | 配對、合盤分析 |
| `dailyFlowDays.ts` | 單日運勢 | 日盤、流日 |
| `dayunLiunian.ts` | 08_大運流年 | 十年大運推算 |
| `peachBlossomTiming.ts` | 04_感情姻緣 | 桃花時機 |
| `taiSui.ts` | 08_大運流年 | 太歲冲煞 |
| `timelineGuidelines.ts` | 時間軸 | 年月日時流年對照 |

### `src/data/charts/` ── 視覺化與格局圖表
| 程式碼檔 | 對應 Wiki 章節 | 備註 |
|--------|---------------|------|
| `index.ts` | 總匯 | 所有 chart 類型匯出 |
| `careerGuidelines.ts` | 03_事業 | 職業適配圖 |
| `careerRemediesData.ts` | 03_事業 | 事業調理資料 |
| `careerRoles.ts` | 03_事業 | 角色對應 |
| `familyInteraction.ts` | 06_人際 | 家人互動模型 |
| `familyRoles.ts` | 06_人際 | 家庭角色定義 |
| `fengShui2026.ts` | 07_軟裝風水 | 2026 風水指南 |
| `friendSupport.ts` | 06_人際 | 朋友貴人、合夥 |
| `healthData.ts` | 05_健康 | 五行器官、病符 |
| `healthRemedies.ts` | 05_健康 | 健康調理方案 |
| `homeDecorGuide.ts` | 07_軟裝風水 | 居家擺設 |
| `romanceFengShui.ts` | 04_感情姻緣 | 感情風水 |
| `romanceRemediesData.ts` | 04_感情姻緣 | 感情調理資料 |
| `spouseGuidelines.ts` | 04_感情姻緣 | 配偶選擇 |
| `spouseTraits.ts` | 04_感情姻緣 | 配偶特質 |
| `wealthCareers.ts` | 02_財富 | 財運事業 |
| `wealthGuidelines.ts` | 02_財富 | 財富指南 |
| `wealthRemediesData.ts` | 02_財富 | 財富調理 |

### `src/data/elementRemedyHelper.ts`
- 通用五行調理輔助函式（歸一化、喜用神判斷）
- 供 rules/charts 互呼

## 2. 索引對應總覽

```
LLM_WIKI.md (來源講義)
        │
        ├── 01_基礎理論      → src/data/core/ (型別、十神、五行)
        ├── 02_財富          → src/data/charts/wealth*、rules/taiSui
        ├── 03_事業          → src/data/charts/career*、rules/compatibility
        ├── 04_感情姻緣      → src/data/charts/romance*、spouse*、rules/peachBlossom
        ├── 05_健康          → src/data/charts/health*、elementRemedyHelper
        ├── 06_人際          → src/data/charts/family*、friend*、childrenGuidelines
        ├── 07_軟裝風水      → src/data/charts/fengShui2026、homeDecorGuide
        └── 08_大運流年      → src/data/lecture/dayunLiunian、rules/taiSui、charts/index
```

## 3. 使用說明

### 查詢入口
- 前端：`/api/chat` → DOMPurify 淨化後渲染
- 後端：`server.ts` SSE 代理 Agnes AI，帶入 `LLM_WIKI.md` 章節編號作上下文

### 程式碼重構提醒
- `LLM_WIKI.md` 章節異動 → 同步本索引（CEO 權責層）
- 新增知識來源 → 放入對應子目錄，更新 `src/data/index.ts` barrel export
- 章節/檔案重命名 → 同步本索引與 `LLM_WIKI.md` 檢查項目

## 4. Upgrade Path
- [ ] 匯入 PDF/DOCX 內容為結構化 JSON（Phase 2）
- [ ] 建立 RAG 向量索引（LLM 回答時檢索）
- [ ] 擴充 `elementRemedyHelper.ts` 以支援全站調理建議
- [ ] 對照 `vitest` 測試用例驗證規則一致性