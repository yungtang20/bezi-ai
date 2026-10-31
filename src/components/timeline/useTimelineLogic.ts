// src/components/timeline/useTimelineLogic.ts
// 時光軌跡頁計算邏輯（從 TimelinePage 抽出）。
// 純資料轉換：由 chart / scores 推導大運、流年、能量曲線與化解建議。
import { useMemo } from 'react';
import type { BaziChart } from '../../paipan';
import type { PatternScores } from '../../pattern';
import { GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../../constants';
import {
  calculateDaYun,
  getDaYunSegmentQuality,
  getFutureLiuNian,
  getTenGodForDaYun,
} from '../../dayun';
import {
  getPrimaryPattern,
  determinePattern,
  getPatternLabel,
  getFavorableElements,
  PATTERN_CONTINUUM_NOTE,
} from '../../pattern';
import {
  getTimelineGuideline,
  getLiunianAndRemedy,
  checkTaiSui,
  getTaiSuiAdvice,
} from '../../data';
import { checkBranchInteractions } from './checkBranchInteractions';
import type { FiveElement } from '../../types';

export interface TimelineLogicResult {
  currentYear: number;
  currentAge: number;
  primaryPattern: string;
  patternLabel: string;
  isContinuum: boolean;
  favorableElements: { favorable: string[]; unfavorable: string[] };
  daYunList: Array<{
    startAge: number;
    startYear: number;
    endYear: number;
    ganZhi: string;
    gan: string;
    zhi: string;
    tenGod: string;
  }>;
  activeDaYun:
    | {
        startAge: number;
        startYear: number;
        endYear: number;
        ganZhi: string;
        gan: string;
        zhi: string;
        tenGod: string;
      }
    | undefined;
  chartData: Array<{
    name: string;
    score: number;
    quality: string;
    firstHalf: '好運' | '壞運' | '平運';
    secondHalf: '好運' | '壞運' | '平運';
    gan: string;
    zhi: string;
    tenGod: string;
    ageLabel: string;
    isCurrent: boolean;
    isGood: boolean;
    isBad: boolean;
    index: number;
  }>;
  liuNianList: Array<{
    year: number;
    gan: string;
    zhi: string;
    tenGod: string;
  }>;
  daYunQuality: '好運' | '壞運' | '平運';
  daYunTenGod: string;
  daYunGuide:
    | {
        impact: string;
        remedy: string;
      }
    | undefined;
  daYunRemedyStr: string;
  firstHalfQuality: '好運' | '壞運' | '平運';
  secondHalfQuality: '好運' | '壞運' | '平運';
  isCurrentDaYun: boolean;
  PATTERN_CONTINUUM_NOTE: string;
}

export function useTimelineLogic({
  chart,
  scores,
}: {
  chart: BaziChart | null | undefined;
  scores: PatternScores;
}): TimelineLogicResult | null {
  if (!chart || !scores) return null;

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - chart.birthYear;

  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = useMemo(() => determinePattern(chart), [chart]);
  const patternLabel = getPatternLabel(patternResult, primaryPattern);
  const isContinuum =
    patternResult.isContinuum && primaryPattern === patternResult.pattern;
  const favorableElements = getFavorableElements(
    chart.dayMaster,
    primaryPattern
  );
  const daYunList = useMemo(() => calculateDaYun(chart), [chart]);
  const daYunListTyped = daYunList as Array<{
    startAge: number;
    startYear: number;
    endYear: number;
    ganZhi: string;
    gan: string;
    zhi: string;
    tenGod: string;
  }>;

  const defaultDyIdx = daYunListTyped.findIndex(
    (dy) => currentAge >= dy.startAge && currentAge <= dy.startAge + 9
  );
  const activeDyIdx = defaultDyIdx >= 0 ? defaultDyIdx : 0;
  const activeDaYun = daYunListTyped[activeDyIdx];

  const segmentQuality = (
    dy: (typeof daYunListTyped)[number],
    year: number
  ): '好運' | '壞運' | '平運' =>
    getDaYunSegmentQuality(
      chart.dayMaster,
      chart.gender,
      dy.gan,
      dy.zhi,
      favorableElements.favorable,
      favorableElements.unfavorable,
      { daYunStartYear: dy.startYear, year }
    );

  const chartData = useMemo(() => {
    return daYunListTyped.map((dy, idx) => {
      const firstHalf = segmentQuality(dy, dy.startYear);
      const secondHalf = segmentQuality(dy, dy.startYear + 5);

      const scoreOf = (q: string) =>
        q === '好運' ? 90 : q === '壞運' ? 20 : 50;
      const score = Math.round((scoreOf(firstHalf) + scoreOf(secondHalf)) / 2);
      const isGood = firstHalf === '好運' && secondHalf === '好運';
      const isBad = firstHalf === '壞運' && secondHalf === '壞運';
      const quality =
        firstHalf === secondHalf ? firstHalf : `${firstHalf}→${secondHalf}`;

      return {
        name: dy.startAge.toString(),
        score,
        quality,
        firstHalf,
        secondHalf,
        gan: dy.gan,
        zhi: dy.zhi,
        tenGod: dy.tenGod,
        ageLabel: `${dy.startAge}-${dy.startAge + 9}`,
        isCurrent: currentAge >= dy.startAge && currentAge <= dy.startAge + 9,
        isGood,
        isBad,
        index: idx,
      };
    });
  }, [daYunListTyped, favorableElements, chart, currentAge]);

  const liuNianList = activeDaYun
    ? getFutureLiuNian(activeDaYun.startYear, 10, chart.dayMaster)
    : [];

  const firstHalfQuality = segmentQuality(activeDaYun, activeDaYun.startYear);
  const secondHalfQuality = segmentQuality(
    activeDaYun,
    activeDaYun.startYear + 5
  );
  const isCurrentDaYun =
    currentYear >= activeDaYun.startYear &&
    currentYear <= activeDaYun.startYear + 9;
  const daYunQuality =
    isCurrentDaYun && currentYear >= activeDaYun.startYear + 5
      ? secondHalfQuality
      : firstHalfQuality;
  const daYunTenGod = getTenGodForDaYun(chart.dayMaster, activeDaYun.gan);
  const daYunGuide = getTimelineGuideline(
    daYunTenGod,
    primaryPattern,
    daYunQuality === '好運' ? 'good' : 'bad'
  );

  const strengthArg =
    primaryPattern === '身弱' || primaryPattern === '從弱' ? '身弱' : '身強';
  const activeDaYunRules = getLiunianAndRemedy(
    GAN_TO_ELEMENT[chart.dayMaster] as FiveElement,
    strengthArg,
    daYunQuality === '好運'
  );

  const daYunRemedyStr = daYunGuide?.remedy
    ? `依據五行平衡，目前的流年大運結構，建議多補充【${activeDaYunRules.remedy.join('、')}】之能量。\n` +
      daYunGuide.remedy
    : '';
  return {
    currentYear,
    currentAge,
    primaryPattern,
    patternLabel,
    isContinuum,
    favorableElements,
    daYunList: daYunListTyped,
    activeDaYun,
    chartData,
    liuNianList: liuNianList.map((ln) => ({
      ...ln,
      tenGod: getTenGodForDaYun(chart.dayMaster, ln.gan),
    })),
    daYunQuality,
    daYunTenGod,
    daYunGuide: {
      impact: daYunGuide?.impact ?? '',
      remedy: daYunGuide?.remedy ?? '',
    },
    daYunRemedyStr,
    firstHalfQuality,
    secondHalfQuality,
    isCurrentDaYun,
    PATTERN_CONTINUUM_NOTE,
  };
}
