// src/lib/shareText.ts — 分享文案（純函式，方便單元測試）

export interface DailyShareInfo {
  name?: string;
  outcomeLabel: string;
  ganZhi: string;
  tenGod: string;
  dateLabel: string;
  advice: string;
  favorable: string[];
  weakestElement: string;
}

export interface SynastryShareInfo {
  myName: string;
  partnerName: string;
  score: number;
  myDayMaster: string;
  partnerDayMaster: string;
  topFactor?: string;
  topDesc?: string;
}

export const SHARE_BRAND = '八字能量日誌';

/** 今日運勢分享文案 */
export function buildDailyShareText(info: DailyShareInfo, url: string): string {
  const title = info.name ? `${info.name} 的今日運勢` : '我的今日運勢';
  const lines = [
    `【${SHARE_BRAND}】${title}`,
    `${info.dateLabel}　${info.ganZhi}・${info.tenGod}　運勢：${info.outcomeLabel}`,
    info.advice,
  ];
  if (info.favorable.length > 0) lines.push(`喜用五行：${info.favorable.join('、')}`);
  lines.push(`👉 立即排我的命盤：${url}`);
  return lines.filter(line => line.trim().length > 0).join('\n');
}

/** 合盤分享文案 */
export function buildSynastryShareText(info: SynastryShareInfo, url: string): string {
  const lines = [
    `【${SHARE_BRAND}】${info.myName} × ${info.partnerName} 合盤契合度 ${info.score}%`,
    `日主：${info.myDayMaster} × ${info.partnerDayMaster}`,
  ];
  if (info.topFactor) lines.push(`${info.topFactor}：${info.topDesc || ''}`);
  lines.push(`👉 測試我們的合盤：${url}`);
  return lines.filter(line => line.trim().length > 0).join('\n');
}

/** LINE 分享連結（免 API key） */
export function buildLineShareUrl(text: string): string {
  return `https://line.me/R/msg/text/?text=${encodeURIComponent(text)}`;
}

/** 依契合度給出標語 */
export function synastryHeadline(score: number): string {
  if (score >= 85) return '天作之合';
  if (score >= 70) return '相當合拍';
  if (score >= 55) return '互補有道';
  if (score >= 40) return '有合有磨';
  return '需要磨合';
}
