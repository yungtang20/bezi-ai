import React, { useMemo } from 'react';
import { BaziChart } from '../paipan';
import { PatternScores, getPrimaryPattern, getFavorableElements, determinePattern } from '../pattern';
import { getDailyEnergy } from '../dailyAnalysis';
import { Solar } from 'lunar-javascript';

interface Props {
  chart: BaziChart;
  scores: PatternScores;
  selectedYear: number;
  selectedMonth: number; // 1-12
  onDateClick?: (dateStr: string) => void;
  selectedDateStr?: string;
}

export default function MonthlyForecastCalendar({ chart, scores, selectedYear, selectedMonth, onDateClick, selectedDateStr }: Props) {
  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = determinePattern(chart);
  const { favorable, unfavorable } = getFavorableElements(chart.dayMaster, primaryPattern);
  const weakest = patternResult.weakestElement || '';

  const daysInMonth = useMemo(() => {
    const days = [];
    const date = new Date(selectedYear, selectedMonth - 1, 1);
    while (date.getMonth() === selectedMonth - 1) {
      const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const energy = getDailyEnergy(chart, weakest, favorable, unfavorable, primaryPattern, new Date(date));
      
      const solar = Solar.fromDate(new Date(date));
      const lunar = solar.getLunar();
      const jieQi = lunar.getJieQi();
      let jieQiTime = '';
      if (jieQi) {
        const table = lunar.getJieQiTable();
        const jqDate = table[jieQi];
        if (jqDate) {
          jieQiTime = `${jqDate.getHour()}:${String(jqDate.getMinute()).padStart(2, '0')}`;
        }
      }

      days.push({
        date: new Date(dateStr),
        dateStr,
        energy,
        jieQi,
        jieQiTime
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [selectedYear, selectedMonth, chart, weakest, favorable, unfavorable, primaryPattern]);

  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const renderShape = (type: string) => {
    let colorClass = '';
    let shortName = '';
    switch (type) {
      case '桃花日': 
        colorClass = chart.gender === '女' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'; 
        shortName = '桃花';
        break;
      case '得財日': 
        colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30'; 
        shortName = '得財';
        break;
      case '事業機會日': 
        colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'; 
        shortName = '事業';
        break;
      case '犯小人日': 
        colorClass = 'bg-slate-500/20 text-slate-300 border-slate-500/30'; 
        shortName = '小人';
        break;
      case '健康注意日': 
        colorClass = 'bg-red-500/20 text-red-300 border-red-500/30'; 
        shortName = '健康';
        break;
      default: return null;
    }

    return (
      <span className={`text-[9px] sm:text-xs px-1 py-0.5 rounded border ${colorClass} whitespace-nowrap overflow-hidden max-w-full text-center block leading-none shadow-sm`}>
        {shortName}
      </span>
    );
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-sm text-zinc-500 font-bold">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => <div key={`pad-${i}`} className="min-h-[60px] sm:min-h-[80px]"></div>)}
        {daysInMonth.map(day => {
          const isSelected = day.dateStr === selectedDateStr;
          const isToday = day.dateStr === new Date().toISOString().split('T')[0];
          return (
            <div 
              key={day.dateStr}
              onClick={() => onDateClick?.(day.dateStr)}
              className={`min-h-[60px] sm:min-h-[80px] relative flex flex-col p-1 cursor-pointer transition-colors border hover:bg-white/10 rounded-xl
                ${isSelected ? 'bg-indigo-500/20 border-indigo-500/50' : 'border-transparent bg-black/20'}
                ${isToday ? 'ring-1 ring-white/20' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                 <span className={`text-base font-bold ${isToday ? 'text-white' : 'text-zinc-300'}`}>{day.date.getDate()}</span>
                 <span className="text-[9px] text-zinc-500 hidden sm:inline">{day.energy.lunarDate.slice(-2)}</span>
              </div>
              <div className="flex-1 flex flex-col gap-0.5 items-stretch justify-start">
                 {day.jieQi && (
                   <span className="text-[9px] sm:text-xs px-1 py-0.5 rounded border bg-purple-500/20 text-purple-300 border-purple-500/30 whitespace-nowrap overflow-hidden max-w-full text-center block leading-none shadow-sm" title={`${day.jieQi} ${day.jieQiTime}`}>
                     {day.jieQi} {day.jieQiTime}
                   </span>
                 )}
                 {day.energy.dayTypes.map((t, idx) => (
                   <React.Fragment key={idx}>{renderShape(t)}</React.Fragment>
                 ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
        <p className="text-base text-zinc-300 leading-relaxed">
          <strong className="text-pink-400">桃花日</strong>：
          單身者宜安排聯誼、約會、參加聚會散發魅力；有伴者宜安排浪漫約會增進感情。
        </p>
        <p className="text-base text-zinc-300 leading-relaxed">
          <strong className="text-amber-400">得財日</strong>：
          適合談判、簽約、投資、開發新客戶，或是進行重要財務決策。
        </p>
        <p className="text-base text-zinc-300 leading-relaxed">
          <strong className="text-emerald-400">事業機會日</strong>：
          宜做重大決策、提案、安排會議、面試或與重要客戶/長官對接。
        </p>
        <p className="text-base text-zinc-300 leading-relaxed">
          <strong className="text-slate-400">犯小人日</strong>：
          容易遇到口角是非、競爭對手暗中作梗，或事情橫生枝節。建議低調行事，不宜做重大決定。
        </p>
        <p className="text-base text-zinc-300 leading-relaxed">
          <strong className="text-red-400">健康注意日</strong>：
          身體較易疲累或免疫力下降，請注意休息、飲食，避免過度勞累或危險活動。
        </p>
      </div>
    </div>
  );
}
