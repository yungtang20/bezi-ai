// src/lib/accuracyReport.ts — 準確率報告（把引擎數字變成「有感」的報告）
import {
  calculateCategoryAccuracy,
  DAY_TYPE_FIELDS,
  CATEGORY_LABELS,
  type CategoryAccuracy,
} from '../calibration';
import type { DailyLog } from '../storage';

export type AccuracyLevel = '未開始' | '仍在學習' | '逐漸熟悉' | '默契漸長' | '心有靈犀';

export interface AccuracyReport {
  accuracy: number;              // 整體吻合度 0-100
  samples: number;               // 可評估樣本數
  checkedDays: number;           // 打卡天數
  level: AccuracyLevel;
  headline: string;              // 大標題
  summary: string;               // 一句話說明
  categories: CategoryAccuracy[];// 分領域明細（僅含有效樣本者）
}

const LEVELS: { min: number; level: AccuracyLevel; headline: string; summary: string }[] = [
  { min: 80, level: '心有靈犀', headline: 'AI 已經懂你了', summary: '命中率高達八成以上——你的命理模型正在成形。' },
  { min: 60, level: '默契漸長', headline: '越來越準了', summary: '多數預測與你的實際感受相符，模型正在收斂。' },
  { min: 40, level: '逐漸熟悉', headline: '正在認識你', summary: '持續記錄能讓預測更貼近你的真實體驗。' },
  { min: 1, level: '仍在學習', headline: '剛開始學習', summary: '再累積幾次記錄，AI 就會抓到你的節奏。' },
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
      samples: 0,
      checkedDays,
      level: '未開始',
      headline: '還沒有足夠的記錄',
      summary: pendingLabel && latest?.dayTenGodType
        ? `今天屬「${latest.dayTenGodType}」日，只要記錄「${pendingLabel}」的感受就能開始計算吻合度。`
        : '完成 10 秒心流紀錄，AI 就會開始學習你的節奏。',
      categories: [],
    };
  }

  const matched = LEVELS.find(level => accuracy >= level.min) || LEVELS[LEVELS.length - 1];
  const best = [...categories].filter(item => item.total > 0).sort((a, b) => b.accuracy - a.accuracy)[0];

  return {
    accuracy,
    samples,
    checkedDays,
    level: matched.level,
    headline: matched.headline,
    summary: best && best.accuracy > 0
      ? `${matched.summary}目前以「${best.label}」最準。`
      : matched.summary,
    categories: categories.filter(item => item.total > 0),
  };
}
