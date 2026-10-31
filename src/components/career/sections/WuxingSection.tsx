// src/components/career/sections/WuxingSection.tsx
// 五行職涯與轉職時機 — 地支密碼與轉職時機。
// 內容僅用 ContentSection 文法；所有數值與 src/data 僅讀引用，不改動邏輯。
import {
  ContentSection,
  ReasoningCard,
  UncertaintyNotice,
  type SectionGrammar,
  makeSection,
} from '../../../components/shared';
import { LECTURE_DATA } from '../../../data';
import { GAN_TO_ELEMENT } from '../../../constants';

const MAX_ACTIONS = 3;

interface WuxingSectionProps {
  jobChangeAdvice: { condition: string; detail: string };
  dmElement: string;
  chartYearZhi: string;
  chartMonthZhi: string;
  chartDayZhi: string;
  chartHourZhi: string;
}

export function WuxingSection({
  jobChangeAdvice,
  dmElement,
  chartYearZhi,
  chartMonthZhi,
  chartDayZhi,
  chartHourZhi,
}: WuxingSectionProps) {
  const zhis = [chartYearZhi, chartMonthZhi, chartDayZhi, chartHourZhi];
  const countZhi = (arr: string[]) =>
    zhis.filter((z) => arr.includes(z)).length;

  const groups = [
    {
      key: '寅申巳亥',
      count: countZhi(['寅', '申', '巳', '亥']),
      data: LECTURE_DATA.ZHI_CAREER_SUITABILITY['寅申巳亥'],
    },
    {
      key: '辰戌丑未',
      count: countZhi(['辰', '戌', '丑', '未']),
      data: LECTURE_DATA.ZHI_CAREER_SUITABILITY['辰戌丑未'],
    },
    {
      key: '子午卯酉',
      count: countZhi(['子', '午', '卯', '酉']),
      data: LECTURE_DATA.ZHI_CAREER_SUITABILITY['子午卯酉'],
    },
  ].sort((a, b) => b.count - a.count);

  const dominantGroup = groups[0];

  const sections: SectionGrammar[] = [
    makeSection(
      '轉職時機與高回報出口',
      2,
      `身強弱判定：${jobChangeAdvice.condition}`,
      {
        evidence: (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 mb-2 font-semibold">
              命理格局：
              <strong className="text-white">
                {jobChangeAdvice.condition}
              </strong>
            </p>
            <p className="text-xs text-zinc-200 leading-relaxed font-sans bg-black/40 p-3 rounded-lg border border-white/5">
              {jobChangeAdvice.detail}
            </p>
          </div>
        ),
        timeWindow: `流年宜逢【${LECTURE_DATA.CAREER_PROMOTION[dmElement as keyof typeof LECTURE_DATA.CAREER_PROMOTION]}】之流年，本命官殺與財氣同旺，升遷跳槽易逢外來資本引渡，成其大功。`,
        actions: [
          '評估當前大運強弱',
          '選擇利於轉換的流年',
          '把握高回報跑道',
        ].slice(0, MAX_ACTIONS),
        uncertainty:
          '轉職時機依命理格局與大運流年推斷，實際決策仍需結合市場條件與個人準備，僅供參考。',
      }
    ),
    makeSection(
      '地支密碼與發展場域',
      3,
      dominantGroup.count === 0
        ? '地支能量分佈平均，無特定聚焦。'
        : `命盤地支以 ${dominantGroup.key} 最多 (${dominantGroup.count} 顆)，屬「${dominantGroup.data.type}」特質。`,
      {
        evidence:
          dominantGroup.count === 0 ? (
            <p className="text-xs text-zen-muted">
              地支能量分佈平均，無特定聚焦。
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-zinc-300 font-sans">
                命盤地支以{' '}
                <strong className="text-white">{dominantGroup.key}</strong> 最多
                ({dominantGroup.count} 顆)。
              </p>
              <div className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/40 p-3 rounded border border-white/5 space-y-1">
                <strong className="text-blue-400">
                  「{dominantGroup.data.type}」特質：
                </strong>
                <p>{dominantGroup.data.desc}</p>
              </div>
            </div>
          ),
        timeWindow: '地支四正、四生或四墓庫代表了您的先天職場心態與行為模式。',
        actions: [
          '確認主導地支類型',
          '對照發展場域特質',
          '選擇契合的工作環境',
        ].slice(0, MAX_ACTIONS),
      }
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zen-text border-b border-zen-border pb-3 mb-4 flex items-center gap-2">
          <span className="text-blue-400 font-mono">03.</span>{' '}
          五行職涯與轉職時機
        </h2>
      </div>
      {sections.map((s) => (
        <ContentSection key={s.title} grammar={s} defaultOpen={s.level === 2} />
      ))}
      <UncertaintyNotice>
        轉職時機與發展場域依八字地支與日主五行推斷，實際職涯變動仍受市場與個人選擇影響，僅供參考，非斷言。
      </UncertaintyNotice>
    </div>
  );
}
