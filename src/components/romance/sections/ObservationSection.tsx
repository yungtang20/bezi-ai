// src/components/romance/sections/ObservationSection.tsx
// 姻緣觀測分析 — 夫妻宮衝刑害與日主五行姻緣觀測。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from 'react';
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from '../../../components/shared';
import { ZHI_TO_ZODIAC } from '../../../data';
import type { BaziChart } from '@bezi/core';

const MAX_ACTIONS = 3;

interface ObservationSectionProps {
  chart: BaziChart;
  monthZhi: string;
  hourZhi: string;
  yearZhi: string;
  dayBranch: string;
  hasClash: boolean;
  hasPunishment: boolean;
  hasHarm: boolean;
  spouseStarHasClash: boolean;
  spouseStarHasPunishment: boolean;
  dayMasterElement: string;
  isMale: boolean;
}

export default function ObservationSection({
  chart,
  monthZhi,
  hourZhi,
  yearZhi,
  dayBranch,
  hasClash,
  hasPunishment,
  hasHarm,
  spouseStarHasClash,
  spouseStarHasPunishment,
  dayMasterElement,
  isMale,
}: ObservationSectionProps) {
  const zodiac = ZHI_TO_ZODIAC[dayBranch];
  const userZodiac = chart.zodiac;

  return (
    <div className="space-y-6">
      <ContentSection
        defaultOpen
        grammar={makeSection(
          '夫妻宮衝刑害觀測',
          2,
          `夫妻宮 ${dayBranch}（${zodiac ?? '—'} 年）與月柱 ${monthZhi}、時柱 ${hourZhi} 的關係：${
            hasClash || hasPunishment || hasHarm
              ? '存在衝刑害互動，感情易有波動。'
              : '無明顯衝刑害，感情宮位相對穩定。'
          }`,
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="夫妻宮" variant="default">
                  <p className="text-xs text-zen-text">
                    地支 {dayBranch}，對應生肖 {zodiac ?? '—'}，日主五行{' '}
                    {dayMasterElement}（${isMale ? '男' : '女'}命）。
                  </p>
                </ReasoningCard>
                <ReasoningCard label="鄰近柱位" variant="muted">
                  <p className="text-xs text-zen-text">
                    年柱地支 {yearZhi}，月柱地支 {monthZhi}，時柱地支 {hourZhi}
                    。
                  </p>
                </ReasoningCard>
                {hasClash ? (
                  <ReasoningCard label="相沖" variant="accent">
                    <p className="text-xs text-zen-text">
                      夫妻宮與鄰近地支相沖，易晚婚或對象在外地認識，感情易有變動。
                    </p>
                  </ReasoningCard>
                ) : null}
                {hasPunishment ? (
                  <ReasoningCard label="相刑" variant="accent">
                    <p className="text-xs text-zen-text">
                      夫妻宮與鄰近地支相刑，易口角爭執，需多磨合相處。
                    </p>
                  </ReasoningCard>
                ) : null}
                {hasHarm ? (
                  <ReasoningCard label="相害" variant="muted">
                    <p className="text-xs text-zen-text">
                      夫妻宮與鄰近地支相害，影響夫妻關係，易產生摩擦。
                    </p>
                  </ReasoningCard>
                ) : null}
                {!hasClash && !hasPunishment && !hasHarm ? (
                  <ReasoningCard label="無明顯衝刑害" variant="default">
                    <p className="text-xs text-zen-text">
                      夫妻宮與鄰近地支無明顯衝、刑、害關係，感情宮位相對穩定。
                    </p>
                  </ReasoningCard>
                ) : null}
              </div>
            ),
            timeWindow: '先天命盤固定，大運流年臨沖刑害年份時效果更明顯。',
            actions: [
              '確認夫妻宮地支屬性',
              '檢視衝刑害與鄰近柱位',
              '評估感情穩定性與變動時機',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <ContentSection
        grammar={makeSection(
          '夫妻星衝刑觀測',
          3,
          `夫妻星與鄰近地支的關係：${
            spouseStarHasClash || spouseStarHasPunishment
              ? '存在衝刑互動，配偶星表現可能受牽制。'
              : '無明顯衝刑，配偶星表現相對穩定。'
          }`,
          {
            evidence: (
              <div className="space-y-2">
                {spouseStarHasClash ? (
                  <ReasoningCard label="夫妻星相沖" variant="accent">
                    <p className="text-xs text-zen-text">
                      夫妻星與鄰近地支相沖，易遠距離戀愛或感情變動較大。
                    </p>
                  </ReasoningCard>
                ) : null}
                {spouseStarHasPunishment ? (
                  <ReasoningCard label="夫妻星相刑" variant="accent">
                    <p className="text-xs text-zen-text">
                      夫妻星與鄰近地支相刑，感情易產生爭執與糾紛。
                    </p>
                  </ReasoningCard>
                ) : null}
                {!spouseStarHasClash && !spouseStarHasPunishment ? (
                  <ReasoningCard label="夫妻星穩定" variant="default">
                    <p className="text-xs text-zen-text">
                      夫妻星與鄰近地支無明顯衝刑關係，配偶星表現相對穩定。
                    </p>
                  </ReasoningCard>
                ) : null}
              </div>
            ),
            timeWindow: '先天命盤固定，大運流年臨沖刑年份時效果更明顯。',
            actions: [
              '確認夫妻星柱位與地支',
              '檢視夫妻星與鄰近柱位互動',
              '評估感情穩定性風險',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <ContentSection
        grammar={makeSection(
          '日主五行姻緣觀測',
          3,
          `日主五行 ${dayMasterElement}${
            isMale ? '（男命，以財星為妻星）' : '（女命，以官殺為夫星）'
          }，${userZodiac ? `生肖 ${userZodiac}` : ''}。`,
          {
            evidence: (
              <ReasoningCard label="日主五行" variant="default">
                <p className="text-xs text-zen-text leading-relaxed">
                  日主五行 {dayMasterElement}{' '}
                  決定了姻緣的基本走向與配偶的五行屬性。$
                  {isMale
                    ? '男命以正財、偏財為妻星，財星旺衰直接影響感情與婚姻。'
                    : '女命以正官、七殺為夫星，官殺星旺衰直接影響感情與婚姻。'}
                </p>
              </ReasoningCard>
            ),
            timeWindow: '先天命盤固定，長期適用。',
            actions: [
              '確認日主五行屬性',
              '對照夫妻星五行與特質',
              '觀察大運流年對夫妻星的影響',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <UncertaintyNotice>
        姻緣觀測依命盤夫妻宮、夫妻星與日主五行推斷，實際感情關係仍受後天大運、流年與個人選擇影響，僅供參考，非絕對斷言。
      </UncertaintyNotice>
    </div>
  );
}
