// src/components/Dashboard.tsx
// Dashboard — 薄協調層。邏輯交由 useDashboardLogic，呈現交由子 widget 與 accordion 區塊。
import React, { useState } from 'react';
import { BaziChart, DAY_MASTER_PERSONALITY } from '../paipan';
import {
  PatternScores,
  getPatternLabel,
  PATTERN_CONTINUUM_NOTE,
} from '../pattern';
import { GAN_TO_ELEMENT } from '../constants';
import { TEN_GOD_TRAITS } from '../data';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ContentSection, SectionGrammar } from './shared';
import FiveElementsRadar from './dashboard/FiveElementsRadar';
import TenGodsPie from './dashboard/TenGodsPie';
import BaziPillars from './dashboard/BaziPillars';
import WeeklyReviewCard from './dashboard/WeeklyReviewCard';
import ChartCodex from './dashboard/ChartCodex';
import CalibrationPanel from './dashboard/CalibrationPanel';
import PatternSwitchNotice from './dashboard/PatternSwitchNotice';
import TodayEnergyCard from './dashboard/TodayEnergyCard';
import LifeTimeline from './dashboard/LifeTimeline';
import { useCheckInStats } from '../hooks/useCheckInStats';
import { PartnerChart } from '../matchmaking';
import PeopleCards from './dashboard/PeopleCards';
import { useDashboardLogic } from './dashboard/useDashboardLogic';

interface Props {
  bazi?: {
    year: string;
    month: string;
    day: string;
    time: string;
    chart?: BaziChart;
  } | null;
  name?: string;
  scores?: PatternScores | null;
  birthDate?: string;
  birthTime?: string;
  gender?: 'male' | 'female' | string | null;
  onNavigate?: (view: string | number) => void;
  onLoadPerson?: (p: PartnerChart) => void;
  view?: 'today' | 'profile';
}

// [AI MOD] Accordion section component with glass card style
function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden animate-fade-in-up">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between p-3 text-left bg-zinc-900/40 border border-white/5 rounded-lg hover:bg-zinc-900/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-zinc-400">{icon}</span>}
          <span className="text-sm font-bold text-zinc-100">{title}</span>
          {badge && (
            <span className="ml-auto text-[10px] text-zinc-500">{badge}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="p-3 border-t border-white/5">{children}</div>}
    </div>
  );
}

export default function Dashboard({
  bazi,
  name,
  scores,
  birthDate,
  birthTime,
  gender,
  onNavigate,
  onLoadPerson,
  view = 'today',
}: Props) {
  const chart = bazi?.chart;
  // [AI MOD] 打卡 log（命盤圖鑑/週回顧用）— 须在 early return 前（hooks 規則）
  const { logs: checkInLogs } = useCheckInStats();

  if (!chart || !scores)
    return (
      <div className="text-center p-10 text-zen-muted">命盤資料載入中...</div>
    );

  const {
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
    pillars,
    getElementColor,
  } = useDashboardLogic({ chart, scores });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2.5 md:space-y-3 pb-8 px-3 md:px-0">
      {/* 頂部區域：大字標題 + 副標題 */}
      <div className="text-center py-2 md:py-3 animate-fade-in-up">
        <h1 className="display-title text-2xl md:text-3xl lg:text-4xl mb-1">
          {view === 'today'
            ? name
              ? `${name}，今天好`
              : '今天好'
            : name
              ? `${name} 的命盤`
              : '我的命盤'}
        </h1>
        <p className="text-zen-muted text-[11px] md:text-xs tracking-widest">
          {view === 'today'
            ? '先看一個重點，再決定要不要深入'
            : '四柱命盤 · 五行強弱 · 十神特質'}
        </p>
        <div className="gold-divider mt-2 mx-auto max-w-[200px]" />
      </div>

      {/* B 軸：打卡改變格局時顯式顯示因果鏈 */}
      <PatternSwitchNotice />

      {/* [AI MOD] 今日能量卡（每日鉤子）：首屏第一眼 */}
      {view === 'today' && (
        <TodayEnergyCard
          chart={chart}
          scores={scores}
          name={name}
          onNavigate={onNavigate}
        />
      )}

      {/* [AI MOD] P1 留存組件：大運色帶 + 命盤圖鑑（每日）+ 週回顧（僅週日） */}
      {view === 'today' && (
        <>
          <LifeTimeline chart={chart} daYuns={daYuns} />
          <ChartCodex
            chart={chart}
            pattern={patternResult}
            scores={scores}
            logs={checkInLogs}
          />
          {new Date().getDay() === 0 && <WeeklyReviewCard logs={checkInLogs} />}
        </>
      )}

      {view === 'profile' && (
        <>
          {/* 命主資訊卡片（永遠顯示） */}
          <div
            className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:justify-between md:items-center relative z-10 gap-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-base md:text-lg font-bold text-white tracking-wide font-serif">
                    {name ? `${name} 的命理根基` : '命理根基'}
                  </h2>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('bezi:return-after-edit', '12');
                      onNavigate?.(1);
                    }}
                    className="text-[10px] bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-2 py-0.5 rounded transition-colors"
                  >
                    重新編輯
                  </button>
                </div>
                {birthDate && (
                  <div className="text-xs text-zinc-500 font-medium font-serif space-y-px">
                    <div className="flex items-center flex-wrap">
                      <span className="w-[150px]">
                        國曆：{birthDate.replace(/-/g, '/')}{' '}
                        {birthTime ? `${birthTime.padStart(2, '0')}:00` : ''}
                      </span>
                      <span className="text-zinc-700 mx-1 hidden md:inline">
                        ｜
                      </span>
                      <span>
                        性別
                        {gender === 'male'
                          ? '男'
                          : gender === 'female'
                            ? '女'
                            : ''}
                      </span>
                    </div>
                    {chart && (
                      <div className="flex items-center flex-wrap">
                        <span className="w-[150px]">
                          農曆：{chart.year.gan}
                          {chart.year.zhi}年 {chart.month.gan}
                          {chart.month.zhi}月 {chart.day.gan}
                          {chart.day.zhi}日
                        </span>
                        <span className="text-zinc-700 mx-1 hidden md:inline">
                          ｜
                        </span>
                        <span>生肖{chart.zodiac}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {(() => {
                const elementStyles: Record<
                  string,
                  { bg: string; text: string }
                > = {
                  木: {
                    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                    text: 'text-emerald-300',
                  },
                  火: {
                    bg: 'bg-red-500/10 border-red-500/20 text-red-400',
                    text: 'text-red-300',
                  },
                  土: {
                    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                    text: 'text-amber-300',
                  },
                  金: {
                    bg: 'bg-zinc-300/10 border-zinc-300/20 text-zinc-300',
                    text: 'text-zinc-300',
                  },
                  水: {
                    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                    text: 'text-blue-300',
                  },
                };
                const style = elementStyles[dayElement] || elementStyles['水'];
                return (
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={`${style.bg} px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-inner border`}
                    >
                      <span className="text-xl font-bold font-serif">
                        {chart?.dayMaster}
                        {dayElement}
                      </span>
                      <span
                        className={`text-sm font-bold tracking-wide ${style.text}`}
                      >
                        {getPatternLabel(patternResult, primaryPattern)}
                      </span>
                    </div>
                    {patternResult.isContinuum && (
                      <p className="text-[10px] text-zinc-500 leading-snug max-w-[260px] text-right">
                        {PATTERN_CONTINUUM_NOTE}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* [P2] 我的親人卡片：家人成員管理（增 / 刪 / 載入重排） */}
          <AccordionSection title="我的親人" defaultOpen={false}>
            <PeopleCards onLoad={onLoadPerson} />
          </AccordionSection>

          <div className="grid gap-3 lg:grid-cols-3 animate-fade-in-up">
            <div className="glass-card p-3">
              <h2 className="mb-2 text-sm font-bold text-zinc-100">四柱命盤</h2>
              <BaziPillars chart={chart} />
            </div>
            <div className="glass-card p-3">
              <h2 className="mb-1 text-sm font-bold text-zinc-100">五行強弱</h2>
              <FiveElementsRadar data={fiveElementData} />
            </div>
            <div className="glass-card p-3">
              <h2 className="mb-1 text-sm font-bold text-zinc-100">十神比例</h2>
              <TenGodsPie data={tenGodData} />
            </div>
          </div>

          {/* 區段 1：八字排盤 — 六柱直立顯示 */}
          <AccordionSection
            title="八字排盤"
            defaultOpen={true}
            badge={<span className="text-zinc-600 text-xs">先天命局</span>}
          >
            <div className="pt-1">
              {/* 六柱水平排列 — 傳統八字命盤格式 (手機版支援左右滑動，桌機版置中) */}
              <div className="flex flex-row gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none snap-x snap-mandatory justify-start md:justify-center items-start pb-2 md:pb-0">
                {pillars.map((p, idx) => {
                  const labels =
                    [['主氣'], ['主氣', '餘氣'], ['主氣', '中氣', '餘氣']][
                      p.data.hiddenGan?.length - 1
                    ] || [];
                  const isDayMaster = p.label.startsWith('日柱');
                  const isTopPillar =
                    p.label.startsWith('流年') || p.label.startsWith('大運');

                  return (
                    <div
                      key={p.label}
                      className={`relative overflow-hidden animate-fade-in-up rounded-lg flex-1 min-w-[92px] md:min-w-0 max-w-[100px] md:max-w-[120px] snap-start shrink-0 md:shrink ${
                        isDayMaster
                          ? 'ring-2 ring-amber-500/40 border-amber-500/30'
                          : 'ring-1 ring-white/10'
                      } ${isTopPillar ? 'md:flex-[0.8]' : ''}`}
                      style={{
                        animationDelay: `${0.2 + idx * 0.05}s`,
                        background: 'rgba(10, 30, 20, 0.5)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(212, 168, 83, 0.1)',
                      }}
                    >
                      {/* 頂部標籤 */}
                      <div
                        className={`w-full py-0.5 text-center ${isDayMaster ? 'bg-amber-500/15 border-b border-amber-500/30' : isTopPillar ? 'bg-indigo-500/10 border-b border-indigo-500/20' : 'bg-white/5 border-b border-white/10'}`}
                      >
                        {/* 桌機版完整標籤 */}
                        <span
                          className={`hidden md:block text-xs md:text-sm font-bold tracking-widest ${isDayMaster ? 'text-amber-400' : isTopPillar ? 'text-indigo-400' : 'text-zinc-400'}`}
                        >
                          {p.label}
                        </span>
                        {/* 手機版精簡雙行標籤 */}
                        <div className="md:hidden flex flex-col items-center py-0.5">
                          <span
                            className={`text-[11px] font-bold tracking-widest leading-none ${isDayMaster ? 'text-amber-400' : isTopPillar ? 'text-indigo-400' : 'text-zinc-400'}`}
                          >
                            {p.mobileLabel}
                          </span>
                          {p.mobileSubLabel && (
                            <span className="text-[9px] text-zinc-500 font-medium scale-90 mt-0.5 leading-none">
                              {p.mobileSubLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 內容區：垂直排列 十神→天干→地支→藏干，底部多5px */}
                      <div className="flex flex-col items-center gap-1 pb-[5px]">
                        {/* 十神 */}
                        <span
                          className={`text-xs md:text-sm font-bold leading-tight ${isDayMaster ? 'text-amber-400' : 'text-amber-500/60'}`}
                        >
                          {isDayMaster ? '日主' : p.data.tenGod}
                        </span>

                        {/* 天干 */}
                        <span
                          className={`text-2xl md:text-4xl font-bold font-serif leading-none ${getElementColor(p.data.gan)}`}
                        >
                          {p.data.gan}
                        </span>

                        {/* 地支 */}
                        <span
                          className={`text-2xl md:text-4xl font-bold font-serif leading-none ${getElementColor(p.data.zhi)}`}
                        >
                          {p.data.zhi}
                        </span>

                        {/* 藏干（含十神）— 直立排列，由大到小，由右至左，十神在下、藏干在上 */}
                        {p.data.hiddenGan && p.data.hiddenGan.length > 0 && (
                          <div className="flex flex-row-reverse items-start gap-1">
                            {p.data.hiddenGan.map((hg, hidx) => {
                              const hgTenGod =
                                p.data.hiddenTenGods?.[hidx] || '';
                              return (
                                <div
                                  key={hidx}
                                  className="flex flex-col items-center leading-tight"
                                >
                                  <span
                                    className={`text-xs md:text-sm font-bold leading-none ${getElementColor(hg)}`}
                                    title={labels[hidx] || ''}
                                  >
                                    {hg}
                                  </span>
                                  {hgTenGod && (
                                    <span className="text-[10px] md:text-xs text-amber-500/50 font-medium leading-none">
                                      {hgTenGod}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 手機版左右滑動提示 */}
              <div className="flex md:hidden items-center justify-center gap-1.5 mt-2.5 text-[10px] text-zinc-500 tracking-widest uppercase font-semibold">
                <span className="animate-pulse">←</span>
                <span>左右滑動查看完整六柱</span>
                <span className="animate-pulse">→</span>
              </div>
            </div>
          </AccordionSection>

          {/* 區段 2：先天個性核心 */}
          <AccordionSection title="先天個性核心">
            <ContentSection
              defaultOpen
              grammar={{
                title: '先天個性核心',
                level: 3,
                conclusion: DAY_MASTER_PERSONALITY[chart.dayMaster],
                evidence: `日主 ${chart.dayMaster}（${dayElement}）定義你的先天氣質與行事底色。`,
              }}
            />
          </AccordionSection>

          {/* 區段 3：外在展現（天干主星） */}
          <AccordionSection
            title="外在展現"

            badge={
              <span className="text-zinc-600 text-[10px]">
                天干主星 · 社會形象
              </span>
            }
          >
            <div className="pt-2 space-y-2">
              {[
                { god: chart.year.tenGod, pillar: '年干', gan: chart.year.gan },
                {
                  god: chart.month.tenGod,
                  pillar: '月干',
                  gan: chart.month.gan,
                },
                { god: chart.hour.tenGod, pillar: '時干', gan: chart.hour.gan },
              ]
                .filter((t) => t.god)
                .map((t, idx) => {
                  const trait = TEN_GOD_TRAITS[t.god];
                  if (!trait) return null;
                  const grammar: SectionGrammar = {
                    title: `${t.god}（${t.pillar}）`,
                    level: 3,
                    conclusion: trait.trait,
                    evidence: (
                      <>
                        <p className="text-[10px] text-zinc-500 mb-2 truncate">
                          {trait.image}
                        </p>
                        <div className="space-y-1">
                          <div className="bg-green-500/5 p-2 rounded border border-green-500/10">
                            <span className="text-[10px] font-bold text-green-500/80 block mb-0.5">
                              {' '}
                              優勢
                            </span>
                            <span className="text-[10px] text-green-100/70">
                              {trait.overload.pros}
                            </span>
                          </div>
                          <div className="bg-red-500/5 p-2 rounded border border-red-500/10">
                            <span className="text-[10px] font-bold text-red-500/80 block mb-0.5">
                              {' '}
                              盲點
                            </span>
                            <span className="text-[10px] text-red-100/70">
                              {trait.overload.cons}
                            </span>
                          </div>
                        </div>
                      </>
                    ),
                    timeWindow: `天干：${t.gan}`,
                    actions: [
                      `強化 ${trait.category} 特質`,
                      `留意 ${trait.overload.cons}`,
                    ],
                  };
                  return (
                    <ContentSection
                      key={`${t.pillar}-${t.god}-${idx}`}
                      grammar={grammar}
                      defaultOpen
                    />
                  );
                })}
              {myTenGods.length === 0 && (
                <p className="text-xs text-zinc-500">無主星紀錄</p>
              )}
            </div>
          </AccordionSection>

          {/* 區段 4：私下展現（地支性格） */}
          <AccordionSection
            title="私下展現"

            badge={<span className="text-zinc-600 text-[10px]">地支性格</span>}
          >
            <ContentSection
              defaultOpen
              grammar={{
                title: '私下展現（地支性格）',
                level: 3,
                conclusion:
                  '你的地支性格由命盤四柱地支決定，呈現私底下的真實面向。',
                evidence: (
                  <>
                    {[
                      {
                        name: '動態魅力',
                        zhis: ['子', '午', '卯', '酉'],
                        desc: '高顏值、目光焦點喜打扮，具備獨特個人魅力。',
                      },
                      {
                        name: '開創行動',
                        zhis: ['寅', '申', '巳', '亥'],
                        desc: '陽剛明快、有話直說、行動力強、充滿活力的變動。',
                      },
                      {
                        name: '穩重內斂',
                        zhis: ['辰', '戌', '丑', '未'],
                        desc: '穩重踏實、安靜內斂、富有內涵、喜歡將話藏心中。',
                      },
                    ].map((cat) => {
                      const matched = [
                        chart.year.zhi,
                        chart.month.zhi,
                        chart.day.zhi,
                        chart.hour.zhi,
                      ].filter((z) => cat.zhis.includes(z));
                      if (matched.length === 0) return null;
                      return (
                        <div
                          key={cat.name}
                          className="glass-card p-2.5 flex items-start gap-3"
                        >
                          <span className="text-xs font-bold text-amber-500/80 shrink-0 w-16 pt-0.5">
                            {cat.name}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs text-zinc-300 leading-snug">
                              {cat.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ),
              }}
            />
          </AccordionSection>

          {/* 區段 5：命局交互作用 */}
          <AccordionSection
            title="命局交互作用"

            badge={<span className="text-zinc-600 text-[10px]">刑沖合會</span>}
          >
            <ContentSection
              defaultOpen
              grammar={{
                title: '命局交互作用',
                level: 3,
                conclusion: '地支之間的刑沖合會決定命盤能量的穩定與變動幅度。',
                evidence: (
                  <>
                    {(() => {
                      const zhis = [
                        chart.year.zhi,
                        chart.month.zhi,
                        chart.day.zhi,
                        chart.hour.zhi,
                      ];
                      const interactions: string[] = [];

                      const chongPairs = [
                        ['子', '午'],
                        ['丑', '未'],
                        ['寅', '申'],
                        ['卯', '酉'],
                        ['辰', '戌'],
                        ['巳', '亥'],
                      ];
                      chongPairs.forEach(([z1, z2]) => {
                        if (zhis.includes(z1) && zhis.includes(z2)) {
                          interactions.push(
                            `命局帶【${z1}${z2}六沖】：能量變動大，人生較多起伏，適合遠行開創。`
                          );
                        }
                      });

                      const hePairs = [
                        ['子', '丑'],
                        ['寅', '亥'],
                        ['卯', '戌'],
                        ['辰', '酉'],
                        ['巳', '申'],
                        ['午', '未'],
                      ];
                      hePairs.forEach(([z1, z2]) => {
                        if (zhis.includes(z1) && zhis.includes(z2)) {
                          interactions.push(
                            `命局帶【${z1}${z2}六合】：人際和諧，多貴人相助，關係穩定。`
                          );
                        }
                      });

                      const selfZhis = ['辰', '午', '酉', '亥'];
                      const counts: Record<string, number> = {};
                      zhis.forEach((z) => (counts[z] = (counts[z] || 0) + 1));
                      selfZhis.forEach((sz) => {
                        if (counts[sz] >= 2)
                          interactions.push(
                            `命局帶【${sz}${sz}自刑】：內心易糾結，自我要求高，需學會寬心。`
                          );
                      });

                      if (interactions.length === 0)
                        return (
                          <div className="glass-card p-2.5 text-center">
                            <p className="text-xs text-zinc-500 italic">
                              本命地支氣場平穩，無劇烈刑沖。
                            </p>
                          </div>
                        );

                      return interactions.map((inter, i) => (
                        <div
                          key={i}
                          className="glass-card p-2.5 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0" />
                          <p className="text-xs text-zinc-300 leading-snug">
                            {inter}
                          </p>
                        </div>
                      ));
                    })()}
                  </>
                ),
                uncertainty:
                  '刑沖合會僅為命盤結構推斷，實際事件仍受大運、流年與個人選擇影響。',
              }}
            />
          </AccordionSection>
          {/* B 軸：越用越準校準面板 */}
          <AccordionSection
            title="越用越準校準面板"

            badge={
              <span className="text-zinc-600 text-[10px]">打卡回閉環</span>
            }
          >
            <CalibrationPanel
              scores={scores}
              patternResult={patternResult}
              onNavigate={onNavigate}
            />
          </AccordionSection>

          {/* 理論速查引用出處 */}
          <div className="pt-3 pb-6 flex justify-center">
            <button
              onClick={() => {
                sessionStorage.setItem('currentRefTab', 'basic');
                if (typeof onNavigate === 'function') onNavigate(10);
              }}
              className="text-[11px] text-zinc-500 hover:text-amber-500/80 flex items-center gap-1 transition-colors relative group py-1"
            >
              <span className="text-amber-500/60"></span>
              <span>
                本頁面分析皆基於八字命理學說，點擊可查看【理論速查】對照表
              </span>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-500/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
