// src/lib/sevenDayForecast.ts
// [R7 P1-1/P1-2/P1-3/P1-4] 首頁未來七天趨勢：純規則引擎，不呼叫 AI。
// 設計原則：
// 1. 每天最多兩個值得注意的生活領域（P1-3）。
// 2. 領域選擇與方向一律來自既有規則單一真實來源（calibration.DAY_TYPE_FIELDS、
//    dailyAnalysis.checkDayType / getDailyEnergy），不自創老師口徑。
// 3. 每條建議皆帶 evidence 追溯（P1-4）：SOURCE_VERIFIED / RULE_COMPUTED /
//    USER_CALIBRATED / REVIEW_REQUIRED / UNKNOWN，決不假裝科學預測。
// 4. 決定論性：同一命盤與同一規則版本必須回傳相同結果，便於測試與回溯。
import { type DailyEnergy, getDailyEnergy } from '../dailyAnalysis';
import { checkDayType } from '@bezi/core';
import { DAY_TYPE_FIELDS, type CategoryKey, CATEGORY_LABELS } from './domains';
import {
  dateKeyToUtcMs,
  dateKeyWeekdayLabel,
  enumerateDateKeys,
  formatMonthDay,
  todayKey,
} from './civilDate';
import type { BaziChart } from '../paipan';
import { type EvidenceRef } from './evidenceStatus';
import { ruleComputed, userCalibrated, reviewRequired } from './evidenceStatus';
import { latestPerDate } from './dailyLog';
import type { DailyLog } from '../storage';
import { determinePattern, getFavorableElements } from '../pattern';

export const FORECAST_RULES_VERSION = 'r7-2026-11-20';

export interface DomainSignal {
  key: CategoryKey;
  label: string;
  stance: 'supportive' | 'caution' | 'neutral';
  weight: number; // 0-100，越大越值得關注
  reason: string;
  evidence: EvidenceRef[];
}

export interface DayForecast {
  dateKey: string; // YYYY-MM-DD
  weekday: string; // 星期五
  monthDay: string; // 11/20
  dayGanZhi: string; // 庚午
  dayTenGodType: string; // 財星
  trend: 'favorable' | 'unfavorable' | 'mixed' | 'steady';
  trendLabel: string; // e.g. 「財運順」、「平穩」
  headline: string; // 一句話摘要
  domains: DomainSignal[]; // 最多兩個
  reasons: string[]; // 規則依據
  uncertainty: string[]; // 無法確定的項目，供 UI 標註
  confidence: 'computed' | 'limited' | 'insufficient';
  evidence: EvidenceRef[]; // 當日整體證據
  rulesVersion: string;
}

/** 十神日型 → 對應領域（單一真實來源：calibration.DAY_TYPE_FIELDS）。 */
const DAY_TYPE_DOMAINS: Record<string, CategoryKey[]> = {
  ...DAY_TYPE_FIELDS,
};

function domainLabel(key: CategoryKey): string {
  return CATEGORY_LABELS[key];
}

/** 從 dailyEnergy 與十神類型推斷單一領域的訊號（純函數）。 */
function domainSignal(
  key: CategoryKey,
  energy: DailyEnergy,
  outcome: DailyEnergy['theoreticalOutcome'],
  isGoodLog: boolean
): DomainSignal | null {
  const fields = DAY_TYPE_DOMAINS[energy.dayTenGodType] ?? [];
  if (!fields.includes(key)) return null;

  const stance: 'supportive' | 'caution' | 'neutral' =
    outcome === '大好' || outcome === '順利' || outcome === '小吉'
      ? 'supportive'
      : outcome === '不順' || outcome === '不佳' || outcome === '較差'
        ? 'caution'
        : 'neutral';

  const weight =
    stance === 'supportive'
      ? outcome === '大好'
        ? 90
        : outcome === '順利'
          ? 70
          : 50
      : stance === 'caution'
        ? outcome === '不佳' || outcome === '不順'
          ? 80
          : 55
        : 30;

  const reason = `${energy.dayTenGodType}日主${domainLabel(key)}：${
    stance === 'supportive'
      ? '今日方向與該領域相宜，可安排相關事項。'
      : stance === 'caution'
        ? '今日該領域方向較為吃力，建議保守處理。'
        : '今日該領域無特別指向，視常態處理。'
  }`;

  const evidence: EvidenceRef[] = [
    ruleComputed(
      `依十神日型 ${energy.dayTenGodType} 對應領域 ${domainLabel(key)}`,
      'calibration.DAY_TYPE_FIELDS'
    ),
  ];
  if (isGoodLog) evidence.push(userCalibrated('使用者近期回饋偏正面'));
  else if (!isGoodLog && stance === 'caution')
    evidence.push(reviewRequired('未見到足夠使用者回饋支撐，建議僅作參考'));

  return {
    key,
    label: domainLabel(key),
    stance,
    weight,
    reason,
    evidence,
  };
}

/** 判斷當日整體趨勢。 */
function trendOf(energy: DailyEnergy): {
  trend: DayForecast['trend'];
  trendLabel: string;
} {
  const o = energy.theoreticalOutcome;
  switch (o) {
    case '大好':
      return { trend: 'favorable', trendLabel: '大順' };
    case '順利':
      return { trend: 'favorable', trendLabel: '順' };
    case '小吉':
      return { trend: 'favorable', trendLabel: '小順' };
    case '平穩':
      return { trend: 'steady', trendLabel: '平穩' };
    case '較差':
      return { trend: 'unfavorable', trendLabel: '不順' };
    case '不順':
    case '不佳':
    default:
      return { trend: 'unfavorable', trendLabel: '宜保守' };
  }
}

interface LogEntry {
  date: string;
  [key: string]: 'good' | 'bad' | null | string;
}
/**
 * 建構未來七日預報（含今天）。
 * @param now 測試用固定時鐘；預設系統時間。
 */
export function buildSevenDayForecast({
  chart,
  startDateKey = todayKey(),
  days = 7,
  logs = [],
  now = new Date(),
}: {
  chart: BaziChart;
  startDateKey?: string;
  days?: number;
  logs?: DailyLog[];
  now?: Date;
}): DayForecast[] {
  const pattern = determinePattern(chart);
  const weakestElement = pattern.weakestElement;
  const { favorable, unfavorable } = getFavorableElements(
    chart.dayMaster,
    pattern.pattern
  );

  const dateKeys = enumerateDateKeys(startDateKey, days);
  const logsByDate = new Map<string, LogEntry>();
  for (const log of latestPerDate(logs ?? [])) {
    if (log.date) logsByDate.set(log.date, log as unknown as LogEntry);
  }

  return dateKeys.map((dateKey) => {
    // 以 Asia/Taipei 民用日期鍵對應的 UTC 午夜建構瞬間，避免本地時區午夜
    // 在台灣落到前一天 UTC 日期而導致星期與八字日柱錯位。
    const instant = new Date(dateKeyToUtcMs(dateKey));
    const energy = getDailyEnergy(
      chart,
      weakestElement,
      favorable,
      unfavorable,
      pattern.pattern,
      instant
    );
    const { trend, trendLabel } = trendOf(energy);
    const dayTypes = checkDayType(
      energy.dayGan,
      energy.dayZhi,
      chart.dayMaster,
      chart.gender
    );

    const log = logsByDate.get(dateKey);
    const isGoodLog = log
      ? Object.values(log).some((v) => v === 'good')
      : false;
    const isBadLog = log ? Object.values(log).some((v) => v === 'bad') : false;

    // 選出最多兩個值得注意的領域：優先取 stance !== neutral 且 weight 最高者
    const candidates: DomainSignal[] = [];
    const evaluatedFields = DAY_TYPE_DOMAINS[energy.dayTenGodType] ?? [];
    for (const key of evaluatedFields) {
      const sig = domainSignal(
        key,
        energy,
        energy.theoreticalOutcome,
        isGoodLog
      );
      if (sig) candidates.push(sig);
    }
    candidates.sort((a, b) => b.weight - a.weight);
    const domains = candidates.slice(0, 2);

    const reasons: string[] = [];
    const uncertainty: string[] = [];
    const evidence: EvidenceRef[] = [
      ruleComputed(
        `${dateKey} ${energy.dayGanZhi} 十神 ${energy.dayTenGodType}；理論方向 ${energy.theoreticalOutcome}`,
        'dailyAnalysis.getDailyEnergy'
      ),
    ];
    if (energy.theoreticalExplanation) {
      evidence.push(
        ruleComputed(
          energy.theoreticalExplanation,
          'dailyAnalysis.getDailyEnergy'
        )
      );
    }

    if (energy.isExtremeDay) {
      reasons.push(`極端能量日：${energy.extremeType}`);
      evidence.push(
        ruleComputed('極端能量日判斷', 'dailyAnalysis.extremeDayMap')
      );
    }
    if (energy.isWeaknessDay) {
      reasons.push(`最弱五行受剋：${energy.weaknessType}`);
      evidence.push(
        ruleComputed('弱五行受剋流日', 'dailyAnalysis.weakControlDaysMap')
      );
    }
    dayTypes.forEach((t) => {
      if (t.includes('犯小人日')) {
        uncertainty.push('犯小人日：人際摩擦可能增加，僅供參考');
        evidence.push(reviewRequired('犯小人日屬傳統曆法說法，非科學事實'));
      }
    });
    if (log) {
      evidence.push(
        userCalibrated(
          `${dateKey} 使用者打卡：${
            isGoodLog ? '順利' : isBadLog ? '不順' : '已記錄'
          }`
        )
      );
    }

    let headline = trendLabel;
    if (domains.length > 0) {
      headline = `${trendLabel} · ${domains.map((d) => d.label).join('、')} ${
        domains[0].stance === 'supportive' ? '順' : '留意'
      }`;
    }

    const confidence: DayForecast['confidence'] =
      energy.theoreticalOutcome === '平穩' && domains.length === 0
        ? 'limited'
        : 'computed';

    return {
      dateKey,
      weekday: dateKeyWeekdayLabel(dateKey),
      monthDay: formatMonthDay(dateKey),
      dayGanZhi: energy.dayGanZhi.split(' ').pop() ?? '',
      dayTenGodType: energy.dayTenGodType,
      trend,
      trendLabel,
      headline,
      domains,
      reasons,
      uncertainty,
      confidence,
      evidence,
      rulesVersion: FORECAST_RULES_VERSION,
    };
  });
}

/** 依照七日預報，挑出「未來七天的趨勢」一句話（首頁摘要用）。 */
export function forecastSummary(forecast: DayForecast[]): string {
  const fav = forecast.filter((d) => d.trend === 'favorable').length;
  const unf = forecast.filter((d) => d.trend === 'unfavorable').length;
  if (fav >= 4) return `未來七天多為順利日，宜把握行動。`;
  if (unf >= 4) return `未來七天多為保守日，宜穩守等待。`;
  return `未來七天順與不順交替，重點日請參考下方細節。`;
}
