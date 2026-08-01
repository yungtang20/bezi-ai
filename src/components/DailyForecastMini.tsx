// [AI MOD] DailyForecastMini.tsx — 側邊欄精簡版流日預報元件
// 顯示選定日期的六大領域能量預報，支援日期切換與心流記錄

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores, getPrimaryPattern, determinePattern, getFavorableElements } from '../pattern';
import { DailyEnergy, getDailyEnergy, getUpcomingDatesForCategory } from '../dailyAnalysis';
import { DailyLog, saveDailyLog, getDailyLog } from '../storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ==================== 型別定義 ====================

interface DailyForecastMiniProps {
  chart: BaziChart;
  scores: PatternScores;
}

interface CategoryInfo {
  key: string;
  label: string;
  emoji: string;
  color: string;
}

interface CategoryScore extends CategoryInfo {
  score: number;
  description: string;
  outcome: '吉' | '凶' | '平';
}

// [AI MOD] 本地型別，對應 dailyAnalysis 內部的 UpcomingDay（不 export）
interface UpcomingDay {
  date: string;
  ganZhi: string;
  isFavorable: boolean;
}

// ==================== 六大領域定義 ====================

const CATEGORIES = [
  { key: 'health', label: '健康', emoji: '🏃', color: 'emerald' },
  { key: 'career', label: '事業', emoji: '💼', color: 'blue' },
  { key: 'romance', label: '感情', emoji: '❤️', color: 'rose' },
  { key: 'wealth', label: '金錢', emoji: '💰', color: 'amber' },
  { key: 'family', label: '家人', emoji: '🤝', color: 'violet' },
  { key: 'friends', label: '人際', emoji: '🙌', color: 'cyan' },
] as const;

// 領域對應的 getUpcomingDatesForCategory 類別
const CATEGORY_TO_UPCOMING_KEY: Record<string, 'health_warning' | 'career' | 'romance' | 'wealth' | 'villain' | 'move_in'> = {
  health: 'health_warning',
  career: 'career',
  romance: 'romance',
  wealth: 'wealth',
  family: 'move_in',     // 家人以動土日替代（低耦合）
  friends: 'villain',    // 人際以犯小人日替代（警示日）
};

// ==================== 輔助函式 ====================

/**
 * 將 Date 格式化為 YYYY-MM-DD
 */
function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 取得星期幾（繁體中文）
 */
function getDayOfWeek(date: Date): string {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `星期${days[date.getDay()]}`;
}

/**
 * 取得分數對應的顏色 class
 */
function getScoreColor(score: number): string {
  if (score > 0) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  if (score < 0) return 'bg-red-500/20 text-red-400 border border-red-500/30';
  return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
}

/**
 * 取得領域結果標籤
 */
function getOutcomeLabel(outcome: string): '吉' | '凶' | '平' {
  if (outcome === '順利' || outcome === '小吉' || outcome === '大好') return '吉';
  if (outcome === '較差' || outcome === '不順' || outcome === '不佳') return '凶';
  return '平';
}

/**
 * 根據理論結果取得簡短描述
 */
function getOutcomeDescription(outcome: string, categoryLabel: string): string {
  switch (outcome) {
    case '大好':
      return `今日${categoryLabel}能量極佳，大有可為`;
    case '順利':
    case '小吉':
      return `今日${categoryLabel}運勢順利，穩中有進`;
    case '平穩':
      return `今日${categoryLabel}能量平穩，宜平常心`;
    case '較差':
      return `今日${categoryLabel}阻力較大，保守為宜`;
    case '不順':
    case '不佳':
      return `今日${categoryLabel}宜靜不宜動，多休息`;
    default:
      return `今日${categoryLabel}平穩無波`;
  }
}

// ==================== 主元件 ====================

export default function DailyForecastMini({ chart, scores }: DailyForecastMiniProps) {
  // ---- 狀態 ----
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  });
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergy | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState<Record<string, 'good' | 'bad' | null>>({
    health: null,
    career: null,
    romance: null,
    wealth: null,
    family: null,
    friends: null,
  });
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [upcomingMap, setUpcomingMap] = useState<Record<string, UpcomingDay[]>>({});

  // ---- 預先計算格局資料（不隨日期變化） ----
  const primaryPattern = useMemo(() => getPrimaryPattern(scores), [scores]);
  const patternResult = useMemo(() => determinePattern(chart), [chart]);
  const { favorable, unfavorable } = useMemo(
    () => getFavorableElements(chart.dayMaster, primaryPattern),
    [chart.dayMaster, primaryPattern]
  );

  // ---- 載入各領域事件日（只載入一次） ----
  useEffect(() => {
    if (!chart) return;

    const catKeys = ['health', 'career', 'romance', 'wealth', 'family', 'friends'] as const;
    const result: Record<string, UpcomingDay[]> = {};

    for (const cat of catKeys) {
      const upcomingKey = CATEGORY_TO_UPCOMING_KEY[cat];
      if (upcomingKey) {
        result[cat] = getUpcomingDatesForCategory(
          chart,
          upcomingKey,
          favorable,
          unfavorable,
          patternResult.weakestElement,
          30, // 掃描 30 天
          undefined,
          365 // 最多掃一年
        );
      }
    }

    setUpcomingMap(result);
  }, [chart, favorable, unfavorable, patternResult.weakestElement]);

  // ---- 計算選定日期的流日能量 ----
  useEffect(() => {
    if (!chart || !scores) return;

    const energy = getDailyEnergy(
      chart,
      patternResult.weakestElement,
      favorable,
      unfavorable,
      primaryPattern,
      selectedDate
    );
    setDailyEnergy(energy);

    // 檢查是否已記錄
    const dateStr = formatDateStr(selectedDate);
    getDailyLog(dateStr)
      .then(log => {
        if (log) {
          setIsCheckedIn(true);
          setCategoryFeedback({
            health: log.health || null,
            career: log.career || null,
            romance: log.romance || null,
            wealth: log.wealth || null,
            family: log.family || null,
            friends: log.friends || null,
          });
        } else {
          setIsCheckedIn(false);
          setCategoryFeedback({
            health: null,
            career: null,
            romance: null,
            wealth: null,
            family: null,
            friends: null,
          });
        }
      })
      .catch(() => {
        /* [AI MOD] 靜默處理 DB 錯誤 */
        setIsCheckedIn(false);
      });
  }, [chart, scores, selectedDate, favorable, unfavorable, primaryPattern, patternResult.weakestElement]);

  // ---- 日期導航 ----
  const goToPrevDay = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  }, []);

  // ---- 計算各領域能量分數 ----
  const categoryScores: CategoryScore[] = useMemo(() => {
    if (!dailyEnergy) return [];

    const selectedDateStr = formatDateStr(selectedDate);
    const selectedMonthDay = `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`;

    return CATEGORIES.map(cat => {
      // 從 upcomingMap 找出此日期是否為事件日
      const events = upcomingMap[cat.key] || [];
      const isEventDay = events.some(e => e.date === selectedMonthDay);

      // 根據理論結果與是否為事件日推估分數
      let score = 0;
      const outcome = dailyEnergy.theoreticalOutcome;

      if (isEventDay) {
        // 事件日：根據 favorable 判斷
        score = dailyEnergy.isExtremeDay ? 3 : 1.5;
      }

      // 根據理論結果調整
      switch (outcome) {
        case '大好':
          score += 2;
          break;
        case '順利':
        case '小吉':
          score += 1;
          break;
        case '平穩':
          // 不調整
          break;
        case '較差':
          score -= 1;
          break;
        case '不順':
        case '不佳':
          score -= 2;
          break;
      }

      // 特殊日處理
      if (dailyEnergy.isWeaknessDay) {
        if (cat.key === 'health') score -= 1; // 弱化日健康較差
      }

      const outcomeLabel = getOutcomeLabel(outcome);
      const description = getOutcomeDescription(outcome, cat.label);

      return {
        ...cat,
        score,
        description,
        outcome: outcomeLabel,
      };
    });
  }, [dailyEnergy, selectedDate, upcomingMap]);

  // ---- 整體評語 ----
  const overallComment = useMemo(() => {
    if (!dailyEnergy) return '命盤資料載入中...';

    const totalScore = categoryScores.reduce((sum, c) => sum + c.score, 0);
    const outcome = dailyEnergy.theoreticalOutcome;

    if (outcome === '大好' || totalScore > 5) {
      return '🌟 今日整體運勢極佳，能量充沛，適合積極行動、把握機會！';
    }
    if (outcome === '順利' || outcome === '小吉' || totalScore > 2) {
      return '✨ 今日運勢平穩中有進展，適合推進計畫、穩定發展。';
    }
    if (outcome === '平穩' || totalScore >= -2) {
      return '⚖️ 今日運勢平穩，適合按部就班、維持現狀。';
    }
    if (outcome === '較差' || totalScore >= -5) {
      return '⚠️ 今日宜保守謹慎，避免重大決定，多觀察少行動。';
    }
    return '🌙 今日宜靜不宜動，多休息養精蓄銳，等待時機。';
  }, [dailyEnergy, categoryScores]);

  // ---- 心流記錄 ----
  const handleCheckIn = useCallback(async () => {
    const hasAny = Object.values(categoryFeedback).some(v => v !== null);
    if (!hasAny) return;

    const dateStr = formatDateStr(selectedDate);
    const log: DailyLog = {
      date: dateStr,
      health: categoryFeedback.health,
      career: categoryFeedback.career,
      romance: categoryFeedback.romance,
      wealth: categoryFeedback.wealth,
      family: categoryFeedback.family,
      friends: categoryFeedback.friends,
      note: '',
      theoreticalOutcome: dailyEnergy?.theoreticalOutcome || '平穩',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveDailyLog(log);
      setIsCheckedIn(true);
      setShowCheckIn(false);
    } catch (e) {
      console.error('[AI MOD] DailyForecastMini handleCheckIn failed:', e);
    }
  }, [categoryFeedback, selectedDate, dailyEnergy]);

  // ---- 領域 feedback 切換 ----
  const toggleFeedback = useCallback((key: string, value: 'good' | 'bad') => {
    setCategoryFeedback(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }, []);

  // ---- 領域顏色 class ----
  const getCategoryColorClass = (outcome: '吉' | '凶' | '平'): string => {
    switch (outcome) {
      case '吉':
        return 'text-emerald-400';
      case '凶':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // ==================== 渲染 ====================

  return (
    <div className="space-y-3">
      {/* 標題 */}
      <h3 className="text-sm font-bold text-zen-gold flex items-center gap-1.5">
        📅 流日預報
      </h3>

      {/* 日期導航 */}
      <div className="flex items-center justify-between bg-zen-surface/40 border border-zen-border rounded-lg px-2 py-1.5">
        <button
          type="button"
          onClick={goToPrevDay}
          className="p-1 hover:bg-white/10 rounded transition text-zen-muted"
          aria-label="前一天"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="text-center">
          <span className="text-xs font-medium text-zen-text block">
            {formatDateStr(selectedDate).slice(5)} ({getDayOfWeek(selectedDate)})
          </span>
          {dailyEnergy && (
            <span className="text-[10px] text-zen-muted block">
              {dailyEnergy.dayGanZhi}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={goToNextDay}
          className="p-1 hover:bg-white/10 rounded transition text-zen-muted"
          aria-label="後一天"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 整體評語 */}
      <div className="bg-zen-surface/40 border border-zen-border rounded-lg p-3">
        <p className="text-xs text-zen-text leading-relaxed">{overallComment}</p>
      </div>

      {/* 六大領域能量 */}
      <div className="grid grid-cols-2 gap-2">
        {categoryScores.map(cat => (
          <div
            key={cat.key}
            className="bg-zen-surface/40 border border-zen-border rounded-lg p-2 space-y-1"
          >
            {/* 領域名稱 + 分數 */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zen-muted">
                {cat.emoji} {cat.label}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getScoreColor(cat.score)}`}
              >
                {cat.score > 0 ? '+' : ''}
                {cat.score.toFixed(1)}
              </span>
            </div>

            {/* 吉/凶/平標籤 */}
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-medium ${getCategoryColorClass(cat.outcome)}`}>
                {cat.outcome}
              </span>
            </div>

            {/* 簡短描述 */}
            <p className="text-[10px] text-zen-sage leading-tight">
              {cat.description}
            </p>
          </div>
        ))}
      </div>

      {/* 記錄按鈕 */}
      {!isCheckedIn && !showCheckIn && (
        <button
          type="button"
          onClick={() => setShowCheckIn(true)}
          className="w-full py-1.5 bg-zen-gold/10 hover:bg-zen-gold/20 border border-zen-gold/30 text-zen-gold text-xs rounded-lg transition-colors"
        >
          📝 記錄今日能量
        </button>
      )}

      {/* 記錄表單 */}
      {showCheckIn && (
        <div className="bg-zen-surface/40 border border-zen-border rounded-lg p-3 space-y-2">
          <p className="text-xs text-zen-muted">回顧今天各領域感受：</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map(cat => (
              <div key={cat.key} className="flex items-center gap-1">
                <span className="text-xs text-zen-muted shrink-0 w-6">
                  {cat.emoji}
                </span>
                <button
                  type="button"
                  onClick={() => toggleFeedback(cat.key, 'good')}
                  className={`flex-1 py-1 text-[10px] rounded transition-colors ${
                    categoryFeedback[cat.key] === 'good'
                      ? 'bg-emerald-500/30 text-emerald-400'
                      : 'bg-zen-surface/60 text-zen-muted hover:bg-emerald-500/10'
                  }`}
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => toggleFeedback(cat.key, 'bad')}
                  className={`flex-1 py-1 text-[10px] rounded transition-colors ${
                    categoryFeedback[cat.key] === 'bad'
                      ? 'bg-red-500/30 text-red-400'
                      : 'bg-zen-surface/60 text-zen-muted hover:bg-red-500/10'
                  }`}
                >
                  ✗
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCheckIn(false)}
              className="flex-1 py-1.5 bg-zen-surface/60 hover:bg-zen-surface/40 text-zen-muted text-xs rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={!Object.values(categoryFeedback).some(v => v !== null)}
              className="flex-1 py-1.5 bg-zen-gold/20 hover:bg-zen-gold/30 text-zen-gold text-xs rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              儲存
            </button>
          </div>
        </div>
      )}

      {/* 已記錄提示 */}
      {isCheckedIn && !showCheckIn && (
        <div className="text-center py-2 text-emerald-400 text-xs">
          ✅ 今日已記錄
        </div>
      )}
    </div>
  );
}
