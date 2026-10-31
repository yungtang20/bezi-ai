// src/components/romance/sections/TimelineSection.tsx
// 歲運推與化解 — 大運流年感情好壞與化解建議。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import type { DaYun, LiuNian, PatternResult } from '@bezi/core';
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  makeSection,
} from '../../../components/shared';
import { LECTURE_DATA, getTimelineGuideline } from '../../../data';

const MAX_ACTIONS = 3;

interface TimelineSectionProps {
  patternResult: PatternResult;
  patternLabel: string;
  isContinuum: boolean;
  isMale: boolean;
  currentYear: number;
  currentAge: number;
  daYunList: DaYun[];
  currentDaYun: DaYun | undefined;
  currentLiuNian: LiuNian;
  remedyKey: '身強' | '身弱_平衡' | '身弱_不平衡';
  romanceRemedy: string;
  isCrisis: boolean;
  isGoodForBreakup: boolean;
  dayMasterElement: string;
}

export default function TimelineSection({
  patternResult,
  patternLabel,
  isContinuum,
  isMale,
  currentYear,
  currentAge,
  daYunList,
  currentDaYun,
  currentLiuNian,
  remedyKey,
  romanceRemedy,
  isCrisis,
  isGoodForBreakup,
  dayMasterElement,
}: TimelineSectionProps) {
  const daYunQuality = currentDaYun
    ? getTimelineGuideline(currentDaYun.tenGod, patternLabel, 'good') ||
      getTimelineGuideline(currentDaYun.tenGod, patternLabel, 'bad')
    : undefined;

  const currentLiuNianTenGod = currentLiuNian.relation;
  const liuNianQuality = currentLiuNianTenGod
    ? getTimelineGuideline(currentLiuNianTenGod, patternLabel, 'good') ||
      getTimelineGuideline(currentLiuNianTenGod, patternLabel, 'bad')
    : undefined;

  const timing =
    LECTURE_DATA.PEACH_BLOSSOM_TIMING[isMale ? '男' : '女']?.[
      dayMasterElement as keyof (typeof LECTURE_DATA.PEACH_BLOSSOM_TIMING)['男']
    ];

  return (
    <div className="space-y-6">
      <ContentSection
        defaultOpen
        grammar={makeSection(
          '當前大運與流年感情運勢',
          2,
          `當前年齡 ${currentAge} 歲（${currentYear} 年），處於 ${currentDaYun?.ganZhi ?? '—'} 大運，流年 ${currentLiuNian.ganZhi ?? '—'}${
            currentDaYun ? `，十神為 ${currentDaYun.tenGod}` : ''
          }。`,
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="大運" variant="default">
                  <p className="text-xs text-zen-text">
                    {currentDaYun
                      ? `起運年齡 ${currentDaYun.startAge}–${currentDaYun.endAge} 歲，${currentDaYun.ganZhi}，十神 ${currentDaYun.tenGod}，五行 ${currentDaYun.element}。`
                      : '暫無大運數據。'}
                  </p>
                  {daYunQuality ? (
                    <p className="text-xs text-zen-muted mt-1">
                      {daYunQuality.impact}
                      {daYunQuality.remedy
                        ? ` 化解：${daYunQuality.remedy}`
                        : ''}
                    </p>
                  ) : null}
                </ReasoningCard>
                <ReasoningCard label="流年" variant="muted">
                  <p className="text-xs text-zen-text">
                    {currentYear} 年 ${currentLiuNian.ganZhi ?? '—'}，十神 $
                    {currentLiuNianTenGod ?? '—'}, 五行 $
                    {currentLiuNian.element ?? '—'}。
                  </p>
                  {liuNianQuality ? (
                    <p className="text-xs text-zen-muted mt-1">
                      {liuNianQuality.impact}
                      {liuNianQuality.remedy
                        ? ` 化解：${liuNianQuality.remedy}`
                        : ''}
                    </p>
                  ) : null}
                </ReasoningCard>
                {isContinuum ? (
                  <ReasoningCard label="連續體提醒" variant="accent">
                    <p className="text-xs text-zen-text">
                      格局分數落在連續體地帶，標籤僅供參考，仍以流年定盤（體感回測）為準。
                    </p>
                  </ReasoningCard>
                ) : null}
              </div>
            ),
            timeWindow: `當前大運 ${currentDaYun?.startAge ?? '—'}–${currentDaYun?.endAge ?? '—'} 歲，流年 ${currentYear} 年。`,
            actions: [
              '確認當前大運十神與五行',
              '對照流年好壞運指引',
              '採用對應化解建議',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <ContentSection
        grammar={makeSection(
          '桃花時機與補運',
          3,
          `日主 ${dayMasterElement} 命（${isMale ? '男' : '女'}命），${romanceRemedy}，桃花時機參考官殺流年。`,
          {
            evidence: (
              <div className="space-y-2">
                <ReasoningCard label="桃花補運" variant="default">
                  <p className="text-xs text-zen-text leading-relaxed">
                    {LECTURE_DATA.ROMANCE_REMEDY[remedyKey]?.[
                      isMale ? '男' : '女'
                    ] ?? romanceRemedy}
                  </p>
                </ReasoningCard>
                {timing ? (
                  <ReasoningCard label="桃花流年指引" variant="muted">
                    <p className="text-xs text-zen-text">
                      桃花元素：{timing.element}；天干 {timing.gans.join('、')}
                      ；地支 {timing.zhis.join('、')}。
                    </p>
                  </ReasoningCard>
                ) : null}
                {isCrisis ? (
                  <ReasoningCard label="危機預警" variant="accent">
                    <p className="text-xs text-zen-text">
                      當前大運/流年組合可能觸及桃花危機，建議謹慎處理感情糾葛。
                    </p>
                  </ReasoningCard>
                ) : null}
                {isGoodForBreakup ? (
                  <ReasoningCard label="斷絕孽緣時機" variant="muted">
                    <p className="text-xs text-zen-text">
                      當前運勢適合斷絕孽緣或處理感情終結事宜。
                    </p>
                  </ReasoningCard>
                ) : null}
              </div>
            ),
            timeWindow: '依當前大運與流年五行判斷，建議每三年複盤一次。',
            actions: [
              '確認當前桃花補運方向',
              '對照桃花流年天干地支',
              '評估危機與斷緣時機',
            ].slice(0, MAX_ACTIONS),
          }
        )}
      />
      <UncertaintyNotice>
        歲運推演依命盤格局與大運流年五行生剋推斷，實際感情走勢仍受個人經營與後天選擇影響，僅供參考，非絕對斷言。
      </UncertaintyNotice>
    </div>
  );
}
