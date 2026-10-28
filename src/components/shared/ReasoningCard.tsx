// ReasoningCard — single piece of evidence with label.
// 依據卡：單一證據 + 標籤，供內容區塊複用。
import React from "react";

interface ReasoningCardProps {
  label?: string;
  children: React.ReactNode;
  variant?: "default" | "muted" | "accent";
}

export function ReasoningCard({ label, children, variant = "default" }: ReasoningCardProps) {
  const base = "rounded-lg border p-3 text-sm leading-relaxed text-zen-text";
  const variants: Record<string, string> = {
    default: `bg-white/5 border-white/10`,
    muted: `bg-white/3 border-white/5 text-zen-muted/80`,
    accent: `bg-zen-sage/5 border-zen-sage/20 text-zen-text`,
  };

  return (
    <div className={`${base} ${variants[variant]}`}>
      {label && (
        <span className="block text-xs font-medium text-zen-sage/70 mb-1 uppercase tracking-wider">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
