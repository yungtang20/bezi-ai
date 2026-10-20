import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { LECTURE_DATA } from '../data';
import { GAN_TO_ELEMENT } from '../constants';

interface Props {
  remedyText: string;
  dayMaster: string;
}

// 根據十神類別取得對應五行
function getElementForCategory(dayMaster: string, category: string): string {
  const dayElement = GAN_TO_ELEMENT[dayMaster];
  const elements = ['木', '火', '土', '金', '水'];
  const idx = elements.indexOf(dayElement);
  if (category === '比劫') return dayElement;
  if (category === '食傷') return elements[(idx + 1) % 5];
  if (category === '財星') return elements[(idx + 2) % 5];
  if (category === '官殺') return elements[(idx + 3) % 5];
  if (category === '印星') return elements[(idx + 4) % 5];
  return '';
}

// 提取文本中出現的十神分類
function getMentionedCategories(remedy: string): string[] {
  const categories = ['財星', '食傷', '官殺', '印星', '比劫'];
  return categories.filter(c => remedy.includes(c));
}

// 提取【 】中推薦的五行或文本中出現的五行
function getMentionedElements(remedy: string): string[] {
  const elements = ['木', '火', '土', '金', '水'];
  const match = remedy.match(/【([^】]+)】/);
  if (match) {
    const content = match[1];
    return elements.filter(e => content.includes(e));
  }
  return elements.filter(e => remedy.includes(e));
}

export default function RemedyBrocade({ remedyText, dayMaster }: Props) {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  const toggleOpen = (key: string) => {
    setOpenStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!remedyText) return null;

  // 1. 取得十神對應的五行
  const categories = getMentionedCategories(remedyText);
  const categoryElements = categories.map(cat => getElementForCategory(dayMaster, cat)).filter(Boolean);

  // 2. 取得【 】中直接推薦的五行
  const directElements = getMentionedElements(remedyText);

  // 3. 合併所有需要補充的五行 (去重)
  const uniqueElements = Array.from(new Set([...categoryElements, ...directElements]));

  // 4. 解析文本中的條目，排除導入說明行
  const lines = remedyText.split('\n')
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('👉'));

  return (
    <div className="mt-4 space-y-4 text-left">
      {lines.length > 0 && (
        <ul className="space-y-2 bg-black/20 p-4 rounded-xl border border-zinc-800/40">
          {lines.map((line, idx) => (
            <li key={idx} className="text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </li>
          ))}
        </ul>
      )}

      {uniqueElements.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-zinc-800/60">
          <h6 className="text-sm font-bold text-amber-500/90 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>五行開運能量指引錦囊</span>
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uniqueElements.map(elem => {
              const data = LECTURE_DATA.ELEMENT_REMEDIES[elem as keyof typeof LECTURE_DATA.ELEMENT_REMEDIES];
              if (!data) return null;
              
              const isOpen = openStates[elem];
              return (
                <div key={elem} className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-zinc-700">
                  <button
                    onClick={() => toggleOpen(elem)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-bold text-amber-400 tracking-wide flex items-center gap-1.5">
                      🔮 補充「{elem}」能量
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 text-xs text-zinc-300 space-y-3 border-t border-zinc-800 bg-zinc-900/40 leading-relaxed">
                      <div>
                        <strong className="text-amber-400 block mb-1">🎯 核心行動：</strong>
                        <span>{data.action}</span>
                      </div>
                      <div>
                        <strong className="text-amber-400 block mb-1">🗺️ 旅遊開運方位：</strong>
                        <span>{data.travel}</span>
                      </div>
                      <div>
                        <strong className="text-amber-400 block mb-1">🎨 穿搭與空間顏色：</strong>
                        <span>{data.color}</span>
                      </div>
                      <div>
                        <strong className="text-amber-400 block mb-1">🧸 吉祥物品與生肖：</strong>
                        <span>{data.items}</span>
                      </div>
                      <div className="pt-2 border-t border-red-950/40 text-rose-300/90">
                        <strong className="text-rose-400 block mb-1">⚠️ 需避免事項：</strong>
                        <span>{data.avoid}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
