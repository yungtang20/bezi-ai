// src/components/romance/sections/FengShuiSection.tsx
// 2026桃花催旺位 — 依日主五行與性別推演出專屬桃花方位與佈置。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import React from 'react';
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from '../../../components/shared';
import { ROMANCE_FENG_SHUI_DATA } from '../../../data';
import type { BaziChart } from '@bezi/core';
import { DAY_MASTER_FENG_SHUI } from '../../../data/charts/romanceFengShui';
import { GAN_TO_ELEMENT } from '../../../constants';

const MAX_ACTIONS = 3;

interface FengShuiSectionProps {
  chart: BaziChart;
  dayMasterElement: string;
  isMale: boolean;
  userFengShuiDetail:
    | {
        element: string;
        directions: string[];
        colors: string[];
        items: string;
        zodiacs: string;
        sideDesc: string;
      }
    | undefined;
}

export default function FengShuiSection({
  chart,
  dayMasterElement,
  isMale,
  userFengShuiDetail,
}: FengShuiSectionProps) {
  const genderKey = isMale ? '男' : '女';
  const detail =
    userFengShuiDetail ??
    DAY_MASTER_FENG_SHUI[dayMasterElement]?.genderGuide[genderKey];
  const romanceFengShui = ROMANCE_FENG_SHUI_DATA[dayMasterElement]?.[genderKey];

  return (
    <div className="space-y-6">
      <ContentSection
        defaultOpen
        grammar={makeSection(
          '2026桃花催旺位',
          2,
          `日主 ${dayMasterElement} ${genderKey}命，${detail?.directions ?? '—'} 為桃花催旺方位。`,
          {
            evidence: detail ? (
              <ReasoningCard label="催旺方位" variant="default">
                <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
                  <li>方位：{detail.directions.join('、')}</li>
                  <li>顏色：{detail.colors}</li>
                  <li>擺設：{detail.items}</li>
                  <li>生肖擺件：{detail.zodiacs}</li>
                </ul>
              </ReasoningCard>
            ) : (
              <ReasoningCard label="催旺方位" variant="muted">
                <p className="text-xs text-zen-text">
                  未找到對應的桃花催旺方位資料。
                </p>
              </ReasoningCard>
            ),
            timeWindow: '2026 年流年，依日主五行與性別對照表推斷。',
            actions: [
              '確認日主五行與性別',
              '對照桃花催旺方位與顏色',
              '擺設對應開運物品',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      {romanceFengShui ? (
        <ContentSection
          grammar={makeSection(
            '補充桃花風水建議',
            3,
            `${dayMasterElement} ${genderKey}命的桃花補強元素為 ${romanceFengShui.elementName}，方位 ${romanceFengShui.direction}。`,
            {
              evidence: (
                <ReasoningCard label="桃花風水" variant="default">
                  <p className="text-xs text-zen-text leading-relaxed">
                    方位：{romanceFengShui.direction}，顏色：
                    {romanceFengShui.colors}，擺設：
                    {romanceFengShui.decorations}，生肖：
                    {romanceFengShui.zodiacs}。
                  </p>
                </ReasoningCard>
              ),
              timeWindow: '依日主五行與性別對照表，長期適用。',
              actions: [
                '確認桃花補強元素',
                '對照方位與顏色',
                '擺設對應開運物品',
              ].slice(0, MAX_ACTIONS),
            }
          )}
        />
      ) : null}
      <UncertaintyNotice>
        風水催旺位依命盤日主五行與性別推斷，實際效果仍受家居環境與個人行為影響，僅供參考。
      </UncertaintyNotice>
    </div>
  );
}
