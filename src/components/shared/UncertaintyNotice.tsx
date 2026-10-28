// UncertaintyNotice — honest "unknown" banner, single responsibility.
// 不確定處：顯式標示誠實界線，不靠 AI 自說自話。
import React from "react";

interface UncertaintyNoticeProps {
  children: React.ReactNode;
}

export function UncertaintyNotice({ children }: UncertaintyNoticeProps) {
  return (
    <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-sm text-amber-200 leading-relaxed mb-4">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 mb-1 uppercase tracking-wider block">
        <span>⚠</span> 不確定處
      </span>
      {children}
    </div>
  );
}
