// src/lib/checkInSubmit.ts
// [AI MOD] 打卡共用 submit：DailyForecastPage（完整六領域）與首頁快速打卡
// 共用同一套「存 log → 調整格局分數 → 自動切格局通知」邏輯，避免雙份分叉。
// [R7 P0-1] 未來日期不寫入；[R7 P0-2] 從 calibration-base 重算，不重複累加。
import { isFutureDateKey, taipeiDateKey } from './civilDate';
import {
  getAllLogs,
  getCalibrationBase,
  saveDailyLog,
  saveNotification,
  savePatternScores,
  type DailyLog,
} from '../storage';
import { adjustScores, checkAutoSwitch } from '../calibration';
import { getPrimaryPattern, type PatternScores } from '../pattern';
import {
  recomputePatternScores,
  type RecomputeResult,
  RECOMPUTE_VERSION,
} from './calibrationLedger';

export interface QuickLogInput {
  date: string; // YYYY-MM-DD
  theoreticalOutcome: string; // 理論方向（順利/平穩/不順...）
  dayTenGodType?: string; // 今日十神（財星/官殺...）
  feedback: Record<string, 'good' | 'bad' | null>; // 各領域回饋
  note?: string;
}

export interface SubmitOptions {
  /** 測試/遷移用指定當下；預設為系統時鐘。 */
  now?: Date;
}

/** 打卡提交結果：成功時回傳重算詳情；失敗時僅回傳拒絕原因，不寫入任何資料。 */
export type SubmitResult =
  | {
      ok: true;
      autoSwitched: string | null;
      recomputed: {
        appliedDates: string[];
        skippedFutureDates: string[];
        legacyCoveredDates: string[];
        exact: boolean;
      };
    }
  | {
      ok: false;
      reason: 'FUTURE_DATE';
      date: string;
      today: string;
      autoSwitched: null;
    };

/**
 * 保存打卡記錄並同步格局分數。
 *
 * P0-1：未來日期（> 台北今日）不寫入任何資料，回傳 FUTURE_DATE 拒絕。
 * P0-2：從 calibration-base 重算，舊日誌不重複累加；僅在基準存在時才重算分數。
 */
export async function submitCheckIn(
  scores: PatternScores,
  input: QuickLogInput,
  options?: SubmitOptions
): Promise<SubmitResult> {
  const now = options?.now ?? new Date();
  const today = taipeiDateKey(now);

  if (isFutureDateKey(input.date, today)) {
    return {
      ok: false,
      reason: 'FUTURE_DATE',
      date: input.date,
      today,
      autoSwitched: null,
    };
  }

  const log: DailyLog = {
    date: input.date,
    health: input.feedback.health ?? null,
    career: input.feedback.career ?? null,
    romance: input.feedback.romance ?? null,
    wealth: input.feedback.wealth ?? null,
    family: input.feedback.family ?? null,
    friends: input.feedback.friends ?? null,
    note: input.note ?? '',
    theoreticalOutcome: input.theoreticalOutcome,
    dayTenGodType: input.dayTenGodType,
    createdAt: now.toISOString(),
    rulesVersion: RECOMPUTE_VERSION,
  };

  await saveDailyLog(log);

  const base = await getCalibrationBase();
  let recomputeResult: RecomputeResult | null = null;
  if (base) {
    const allLogs = (await getAllLogs()) ?? [];
    recomputeResult = recomputePatternScores(base, allLogs, today);
  }

  const newScores = recomputeResult
    ? recomputeResult.scores
    : adjustScores(scores, log, input.dayTenGodType);
  await savePatternScores(newScores);
  const switched = checkAutoSwitch(newScores);
  if (switched) {
    const oldPattern = getPrimaryPattern(scores);
    await saveNotification({
      date: now.toISOString(),
      type: 'pattern_switch',
      title: '格局自動調整通知',
      message: `近期身心感受更接近「${switched}」，系統已自動切換格局。`,
      oldPattern,
      newPattern: switched,
      createdAt: now.toISOString(),
      read: false,
    });
  }

  return {
    ok: true,
    autoSwitched: switched,
    recomputed: recomputeResult
      ? {
          appliedDates: recomputeResult.appliedDates,
          skippedFutureDates: recomputeResult.skippedFutureDates,
          legacyCoveredDates: recomputeResult.legacyCoveredDates,
          exact: recomputeResult.exact,
        }
      : {
          appliedDates: [input.date],
          skippedFutureDates: [],
          legacyCoveredDates: [],
          exact: false,
        },
  };
}
