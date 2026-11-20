// src/lib/calibrationLedger.ts
// [R7 P0-2] 校準紀錄重算：純函數，可測試，不碰 IndexedDB。
// 核心設計（見驗收決策）：
// 1. 基準 scores（calibration-base）來源於命盤格局（chart_derived），這是 Layer 2 種子；
// 2. 每日打卡紀錄按日期順序重算：latest per date，排除未來、跳過 legacy_anchor 已涵蓋日期；
// 3. 同一天重複提交等冪（相同內容不改變 createdAt，但數值變更視為新修訂）；
// 4. 未知遺留基準時，保留 legacy_anchor 與標記 residual，UI 不得假裝精確重算。
import { adjustScores } from '../calibration';
import { type DailyLog } from '../storage';
import { compareDateKeys } from '../lib/civilDate';
import { latestPerDate } from './dailyLog';
import type { CalibrationBaseRecord } from '../storage';
import type { PatternScores } from '../pattern';

export type RecomputeVersion = 'r7-2026-11-20';

export const RECOMPUTE_VERSION: RecomputeVersion = 'r7-2026-11-20';

export interface RecomputeResult {
  scores: PatternScores;
  /** 實際參與重算的日期（已排序），供 UI 顯示涵蓋範圍。 */
  appliedDates: string[];
  /** 被跳過的未來日期（保留在 DB，不參與重算）。 */
  skippedFutureDates: string[];
  /** legacy_anchor 已涵蓋且不再重算的日期（估算區間）。 */
  legacyCoveredDates: string[];
  /** 基準是否可完全追溯到命盤規則（true = exact；false = 有估算殘差）。 */
  exact: boolean;
}

export function recomputePatternScores(
  base: CalibrationBaseRecord,
  logs: DailyLog[],
  todayKey: string,
  version: RecomputeVersion = RECOMPUTE_VERSION
): RecomputeResult {
  const latest = latestPerDate(logs);

  const applied: DailyLog[] = [];
  const skippedFuture: string[] = [];
  const legacyCovered: string[] = [];
  const covered = new Set(base.coveredDates ?? []);

  for (const log of latest) {
    if (!log.date) continue;
    const rel = compareDateKeys(log.date, todayKey);
    if (rel > 0) {
      skippedFuture.push(log.date);
      continue;
    }
    if (covered.has(log.date)) {
      legacyCovered.push(log.date);
      continue;
    }
    applied.push(log);
  }

  let scores = { ...base.scores };
  // 按日期序數排序；同日期（不應發生）以 createdAt 斷尾。
  applied.sort((a, b) => {
    const c = (a.date ?? '').localeCompare(b.date ?? '');
    if (c !== 0) return c;
    return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
  });
  for (const log of applied) {
    scores = adjustScores(scores, log, log.dayTenGodType);
  }
  // 將 residual 差額逐鍵加回 scores，並 clamp 到 [0, 100]。
  if (base.residual) {
    scores = {
      strong: Math.min(
        100,
        Math.max(0, base.scores.strong + base.residual.strong)
      ),
      weak: Math.min(100, Math.max(0, base.scores.weak + base.residual.weak)),
      followStrong: Math.min(
        100,
        Math.max(0, base.scores.followStrong + base.residual.followStrong)
      ),
      followWeak: Math.min(
        100,
        Math.max(0, base.scores.followWeak + base.residual.followWeak)
      ),
    };
  }

  const exact =
    base.provenance === 'chart_derived' &&
    base.residual === undefined &&
    legacyCovered.length === 0;

  return {
    scores,
    appliedDates: applied.map((l) => l.date).sort(),
    skippedFutureDates: skippedFuture.sort(),
    legacyCoveredDates: legacyCovered.sort(),
    exact,
  };
}
