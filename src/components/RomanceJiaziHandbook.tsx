// src/components/RomanceJiaziHandbook.tsx
import { useState, useMemo } from "react";
import { 
  Search, 
  UserCheck, 
  Heart, 
  HelpCircle,
  HelpCircle as HelpIcon,
  ChevronRight,
  Sparkle
} from "lucide-react";
import { spouseTraits, SpouseTrait } from "../data/charts/spouseTraits";

interface Props {
  defaultPillar: string; // e.g. "甲子"
  title: string;
}

export default function RomanceJiaziHandbook({ defaultPillar, title }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string>(defaultPillar || "甲子");

  // Filter list of 60 pillars
  const filteredTraits = useMemo(() => {
    if (!searchTerm.trim()) {
      return spouseTraits;
    }
    const cleanSearch = searchTerm.trim().toLowerCase();
    return spouseTraits.filter(item => 
      item.ganZhi.includes(cleanSearch) || 
      item.personality.includes(cleanSearch) || 
      item.appearance.includes(cleanSearch)
    );
  }, [searchTerm]);

  const activeTrait = useMemo(() => {
    return spouseTraits.find(item => item.ganZhi === selectedPillar) || spouseTraits[0];
  }, [selectedPillar]);

  return (
    <div className="bg-zen-surface/30 border border-zen-border rounded-2xl p-5 mb-4">
      <h3 className="font-bold text-pink-400 text-sm mb-3 flex items-center gap-1.5 font-sans">
        <Sparkle size={16} className="text-pink-500" />
        <span>📖 六十甲子伴侶特質手冊（全命盤自助查詢）</span>
      </h3>
      <p className="text-xs text-zen-muted mb-4 font-sans leading-relaxed">
        除了看自己的「夫妻柱」，您也可以在此查詢伴侶或傾慕對象的日柱主干支（如庚子、甲申），對照徐玉蘭老師整理的先天外貌與性格全貌：
      </p>

      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Left column: List of pillars with quick Search */}
        <div className="w-full lg:w-1/3 flex flex-col border border-white/5 rounded-xl bg-black/40 p-3 h-72">
          {/* Search bar */}
          <div className="relative mb-3 flex items-center">
            <Search size={12} className="absolute left-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="搜尋干支或關鍵字 (如: 溫柔)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/5 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-zen-text focus:outline-none focus:border-pink-500/50"
            />
          </div>

          {/* Scrolling list */}
          <div className="flex-1 overflow-y-auto scrollbar-none space-y-1 pr-1">
            {filteredTraits.map(item => {
              const isSelected = item.ganZhi === selectedPillar;
              const isDefault = item.ganZhi === defaultPillar;
              return (
                <button
                  key={item.ganZhi}
                  type="button"
                  onClick={() => setSelectedPillar(item.ganZhi)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border ${
                    isSelected 
                      ? 'bg-pink-500/15 text-pink-400 border-pink-500/25 shadow-sm' 
                      : 'text-zen-muted border-transparent hover:bg-white/[0.02] hover:text-zen-text'
                  }`}
                >
                  <span className="font-mono">{item.ganZhi} 柱</span>
                  {isDefault && (
                    <span className="px-1 text-[9px] bg-pink-500/20 text-pink-300 font-bold rounded">本命</span>
                  )}
                </button>
              );
            })}
            {filteredTraits.length === 0 && (
              <p className="text-center text-[10px] text-zinc-600 py-6">查無匹配干支。</p>
            )}
          </div>
        </div>

        {/* Right column: Target pillar specs */}
        <div className="flex-1 flex flex-col justify-between bg-black/20 p-5 rounded-xl border border-white/5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <span className="text-[10px] text-pink-400 font-bold block uppercase tracking-wider font-sans">
                  {selectedPillar === defaultPillar ? "本命首要分析" : "選定干支理氣"}
                </span>
                <h4 className="text-xl font-black font-serif text-white flex items-center gap-2">
                  <span>{activeTrait.ganZhi}</span>
                  <span className="text-xs font-bold text-zen-muted font-mono bg-white/5 px-2 py-0.5 rounded-full">
                    {selectedPillar === defaultPillar ? "夫妻星/柱位" : "手冊索引"}
                  </span>
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] text-pink-300 font-black tracking-wider block mb-1 font-sans">🧠 先天性格解構</span>
                <p className="text-xs text-zen-text leading-relaxed font-sans">
                  {activeTrait.personality}
                </p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] text-purple-300 font-black tracking-wider block mb-1 font-sans">👔 外在樣貌風情</span>
                <p className="text-xs text-zen-text leading-relaxed font-sans">
                  {activeTrait.appearance}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-zen-muted mt-4 border-t border-white/5 pt-2.5 leading-relaxed font-sans">
            ※ 上述六十甲子對照出自講義，若本局有多個夫妻星，可使用上方搜尋條查看另一夫妻星所在柱之干支特質；若命局無夫妻星，直接點選「日柱」（即本命日干支）特徵查看。
          </p>
        </div>
      </div>
    </div>
  );
}
