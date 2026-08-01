import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  ChevronDown, 
  ChevronUp, 
  Check,
  FileText
} from 'lucide-react';

import { DailyLog, saveDailyLog, getDailyLog, getMonthLogs, getWeekLogs, savePatternScores, saveNotification } from '../storage';
import { adjustScores, checkAutoSwitch, calculateAccuracy } from '../calibration';
import { getPrimaryPattern } from '../pattern';

export default function RecordPage({ 
  bazi, 
  name, 
  gender, 
  birthDate,
  birthTime,
  calibrations,
  scores,
  onNavigate 
}: { 
  bazi: any, 
  name: string, 
  gender: 'male' | 'female' | null, 
  birthDate: string,
  birthTime: string,
  calibrations: Record<string, string>,
  scores: any,
  onNavigate: (step: number) => void 
}) {
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState<Record<string, 'good' | 'bad' | null>>({
    health: null,
    career: null,
    romance: null,
    wealth: null,
    family: null,
    friends: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [note, setNote] = useState('');
  const [weekLogs, setWeekLogs] = useState<DailyLog[]>([]);
  const [monthAccuracy, setMonthAccuracy] = useState<number | null>(null);
  
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [editCategoryFeedback, setEditCategoryFeedback] = useState<Record<string, 'good' | 'bad' | null>>({
    health: null,
    career: null,
    romance: null,
    wealth: null,
    family: null,
    friends: null,
  });
  const [editOutcome, setEditOutcome] = useState<string>('平穩');
  const [editNote, setEditNote] = useState('');
  const [dailyEnergy, setDailyEnergy] = useState<any>(null); // For theoretical outcome
  const [localScores, setLocalScores] = useState<any>(scores);

  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (scores && !localScores) {
      setLocalScores(scores);
    }
  }, [scores]);

  const canEdit = (dateStr: string): boolean => {
    const logDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    logDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - logDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 2;
  };

  useEffect(() => {
    if (bazi?.chart && localScores) {
      const pattern = getPrimaryPattern(localScores);
      import('../pattern').then(p => {
        const fullResult = p.determinePattern(bazi.chart);
        const { favorable, unfavorable } = p.getFavorableElements(bazi.chart.dayMaster, pattern);
        import('../dailyAnalysis').then(da => {
          const energy = da.getDailyEnergy(bazi.chart, fullResult.weakestElement, favorable, unfavorable, pattern);
          setDailyEnergy(energy);
        }).catch(() => {/* [AI MOD] 靜態處理 */});
      }).catch(() => {/* [AI MOD] 靜態處理 */});
    }

    getDailyLog(todayDateStr).then(log => {
      if (log) {
        setCategoryFeedback({
          health: log.health || null,
          career: log.career || null,
          romance: log.romance || null,
          wealth: log.wealth || null,
        });
        setNote(log.note || '');
        setSubmitted(true);
      }
    }).catch(() => {/* [AI MOD] 靜默處理 DB 錯誤 */});

    getWeekLogs().then(setWeekLogs).catch(() => {/* [AI MOD] 靜默處理 DB 錯誤 */});

    const now = new Date();
    getMonthLogs(now.getFullYear(), now.getMonth() + 1).then(logs => {
      if (logs.length > 0) {
        const acc = calculateAccuracy(logs);
        setMonthAccuracy(acc);
      }
    }).catch(() => {/* [AI MOD] 靜默處理 DB 錯誤 */});
  }, [bazi, localScores, todayDateStr]);

  const handleSubmit = async () => {
    const hasAny = Object.values(categoryFeedback).some(v => v !== null);
    if (hasAny && localScores) {
      const log: DailyLog = {
        date: todayDateStr,
        health: categoryFeedback.health,
        career: categoryFeedback.career,
        romance: categoryFeedback.romance,
        wealth: categoryFeedback.wealth,
        family: categoryFeedback.family,
        friends: categoryFeedback.friends,
        note: note,
        theoreticalOutcome: dailyEnergy?.theoreticalOutcome || '平穩',
        dayTenGodType: dailyEnergy?.dayTenGodType,
        createdAt: new Date().toISOString(),
      };

      try {
        await saveDailyLog(log);
        const newScores = adjustScores(localScores, log);
        await savePatternScores(newScores);
        setLocalScores(newScores);

        const switchResult = checkAutoSwitch(newScores);
        if (switchResult) {
          const oldPattern = getPrimaryPattern(localScores);
          await saveNotification({
            type: 'pattern_switch',
            title: '格局自動調整通知',
            message: `我們發現您的近期身心感受，更接近「${switchResult}」的理論。系統已自動為您切換格局，並更新喜用神與各項建議。`,
            oldPattern,
            newPattern: switchResult,
            createdAt: new Date().toISOString(),
            read: false,
          } as any);
        }

        setSubmitted(true);
        getWeekLogs().then(setWeekLogs).catch(() => {/* [AI MOD] 靜默處理 */});
        setMonthAccuracy(prev => {
          getMonthLogs(new Date().getFullYear(), new Date().getMonth() + 1).then(logs => {
            const acc = calculateAccuracy(logs);
            setMonthAccuracy(acc);
          }).catch(() => {/* [AI MOD] 靜默處理 */});
          return prev;
        });
      } catch (e) {
        console.error('[AI MOD] handleSubmit failed:', e);
      }
    }
  };

  return (
    <div className="w-full xl:max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-1000 slide-in-from-bottom-4 px-2 xl:px-4 mt-8">
      
      <div className="flex items-center gap-3 border-b border-zen-muted/20 pb-4 md:pb-6">
        <div className="w-10 h-10 rounded-full bg-zen-sage/20 flex items-center justify-center text-zen-sage">
          <LineChart size={20} />
        </div>
        <div>
           <h2 className="text-2xl md:text-3xl font-serif text-zen-text mb-1">記錄與分析</h2>
           <p className="text-xs tracking-wider text-zen-muted">
             觀照每一次的經驗與反饋
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
        <div className="bg-zen-card rounded-[2rem] p-6 md:p-8 shadow-sm border border-zen-muted/10">
          <div className="flex justify-between items-center mb-6 cursor-pointer select-none" onClick={() => setIsRecordOpen(!isRecordOpen)}>
            <div>
              <h3 className="text-xl font-serif text-zen-text mb-1">10秒心流紀錄</h3>
              <p className="text-xs text-zen-muted tracking-wide">記錄今日能量，幫助系統記錄</p>
            </div>
            <button className="text-zen-muted hover:text-zen-sage transition-colors p-2 bg-zen-bg rounded-full">
              {isRecordOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          <div className={`transition-all duration-500 overflow-hidden ${isRecordOpen ? 'max-h-[1500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-zen-sage/10 rounded-full flex items-center justify-center mb-6 text-zen-sage">
                  <Check size={32} strokeWidth={2} />
                </div>
                <h4 className="text-xl font-serif text-zen-text mb-2">已記錄今日能量</h4>
                <p className="text-sm text-zen-muted">感謝你的堅持紀錄。</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                <div>
                  <label className="block text-base font-medium text-zen-text text-center">回顧今天，各領域的感受是？（可只選有感的）</label>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      {key: 'health', label: '🏃 健康'}, {key: 'career', label: '💼 事業'}, 
                      {key: 'romance', label: '❤️ 感情'}, {key: 'wealth', label: '💰 金錢'},
                      {key: 'family', label: '🤝 家人'}, {key: 'friends', label: '🙌 人際'}
                    ].map(cat => (
                      <div key={cat.key} className="bg-zen-bg rounded-xl p-4 border border-zen-muted/10">
                        <p className="text-sm font-medium text-zen-text mb-3 text-center">{cat.label}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCategoryFeedback(prev => ({ ...prev, [cat.key]: prev[cat.key] === 'good' ? null : 'good' }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                              categoryFeedback[cat.key] === 'good'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/5 border border-white/10 text-zen-muted hover:bg-green-500/10'
                            }`}
                          >
                            😊 順利
                          </button>
                          <button
                            onClick={() => setCategoryFeedback(prev => ({ ...prev, [cat.key]: prev[cat.key] === 'bad' ? null : 'bad' }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
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
                </div>

                <div className={`transition-all duration-500 overflow-hidden`}>
                   <textarea
                     value={note}
                     onChange={e => setNote(e.target.value)}
                     placeholder="其他想記錄的事情（選填）..."
                     className="w-full mt-2 mb-6 p-3 rounded-lg border border-zen-muted/20 text-sm focus:outline-none focus:border-zen-sage/50 bg-zen-bg"
                     style={{ minHeight: '60px' }}
                   />
                   <button 
                     onClick={handleSubmit} 
                     disabled={!Object.values(categoryFeedback).some(v => v !== null)}
                     className="w-full bg-zen-sage text-white font-medium py-3 rounded-xl hover:bg-[#8CA292] transition-colors shadow-sm disabled:opacity-50"
                   >
                     記錄今天的能量
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zen-card rounded-[2rem] p-6 shadow-sm border border-zen-muted/10">
            <h3 className="text-xs tracking-[0.2em] text-zen-muted font-medium uppercase mb-5">本月格局吻合度</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-zen-muted/10" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="175.9" strokeDashoffset={175.9 - ((monthAccuracy || 0) / 100) * 175.9} strokeLinecap="round" className="text-zen-sage" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-zen-text">{monthAccuracy !== null ? `${monthAccuracy}%` : '--'}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-serif text-zen-text mb-1">近期記錄</h4>
                <p className="text-sm text-zen-muted leading-relaxed">本月已記錄 {monthAccuracy !== null ? '多' : '0'} 天</p>
              </div>
            </div>
          </div>

          <div className="bg-zen-card rounded-[2rem] p-6 shadow-sm border border-zen-muted/10">
            <h3 className="text-xs tracking-[0.2em] text-zen-muted font-medium uppercase mb-5">近期能量回顧</h3>
            <div className="flex justify-between items-center">
               {(() => {
                 const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
                 const result = [];
                 for (let i = 6; i >= 0; i--) {
                   const d = new Date();
                   d.setDate(d.getDate() - i);
                   const dStr = d.toISOString().split('T')[0];
                   const log = weekLogs.find(l => l.date === dStr);
                   result.push({
                     day: weekDays[d.getDay()],
                     done: !!log,
                     log: log,
                     dateStr: dStr,
                     emoji: log ? (Object.values(log).some(v => v === 'good') ? '😊' : Object.values(log).some(v => v === 'bad') ? '😞' : '😐') : '',
                     active: i === 0
                   });
                 }
                 return result.map((d, i) => {
                   const editable = canEdit(d.dateStr) && d.log;
                   return (
                   <div key={i} className="flex flex-col items-center gap-1">
                     <span className={`text-xs font-medium ${d.active ? 'text-zen-text' : 'text-zen-muted'}`}>{d.day}</span>
                     <div 
                       onClick={() => {
                         if (editable && d.log) {
                           setEditingLog(d.log);
                           setEditCategoryFeedback({ 
                             health: d.log.health || null, career: d.log.career || null, 
                             romance: d.log.romance || null, wealth: d.log.wealth || null,
                             family: d.log.family || null, friends: d.log.friends || null
                           });
                           setEditOutcome(d.log.theoreticalOutcome || '平穩');
                           // tags removed
                           setEditNote(d.log.note || '');
                         }
                       }}
                       title={editable ? '點擊編輯' : (d.log ? '已超過編輯期限' : '')}
                       className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${editable ? 'cursor-pointer' : 'cursor-default'} ${
                       d.done 
                         ? `bg-zen-bg ${editable ? 'hover:scale-110 border border-zen-sage/30' : 'opacity-70'}` 
                         : d.active 
                           ? 'border border-dashed border-zen-sage text-zen-sage' 
                           : 'border border-zen-muted/10'
                     }`}>
                       {d.emoji || (d.active ? '?' : '')}
                     </div>
                   </div>
                 )});
               })()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 border-b border-zen-muted/20 pb-4 mb-6">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <FileText size={16} />
          </div>
          <h3 className="text-xl font-serif text-zen-text">過往校正分析</h3>
        </div>
        <div className="bg-zen-card/50 rounded-3xl overflow-hidden border border-zen-muted/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div>
             <h4 className="text-zen-text font-medium mb-1">對焦過往流年</h4>
             <p className="text-xs text-zen-muted">回顧過去的大運與流年，提供回饋以幫助系統記錄您的能量喜忌。</p>
           </div>
           <button 
             onClick={() => onNavigate(6)}
             className="px-5 py-2.5 bg-zen-sage text-white text-sm font-medium rounded-xl hover:bg-[#8CA292] transition-colors whitespace-nowrap shrink-0"
           >
             前往校正
           </button>
        </div>
      </div>

      {editingLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start md:items-center justify-center pt-[10vh] md:pt-0 p-4 slide-in-from-bottom-2">
          <div className="bg-zen-card w-full max-w-md rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-serif text-zen-text mb-6">修改 {editingLog.date} 的記錄</h3>
            
            <div className="flex items-center justify-between mb-6 bg-zen-bg p-3 rounded-xl border border-zen-muted/10">
              <span className="text-sm text-zen-muted">當日預報</span>
              <button 
                onClick={() => {
                   if (editOutcome === '順利' || editOutcome.includes('好') || editOutcome.includes('吉')) setEditOutcome('平穩');
                   else if (editOutcome === '平穩') setEditOutcome('不順');
                   else setEditOutcome('順利');
                }}
                title="點擊修改預報"
                className={`px-3 py-1 rounded-full text-base font-bold flex items-center gap-1 transition-all hover:scale-105 active:scale-95 ${
                  editOutcome === '順利' || editOutcome.includes('好') || editOutcome.includes('吉') ? 'bg-green-100 text-green-500 border border-green-200' : 
                  editOutcome === '不順' ? 'bg-red-100 text-red-500 border border-red-200' : 'bg-white/10 text-zen-text border border-white/20'
                }`}
              >
                <span>{editOutcome === '小吉' || editOutcome === '大好' ? '順利' : editOutcome}</span>
                <span className="text-xs opacity-70">✏️</span>
              </button>
            </div>
            <label className="block text-xs font-medium text-zen-muted mb-3">修改各領域感受</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                {key: 'health', label: '🏃 健康'}, {key: 'career', label: '💼 事業'}, 
                {key: 'romance', label: '❤️ 感情'}, {key: 'wealth', label: '💰 金錢'},
                {key: 'family', label: '🤝 家人'}, {key: 'friends', label: '🙌 人際'}
              ].map(cat => (
                 <div key={cat.key} className="bg-zen-bg rounded-xl p-3 border border-zen-muted/10">
                   <p className="text-xs font-medium text-zen-text mb-2 text-center">{cat.label}</p>
                   <div className="flex gap-2">
                     <button
                       onClick={() => setEditCategoryFeedback(prev => ({ ...prev, [cat.key]: prev[cat.key] === 'good' ? null : 'good' }))}
                       className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                         editCategoryFeedback[cat.key] === 'good'
                           ? 'bg-green-500 text-white'
                           : 'bg-white/5 border border-white/10 text-zen-muted hover:bg-green-500/10'
                       }`}
                     >
                       順利
                     </button>
                     <button
                       onClick={() => setEditCategoryFeedback(prev => ({ ...prev, [cat.key]: prev[cat.key] === 'bad' ? null : 'bad' }))}
                       className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                         editCategoryFeedback[cat.key] === 'bad'
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
            
            <label className="block text-xs font-medium text-zen-muted mb-2">補充備註</label>
            <textarea
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              className="w-full p-3 rounded-lg border border-zen-muted/20 text-sm focus:outline-none focus:border-zen-sage/50 bg-zen-bg"
              rows={3}
            />
            
            <div className="flex gap-3 justify-end mt-8">
              <button onClick={() => setEditingLog(null)} className="px-6 py-2 text-sm text-zen-muted hover:bg-zen-muted/10 rounded-lg">取消</button>
              <button
                onClick={async () => {
                  if (!localScores || !Object.values(editCategoryFeedback).some(v => v !== null)) return;
                  const updatedLog: DailyLog = {
                    ...editingLog,
                    theoreticalOutcome: editOutcome,
                    health: editCategoryFeedback.health,
                    career: editCategoryFeedback.career,
                    romance: editCategoryFeedback.romance,
                    wealth: editCategoryFeedback.wealth,
                    family: editCategoryFeedback.family,
                    friends: editCategoryFeedback.friends,
                    note: editNote
                  };
                  try {
                    await saveDailyLog(updatedLog);
                    const newScores = adjustScores(localScores, updatedLog);
                    const m = await import('../storage');
                    await m.savePatternScores(newScores);
                    setEditingLog(null);
                    window.location.reload();
                  } catch (e) {
                    console.error('[AI MOD] edit log save failed:', e);
                  }
                }}
                className="px-6 py-2 bg-zen-sage text-white text-sm font-medium rounded-lg hover:bg-[#8CA292]"
              >
                儲存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
