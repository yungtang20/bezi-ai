import { useState, useEffect } from 'react';
import { BaziChart } from '../paipan';
import {
  PatternScores,
  getPrimaryPattern,
  determinePattern,
  getFavorableElements,
} from '../pattern';
import {
  DailyEnergy,
  getDailyEnergy,
  getUpcomingDatesForCategory,
} from '../dailyAnalysis';
import { getDailyLog, getMonthLogs } from '../storage';
import { submitCheckIn } from '../lib/checkInSubmit';
import { useCheckInStats } from '../hooks/useCheckInStats';
import {
  CATEGORY_LABELS,
  DAY_TYPE_FIELDS,
  isBadOutcome,
  isGoodOutcome,
  type CategoryKey,
} from '../calibration';
import MonthlyForecastCalendar from './MonthlyForecastCalendar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

// 六大領域打卡選項：label 一律引用 calibration 的單一真實來源（CATEGORY_LABELS），
// 避免各處各寫一份名稱（曾出現「金錢/家人」與「財運/家庭」並存）。
const CATEGORY_OPTIONS: { key: CategoryKey; label: string }[] = (
  [
    'health',
    'career',
    'romance',
    'wealth',
    'family',
    'friends',
  ] as CategoryKey[]
).map((key) => ({
  key,
  label: CATEGORY_LABELS[key],
}));

interface Props {
  chart?: BaziChart | null;
  scores?: PatternScores | null;
  onNavigate?: (step: number) => void;
}

export default function DailyForecastPage({
  chart,
  scores,
  onNavigate,
}: Props) {
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergy | null>(null);
  // [AI MOD] 連續打卡 + 準確率報告
  const { streak, report, refresh: refreshStats } = useCheckInStats();
  const [categoryFeedback, setCategoryFeedback] = useState<
    Record<string, 'good' | 'bad' | null>
  >({
    health: null,
    career: null,
    romance: null,
    wealth: null,
    family: null,
    friends: null,
  });
  const [overrideOutcome, setOverrideOutcome] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [monthAccuracy, setMonthAccuracy] = useState<number | null>(null);
  const [monthCategoryStats, setMonthCategoryStats] = useState<
    { name: string; score: number }[]
  >([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  });

  if (!chart || !scores)
    return (
      <div className="text-center p-10 text-zen-muted">命盤資料載入中...</div>
    );

  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = determinePattern(chart);
  const { favorable, unfavorable } = getFavorableElements(
    chart.dayMaster,
    primaryPattern
  );
  const hasComparableDirection = dailyEnergy
    ? isGoodOutcome(dailyEnergy.theoreticalOutcome) ||
      isBadOutcome(dailyEnergy.theoreticalOutcome)
    : false;
  const evaluatedFields =
    dailyEnergy && hasComparableDirection
      ? DAY_TYPE_FIELDS[dailyEnergy.dayTenGodType] || []
      : [];
  const evaluatedLabels = evaluatedFields.map(
    (field) => CATEGORY_LABELS[field]
  );

  useEffect(() => {
    const dTokens = selectedDateStr.split('-');
    const selectedDateObj = new Date(
      Number(dTokens[0]),
      Number(dTokens[1]) - 1,
      Number(dTokens[2]),
      12,
      0,
      0
    );

    const energy = getDailyEnergy(
      chart,
      patternResult.weakestElement,
      favorable,
      unfavorable,
      primaryPattern,
      selectedDateObj
    );
    setDailyEnergy(energy);
    setCanCheckIn(true); // Allow all times for testing

    getDailyLog(selectedDateStr)
      .then((log) => {
        if (log) {
          setCategoryFeedback({
            health: log.health || null,
            career: log.career || null,
            romance: log.romance || null,
            wealth: log.wealth || null,
            family: log.family || null,
            friends: log.friends || null,
          });
          setNote(log.note || '');
          setIsSubmitted(true);
        } else {
          setCategoryFeedback({
            health: null,
            career: null,
            romance: null,
            wealth: null,
            family: null,
            friends: null,
          });
          setNote('');
          setIsSubmitted(false);
        }
      })
      .catch(() => {
        /* [AI MOD] 靜默處理 DB 錯誤 */
      });

    const now = new Date();
    getMonthLogs(now.getFullYear(), now.getMonth() + 1)
      .then((logs) => {
        if (logs.length > 0) {
          const cStats = {
            health: 0,
            career: 0,
            romance: 0,
            wealth: 0,
            family: 0,
            friends: 0,
          };
          logs.forEach((log) => {
            if (log.health === 'good') cStats.health++;
            else if (log.health === 'bad') cStats.health--;
            if (log.career === 'good') cStats.career++;
            else if (log.career === 'bad') cStats.career--;
            if (log.romance === 'good') cStats.romance++;
            else if (log.romance === 'bad') cStats.romance--;
            if (log.wealth === 'good') cStats.wealth++;
            else if (log.wealth === 'bad') cStats.wealth--;
            if (log.family === 'good') cStats.family++;
            else if (log.family === 'bad') cStats.family--;
            if (log.friends === 'good') cStats.friends++;
            else if (log.friends === 'bad') cStats.friends--;
          });

          setMonthCategoryStats([
            { name: CATEGORY_LABELS.health, score: cStats.health },
            { name: CATEGORY_LABELS.career, score: cStats.career },
            { name: CATEGORY_LABELS.romance, score: cStats.romance },
            { name: CATEGORY_LABELS.wealth, score: cStats.wealth },
            { name: CATEGORY_LABELS.family, score: cStats.family },
            { name: CATEGORY_LABELS.friends, score: cStats.friends },
          ]);

          import('../calibration')
            .then(({ calculateAccuracy }) => {
              setMonthAccuracy(calculateAccuracy(logs));
            })
            .catch(() => {
              /* [AI MOD] 靜態處理 */
            });
        } else {
          setMonthCategoryStats([]);
          setMonthAccuracy(null);
        }
      })
      .catch(() => {
        /* [AI MOD] 靜默處理 DB 錯誤 */
      });
  }, [chart, scores, selectedDateStr]); // Removed isSubmitted to fix edit bug

  const handleCheckIn = async () => {
    const hasAny = Object.values(categoryFeedback).some((v) => v !== null);
    if (!hasAny) return;

    try {
      // [AI MOD] 共用 submit 邏輯（與首頁快速打卡同一套：存 log → 調格局分數 → 自動切格局通知）
      const { autoSwitched } = await submitCheckIn(scores, {
        date: selectedDateStr,
        theoreticalOutcome:
          overrideOutcome || dailyEnergy?.theoreticalOutcome || '平穩',
        dayTenGodType: dailyEnergy?.dayTenGodType,
        feedback: categoryFeedback,
        note,
      });
      if (autoSwitched) window.location.reload();
      setIsSubmitted(true);
      void refreshStats();
    } catch (e) {
      console.error('[AI MOD] handleCheckIn failed:', e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto pb-8">
      <div className="flex justify-between items-center mb-4 md:hidden">
        <button
          onClick={() => onNavigate?.(11)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-sm font-bold"
        >
          <span>←</span> 返回探索
        </button>
      </div>

      <div className="info-card bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        {/* 本月行事曆 */}
        <h2 className="text-xl font-bold text-zen-text mb-4">本月流日預報</h2>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const d = new Date(selectedDateStr);
              d.setMonth(d.getMonth() - 1);
              setSelectedDateStr(d.toISOString().split('T')[0]);
            }}
            className="p-1 hover:bg-white/10 rounded transition text-zen-muted text-xs"
          >
            ◀ 上個月
          </button>
          <span className="text-[14px] font-bold text-zen-text tracking-wider">
            {selectedDateStr.split('-')[0]} 年 {selectedDateStr.split('-')[1]}{' '}
            月
          </span>
          <button
            onClick={() => {
              const d = new Date(selectedDateStr);
              d.setMonth(d.getMonth() + 1);
              setSelectedDateStr(d.toISOString().split('T')[0]);
            }}
            className="p-1 hover:bg-white/10 rounded transition text-zen-muted text-xs"
          >
            下個月 ▶
          </button>
        </div>

        <MonthlyForecastCalendar
          chart={chart}
          scores={scores}
          selectedYear={Number(selectedDateStr.split('-')[0])}
          selectedMonth={Number(selectedDateStr.split('-')[1])}
          selectedDateStr={selectedDateStr}
          onDateClick={(dateStr) => setSelectedDateStr(dateStr)}
        />

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
              <button
                onClick={() => {
                  const d = new Date(selectedDateStr);
                  d.setDate(d.getDate() - 1);
                  setSelectedDateStr(d.toISOString().split('T')[0]);
                }}
                aria-label="前一天"
                className="p-1 hover:bg-white/10 rounded transition text-zen-muted text-xs"
              >
                ◀
              </button>
              <span className="text-[13px] font-medium text-zen-muted min-w-[85px] text-center tracking-wider">
                {selectedDateStr.slice(5)}
              </span>
              <button
                onClick={() => {
                  const d = new Date(selectedDateStr);
                  d.setDate(d.getDate() + 1);
                  setSelectedDateStr(d.toISOString().split('T')[0]);
                }}
                aria-label="後一天"
                className="p-1 hover:bg-white/10 rounded transition text-zen-muted text-xs"
              >
                ▶
              </button>
            </div>
          </div>

          {/* 選擇日詳細資訊 (Removed to avoid bias) */}

          {/* 打卡區 */}
          <div className="mt-2">
            <h4 className="font-bold text-zen-text mb-3">10秒心流紀錄</h4>
            {!canCheckIn && !isSubmitted && (
              <p className="text-sm text-zen-muted">紀錄將在今晚20:00開放</p>
            )}
            {canCheckIn && !isSubmitted && (
              <div className="space-y-3">
                <p className="text-sm text-zen-muted">
                  回顧
                  {selectedDateStr === new Date().toISOString().split('T')[0]
                    ? '今天'
                    : '該日'}
                  ，各領域的感受是？（可只選有感的）
                </p>
                {evaluatedLabels.length > 0 && (
                  <p className="text-xs rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-indigo-200">
                    今日「{dailyEnergy?.dayTenGodType}」日會以「
                    {evaluatedLabels.join('、')}
                    」計入近期紀錄吻合度；其他欄位只留在你的日誌中。
                  </p>
                )}
                {dailyEnergy && !hasComparableDirection && (
                  <p className="text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zen-muted">
                    今日理論方向為「平穩」，目前的二元感受不計入吻合度；你仍可將各領域感受保存在日誌中。
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <div
                      key={cat.key}
                      className="bg-white/5 rounded-xl p-3 border border-white/5"
                    >
                      <p className="text-sm font-medium text-zen-text mb-2 cursor-default shrink-0">
                        {cat.label}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setCategoryFeedback((prev) => ({
                              ...prev,
                              [cat.key]:
                                prev[cat.key] === 'good' ? null : 'good',
                            }))
                          }
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                            categoryFeedback[cat.key] === 'good'
                              ? 'bg-green-500 text-white'
                              : 'bg-white/5 border border-white/10 text-zen-muted hover:bg-green-500/10'
                          }`}
                        >
                          順利
                        </button>
                        <button
                          onClick={() =>
                            setCategoryFeedback((prev) => ({
                              ...prev,
                              [cat.key]: prev[cat.key] === 'bad' ? null : 'bad',
                            }))
                          }
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                            categoryFeedback[cat.key] === 'bad'
                              ? 'bg-red-500 text-white'
                              : 'bg-white/5 border border-white/10 text-zen-muted hover:bg-red-500/10'
                          }`}
                        >
                          不順
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={
                    !Object.values(categoryFeedback).some((v) => v !== null)
                  }
                  className="w-full py-2 text-white rounded-xl font-medium disabled:opacity-50 mt-2 hover:bg-indigo-600 transition-colors"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  記錄
                  {selectedDateStr === new Date().toISOString().split('T')[0]
                    ? '今天'
                    : '這天'}
                  的能量
                </button>
              </div>
            )}
            {isSubmitted && (
              <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-2">
                <div className="flex items-center text-emerald-400 font-medium mb-3">
                  {selectedDateStr === new Date().toISOString().split('T')[0]
                    ? '今日'
                    : '這天'}
                  已記錄
                </div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm rounded-lg transition-colors border border-white/10"
                >
                  修改記錄
                </button>
                {streak.current > 0 && (
                  <div className="text-sm text-orange-300 mt-3">
                    已連續打卡 {streak.current} 天（最長 {streak.longest} 天）
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 近期紀錄與規則方向的比較，不宣稱 AI 學習或預測準確率。 */}
      <div className="info-card bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-zen-text">近期紀錄吻合度</h2>
          {streak.current > 0 && (
            <span className="text-xs px-2 py-1 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-400/30">
              連續 {streak.current} 天
            </span>
          )}
        </div>

        {report.samples > 0 ? (
          <div className="relative z-10">
            <div className="flex items-end gap-3 mb-1">
              {report.samples >= 3 ? (
                <>
                  <span className="text-5xl font-bold text-indigo-400 leading-none">
                    {report.accuracy}
                  </span>
                  <span className="text-2xl text-indigo-400/70 mb-1">%</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-indigo-300 leading-none">
                  {report.samples}/3 筆
                </span>
              )}
              <span className="ml-auto text-sm px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                {report.level}
              </span>
            </div>
            <p className="text-sm text-zen-text font-medium mt-1">
              {report.headline}
            </p>
            <p className="text-xs text-zen-muted mt-1.5 leading-relaxed">
              {report.summary}
            </p>

            <div className="mt-4 space-y-2">
              {report.categories.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="text-xs text-zen-muted w-10 shrink-0">
                    {item.label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.total >= 3 ? 'bg-gradient-to-r from-indigo-500 to-purple-400' : 'bg-indigo-400/35'}`}
                      style={{
                        width: `${item.total >= 3 ? item.accuracy : Math.round((item.total / 3) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-zen-text w-20 text-right shrink-0">
                    {item.total >= 3 ? `${item.accuracy}% ` : ''}
                    <span className="text-zen-muted">
                      ({item.match}/{item.total})
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zen-muted mt-4 pt-3 border-t border-white/5">
              依據 {report.checkedDays} 次心流紀錄、{report.samples}{' '}
              筆可評估回饋計算。這是命理規則與主觀紀錄的方向比較，不代表科學驗證或個人結果保證。
            </p>
          </div>
        ) : (
          <div className="text-center bg-white/5 rounded-xl p-6 border border-white/5">
            <p className="text-sm text-zen-muted">{report.summary}</p>
            {streak.totalDays > 0 && (
              <p className="text-xs text-zen-muted mt-2">
                已累積 {streak.totalDays} 天紀錄
              </p>
            )}
          </div>
        )}
      </div>

      {/* 本月吻合度 (校準) */}
      <div className="info-card">
        <h2 className="text-xl font-bold text-zen-text mb-4">本月校準</h2>
        {monthCategoryStats && monthCategoryStats.length > 0 ? (
          <div className="bg-white/5 rounded-xl p-4 overflow-hidden">
            <p className="text-sm text-zen-muted mb-4 text-center">
              六大專項能量累積 (順利 +1, 不順 -1)
            </p>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthCategoryStats}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#888', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    cursor={{ fill: '#27272a' }}
                  />
                  <ReferenceLine y={0} stroke="#555" />
                  <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                    {monthCategoryStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {monthAccuracy !== null && (
              <p className="text-xs text-zen-muted mt-4 text-center">
                整體格局吻合度:{' '}
                <span className="font-bold text-indigo-400">
                  {monthAccuracy}%
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="text-center bg-white/5 rounded-xl p-6 border border-white/5">
            <p className="text-sm text-zen-muted">
              尚無本月紀錄，開始您的第一次10秒心流紀錄吧。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
