// src/components/DailyForecastCard.tsx
import { BaziChart } from '../paipan';
import { getUpcomingDatesForCategory } from '../dailyAnalysis';

interface DailyForecastCardProps {
  chart: BaziChart;
  category: 'wealth' | 'health_warning' | 'career' | 'romance' | 'move_in' | 'villain';
  categoryName: string;
  accentColor: string;
  title: string;
  emptyMessage: string;
  actionGuide: string;
  dateBorderColors: {
    border: string;
    bg: string;
    text: string;
  };
  emoji?: string;
  showQualityBadge?: boolean;
  extraWarning?: string;
}

export default function DailyForecastCard({
  chart,
  category,
  categoryName,
  accentColor,
  title,
  emptyMessage,
  actionGuide,
  dateBorderColors,
  emoji,
  showQualityBadge = false,
  extraWarning,
}: DailyForecastCardProps) {
  // 取得近期日期
  const upcomingDays = getUpcomingDatesForCategory(chart, category, [], [], '', 3, []);

  // 根據 categoryName 選擇 emoji
  const displayEmoji = emoji || (categoryName === '財富' ? '💰' : categoryName === '健康' ? '⚠️' : categoryName === '事業' ? '🚀' : categoryName === '姻緣' ? '💕' : categoryName === '家庭' ? '🏠' : '👥');

  return (
    <div className="glass-card">
      <h2 className="text-xl font-bold text-zen-text mb-4">
        <span className={accentColor}>{displayEmoji}</span>{' '}
        {title}
      </h2>
      <div className="bg-zen-surface/60 border border-zen-border rounded-xl p-4">
        <h3 className={`font-bold ${accentColor} text-sm mb-2`}>{title}</h3>

        {upcomingDays.length > 0 ? (
          <div className="mt-2 mb-2 p-3 bg-zen-surface/40 rounded-lg border border-zen-border">
            <div className="flex flex-wrap gap-2">
              {upcomingDays.map((d: { date: string; ganZhi: string; isFavorable: boolean }, i: number) => (
                <span
                  key={i}
                  className={`px-2 py-1 ${dateBorderColors.bg} ${dateBorderColors.text} rounded text-xs gap-1 flex items-center`}
                >
                  {d.date} ({d.ganZhi})
                  {showQualityBadge && d.isFavorable && (
                    <span className={`text-xs ${dateBorderColors.bg} px-1 rounded ml-1`}>🌟 高質量</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-base text-zen-muted font-bold mt-2">{emptyMessage}</p>
        )}

        <div className="mt-3 text-sm text-zen-muted border-t border-zen-border pt-3">
          <strong className="text-zen-text">行動指南：</strong> {actionGuide}
          {extraWarning && (
            <span className="block mt-1">
              <strong className="text-red-400">特別注意：</strong> {extraWarning}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
