import React, { useState, useMemo } from 'react';
import { BaziChart, getHiddenTenGodsForZhi, ZHI_HIDE_GAN, DAY_MASTER_PERSONALITY } from '../paipan';
import { PatternScores, getPrimaryPattern, determinePattern } from '../pattern';
import { GAN_TO_ELEMENT } from '../constants';
import { TEN_GOD_TRAITS } from '../data';
import { calculateDaYun, getLiuNian } from '../dayun';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

interface Props {
  bazi?: { year: string; month: string; day: string; time: string; chart?: BaziChart } | null;
  name?: string;
  scores?: PatternScores | null;
  birthDate?: string;
  birthTime?: string;
  gender?: 'male' | 'female' | string | null;
  onNavigate?: (view: string | number) => void;
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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="text-sm md:text-base font-bold text-zinc-100 tracking-wide">{title}</span>
          {badge && <span className="text-[10px] text-zinc-500">{badge}</span>}
        </div>
        {isOpen
          ? <ChevronUp size={16} className="text-amber-500/70" />
          : <ChevronDown size={16} className="text-zinc-500" />}
      </button>
      {isOpen && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ bazi, name, scores, birthDate, birthTime, gender, onNavigate }: Props) {
  const chart = bazi?.chart;

  if (!chart || !scores) return <div className="text-center p-10 text-zen-muted">命盤資料載入中...</div>;

  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = useMemo(() => determinePattern(chart), [chart]);

  const currentYear = new Date().getFullYear();
  const daYuns = useMemo(() => calculateDaYun(chart), [chart]);
  const currentDaYun = daYuns.find(d => currentYear >= d.startYear && currentYear <= d.endYear);
  const currentLiuNian = useMemo(() => getLiuNian(currentYear, chart.dayMaster), [currentYear, chart.dayMaster]);

  const dayElement = GAN_TO_ELEMENT[chart.dayMaster];
  const myTenGods = Array.from(new Set([chart.year.tenGod, chart.month.tenGod, chart.hour.tenGod].filter(Boolean)));

  const liuNianZhiHidden = currentLiuNian.zhi ? (ZHI_HIDE_GAN[currentLiuNian.zhi] || []) : [];
  const liuNianZhiTenGods = currentLiuNian.zhi ? getHiddenTenGodsForZhi(currentLiuNian.zhi, chart.dayMaster) : [];

  const daYunZhiHidden = currentDaYun?.zhi ? (ZHI_HIDE_GAN[currentDaYun.zhi] || []) : [];
  const daYunZhiTenGods = currentDaYun?.zhi ? getHiddenTenGodsForZhi(currentDaYun.zhi, chart.dayMaster) : [];

  const pillars = [
    {
      label: `流年 ${currentLiuNian.year}`,
      mobileLabel: '流年',
      mobileSubLabel: `${currentLiuNian.year}`,
      data: {
        gan: currentLiuNian.gan,
        zhi: currentLiuNian.zhi,
        tenGod: currentLiuNian.relation,
        hiddenGan: liuNianZhiHidden,
        hiddenTenGods: liuNianZhiTenGods
      },
      isHighlighted: true
    },
    {
      label: `大運 ${currentDaYun?.startAge}歲`,
      mobileLabel: '大運',
      mobileSubLabel: `${currentDaYun?.startAge}歲`,
      data: {
        gan: currentDaYun?.gan || '?',
        zhi: currentDaYun?.zhi || '?',
        tenGod: currentDaYun?.tenGod || '?',
        hiddenGan: daYunZhiHidden,
        hiddenTenGods: daYunZhiTenGods
      },
      isHighlighted: true
    },
    { label: '時柱', mobileLabel: '時柱', data: chart.hour, isHighlighted: false },
    {
      label: `日柱（${currentYear - chart.birthYear}歲）`,
      mobileLabel: '日柱',
      mobileSubLabel: `${currentYear - chart.birthYear}歲`,
      data: chart.day,
      isHighlighted: false
    },
    { label: '月柱', mobileLabel: '月柱', data: chart.month, isHighlighted: false },
    { label: '年柱', mobileLabel: '年柱', data: chart.year, isHighlighted: false },
  ];

  const getElementColor = (ganZhi: string) => ELEMENT_COLORS[ganZhi] || 'text-zinc-400';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2.5 md:space-y-3 pb-8 px-3 md:px-0">

      {/* 頂部區域：大字標題 + 副標題 */}
      <div className="text-center py-2 md:py-3 animate-fade-in-up">
        <h1 className="display-title text-2xl md:text-3xl lg:text-4xl mb-1">
          {name ? `${name} 的命盤` : '先天命局'}
        </h1>
        <p className="text-zen-muted text-[11px] md:text-xs tracking-widest">
          八字格局 · 五行能量 · 人生藍圖
        </p>
        <div className="gold-divider mt-2 mx-auto max-w-[200px]" />
      </div>

      {/* 命主資訊卡片（永遠顯示） */}
      <div className="glass-card p-3 md:p-4 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:justify-between md:items-center relative z-10 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base md:text-lg font-bold text-white tracking-wide font-serif">
                {name ? `${name} 的命理根基` : '命理根基'}
              </h2>
              <button
                onClick={() => onNavigate?.(1 as any)}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-2 py-0.5 rounded transition-colors"
              >
                重新編輯
              </button>
            </div>
            {birthDate && (
              <div className="text-xs text-zinc-500 font-medium font-serif space-y-px">
                <div className="flex items-center flex-wrap">
                  <span className="w-[150px]">國曆：{birthDate.replace(/-/g, '/')} {birthTime ? `${birthTime.padStart(2, '0')}:00` : ''}</span>
                  <span className="text-zinc-700 mx-1 hidden md:inline">｜</span>
                  <span>性別{gender === 'male' ? '男' : gender === 'female' ? '女' : ''}</span>
                </div>
                {chart && (
                  <div className="flex items-center flex-wrap">
                    <span className="w-[150px]">農曆：{chart.year.gan}{chart.year.zhi}年 {chart.month.gan}{chart.month.zhi}月 {chart.day.gan}{chart.day.zhi}日</span>
                    <span className="text-zinc-700 mx-1 hidden md:inline">｜</span>
                    <span>生肖{chart.zodiac}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {(() => {
            const elementStyles: Record<string, { bg: string; text: string }> = {
              '木': { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', text: 'text-emerald-300' },
              '火': { bg: 'bg-red-500/10 border-red-500/20 text-red-400', text: 'text-red-300' },
              '土': { bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400', text: 'text-amber-300' },
              '金': { bg: 'bg-zinc-300/10 border-zinc-300/20 text-zinc-300', text: 'text-zinc-300' },
              '水': { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400', text: 'text-blue-300' },
            };
            const style = elementStyles[dayElement] || elementStyles['水'];
            return (
              <div className={`${style.bg} px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-inner border`}>
                <span className="text-xl font-bold font-serif">{chart?.dayMaster}{dayElement}</span>
                <span className={`text-sm font-bold tracking-wide ${style.text}`}>{primaryPattern}</span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 區段 1：八字排盤 — 六柱直立顯示 */}
      <AccordionSection
        title="八字排盤"
        icon={<span>🔮</span>}
        defaultOpen={true}
        badge={<span className="text-zinc-600 text-xs">先天命局</span>}
      >
        <div className="pt-1">
          {/* 六柱水平排列 — 傳統八字命盤格式 (手機版支援左右滑動，桌機版置中) */}
          <div className="flex flex-row gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none snap-x snap-mandatory justify-start md:justify-center items-start pb-2 md:pb-0">
            {pillars.map((p, idx) => {
              const labels = [['主氣'], ['主氣', '餘氣'], ['主氣', '中氣', '餘氣']][p.data.hiddenGan?.length - 1] || [];
              const isDayMaster = p.label.startsWith('日柱');
              const isTopPillar = p.label.startsWith('流年') || p.label.startsWith('大運');

              return (
                <div
                  key={p.label}
                  className={`relative overflow-hidden animate-fade-in-up rounded-lg flex-1 min-w-[92px] md:min-w-0 max-w-[100px] md:max-w-[120px] snap-start shrink-0 md:shrink ${
                    isDayMaster ? 'ring-2 ring-amber-500/40 border-amber-500/30' : 'ring-1 ring-white/10'
                  } ${isTopPillar ? 'md:flex-[0.8]' : ''}`}
                  style={{
                    animationDelay: `${0.2 + idx * 0.05}s`,
                    background: 'rgba(10, 30, 20, 0.5)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(212, 168, 83, 0.1)',
                  }}
                >
                  {/* 頂部標籤 */}
                  <div className={`w-full py-0.5 text-center ${isDayMaster ? 'bg-amber-500/15 border-b border-amber-500/30' : isTopPillar ? 'bg-indigo-500/10 border-b border-indigo-500/20' : 'bg-white/5 border-b border-white/10'}`}>
                    {/* 桌機版完整標籤 */}
                    <span className={`hidden md:block text-xs md:text-sm font-bold tracking-widest ${isDayMaster ? 'text-amber-400' : isTopPillar ? 'text-indigo-400' : 'text-zinc-400'}`}>
                      {p.label}
                    </span>
                    {/* 手機版精簡雙行標籤 */}
                    <div className="md:hidden flex flex-col items-center py-0.5">
                      <span className={`text-[11px] font-bold tracking-widest leading-none ${isDayMaster ? 'text-amber-400' : isTopPillar ? 'text-indigo-400' : 'text-zinc-400'}`}>
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
                    <span className={`text-xs md:text-sm font-bold leading-tight ${isDayMaster ? 'text-amber-400' : 'text-amber-500/60'}`}>
                      {isDayMaster ? '日主' : p.data.tenGod}
                    </span>

                    {/* 天干 */}
                    <span className={`text-2xl md:text-4xl font-bold font-serif leading-none ${getElementColor(p.data.gan)}`}>
                      {p.data.gan}
                    </span>

                    {/* 地支 */}
                    <span className={`text-2xl md:text-4xl font-bold font-serif leading-none ${getElementColor(p.data.zhi)}`}>
                      {p.data.zhi}
                    </span>

                    {/* 藏干（含十神）— 直立排列，由大到小，由右至左，十神在下、藏干在上 */}
                    {p.data.hiddenGan && p.data.hiddenGan.length > 0 && (
                      <div className="flex flex-row-reverse items-start gap-1">
                        {p.data.hiddenGan.map((hg, hidx) => {
                          const hgTenGod = p.data.hiddenTenGods?.[hidx] || '';
                          return (
                            <div key={hidx} className="flex flex-col items-center leading-tight">
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
      <AccordionSection
        title="先天個性核心"
        icon={<span>🧬</span>}
      >
        <div className="pt-2">
          <div className="glass-card p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -ml-8 -mt-8 pointer-events-none" />
            <p className="text-xs md:text-sm text-zinc-300 leading-snug relative z-10">{DAY_MASTER_PERSONALITY[chart.dayMaster]}</p>
          </div>
        </div>
      </AccordionSection>

      {/* 區段 3：外在展現（天干主星） */}
      <AccordionSection
        title="外在展現"
        icon={<span>🌟</span>}
        badge={<span className="text-zinc-600 text-[10px]">天干主星 · 社會形象</span>}
      >
        <div className="pt-2 space-y-1.5">
          {[
            { god: chart.year.tenGod, pillar: '年干', gan: chart.year.gan },
            { god: chart.month.tenGod, pillar: '月干', gan: chart.month.gan },
            { god: chart.hour.tenGod, pillar: '時干', gan: chart.hour.gan }
          ].filter(t => t.god).map((t, idx) => {
            const trait = TEN_GOD_TRAITS[t.god];
            if (!trait) return null;
            return (
              <div key={`${t.pillar}-${t.god}-${idx}`} className="glass-card p-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="flex justify-between items-center mb-1 relative z-10">
                  <span className="text-xs md:text-sm font-bold text-amber-500">
                    {t.god} <span className="text-[10px] text-amber-500/70 ml-1">({t.pillar}: {t.gan})</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">{trait.category}</span>
                </div>
                <p className="text-[10px] text-zinc-500 mb-1 truncate relative z-10">{trait.image}</p>
                <p className="text-xs text-zinc-300 leading-snug mb-2 relative z-10">{trait.trait}</p>
                <div className="space-y-1 relative z-10">
                  <div className="bg-green-500/5 p-2 rounded border border-green-500/10">
                    <span className="text-[10px] font-bold text-green-500/80 block mb-0.5">✔️ 優勢</span>
                    <span className="text-[10px] text-green-100/70">{trait.overload.pros}</span>
                  </div>
                  <div className="bg-red-500/5 p-2 rounded border border-red-500/10">
                    <span className="text-[10px] font-bold text-red-500/80 block mb-0.5">❌ 盲點</span>
                    <span className="text-[10px] text-red-100/70">{trait.overload.cons}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {myTenGods.length === 0 && <p className="text-xs text-zinc-500">無主星紀錄</p>}
        </div>
      </AccordionSection>

      {/* 區段 4：私下展現（地支性格） */}
      <AccordionSection
        title="私下展現"
        icon={<span>🌙</span>}
        badge={<span className="text-zinc-600 text-[10px]">地支性格</span>}
      >
        <div className="pt-2 space-y-1.5">
          {[
            { name: '動態魅力', zhis: ['子', '午', '卯', '酉'], desc: '高顏值、目光焦點喜打扮，具備獨特個人魅力。' },
            { name: '開創行動', zhis: ['寅', '申', '巳', '亥'], desc: '陽剛明快、有話直說、行動力強、充滿活力的變動。' },
            { name: '穩重內斂', zhis: ['辰', '戌', '丑', '未'], desc: '穩重踏實、安靜內斂、富有內涵、喜歡將話藏心中。' }
          ].map(cat => {
            const matched = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi].filter(z => cat.zhis.includes(z));
            if (matched.length === 0) return null;
            return (
              <div key={cat.name} className="glass-card p-2.5 flex items-start gap-3">
                <span className="text-xs font-bold text-amber-500/80 shrink-0 w-16 pt-0.5">{cat.name}</span>
                <div className="flex-1">
                  <p className="text-xs text-zinc-300 leading-snug">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </AccordionSection>

      {/* 區段 5：命局交互作用 */}
      <AccordionSection
        title="命局交互作用"
        icon={<span>⚡</span>}
        badge={<span className="text-zinc-600 text-[10px]">刑沖合會</span>}
      >
        <div className="pt-2 space-y-1.5">
          {(() => {
            const zhis = [chart.year.zhi, chart.month.zhi, chart.day.zhi, chart.hour.zhi];
            const interactions: string[] = [];

            const chongPairs = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
            chongPairs.forEach(([z1, z2]) => {
              if (zhis.includes(z1) && zhis.includes(z2)) {
                interactions.push(`命局帶【${z1}${z2}六沖】：能量變動大，人生較多起伏，適合遠行開創。`);
              }
            });

            const hePairs = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']];
            hePairs.forEach(([z1, z2]) => {
              if (zhis.includes(z1) && zhis.includes(z2)) {
                interactions.push(`命局帶【${z1}${z2}六合】：人際和諧，多貴人相助，關係穩定。`);
              }
            });

            const selfZhis = ['辰', '午', '酉', '亥'];
            const counts: Record<string, number> = {};
            zhis.forEach(z => counts[z] = (counts[z] || 0) + 1);
            selfZhis.forEach(sz => {
              if (counts[sz] >= 2) interactions.push(`命局帶【${sz}${sz}自刑】：內心易糾結，自我要求高，需學會寬心。`);
            });

            if (interactions.length === 0) return (
              <div className="glass-card p-2.5 text-center">
                <p className="text-xs text-zinc-500 italic">本命地支氣場平穩，無劇烈刑沖。</p>
              </div>
            );

            return interactions.map((inter, i) => (
              <div key={i} className="glass-card p-2.5 flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0" />
                <p className="text-xs text-zinc-300 leading-snug">{inter}</p>
              </div>
            ));
          })()}
        </div>
      </AccordionSection>

      {/* 理論速查引用出處 */}
      <div className="pt-3 pb-6 flex justify-center">
        <button
          onClick={() => { sessionStorage.setItem('currentRefTab', 'basic'); if(typeof onNavigate === 'function') onNavigate(10); }}
          className="text-[11px] text-zinc-500 hover:text-amber-500/80 flex items-center gap-1 transition-colors relative group py-1"
        >
          <span className="text-amber-500/60">✱</span>
          <span>本頁面分析皆基於八字命理學說，點擊可查看【理論速查】對照表</span>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-amber-500/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
      </div>
    </div>
  );
}
