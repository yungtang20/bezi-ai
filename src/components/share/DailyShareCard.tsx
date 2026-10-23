// src/components/share/DailyShareCard.tsx
// [AI MOD] 今日運勢分享卡（品牌化）
// ⚠️ 樣式一律使用 inline hex/rgba：html2canvas 不支援 Tailwind v4 的 oklch()/lab() 色彩函式，
//    若使用 Tailwind 色票工具類會導致擷取失敗。
import type { CSSProperties } from 'react';

const C = {
  bg: '#080c0a',
  surface: '#0f1a14',
  card: 'rgba(15, 40, 25, 0.85)',
  border: 'rgba(212, 168, 83, 0.28)',
  borderSoft: 'rgba(212, 168, 83, 0.14)',
  gold: '#d4a853',
  goldDim: 'rgba(212, 168, 83, 0.16)',
  jade: '#2d8a5e',
  text: '#f5f0e8',
  muted: '#a89b84',
  rose: '#c45c5c',
  blue: '#3b82f6',
};

const ELEMENT_COLOR: Record<string, string> = {
  木: '#4ade80',
  火: '#f87171',
  土: '#fbbf24',
  金: '#cbd5e1',
  水: '#60a5fa',
};

interface OutcomeTone {
  bg: string;
  fg: string;
  border: string;
}

interface DailyShareCardProps {
  name?: string;
  dateLabel: string;
  lunarDate: string;
  ganZhi: string;
  tenGod: string;
  outcomeLabel: string;
  outcomeTone: OutcomeTone;
  advice: string;
  favorable: string[];
  weakestElement: string;
  dayMaster: string;
  siteUrl: string;
  showPrivateDetails?: boolean;
}

export default function DailyShareCard({
  name,
  dateLabel,
  lunarDate,
  ganZhi,
  tenGod,
  outcomeLabel,
  outcomeTone,
  advice,
  favorable,
  weakestElement,
  dayMaster,
  siteUrl,
  showPrivateDetails = false,
}: DailyShareCardProps) {
  const serif: CSSProperties = { fontFamily: '"Noto Serif TC", "Songti TC", "PingFang TC", serif' };
  const sans: CSSProperties = { fontFamily: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif' };

  return (
    <div
      style={{
        width: 720,
        minHeight: 660,
        background: C.bg,
        backgroundImage: `linear-gradient(160deg, ${C.goldDim} 0%, rgba(8, 12, 10, 0) 42%)`,
        padding: '48px 44px 36px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
        color: C.text,
        ...serif,
      }}
    >
      {/* 品牌列 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.gold, letterSpacing: 4 }}>八字能量日誌</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, letterSpacing: 2, ...sans }}>順應自然週期的個人觀測系統</div>
        </div>
        <div style={{ fontSize: 13, color: C.muted, textAlign: 'right', ...sans }}>
          {dateLabel}
          <div style={{ marginTop: 4, color: C.gold }}>{lunarDate}</div>
        </div>
      </div>

      <div style={{ height: 1, background: C.border }} />

      {/* 姓名 + 運勢 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 24,
            border: `2px solid ${outcomeTone.border}`,
            background: outcomeTone.bg,
            color: outcomeTone.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 46,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {outcomeLabel}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3 }}>
            {showPrivateDetails && name ? `${name} 的今日運勢` : '我的今日運勢'}
          </div>
          {showPrivateDetails && <div style={{ fontSize: 19, color: C.muted, marginTop: 10, ...sans }}>
            {ganZhi}・日主十神屬「{tenGod}」
          </div>}
          {showPrivateDetails && (
            <div style={{ fontSize: 19, color: C.muted, marginTop: 4, ...sans }}>
              日主 {dayMaster}　最弱五行 {weakestElement}
            </div>
          )}
        </div>
      </div>

      {/* 喜用神 */}
      {showPrivateDetails && favorable.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, color: C.muted, letterSpacing: 2, ...sans }}>喜用五行</span>
          {favorable.map(element => (
            <span
              key={element}
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                color: ELEMENT_COLOR[element] || C.text,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              {element}
            </span>
          ))}
        </div>
      )}

      {/* 建議 */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.borderSoft}`,
          borderRadius: 18,
          padding: '24px 26px',
          fontSize: 20,
          lineHeight: 1.7,
          color: C.text,
        }}
      >
        {advice}
      </div>

      <div style={{ flex: 1 }} />

      {/* 頁尾 */}
      <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: C.muted, ...sans }}>✱ 本頁面分析皆基於八字命理學說</div>
        <div style={{ fontSize: 14, color: C.gold, ...sans }}>{siteUrl.replace(/^https?:\/\//, '')}</div>
      </div>
    </div>
  );
}
