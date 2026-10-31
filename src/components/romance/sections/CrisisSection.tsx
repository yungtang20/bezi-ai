// src/components/romance/sections/CrisisSection.tsx
// 桃花危機與預警 — 夫妻星坐比劫與大運流年危機診斷（依命盤原始特質與當前大運/流年，不改動邏輯）。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用。
import React from 'react';
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  type SectionGrammar,
  makeSection,
} from '../../../components/shared';
import { BaziChart } from '../../../paipan';
import { GAN_TO_ELEMENT } from '../../../constants';
import {
  calculateDaYun,
  getLiuNian,
  getTenGodForDaYun,
  type DaYun,
  type LiuNian,
} from '../../../dayun';
import { LECTURE_DATA } from '../../../data';

const MAX_ACTIONS = 3;

interface CrisisSectionProps {
  chart: BaziChart;
  isMale: boolean;
  currentDaYun: DaYun | undefined;
  currentLiuNian: LiuNian;
  primaryPattern: string;
  patternLabel: string;
  isContinuum: boolean;
  romanceRemedy: string;
  weakestElements: string[];
}

export function CrisisSection({
  chart,
  isMale,
  currentDaYun,
  currentLiuNian,
  primaryPattern,
  patternLabel,
  isContinuum,
  romanceRemedy,
  weakestElements,
}: CrisisSectionProps) {
  const genderKey = isMale ? '男' : '女';
  const dayMaster = chart.dayMaster;
  const dayMasterElement = (GAN_TO_ELEMENT[dayMaster] || '金') as string;
  const isWeak = primaryPattern.includes('弱');

  const targetGods = isMale ? ['正財', '偏財'] : ['正官', '七殺'];
  const clashGods = ['比肩', '劫財'];

  function isCrisisPair(ganTG: string, zhiTG: string): boolean {
    return (
      (targetGods.includes(ganTG) && clashGods.includes(zhiTG)) ||
      (clashGods.includes(ganTG) && targetGods.includes(zhiTG))
    );
  }

  // 重新推導當前大運／流年是否命中危機組合（與 useRomanceLogic 同一套規則，不改動邏輯）。
  let currentCrisis = false;
  let crisisSource = '';
  if (currentDaYun) {
    const ganTG = getTenGodForDaYun(dayMaster, currentDaYun.gan);
    const zhiTG = getTenGodForDaYun(dayMaster, currentDaYun.zhi);
    if (isCrisisPair(ganTG, zhiTG)) {
      currentCrisis = true;
      crisisSource = `當前大運 ${currentDaYun.ganZhi}（天干 ${ganTG}、地支 ${zhiTG}）`;
    }
  }
  if (!currentCrisis && currentLiuNian) {
    const ganTG = getTenGodForDaYun(dayMaster, currentLiuNian.gan);
    const zhiTG = getTenGodForDaYun(dayMaster, currentLiuNian.zhi);
    if (isCrisisPair(ganTG, zhiTG)) {
      currentCrisis = true;
      crisisSource = `今年流年 ${currentLiuNian.ganZhi}（天干 ${ganTG}、地支 ${zhiTG}）`;
    }
  }

  const crisisByGender =
    LECTURE_DATA.PEACH_BLOSSOM_CRISIS[genderKey as '男' | '女'];
  const peachCrisisRule =
    (crisisByGender as Record<string, { desc: string }>)[dayMasterElement]
      ?.desc ?? '暫無對應危機規則';

  const sections: SectionGrammar[] = [
    makeSection(
      '桃花危機診斷',
      2,
      currentCrisis
        ? `目前${crisisSource}，屬桃花危機組合，感情易生變數，宜謹慎。`
        : '目前未偵測到明顯桃花危機組合，感情關係相對穩定。',
      {
        evidence: (
          <ReasoningCard
            label="桃花危機規則（依日主五行與性別）"
            variant="default"
          >
            <p className="text-xs text-zen-text leading-relaxed">
              {isMale
                ? '男命：天干財星（正財／偏財）與地支比劫（比肩／劫財）交疊，或比劫坐財，心儀對象可能與他人藕斷絲連，易陷入三角糾紛。'
                : '女命：天干官殺（正官／七殺）與地支比劫（比肩／劫財）交疊，或比劫坐官殺，交往對象感情背景複雜，易捲入三角糾紛。'}
            </p>
            <p className="text-xs text-zen-text leading-relaxed mt-2">
              對應日主規則：{peachCrisisRule}
            </p>
          </ReasoningCard>
        ),
        timeWindow:
          '以當前大運段與今年流年為主，遇到對應天干地支組合之年需特別留意。',
        actions: [
          '確認夫妻星與臨柱比劫關係',
          '對照日主對應危機組合',
          '留意流年觸發危機之年',
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          '危機診斷依傳統八字斷法（財坐比劫／官殺坐比劫等規則），不等於必然發生，實際感情尚受雙方性格與經驗影響，僅供參考。',
      }
    ),
    makeSection(
      '當前大運與流年危機風險',
      3,
      currentCrisis
        ? `目前處於桃花危機期（${crisisSource}），建議避免衝動決定與不明感情介入。`
        : `目前大運／流年未觸發桃花危機組合，感情風險較低。`,
      {
        evidence: (
          <ReasoningCard label="當前大運與流年十神" variant="default">
            <ul className="text-zen-text text-xs list-disc pl-4 space-y-1">
              {currentDaYun ? (
                <>
                  <li>
                    大運 <strong>{currentDaYun.ganZhi}</strong>：天干{' '}
                    {getTenGodForDaYun(dayMaster, currentDaYun.gan)}、地支{' '}
                    {getTenGodForDaYun(dayMaster, currentDaYun.zhi)}（歲數{' '}
                    {currentDaYun.startAge}-{currentDaYun.endAge}）。
                  </li>
                </>
              ) : (
                <li>目前無可用大運資料。</li>
              )}
              <li>
                流年 <strong>{currentLiuNian.ganZhi}</strong>：天干{' '}
                {getTenGodForDaYun(dayMaster, currentLiuNian.gan)}、地支{' '}
                {getTenGodForDaYun(dayMaster, currentLiuNian.zhi)}。
              </li>
            </ul>
          </ReasoningCard>
        ),
        timeWindow: `當前大運段（${currentDaYun ? currentDaYun.startAge + '-' + currentDaYun.endAge + '歲' : '—'}）與今年流年 ${currentLiuNian.year} 年。`,
        actions: [
          '確認大運與流年天干地支十神',
          '對照比劫與財官殺交疊組合',
          '危機年避免衝動決定',
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          '大運與流年危機風險僅反映天干地支十神組合，實際吉凶需結合整體格局、用神與喜忌綜合判斷，非絕對斷言。',
      }
    ),
    makeSection(
      '斬斷孽緣與補運建議',
      3,
      isWeak
        ? `日主偏弱，${romanceRemedy}，建議在大運忌神時尋求長輩或朋友協助，避免單打獨鬥。`
        : `日主偏強，${romanceRemedy}，有利於溝通梳理、爭取權益與主導談判。`,
      {
        evidence: (
          <ReasoningCard label="斬斷孽緣與補運依據" variant="default">
            <p className="text-xs text-zen-text leading-relaxed">
              {
                LECTURE_DATA.ROMANCE_CRISIS[
                  `斬斷孽緣_${isWeak ? '身弱' : '身強'}` as keyof typeof LECTURE_DATA.ROMANCE_CRISIS
                ]
              }
            </p>
          </ReasoningCard>
        ),
        timeWindow: '以當前大運忌神時為主，建議每三年複盤一次強弱變化。',
        actions: [
          '採用對應補運方向',
          '避免單打獨鬥，尋求長輩朋友協助',
          '危機年優先穩定情緒與溝通',
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          '補運建議依傳統八字斷法，實際效果仍隨大運、流年與個人行為而異，不構成絕對感情或人生指導。',
      }
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-rose-400 font-mono">07.</span> 桃花危機與預警
        </h2>
      </div>
      <p className="text-xs text-zen-muted mb-4 leading-relaxed">
        依夫妻星坐比劫與當前大運／流年十神組合，觀測您的
        <strong>桃花危機與爛桃花預警重點</strong>
        （僅呈現命盤原始特質，非斷言）：
      </p>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        桃花危機判斷依傳統八字斷法（財坐比劫／官殺坐比劫等規則），實際感情尚受雙方性格、溝通與經驗影響，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}

export default CrisisSection;
