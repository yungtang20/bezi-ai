// src/lib/checkInSubmit.ts
// [AI MOD] 打卡共用 submit：DailyForecastPage（完整六領域）與首頁快速打卡
// 共用同一套「存 log → 調整格局分數 → 自動切格局通知」邏輯，避免雙份分叉。
import { saveDailyLog, savePatternScores, saveNotification, type DailyLog } from '../storage';
import { adjustScores, checkAutoSwitch } from '../calibration';
import { getPrimaryPattern, type PatternScores } from '../pattern';

export interface QuickLogInput {
  date: string;                       // YYYY-MM-DD
  theoreticalOutcome: string;         // 理論方向（順利/平穩/不順...）
  dayTenGodType?: string;             // 今日十神（財星/官殺...）
  feedback: Record<string, 'good' | 'bad' | null>; // 各領域回饋
  note?: string;
}

export interface SubmitOutcome {
  autoSwitched: string | null;        // 非 null 表示格局自動切換（呼叫端負責 reload）
}

/**
 * 保存打卡記錄並同步格局分數。
 * 回傳 autoSwitched：若切格局則呼叫端應 reload（與既有 DailyForecastPage 行為一致）。
 */
export async function submitCheckIn(
  scores: PatternScores,
  input: QuickLogInput,
): Promise<SubmitOutcome> {
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
    createdAt: new Date().toISOString(),
  };

  await saveDailyLog(log);
  const newScores = adjustScores(scores, log, input.dayTenGodType);
  await savePatternScores(newScores);

  const switched = checkAutoSwitch(newScores);
  if (switched) {
    const oldPattern = getPrimaryPattern(scores);
    await saveNotification({
      date: new Date().toISOString(),
      type: 'pattern_switch',
      title: '格局自動調整通知',
      message: `近期身心感受更接近「${switched}」，系統已自動切換格局。`,
      oldPattern,
      newPattern: switched,
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  return { autoSwitched: switched };
}
