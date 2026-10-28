// ContentSection — conclusion-first analysis block, single responsibility.
// 內容區塊：固定文法「結論先行 → 依據 → 時間窗 → 動作 → 不確定處」。
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GRAMMAR_RULES, SectionGrammar } from "./grammar";

interface ContentSectionProps {
  grammar: SectionGrammar;
  /** Initially open on desktop, closed on mobile (progressive disclosure). */
  defaultOpen?: boolean;
}

export function ContentSection({ grammar, defaultOpen }: ContentSectionProps) {
  const [open, setOpen] = React.useState(
    defaultOpen ?? (typeof window === "undefined" || window.innerWidth >= 768)
  );

  const evidenceFirst = grammar.evidence ?? null;
  const actions = (grammar.actions ?? []).slice(0, GRAMMAR_RULES.actionsMax);

  return (
    <section className="mb-4 border border-white/5 rounded-xl bg-white/5 p-4 md:p-6">
      <div className="flex items-center justify-between cursor-pointer group" onClick={() => setOpen(!open)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(!open); }}>
        <h3 className={`text-lg font-serif text-zen-text tracking-tight leading-tight flex items-center gap-2`}>
          {grammar.level === 2 ? <span className="text-xl">🔸</span> : <span className="text-lg">▸</span>}
          {grammar.title}
        </h3>
        {open ? <ChevronUp size={16} className="text-zen-muted/60 group-hover:text-zen-accent transition-colors" /> : <ChevronDown size={16} className="text-zen-muted/60 group-hover:text-zen-accent transition-colors" />}
      </div>

      {!open ? null : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-zen-text leading-relaxed">
            <span className="font-medium text-zen-accent">結論：</span> {grammar.conclusion}
          </p>
          {evidenceFirst && (
            <div className="bg-white/3 rounded-lg p-3 border border-white/10 text-sm text-zen-muted leading-relaxed">
              <span className="block text-xs font-medium text-zen-sage/70 mb-1 uppercase tracking-wider">依據</span>
              {evidenceFirst}
            </div>
          )}
          {grammar.timeWindow && (
            <p className="text-sm text-zen-muted/80 leading-relaxed">
              <span className="font-medium text-zen-sage/70">時間窗：</span> {grammar.timeWindow}
            </p>
          )}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-zen-sage/70 uppercase tracking-wider mb-1 block md:inline-block md:mr-2">可執行：</span>
              {actions.map((a, i) => (
                <button key={i} type="button" className="text-xs bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-zen-muted hover:bg-white/20 hover:text-zen-text transition-colors">
                  {a}
                </button>
              ))}
            </div>
          )}
          {grammar.uncertainty && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-sm text-amber-200 leading-relaxed">
              <span className="block text-xs font-medium text-amber-400 mb-1 uppercase tracking-wider">不確定處</span>
              {grammar.uncertainty}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
