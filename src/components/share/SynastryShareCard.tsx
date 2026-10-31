// src/components/share/SynastryShareCard.tsx
// [AI MOD] 合盤分享卡（品牌化）— 一個人分享＝兩個人進來（裂變）
// 一律 inline hex/rgba（html2canvas 不支援 oklch()）
import type { CSSProperties } from 'react';

const C = {
  bg: '#080c0a',
  card: 'rgba(15, 40, 25, 0.85)',
  border: 'rgba(212, 168, 83, 0.28)',
  borderSoft: 'rgba(212, 168, 83, 0.14)',
  gold: '#d4a853',
  text: '#f5f0e8',
  muted: '#a89b84',
  rose: '#c45c5c',
};

interface SynastryShareCardProps {
  myName: string;
  partnerName: string;
  score: number;
  headline: string;
  myDayMaster: string;
  partnerDayMaster: string;
  myPillar: string;
  partnerPillar: string;
  details: { factor: string; desc: string }[];
  siteUrl: string;
  showPrivateDetails?: boolean;
}

export default function SynastryShareCard({
  myName,
  partnerName,
  score,
  headline,
  myDayMaster,
  partnerDayMaster,
  myPillar,
  partnerPillar,
  details,
  siteUrl,
  showPrivateDetails = false,
}: SynastryShareCardProps) {
  const serif: CSSProperties = {
    fontFamily: '"Noto Serif TC", "Songti TC", "PingFang TC", serif',
  };
  const sans: CSSProperties = {
    fontFamily:
      '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
  };

  return (
    <div
      style={{
        width: 720,
        minHeight: 660,
        background: C.bg,
        backgroundImage: `linear-gradient(160deg, ${C.borderSoft} 0%, rgba(8, 12, 10, 0) 45%)`,
        padding: '48px 44px 36px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        color: C.text,
        ...serif,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: C.gold,
            letterSpacing: 4,
          }}
        >
          八字能量日誌
        </div>
        <div
          style={{ fontSize: 13, color: C.muted, letterSpacing: 2, ...sans }}
        >
          合盤報告
        </div>
      </div>

      <div style={{ height: 1, background: C.border }} />

      {/* 雙方 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          paddingTop: 8,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>
            {showPrivateDetails ? myName || '我' : '我'}
          </div>
          {showPrivateDetails && (
            <div
              style={{ fontSize: 15, color: C.muted, marginTop: 8, ...sans }}
            >
              日主 {myDayMaster}・{myPillar}
            </div>
          )}
        </div>
        <div style={{ fontSize: 34, color: C.gold }}>×</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>
            {showPrivateDetails ? partnerName || 'TA' : '夥伴'}
          </div>
          {showPrivateDetails && (
            <div
              style={{ fontSize: 15, color: C.muted, marginTop: 8, ...sans }}
            >
              日主 {partnerDayMaster}・{partnerPillar}
            </div>
          )}
        </div>
      </div>

      {/* 契合度 */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: '26px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{ fontSize: 15, color: C.muted, letterSpacing: 3, ...sans }}
        >
          五行磁場契合度
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 700,
            color: C.gold,
            lineHeight: 1.15,
            marginTop: 6,
          }}
        >
          {score}%
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
          {headline}
        </div>
      </div>

      {/* 關鍵發現 */}
      {details.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {details.slice(0, 2).map((detail, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.gold,
                  ...sans,
                }}
              >
                {detail.factor}
              </div>
              <div
                style={{
                  fontSize: 18,
                  lineHeight: 1.6,
                  marginTop: 6,
                  color: C.text,
                }}
              >
                {detail.desc}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div
        style={{
          borderTop: `1px solid ${C.borderSoft}`,
          paddingTop: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 13, color: C.muted, ...sans }}>
          ※ 本頁面分析皆基於八字命理學說
        </div>
        <div style={{ fontSize: 14, color: C.gold, ...sans }}>
          {siteUrl.replace(/^https?:\/\//, '')}
        </div>
      </div>
    </div>
  );
}
