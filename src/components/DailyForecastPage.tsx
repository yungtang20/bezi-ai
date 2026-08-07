import { useState, useEffect } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores, getPrimaryPattern, determinePattern, getFavorableElements } from '../pattern';
import { DailyEnergy, getDailyEnergy, getUpcomingDatesForCategory } from '../dailyAnalysis';
import { generateCalendarICS } from '../utils/calendarExport';
import { DailyLog, saveDailyLog, getDailyLog, getMonthLogs } from '../storage';
import MonthlyForecastCalendar from './MonthlyForecastCalendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const CATEGORY_OPTIONS = [
  { key: 'health', label: '🏃 健康', emoji: '😊' },
  { key: 'career', label: '💼 事業', emoji: '😊' },
  { key: 'romance', label: '❤️ 感情', emoji: '😊' },
  { key: 'wealth', label: '💰 金錢', emoji: '😊' },
  { key: 'family', label: '🤝 家人', emoji: '😊' },
  { key: 'friends', label: '🙌 人際', emoji: '😊' },
] as const;

interface Props {
  chart?: BaziChart | null;
  scores?: PatternScores | null;
  onNavigate?: (step: number) => void;
}

export default function DailyForecastPage({ chart, scores, onNavigate }: Props) {
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergy | null>(null);
  const [categoryFeedback, setCategoryFeedback] = useState<Record<string, 'good' | 'bad' | null>>({
    health: null, career: null, romance: null, wealth: null, family: null, friends: null
  });
  const [overrideOutcome, setOverrideOutcome] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [monthAccuracy, setMonthAccuracy] = useState<number | null>(null);
  const [monthCategoryStats, setMonthCategoryStats] = useState<{name: string, score: number}[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  });

  if (!chart || !scores) return <div className="text-center p-10 text-zen-muted">命盤資料載入中...</div>;

  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = determinePattern(chart);
  const { favorable, unfavorable } = getFavorableElements(chart.dayMaster, primaryPattern);

  useEffect(() => {
    const dTokens = selectedDateStr.split('-');
    const selectedDateObj = new Date(Number(dTokens[0]), Number(dTokens[1]) - 1, Number(dTokens[2]), 12, 0, 0);
    
    const energy = getDailyEnergy(chart, patternResult.weakestElement, favorable, unfavorable, primaryPattern, selectedDateObj);
    setDailyEnergy(energy);
    setCanCheckIn(true); // Allow all times for testing

    getDailyLog(selectedDateStr).then(log => {
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
        setCategoryFeedback({health: null, career: null, romance: null, wealth: null, family: null, friends: null});
        setNote('');
        setIsSubmitted(false);
      }
    }).catch(() => {/* [AI MOD] 靜默處理 DB 錯誤 */});

    const now = new Date();
    getMonthLogs(now.getFullYear(), now.getMonth() + 1).then(logs => {
        if (logs.length > 0) {
          const cStats = { health: 0, career: 0, romance: 0, wealth: 0, family: 0, friends: 0 };
          logs.forEach(log => {
            if (log.health === 'good') cStats.health++; else if (log.health === 'bad') cStats.health--;
            if (log.career === 'good') cStats.career++; else if (log.career === 'bad') cStats.career--;
            if (log.romance === 'good') cStats.romance++; else if (log.romance === 'bad') cStats.romance--;
            if (log.wealth === 'good') cStats.wealth++; else if (log.wealth === 'bad') cStats.wealth--;
            if (log.family === 'good') cStats.family++; else if (log.family === 'bad') cStats.family--;
            if (log.friends === 'good') cStats.friends++; else if (log.friends === 'bad') cStats.friends--;
          });

          setMonthCategoryStats([
            { name: '健康', score: cStats.health },
            { name: '事業', score: cStats.career },
            { name: '感情', score: cStats.romance },
            { name: '金錢', score: cStats.wealth },
            { name: '家人', score: cStats.family },
            { name: '人際', score: cStats.friends },
          ]);

          import('../calibration').then(({ calculateAccuracy }) => {
            setMonthAccuracy(calculateAccuracy(logs));
          }).catch(() => {/* [AI MOD] 靜態處理 */});
        } else {
          setMonthCategoryStats([]);
          setMonthAccuracy(null);
        }
    }).catch(() => {/* [AI MOD] 靜默處理 DB 錯誤 */});
  }, [chart, scores, selectedDateStr]); // Removed isSubmitted to fix edit bug


  const handleCheckIn = async () => {
    const hasAny = Object.values(categoryFeedback).some(v => v !== null);
    if (!hasAny) return;

    const log: DailyLog = {
      date: selectedDateStr,
      health: categoryFeedback.health,
      career: categoryFeedback.career,
      romance: categoryFeedback.romance,
      wealth: categoryFeedback.wealth,
      family: categoryFeedback.family,
      friends: categoryFeedback.friends,
      note,
      theoreticalOutcome: overrideOutcome || dailyEnergy?.theoreticalOutcome || '平穩',
      dayTenGodType: dailyEnergy?.dayTenGodType,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveDailyLog(log);

      const { adjustScores, checkAutoSwitch } = await import('../calibration');
      const newScores = adjustScores(scores, log, dailyEnergy?.dayTenGodType);
      const { savePatternScores, saveNotification } = await import('../storage');
      await savePatternScores(newScores);

      const switchResult = checkAutoSwitch(newScores);
      if (switchResult) {
        const oldPattern = getPrimaryPattern(scores);
        await saveNotification({
          date: new Date().toISOString(),
          type: 'pattern_switch',
          title: '格局自動調整通知',
          message: `近期身心感受更接近「${switchResult}」，系統已自動切換格局。`,
          oldPattern,
          newPattern: switchResult,
          createdAt: new Date().toISOString(),
          read: false,
        });
        window.location.reload();
      }

      setIsSubmitted(true);
    } catch (e) {
      console.error('[AI MOD] handleCheckIn failed:', e);
    }
  };

  const handleExportCalendar = (mode: 'month' | 'year') => {
    if (!chart || !scores) return;
    const year = Number(selectedDateStr.split('-')[0]);
    const month = Number(selectedDateStr.split('-')[1]);
    const icsContent = generateCalendarICS({
      chart,
      scores,
      year,
      month: mode === 'month' ? month : undefined
    });

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bazi-calendar-${year}${mode === 'month' ? '-' + month : ''}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto pb-8">
      <div className="flex justify-between items-center mb-4 md:hidden">
        <button 
          onClick={() => onNavigate?.(4)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-sm font-bold"
        >
          <span>←</span> 返回儀表板
        </button>
      </div>

      <div className="info-card bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
         
         {/* 本月行事曆 */}
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold text-zen-text">本月流日預報</h2>
           <div className="relative">
             <button 
               onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
               onBlur={() => setTimeout(() => setIsExportMenuOpen(false), 200)}
               className="flex items-center gap-2 text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-pointer"
             >
               📅 加入 Google 日曆
             </button>
             {isExportMenuOpen && (
               <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 overflow-hidden">
                 <button onClick={() => { setIsExportMenuOpen(false); handleExportCalendar('month'); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition">
                   下載本月
                 </button>
                 <button onClick={() => { setIsExportMenuOpen(false); handleExportCalendar('year'); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition border-t border-zinc-700">
                   下載全年
                 </button>
               </div>
             )}
           </div>
         </div>
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
           <span className="text-[14px] font-bold text-zen-text tracking-wider">{selectedDateStr.split('-')[0]} 年 {selectedDateStr.split('-')[1]} 月</span>
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
                 className="p-1 hover:bg-white/10 rounded transition text-zen-muted text-xs"
               >
                 ◀
               </button>
               <span className="text-[13px] font-medium text-zen-muted min-w-[85px] text-center tracking-wider">{selectedDateStr.slice(5)}</span>
               <button 
                 onClick={() => {
                   const d = new Date(selectedDateStr);
                   d.setDate(d.getDate() + 1);
                   setSelectedDateStr(d.toISOString().split('T')[0]);
                 }}
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
                 <p className="text-sm text-zen-muted">回顧{selectedDateStr === new Date().toISOString().split('T')[0] ? '今天' : '該日'}，各領域的感受是？（可只選有感的）</p>
                 <div className="grid grid-cols-2 gap-2">
                   {CATEGORY_OPTIONS.map(cat => (
                     <div key={cat.key} className="bg-white/5 rounded-xl p-3 border border-white/5">
                       <p className="text-sm font-medium text-zen-text mb-2 cursor-default shrink-0">{cat.label}</p>
                       <div className="flex gap-2">
                         <button
                           onClick={() => setCategoryFeedback(prev => ({ ...prev, [cat.key]: prev[cat.key] === 'good' ? null : 'good' }))}
                           className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                             categoryFeedback[cat.key] === 'good'
                               ? 'bg-green-500 text-white'
                               : 'bg-white/5 border border-white/10 text-zen-muted hover:bg-green-500/10'
                           }`}
                         >
                           😊 順利
                         </button>
                         <button
                           onClick={() => setCategoryFeedback(prev => ({ ...prev, [cat.key]: prev[cat.key] === 'bad' ? null : 'bad' }))}
                           className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                             categoryFeedback[cat.key] === 'bad'
                               ? 'bg-red-500 text-white'
                               : 'bg-white/5 border border-white/10 text-zen-muted hover:bg-red-500/10'
                           }`}
                         >
                           😞 不順
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
                 <button
                   onClick={handleCheckIn}
                   disabled={!Object.values(categoryFeedback).some(v => v !== null)}
                   className="w-full py-2 text-white rounded-xl font-medium disabled:opacity-50 mt-2 hover:bg-indigo-600 transition-colors"
                   style={{ backgroundColor: '#8B5CF6' }}
                 >
                   記錄{selectedDateStr === new Date().toISOString().split('T')[0] ? '今天' : '這天'}的能量
                 </button>
               </div>
             )}
             {isSubmitted && (
               <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-2">
                 <div className="flex items-center text-emerald-400 font-medium mb-3">
                   <span className="text-xl mr-2">✅</span> {selectedDateStr === new Date().toISOString().split('T')[0] ? '今日' : '這天'}已記錄
                 </div>
                 <button
                   onClick={() => setIsSubmitted(false)}
                   className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm rounded-lg transition-colors border border-white/10"
                 >
                   修改記錄
                 </button>
               </div>
             )}
           </div>
         </div>
      </div>

      {/* 本月吻合度 (校準) */}
      <div className="info-card">
        <h2 className="text-xl font-bold text-zen-text mb-4">本月校準</h2>
        {monthCategoryStats && monthCategoryStats.length > 0 ? (
          <div className="bg-white/5 rounded-xl p-4 overflow-hidden">
            <p className="text-sm text-zen-muted mb-4 text-center">六大專項能量累積 (順利 +1, 不順 -1)</p>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthCategoryStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                    cursor={{fill: '#27272a'}} 
                  />
                  <ReferenceLine y={0} stroke="#555" />
                  <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                    {monthCategoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {monthAccuracy !== null && (
              <p className="text-xs text-zen-muted mt-4 text-center">整體格局吻合度: <span className="font-bold text-indigo-400">{monthAccuracy}%</span></p>
            )}
          </div>
        ) : (
          <div className="text-center bg-white/5 rounded-xl p-6 border border-white/5">
             <p className="text-sm text-zen-muted">尚無本月紀錄，開始您的第一次10秒心流紀錄吧。</p>
          </div>
        )}
      </div>
    </div>
  );
}
