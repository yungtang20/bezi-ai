import { useState, useEffect, useRef } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores, getPrimaryPattern, determinePattern, getFavorableElements } from '../pattern';
import HealthPage from './HealthPage';
import WealthPage from './WealthPage';
import CareerPage from './CareerPage';
import FriendsPage from './FriendsPage';
import RomancePage from './RomancePage';
import FamilyPage from './FamilyPage';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPartners } from '../storage';

// [AI MOD] 定義 Partner 介面，取代 any
interface Partner {
  id: string;
  name: string;
  birthDate?: string;
  birthTime?: string;
  gender?: string;
  chart?: BaziChart;
}

interface Props {
  chart: BaziChart;
  scores: PatternScores;
  name: string;
  onNavigate: (step: number) => void;
}

const TABS = [
  { key: 'health', label: '🌿 健康篇', shortLabel: '健康' },
  { key: 'wealth', label: '💰 財富篇', shortLabel: '財富' },
  { key: 'career', label: '💼 事業篇', shortLabel: '事業' },
  { key: 'friends', label: '🤝 人際篇', shortLabel: '人際' },
  { key: 'family', label: '🏠 家人篇', shortLabel: '家人' },
  { key: 'romance', label: '💕 姻緣篇', shortLabel: '姻緣' },
] as const;

export default function SpecialtyNav({ chart, scores, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState('health');
  // [AI MOD] 使用 Partner 型別取代 any[]
  const [partners, setPartners] = useState<Partner[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPartners().then(list => {
      setPartners(list);
    }).catch(() => {});
  }, []);

  if (!chart || !scores) {
    return <div className="p-8 text-center text-zen-muted">缺少排盤資料，請返回首頁重新測算。</div>;
  }

  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = determinePattern(chart);

  const { favorable, unfavorable } = getFavorableElements(chart.dayMaster, primaryPattern);

  const renderComponent = () => {
    const props = {
      chart,
      scores,
      primaryPattern,
      favorable,
      unfavorable,
      weakestElement: patternResult.weakestElement,
      weakestElements: patternResult.weakestElements,
      onNavigate
    };

    switch(activeTab) {
      case 'health': return <HealthPage {...props} partners={partners} />;
      case 'wealth': return <WealthPage {...props} partners={partners} />;
      case 'career': return <CareerPage {...props} partners={partners} />;
      case 'friends': return <FriendsPage {...props} partners={partners} />;
      case 'romance': return <RomancePage {...props} partners={partners} />;
      case 'family': return <FamilyPage {...props} partners={partners} />;
      default: return <HealthPage {...props} partners={partners} />;
    }
  };

  // [AI MOD] Navigate to prev/next tab
  const currentIdx = TABS.findIndex(t => t.key === activeTab);
  const goToPrev = () => {
    if (currentIdx > 0) setActiveTab(TABS[currentIdx - 1].key);
  };
  const goToNext = () => {
    if (currentIdx < TABS.length - 1) setActiveTab(TABS[currentIdx + 1].key);
  };

  return (
    <div className="max-w-7xl mx-auto w-full pt-6 pb-32 px-4 md:px-0 text-zen-text text-sm">
      {/* 返回按鈕 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(4)}
          className="flex items-center gap-2 text-zen-muted hover:text-zen-text transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-bold text-sm">返回八字排盤</span>
        </button>

        {/* 左右切換箭頭（桌面版） */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={currentIdx === 0}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zen-text hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-zinc-600 min-w-[40px] text-center">
            {currentIdx + 1} / {TABS.length}
          </span>
          <button
            onClick={goToNext}
            disabled={currentIdx === TABS.length - 1}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zen-text hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 頁籤導航 (Segmented Control Style) */}
      <div ref={tabsRef} role="tablist" className="flex flex-wrap lg:flex-nowrap gap-2 mb-8 bg-black/40 border border-white/5 p-2 rounded-2xl shadow-inner">
        {TABS.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-3 transition-all duration-300 flex-1 min-w-[80px] whitespace-nowrap text-center focus:outline-none rounded-xl ${
              activeTab === tab.key
                ? 'text-zen-gold font-bold bg-white/10 shadow-[0_2px_10px_rgba(212,168,83,0.15)] border border-white/10'
                : 'text-zen-muted border border-transparent hover:text-zen-text hover:bg-white/5'
            }`}
          >
            {/* 手機版顯示短標籤，桌面版顯示完整標籤 */}
            <span className="md:hidden text-xs font-sans">{tab.shortLabel}</span>
            <span className="hidden md:inline text-sm font-sans">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 內容區 */}
      <div role="tabpanel" className="space-y-6">
        {renderComponent()}

        {/* 手機版底部切換 */}
        <div className="flex md:hidden items-center justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={goToPrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 text-xs text-zen-muted hover:text-zen-text disabled:opacity-30 disabled:cursor-not-allowed transition-all font-sans"
          >
            <ChevronLeft size={14} />
            上一個
          </button>
          <span className="text-xs text-zen-muted font-sans">
            {TABS[currentIdx].shortLabel}
          </span>
          <button
            onClick={goToNext}
            disabled={currentIdx === TABS.length - 1}
            className="flex items-center gap-1 text-xs text-zen-muted hover:text-zen-text disabled:opacity-30 disabled:cursor-not-allowed transition-all font-sans"
          >
            下一個
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 常駐 夥伴合盤觀測 */}
        <div className="flex justify-center mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => onNavigate(9)}
            className="group relative px-6 py-3 bg-zen-card text-zen-text hover:text-zen-gold rounded-full border border-white/10 hover:border-zen-gold/50 transition-all overflow-hidden flex items-center gap-2"
          >
            <span className="relative z-10 font-bold tracking-wider text-sm font-sans">開啟專屬【夥伴合盤觀測】</span>
            <div className="absolute inset-0 bg-zen-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 opacity-70 group-hover:translate-x-1 transition-transform duration-300 text-sm">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
