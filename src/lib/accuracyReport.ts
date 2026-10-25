// src/lib/accuracyReport.ts — 準確率報告（把引擎數字變成「有感」的報告）
import {
  calculateCategoryAccuracy,
  DAY_TYPE_FIELDS,
  CATEGORY_LABELS,
  type CategoryAccuracy,
} from '../calibration';
import type { DailyLog } from '../storage';

export type AccuracyLevel = '未開始' | '累積中' | '初步觀察' | '待持續觀察' | '多數吻合' | '高度吻合';

export interface AccuracyReport {
  accuracy: number;              // 整體吻合度 0-100
  matches: number;               // 方向吻合筆數
  samples: number;               // 可評估樣本數
  checkedDays: number;           // 打卡天數
  level: AccuracyLevel;
  headline: string;              // 大標題
  summary: string;               // 一句話說明
  categories: CategoryAccuracy[];// 分領域明細（僅含有效樣本者）
}

const LEVELS: { min: number; level: AccuracyLevel; headline: string; summary: string }[] = [
  { min: 80, level: '高度吻合', headline: '近期紀錄多數吻合', summary: '目前紀錄與命理規則的方向高度一致。' },
  { min: 60, level: '多數吻合', headline: '近期紀錄多數吻合', summary: '目前多數可評估紀錄與命理規則的方向一致。' },
  { min: 0, level: '待持續觀察', headline: '近期紀錄仍有差異', summary: '目前紀錄與命理規則的方向不完全一致，可持續觀察。' },
];

export function buildAccuracyReport(logs: DailyLog[]): AccuracyReport {
  const sorted = [...logs].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const categories = calculateCategoryAccuracy(logs);
  const samples = categories.reduce((sum, item) => sum + item.total, 0);
  const matches = categories.reduce((sum, item) => sum + item.match, 0);
  const accuracy = samples > 0 ? Math.round((matches / samples) * 100) : 0;
  const checkedDays = logs.length;

  if (samples === 0) {
    // 有紀錄但無法評估 → 提示當天十神對應的領域，讓使用者知道該記錄哪一項
    const latest = sorted[sorted.length - 1];
    const fields = latest ? DAY_TYPE_FIELDS[latest.dayTenGodType || ''] : undefined;
    const pendingLabel = fields?.length ? CATEGORY_LABELS[fields[0]] : null;
    return {
      accuracy: 0,
      matches: 0,
      samples: 0,
      checkedDays,
      level: '未開始',
      headline: '還沒有足夠的記錄',
      summary: pendingLabel && latest?.dayTenGodType
        ? `今天屬「${latest.dayTenGodType}」日，只要記錄「${pendingLabel}」的感受就能開始計算吻合度。`
        : '完成 10 秒心流紀錄，就能開始比較實際感受與命理規則。',
      categories: [],
    };
  }

  if (samples < 3) {
    return {
      accuracy,
      matches,
      samples,
      checkedDays,
      level: '累積中',
      headline: '正在累積可評估紀錄',
      summary: `目前有 ${matches}/${samples} 筆方向吻合。累積至少 3 筆後顯示初步比例。`,
      categories: categories.filter(item => item.total > 0),
    };
  }

  if (samples < 7) {
    return {
      accuracy,
      matches,
      samples,
      checkedDays,
      level: '初步觀察',
      headline: '這是初步吻合度',
      summary: `目前有 ${matches}/${samples} 筆方向吻合；樣本仍少，累積 7 筆後再看趨勢較合適。`,
      categories: categories.filter(item => item.total > 0),
    };
  }

  const matched = LEVELS.find(level => accuracy >= level.min) || LEVELS[LEVELS.length - 1];
  const best = [...categories].filter(item => item.total > 0).sort((a, b) => b.accuracy - a.accuracy)[0];

  return {
    accuracy,
    matches,
    samples,
    checkedDays,
    level: matched.level,
    headline: matched.headline,
    summary: best && best.accuracy > 0
      ? `${matched.summary}目前「${best.label}」的紀錄吻合度最高。`
      : matched.summary,
    categories: categories.filter(item => item.total > 0),
  };
}
