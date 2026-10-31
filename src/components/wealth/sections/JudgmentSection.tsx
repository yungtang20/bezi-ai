// src/components/wealth/sections/JudgmentSection.tsx
// 命盤十神分布 — 我是怎麼判斷的。
// 所有數值與 src/data 僅讀引用，不改動邏輯。
import React from 'react';
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from '../../../components/shared';
import { TEN_GOD_TRAITS, wealthCareers } from '../../../data';

const MAX_ACTIONS = 3;

interface JudgmentSectionProps {
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

export default function JudgmentSection({
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
}: JudgmentSectionProps) {
  const total = Object.values(tenGodCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* 十神分布總覽 */}
      <ContentSection
        defaultOpen
        grammar={makeSection(
          '命盤十神分布總覽',
          2,
          `命盤共 ${total} 位十神，${topGod1} 出現 ${topCount1} 次為最多，${topGod2} 出現 ${topCount2} 次為次多。`,
          {
            evidence: (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {sortedTenGods.map(([god, count]) => {
                  const t = TEN_GOD_TRAITS[god];
                  return (
                    <ReasoningCard
                      key={god}
                      label={`${god}（${count} 位，${((count / total) * 100).toFixed(0)}%）`}
                      variant="default"
                    >
                      {t ? (
                        <p className="text-xs text-zen-text leading-relaxed">
                          {t.trait}
                        </p>
                      ) : (
                        <p className="text-xs text-zen-muted">無特質說明</p>
                      )}
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: '先天命盤固定，長期適用；大運與流年臨旺時效果更明顯。',
            actions: [
              '確認主星十神類型',
              '對照各十神特質',
              '評估強弱與格局',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 主次十神 */}
      <ContentSection
        grammar={makeSection(
          '主次十神與格局判斷',
          3,
          `${topGod1} 為主星（${topCount1} 位），${topGod2} 為次星（${topCount2} 位），格局為 ${patternLabel}。`,
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="主星" variant="accent">
                  <p className="text-xs text-zen-text">
                    {topGod1} 出現 {topCount1}{' '}
                    次，為命盤最強勢的十神，代表你最習慣、最常使用的能量模式。
                  </p>
                </ReasoningCard>
                <ReasoningCard label="次星" variant="muted">
                  <p className="text-xs text-zen-text">
                    {topGod2} 出現 {topCount2}{' '}
                    次，為次要輔助能量，與主星共同塑造性格與行事風格。
                  </p>
                </ReasoningCard>
                {isContinuum ? (
                  <ReasoningCard label="從格" variant="default">
                    <p className="text-xs text-zen-text">
                      命盤為從格（{patternLabel}
                      ），日主極端強弱，十神能量貫通，以順勢為吉。
                    </p>
                  </ReasoningCard>
                ) : null}
              </div>
            ),
            timeWindow: '先天格局固定，以大運與流年臨旺時效果更明顯。',
            actions: ['確認主次十神', '對照格局判斷', '觀察大運流年透出'].slice(
              0,
              MAX_ACTIONS
            ),
          }
        )}
      />

      {/* 日主強弱 */}
      <ContentSection
        grammar={makeSection(
          '日主強弱判斷',
          3,
          isStrong
            ? '日主身強，宜用官殺財星食傷瀉秀；忌比劫印星扶助。'
            : isWeak
              ? '日主身弱，宜用印星比劫扶身；忌官殺財星食傷瀉氣。'
              : '日主中和，無極端強弱，以中庸為貴。',
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard
                  label={
                    isStrong ? '身強命盤' : isWeak ? '身弱命盤' : '中和命盤'
                  }
                  variant={isStrong ? 'accent' : isWeak ? 'muted' : 'default'}
                >
                  <p className="text-xs text-zen-text leading-relaxed">
                    {isStrong
                      ? '日主得令、得地、得生，力量充沛，需瀉、剋、耗來平衡。'
                      : isWeak
                        ? '日主失令、失地、無生扶，力量不足，需印星化殺或比劫扶身。'
                        : '日主強弱適中，十神能量平衡，格局較為穩定。'}
                  </p>
                </ReasoningCard>
                <ReasoningCard label="建議方向" variant="default">
                  <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                    {isStrong
                      ? [
                          '官殺管制、財星耗氣、食傷瀉秀為用。',
                          '忌比劫扶助、印星生扶，恐過強失衡。',
                        ]
                      : isWeak
                        ? [
                            '印星化殺生身、比劫扶助同類為用。',
                            '忌官殺剋身、財星耗氣、食傷瀉氣，恐過弱不堪。',
                          ]
                        : [
                            '十神能量中和，格局穩定，無極端忌用。',
                            '隨大運流年補強較弱之五行即可。',
                          ]}
                  </ul>
                </ReasoningCard>
              </div>
            ),
            timeWindow: '先天命盤固定，大運與流年五行臨旺時強弱會有動態變化。',
            actions: [
              '確認日主強弱',
              '對照用神與忌神',
              '監控大運流年變化',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      {/* 各十神職業對照 */}
      <ContentSection
        grammar={makeSection(
          '十神得財模式與適合職業',
          3,
          '各十神代表不同得財模式與適合職業，以命盤主次十神為參考。',
          {
            evidence: (
              <div className="grid gap-3">
                {sortedTenGods.map(([god]) => {
                  const role = wealthCareers.find(
                    (wc) => wc.tenGodName === god
                  );
                  if (!role) return null;
                  return (
                    <ReasoningCard key={god} label={`${god}`} variant="default">
                      <p className="text-xs text-zen-text">
                        得財風格：{role.wealthStyle}
                      </p>
                      <p className="text-xs text-zen-muted">
                        適合職業：{role.suitableCareers}
                      </p>
                      <p className="text-xs text-zen-accent mt-1">
                        合作建議：{role.partnerAdvice}
                      </p>
                    </ReasoningCard>
                  );
                })}
              </div>
            ),
            timeWindow: '依命盤主次十神判斷，長期適用。',
            actions: [
              '確認主次十神類型',
              '對照適合職業與得財風格',
              '評估合作夥伴條件',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />

      <UncertaintyNotice>
        十神分布與強弱判斷依命盤先天結構推斷，實際人生走向尚受後天大運、流年與個人選擇影響，僅供參考，非絕對斷語。
      </UncertaintyNotice>
    </div>
  );
}
