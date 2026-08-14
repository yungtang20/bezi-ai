// src/components/FlyingStarsDisplay.tsx
import { Solar } from 'lunar-javascript';

interface FlyingStar {
  name: string;
  type: string;
  location: string;
  remedy: string;
}

interface FlyingStarsDisplayProps {
  title?: React.ReactNode;
  subtitle?: string;
  year: number;
  onYearChange: (year: number) => void;
  stars: FlyingStar[];
  accentColor: string; // 強調色 class 名稱
  gridColumns?: 2 | 3; // 網格列數，預設 3
}

export default function FlyingStarsDisplay({
  title,
  subtitle,
  year,
  onYearChange,
  stars,
  accentColor,
  gridColumns = 3
}: FlyingStarsDisplayProps) {
  const yearRange = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
  const responsiveGridClass = gridColumns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className="mt-6 border-t border-zen-border pt-6">
      {/* 標題區 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        {title && (
          <h5 className={`text-md font-bold ${accentColor} flex items-center gap-2`}>
            {title}
          </h5>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zen-muted">觀測流年：</span>
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="bg-zen-surface/60 border border-zen-border rounded-lg px-3 py-1.5 text-zen-text text-sm outline-none focus:border-zen-gold/50"
          >
            {yearRange.map(y => (
              <option key={y} value={y}>
                {y}年 ({Solar.fromYmdHms(y, 6, 1, 0, 0, 0).getLunar().getYearInGanZhi()}年)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 副標題 */}
      {subtitle && (
        <p className="text-xs text-zen-muted mb-4 leading-relaxed font-sans">
          {subtitle}
        </p>
      )}

      {/* 飛星列表 */}
      <div className={`grid grid-cols-1 ${responsiveGridClass} gap-4`}>
        {stars.map((star) => (
          <div key={star.name} className="glass-card p-4 space-y-2 font-sans">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${accentColor} bg-zen-surface/60 border border-zen-border mb-1`}>
              {star.location}｜{star.name}
            </span>
            <p className="text-xs text-zen-text leading-relaxed font-sans">
              {star.remedy}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
