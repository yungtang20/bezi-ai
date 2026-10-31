// src/components/wealth/sections/InherentSection.tsx
// 先天財富特質 — 命盤十神分布與日主強弱判斷（不論身強身弱，僅呈現命盤原始特質）。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  type SectionGrammar,
  makeSection,
} from '../../../components/shared';
import { TEN_GOD_TRAITS } from '../../../data';

const MAX_ACTIONS = 3;

interface InherentSectionProps {
  tenGodCounts: Record<string, number>;
  sortedTenGods: [string, number][];
  topGod1: string;
  topCount1: number;
  topGod2: string;
  topCount2: number;
  isContinuum: boolean;
  patternLabel: string;
  isStrong: boolean;
  isWeak: boolean;
}

export function InherentSection({
  tenGodCounts,
  sortedTenGods,
  topGod1,
  topCount1,
  topGod2,
  topCount2,
  isContinuum,
  patternLabel,
  isStrong,
  isWeak,
}: InherentSectionProps) {
  const hasWealthStars =
    topGod1 === '正財' ||
    topGod1 === '偏財' ||
    topGod2 === '正財' ||
    topGod2 === '偏財';
  const topGodTrait = TEN_GOD_TRAITS[topGod1];
  const secGodTrait = TEN_GOD_TRAITS[topGod2];

  const sections: SectionGrammar[] = [
    makeSection(
      '我是怎麼判斷的：命盤十神分布',
      2,
      `命盤中出現次數最多的十神是 ${topGod1}（${topCount1} 個），其次是 ${topGod2}（${topCount2} 個）。日主 ${
        isStrong ? '身強' : isWeak ? '身弱' : '中和'
      }${isContinuum ? '，為從格（從強/從弱）' : '，非從格'}。`,
      {
        evidence: (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sortedTenGods.slice(0, 4).map(([god, count]) => {
              const trait = TEN_GOD_TRAITS[god];
              return (
                <ReasoningCard
                  key={god}
                  label={`${god} × ${count}`}
                  variant="default"
                >
                  <p className="text-xs text-zen-text">{trait?.trait ?? '—'}</p>
                </ReasoningCard>
              );
            })}
          </div>
        ),
        timeWindow: '先天命盤固定，長期適用。',
        actions: [
          '確認日主天干與五行屬性',
          '統計命盤十神類型與出現次數',
          '判斷日主強弱與格局',
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          '十神分布僅反映命盤原始特質，實際財富表現仍受大運、流年與個人選擇影響，僅供參考，非斷言。',
      }
    ),
    makeSection(
      '主星十神特質',
      3,
      `首要十神 ${topGod1} 代表您先天最慣用的財富模式：${topGodTrait?.trait ?? '—'}`,
      {
        evidence: (
          <ReasoningCard
            label={`${topGod1}（${topCount1} 個）`}
            variant="default"
          >
            <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
              <li>出現次數：{topCount1}</li>
              <li>類別：{topGodTrait?.category ?? '—'}</li>
              <li>物象：{topGodTrait?.image ?? '—'}</li>
            </ul>
          </ReasoningCard>
        ),
        timeWindow: '先天固定，長期適用。',
        actions: [
          `深入了解 ${topGod1} 特質`,
          '對照得財風格與適合職業',
          '評估主星十神強弱',
        ].slice(0, MAX_ACTIONS),
      }
    ),
    makeSection(
      '次要十神輔助',
      3,
      `次要十神 ${topGod2}（${topCount2} 個）為輔助財富模式，與 ${topGod1} 共同構成先天財富特質。`,
      {
        evidence: (
          <ReasoningCard
            label={`${topGod2}（${topCount2} 個）`}
            variant="muted"
          >
            <p className="text-xs text-zen-text">{secGodTrait?.trait ?? '—'}</p>
          </ReasoningCard>
        ),
        timeWindow: '先天固定，長期適用。',
        actions: [
          `了解 ${topGod2} 特質`,
          '觀察兩者互動與衝合',
          '評估組合財富模式',
        ].slice(0, MAX_ACTIONS),
      }
    ),
    makeSection(
      '日主強弱與格局',
      3,
      `日主 ${
        isStrong
          ? '身強，宜用傷官食神泄秀、財星生官殺。'
          : isWeak
            ? '身弱，宜用印星生身、比肩劫財扶助。'
            : '中和，喜忌需視五行平衡與流年而定。'
      }${isContinuum ? ` 格局：${patternLabel}，順勢而為。` : ''}`,
      {
        evidence: (
          <div className="space-y-2">
            <ReasoningCard
              label="強弱判斷"
              variant={isStrong ? 'default' : isWeak ? 'muted' : 'accent'}
            >
              <p className="text-xs text-zen-text">
                {isStrong
                  ? '身強命盤，宜用傷官食神泄秀、財星生官殺。'
                  : isWeak
                    ? '身弱命盤，宜用印星生身、比肩劫財扶助。'
                    : '日主中和，喜忌需視五行平衡與流年而定。'}
              </p>
            </ReasoningCard>
            {isContinuum ? (
              <ReasoningCard label="格局判斷" variant="accent">
                <p className="text-xs text-zen-text">
                  {patternLabel}（從格），順勢而為，不宜強行扶抑。
                </p>
              </ReasoningCard>
            ) : null}
          </div>
        ),
        timeWindow: '先天命盤固定，大運流年可強化或削弱其表現。',
        actions: [
          '確認日主強弱狀態',
          '對照用神與忌神',
          '選擇適合求財途徑',
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          '強弱與格局判斷依命盤五行生剋推斷，不同流派有差異，僅供參考，非絕對斷言。',
      }
    ),
    makeSection(
      '先天財富特質綜合',
      3,
      `綜合 ${topGod1}、${topGod2} 與日主強弱狀態，您的先天財富特質傾向於 ${
        hasWealthStars
          ? '財星透出，有直接求財管道'
          : '無直接財星，宜透過食傷生財或官星管道得財'
      }。`,
      {
        evidence: (
          <ReasoningCard label="綜合判斷" variant="default">
            <p className="text-xs text-zen-text leading-relaxed">
              命盤十神以 {topGod1} 為主、{topGod2} 為輔，日主 $
              {isStrong ? '身強' : isWeak ? '身弱' : '中和'}$
              {isContinuum ? '，為從格' : ''}
              。財富獲得方式應順應命盤原始特質，勿強求不合之財。
            </p>
          </ReasoningCard>
        ),
        timeWindow: '先天固定，長期適用。',
        actions: [
          '確認主輔十神類型',
          '對照適合求財途徑',
          '避免與命盤忌神衝突',
        ].slice(0, MAX_ACTIONS),
      }
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-yellow-400 font-mono">05.</span> 先天財富特質
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依據命盤十神分布與日主強弱，推演出您的<strong>先天財富特質</strong>
        （不論身強或身弱，僅呈現命盤原始特質）：
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        先天財富特質依命盤十神分布與日主五行推斷，實際財務狀況尚受大運、流年、學歷、經驗、市場與個人選擇影響，僅供參考，非投資建議。
      </UncertaintyNotice>
    </div>
  );
}
