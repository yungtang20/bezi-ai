// src/components/romance/sections/SynastrySection.tsx
// 合盤適配判定 — 與伴侶命盤的五行與十神適配分析。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from '../../../components/shared';
import { PARTNER_MATCHING_DATA, getTenGodCategory } from '../../../data';
import type { BaziChart } from '@bezi/core';
import type { PartnerInfo } from '../../../types';

const MAX_ACTIONS = 3;

interface SynastrySectionProps {
  chart: BaziChart;
  primaryPattern: string;
  partners: PartnerInfo[];
}

export default function SynastrySection({
  chart,
  primaryPattern,
  partners,
}: SynastrySectionProps) {
  const userElement = chart.dayMaster;
  const partner = partners?.[0];
  const partnerChart = partner?.chart;

  const sections = [
    makeSection(
      '合盤適配總覽',
      2,
      partner
        ? `與 ${partner.name ?? '伴侶'} 的合盤適配：日主五行 ${userElement}，${primaryPattern} 格局。`
        : '未提供伴侶命盤，無法進行合盤適配判定。',
      {
        evidence: partner ? (
          <ReasoningCard label="雙方日主" variant="default">
            <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
              <li>
                本命日主：{userElement}（{chart.gender}）
              </li>
              <li>
                伴侶日主：{partnerChart?.dayMaster ?? '—'}（
                {partner.gender ?? '—'}）
              </li>
              <li>本命格局：{primaryPattern}</li>
            </ul>
          </ReasoningCard>
        ) : (
          <ReasoningCard label="合盤適配" variant="muted">
            <p className="text-xs text-zen-text">
              請在伴侶資料頁面輸入伴侶八字，即可進行合盤適配判定。
            </p>
          </ReasoningCard>
        ),
        timeWindow: '先天命盤固定，長期適用；大運流年臨合局時適配更明顯。',
        actions: partner
          ? [
              '確認雙方日主五行屬性',
              '對照五行互補規則',
              '觀察十神適配與衝合',
            ].slice(0, MAX_ACTIONS)
          : ['補入伴侶八字資料', '重新檢視合盤適配'].slice(0, MAX_ACTIONS),
      }
    ),
    makeSection(
      '五行能量互補',
      3,
      partner
        ? `雙方日主五行 ${userElement} 與 ${partnerChart?.dayMaster ?? '—'}${
            userElement === partnerChart?.dayMaster
              ? '，五行相同，相處如鏡像'
              : '，可能形成互補'
          }。`
        : '需先提供伴侶命盤。',
      {
        evidence: partner ? (
          <ReasoningCard label="五行關係" variant="default">
            <p className="text-xs text-zen-text leading-relaxed">
              {userElement === partnerChart?.dayMaster
                ? '雙方日主五行相同，兩人相處起來會向照鏡子一樣，比較能心電感應對方的想法。'
                : `日主五行 ${userElement} 與 ${partnerChart?.dayMaster ?? '—'} 互為生剋關係，建議詳細檢視五行強弱互補情況。`}
            </p>
          </ReasoningCard>
        ) : (
          <ReasoningCard label="五行關係" variant="muted">
            <p className="text-xs text-zen-text">需先提供伴侶命盤。</p>
          </ReasoningCard>
        ),
        timeWindow: '先天命盤固定，長期適用。',
        actions: [
          '確認雙方日主五行',
          '對照五行生剋關係',
          '評估能量互補程度',
        ].slice(0, MAX_ACTIONS),
      }
    ),
    makeSection(
      '十神適配模式',
      3,
      partner
        ? '依據雙方十神類型判斷適配模式與相處建議。'
        : '需先提供伴侶命盤。',
      {
        evidence: partner ? (
          <ReasoningCard label="十神類別" variant="default">
            <p className="text-xs text-zen-text">
              本命十神類別：{getTenGodCategory(userElement) ?? '—'}
              ；伴侶十神類別：$
              {partnerChart?.dayMaster
                ? (getTenGodCategory(partnerChart.dayMaster) ?? '—')
                : '—'}
              。
            </p>
            <p className="text-xs text-zen-muted mt-1">
              {PARTNER_MATCHING_DATA.TEN_GODS_MATCHING['財星']?.pros?.slice(
                0,
                40
              ) ?? ''}
            </p>
          </ReasoningCard>
        ) : (
          <ReasoningCard label="十神類別" variant="muted">
            <p className="text-xs text-zen-text">需先提供伴侶命盤。</p>
          </ReasoningCard>
        ),
        timeWindow: '先天命盤固定，長期適用。',
        actions: [
          '確認雙方十神類型',
          '對照十神適配模式',
          '評估相處優勢與風險',
        ].slice(0, MAX_ACTIONS),
      }
    ),
    makeSection(
      '生肖六合與三合',
      3,
      partner
        ? `雙方生肖 ${chart.zodiac} 與 ${partnerChart?.zodiac ?? '—'}${
            chart.zodiac === partnerChart?.zodiac ? '，生肖相同' : ''
          }。`
        : '需先提供伴侶命盤。',
      {
        evidence: partner ? (
          <ReasoningCard label="生肖關係" variant="default">
            <p className="text-xs text-zen-text">
              本命生肖：{chart.zodiac}；伴侶生肖：{partnerChart?.zodiac ?? '—'}
              。 生肖三合/六合代表雙方前世有善緣，更容易接納彼此的價值觀。
            </p>
          </ReasoningCard>
        ) : (
          <ReasoningCard label="生肖關係" variant="muted">
            <p className="text-xs text-zen-text">需先提供伴侶命盤。</p>
          </ReasoningCard>
        ),
        timeWindow: '先天命盤固定，長期適用。',
        actions: ['確認雙方生肖', '對照生肖三合與六合', '評估緣分淺深'].slice(
          0,
          MAX_ACTIONS
        ),
      }
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-rose-400 font-mono">05.</span> 合盤適配判定
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依據雙方命盤五行、十神與生肖，評估<strong>合盤適配</strong>：
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        合盤適配依雙方命盤五行與生肖推斷，實際感情關係仍受後天經營與個人選擇影響，僅供參考，非絕對斷言。
      </UncertaintyNotice>
    </div>
  );
}
