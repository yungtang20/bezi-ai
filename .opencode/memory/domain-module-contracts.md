# bezi Domain Module 介面契約

> 依 AGENTS.md：排盤/格局/大運/流年邏輯在 `src/*.ts`；本契約記錄各模組**對外暴露**的函式與型別，作為架構師審查邊界的依據。

## 架構事實（2026-10-21 盤點）

**重要**：`src/paipan.ts`、`src/pattern.ts`、`src/dayun.ts`、`src/dailyAnalysis.ts`、`src/types.ts`、`src/constants.ts` 皆為 **1 行 shim**，實際實作在 npm workspace `@bezi/core`（`packages/core/src/`）。`src/matchmaking.ts` 與 `src/calibration.ts` 則為**真實實作**。

```
src/paipan.ts      → export * from '@bezi/core/paipan'
src/pattern.ts     → export * from '@bezi/core/pattern'
src/dayun.ts       → export * from '@bezi/core/dayun'
src/dailyAnalysis.ts → export * from '@bezi/core/dailyAnalysis'
src/types.ts       → export * from '@bezi/core/types'
src/matchmaking.ts → （真實實作）
src/calibration.ts → （真實實作）
```

---

## 1. `@bezi/core/paipan` — 排盤

| 匯出 | 簽名 | 職責 |
|------|------|------|
| `calculateChart` | `(year, month, day, hour: number, gender: '男'\|'女', isHourUnknown?: boolean) => BaziChart` | 核心排盤：四柱、日主、生肖 |
| `translateGanZhi` | `(ganZhi: string) => string` | 干支中文名稱轉換 |
| `ZHI_HIDE_GAN` | `Record<string, string[]>` | 地支藏干表（= ZHI_HIDDEN） |
| `getHiddenTenGodsForZhi` | `(zhi: string, dayMaster: string) => string[]` | 地支藏干對應十神 |
| `DAY_MASTER_PERSONALITY` | `Record<string, string>` | 日主性格描述 |
| `BaziChart` | interface | 四柱 + dayMaster + gender + 生日 + zodiac |

**邊界規則**：`Pillar` 型別**未導出**（內部型別）— 外部僅能透過 `BaziChart` 存取柱位。

## 2. `@bezi/core/pattern` — 格局判定

| 匯出 | 簽名 | 職責 |
|------|------|------|
| `determinePattern` | `(chart: BaziChart) => PatternResult` | 判定身強/身弱/從強/從弱 + 喜忌神 |
| `getFavorableElements` | `(dayMaster, pattern) => { favorable, unfavorable }` | 喜用神查表 |
| `countTenGods` | `(chart) => TenGodCount[]` | 十神統計（`TenGodCount` 內部型別） |
| `getCheckYears` | `(dayMasterElement, initialPattern) => number[]` | 格局反轉驗證年 |
| `initPatternScores` / `getPrimaryPattern` | — | 校準用分數結構 |
| `PatternResult` | interface | `{ pattern, favorable, unfavorable, score, weakestElement(s), reason? }` |
| 常數 | `ZHI_TYPE`、`ZHI_HIDDEN`、`TRIAD_GROUPS`、`TRIAD_MEETINGS` | 地支刑沖合會表 |

## 3. `@bezi/core/dayun` — 大運流年

| 匯出 | 簽名 | 職責 |
|------|------|------|
| `calculateDaYun` | `(chart) => DaYun[]` | 十年大運序列 |
| `getDaYunQuality` | `(gan, zhi, favorable, unfavorable) => '好運'\|'壞運'\|'平運'` | 大運吉凶 |
| `getLiuNian` | `(year, dayMaster?) => LiuNian` | 單一流年 |
| `getFutureLiuNian` | `(startYear, count, dayMaster) => LiuNian[]` | 未來 N 年流年 |
| re-export | `checkTaiSui`、`getTenGodForDaYun` | 太歲、十神 |
| `DaYun` / `LiuNian` | interface | 干支、十神、五行、起訖年 |

## 4. `@bezi/core/dailyAnalysis` — 流日能量

| 匯出 | 簽名 | 職責 |
|------|------|------|
| `getDailyEnergy` | `(chart, weakestElement, favorable, unfavorable, primaryPattern, targetDate?) => DailyEnergy` | 單日極端日/衰弱日判定 |
| `getUpcomingDatesForCategory` | `(chart, category, favorable, unfavorable, …) => UpcomingDay[]` | 掃描未來特定主題日（wealth/career/romance/health_warning/move_in/villain） |
| `DailyEnergy` | interface | 極端日型別、理論結果、十神型別 |

## 5. `src/matchmaking` — 合盤（真實實作）

| 匯出 | 簽名 | 職責 |
|------|------|------|
| `checkSanHui` / `checkSanHe` | `(zhi1, zhi2) => string \| null` | 三會/三合 |
| `checkLiuChong` / `checkLiuHe` | `(z1, z2) => …` | 六沖/六合 |
| `checkXiangXing` | `(zhi1, zhi2) => string \| null` | 相刑 |
| `checkLiuPo` / `checkLiuHai` | `(z1, z2) => …` | 六破/六害 |
| `checkMutualComplement` | `(myChart, pChart) => …` | 五行互補 |
| `checkDayStructureSimilarity` | `(chart1, chart2) => …` | 日柱結構相似度 |
| `checkCommonSpouseElement` | `(c1, c2) => string \| null` | 共同配偶星五行 |
| `checkSpouseStar` | `(myChart, partnerChart) => string \| null` | 配偶星互見 |
| `PartnerChart` | interface | 合盤用命盤 |

## 6. `src/calibration` — 校準（真實實作）

| 匯出 | 簽名 | 職責 |
|------|------|------|
| `adjustScores` | `(scores: PatternScores, log: DailyLog, dayTenGodType?) => PatternScores` | 依日誌調整格局分數 |
| `checkAutoSwitch` | `(scores) => string \| null` | 自動切換格局建議 |
| `calculateAccuracy` | `(logs) => number` | 歷史準確率 |

## 7. 共用型別 — `@bezi/core/types`

| 型別 | 定義 |
|------|------|
| `BaziDisplay` | `{ year, month, day, time, chart }` |
| `PartnerInfo` | 合盤夥伴（全 optional） |
| `FiveElement` | `'木'\|'火'\|'土'\|'金'\|'水'` |
| `SynastryDetail` | `{ factor, desc, advice? }` |

另有知識層共用型別 `src/data/core/types.ts`：`HeavenlyStem`、`EarthlyBranch`、`YinYang`、`DayMasterStrength`。

---

## 邊界審查結論

1. ✅ **前後端分離良好**：`server.ts` 僅依賴 `src/ai/*`、`src/lib/*`、`src/errors`；domain logic 不進 server。
2. ⚠️ **shim 層一致性**：`src/*.ts` shim 與 `@bezi/core` exports 必須同步；新增 subpath export 需同步 `packages/core/package.json`。
3. ⚠️ **內部型別外洩風險低**：`Pillar`、`TenGodCount`、`DailyLog` 未導出 — 外部代碼不得繞道引用。
4. 📌 **建議**：合盤（`matchmaking.ts`）與校準（`calibration.ts）未來若需被 server 端使用，應先移入 `@bezi/core` 統一管理。

## 對應測試

| Module | 測試檔（tests/unit/） |
|--------|----------------------|
| paipan | `paipan.test.ts` |
| pattern | `pattern.test.ts` |
| dayun | `dayun.test.ts` |
| dailyAnalysis | `dailyAnalysis.test.ts` |
| matchmaking | `matchmaking.test.ts` |
| calibration | `calibration.test.ts` |
| constants/十神 | `constants.test.ts` |
