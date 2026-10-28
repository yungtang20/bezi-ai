import { useMemo } from 'react';
import { BaziChart, getHiddenTenGodsForZhi, ZHI_HIDE_GAN } from '../../paipan';
import { PatternScores, PatternResult, getPrimaryPattern, determinePattern } from '../../pattern';
import { GAN_TO_ELEMENT } from '../../constants';
import { calculateDaYun, DaYun, getLiuNian, LiuNian } from '../../dayun';
import { getFiveElementData, getTenGodData, ChartDatum } from '../../lib/chartTransform';

export type PrimaryPattern = '身強' | '身弱' | '從強' | '從弱';

const ELEMENT_COLORS: Record<string, string> = {
  '甲': 'text-emerald-400', '乙': 'text-emerald-400',
  '丙': 'text-red-400', '丁': 'text-red-400',
  '戊': 'text-amber-500', '己': 'text-amber-500',
  '庚': 'text-zinc-300', '辛': 'text-zinc-300',
  '壬': 'text-blue-400', '癸': 'text-blue-400',
  '寅': 'text-emerald-400', '卯': 'text-emerald-400',
  '巳': 'text-red-400', '午': 'text-red-400',
  '辰': 'text-amber-500', '戌': 'text-amber-500', '丑': 'text-amber-500', '未': 'text-amber-500',
  '申': 'text-zinc-300', '酉': 'text-zinc-300',
  '亥': 'text-blue-400', '子': 'text-blue-400',
};

export interface DashboardPillar {
  label: string;
  mobileLabel: string;
  mobileSubLabel?: string;
  data: { gan: string; zhi: string; tenGod: string; hiddenGan: string[]; hiddenTenGods: string[] };
  isHighlighted: boolean;
}

export interface UseDashboardLogicResult {
  primaryPattern: PrimaryPattern;
  patternResult: PatternResult;
  currentYear: number;
  daYuns: DaYun[];
  currentDaYun: DaYun | undefined;
  currentLiuNian: LiuNian;
  dayElement: string;
  myTenGods: string[];
  fiveElementData: ChartDatum[];
  tenGodData: ChartDatum[];
  liuNianZhiHidden: string[];
  liuNianZhiTenGods: string[];
  daYunZhiHidden: string[];
  daYunZhiTenGods: string[];
  pillars: DashboardPillar[];
  getElementColor: (ganZhi: string) => string;
}

export function useDashboardLogic({ chart, scores }: { chart: BaziChart; scores: PatternScores }): UseDashboardLogicResult {
  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = useMemo(() => determinePattern(chart), [chart]);

  const currentYear = new Date().getFullYear();
  const daYuns = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = daYuns.find(d => currentYear >= d.startYear && currentYear <= d.endYear);
  const currentLiuNian = useMemo(() => getLiuNian(currentYear, chart.dayMaster), [currentYear, chart.dayMaster]);

  const dayElement = GAN_TO_ELEMENT[chart.dayMaster];
  const myTenGods = Array.from(new Set([chart.year.tenGod, chart.month.tenGod, chart.hour.tenGod].filter(Boolean)));
  const fiveElementData = useMemo(() => getFiveElementData(chart), [chart]);
  const tenGodData = useMemo(() => getTenGodData(chart), [chart]);

  const liuNianZhiHidden = currentLiuNian.zhi ? (ZHI_HIDE_GAN[currentLiuNian.zhi] || []) : [];
  const liuNianZhiTenGods = currentLiuNian.zhi ? getHiddenTenGodsForZhi(currentLiuNian.zhi, chart.dayMaster) : [];
  const daYunZhiHidden = currentDaYun?.zhi ? (ZHI_HIDE_GAN[currentDaYun.zhi] || []) : [];
  const daYunZhiTenGods = currentDaYun?.zhi ? getHiddenTenGodsForZhi(currentDaYun.zhi, chart.dayMaster) : [];

  const pillars: DashboardPillar[] = [
    {
      label: `流年 ${currentLiuNian.year}`,
      mobileLabel: '流年',
      mobileSubLabel: `${currentLiuNian.year}`,
      data: {
        gan: currentLiuNian.gan,
        zhi: currentLiuNian.zhi,
        tenGod: currentLiuNian.relation,
        hiddenGan: liuNianZhiHidden,
        hiddenTenGods: liuNianZhiTenGods,
      },
      isHighlighted: true,
    },
    {
      label: `大運 ${currentDaYun ? `${currentDaYun.startAge}-${currentDaYun.startAge + 9}` : '?'} 歲`,
      mobileLabel: '大運',
      mobileSubLabel: currentDaYun ? `${currentDaYun.startAge}-${currentDaYun.startAge + 9} 歲` : '',
      data: {
        gan: currentDaYun?.gan || '?',
        zhi: currentDaYun?.zhi || '?',
        tenGod: currentDaYun?.tenGod || '?',
        hiddenGan: daYunZhiHidden,
        hiddenTenGods: daYunZhiTenGods,
      },
      isHighlighted: true,
    },
    { label: '時柱', mobileLabel: '時柱', data: chart.hour, isHighlighted: false },
    {
      label: `日柱（${currentYear - chart.birthYear}歲）`,
      mobileLabel: '日柱',
      mobileSubLabel: `${currentYear - chart.birthYear}歲`,
      data: chart.day,
      isHighlighted: false,
    },
    { label: '月柱', mobileLabel: '月柱', data: chart.month, isHighlighted: false },
    { label: '年柱', mobileLabel: '年柱', data: chart.year, isHighlighted: false },
  ];

  const getElementColor = (ganZhi: string) => ELEMENT_COLORS[ganZhi] || 'text-zinc-400';

  return {
    primaryPattern,
    patternResult,
    currentYear,
    daYuns,
    currentDaYun,
    currentLiuNian,
    dayElement,
    myTenGods,
    fiveElementData,
    tenGodData,
    liuNianZhiHidden,
    liuNianZhiTenGods,
    daYunZhiHidden,
    daYunZhiTenGods,
    pillars,
    getElementColor,
  };
}
