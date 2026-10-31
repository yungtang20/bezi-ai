// [AI MOD] FengShuiSystemGuide.tsx — 風水系統速查手冊（收合區）
// 資料來源：src/data/charts/fengShuiSystemGuide.ts（skill hsu-yulan-bazi v2.1 風水章節）。
// 鐵律：風水系統 ≠ 八字系統——本區只提供風水系統知識，不與八字喜忌互相推導。

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FENG_SHUI_SYSTEM_GUIDE, FengShuiSystemSection } from '../data/charts';

export default function FengShuiSystemGuide() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="mb-6 p-5 rounded-2xl border border-zen-border bg-zen-surface/40">
      <div className="mb-3">
        <h4 className="text-base font-bold text-zen-text flex items-center gap-2">
          風水系統速查手冊
        </h4>
        <p className="text-xs text-zen-muted mt-1 leading-relaxed">
          風水是預防醫學，也是與八字分離的另一套系統：佈局不看身強身弱、不看八字忌神。以下是完整章節，點開查閱。
        </p>
      </div>

      <div className="space-y-2">
        {FENG_SHUI_SYSTEM_GUIDE.map((section: FengShuiSystemSection, idx) => {
          const open = openId === section.id;
          return (
            <div
              key={section.id}
              className="rounded-xl border border-zen-border bg-black/20 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zen-surface/40 transition-colors"
                aria-expanded={open}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-zen-muted font-mono text-xs shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-bold text-zen-text truncate">
                    {section.title}
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  className={`text-zen-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <div className="px-4 pb-4 space-y-3 animate-in fade-in duration-200">
                  {section.boundary && (
                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
                      <strong className="text-amber-400 text-xs block mb-1">
                        前提與界線
                      </strong>
                      <p className="text-xs text-zen-text leading-relaxed">
                        {section.boundary}
                      </p>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {section.items.map((it, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-lg bg-zen-surface/30 border border-zen-border"
                      >
                        <strong className="text-zen-text text-xs">
                          {it.name}
                        </strong>
                        <p className="text-xs text-zen-muted mt-1 leading-relaxed">
                          {it.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
