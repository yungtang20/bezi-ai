import { BaziChart } from '../paipan';
import { PatternScores, getPrimaryPattern, getFavorableElements, determinePattern } from '../pattern';
import { getDailyEnergy } from '../dailyAnalysis';
import { Solar } from 'lunar-javascript';

export interface CalendarExportOptions {
  chart: BaziChart;
  scores: PatternScores;
  year: number;
  month?: number; // Optional, if provided, export for this month only. If not, export for the whole year.
}

export function generateCalendarICS(options: CalendarExportOptions): string {
  const { chart, scores, year, month } = options;
  const primaryPattern = getPrimaryPattern(scores);
  const patternResult = determinePattern(chart);
  const { favorable, unfavorable } = getFavorableElements(chart.dayMaster, primaryPattern);
  const weakest = patternResult.weakestElement || '';

  const events: string[] = [];

  const startMonth = month ? month - 1 : 0;
  const endMonth = month ? month - 1 : 11;

  for (let m = startMonth; m <= endMonth; m++) {
    const date = new Date(year, m, 1);
    while (date.getMonth() === m) {
      const energy = getDailyEnergy(chart, weakest, favorable, unfavorable, primaryPattern, new Date(date));
      
      const warnings = energy.dayTypes.filter(t => 
        t === '健康注意日' || t === '犯小人日' || t === '得財日' || t === '事業機會日' || t === '桃花日'
      );

      warnings.forEach(warning => {
        let title = '';
        if (warning === '健康注意日') title = '🟢 【健康警訊\\小人日】'; // Using the requested title
        else if (warning === '犯小人日') title = '🟢 【健康警訊\\小人日】'; // Map both to the same? The user requested: 🟢 【健康警訊\小人日】, let's just use it for both. Or combine?
        else if (warning === '得財日') title = '🟡 【財運日】';
        else if (warning === '事業機會日') title = '💼 【事業日】';
        else if (warning === '桃花日') title = '💖 【感情日】';

        if (title) {
          const startDateStr = formatDateToYYYYMMDD(date);
          const endDate = new Date(date);
          endDate.setDate(endDate.getDate() + 1);
          const endDateStr = formatDateToYYYYMMDD(endDate);
          
          const uid = `bazi-warning-${startDateStr}-${warning}@bazi.app`;
          const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

          events.push(`BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowUtc}
DTSTART;VALUE=DATE:${startDateStr}
DTEND;VALUE=DATE:${endDateStr}
SUMMARY:${title}
END:VEVENT`);
        }
      });

      date.setDate(date.getDate() + 1);
    }
  }

  // Add solar terms (JieQi)
  const solarTerms = getSolarTermsForYear(year);
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  solarTerms.forEach(st => {
    // Check if the solar term falls into the requested month (if month is provided)
    if (!month || st.date.getMonth() === month - 1) {
      // The user wants: "農曆七月立秋丙申月"
      // We can get the lunar month and Chinese branch from lunar-javascript
      const lunar = Solar.fromDate(st.date).getLunar();
      const lunarMonthName = lunar.getMonthInChinese() + '月'; // e.g. 七月
      const bzMonth = lunar.getMonthInGanZhi() + '月'; // e.g. 丙申月
      const title = `農曆${lunarMonthName}${st.name}${bzMonth}`;

      const startUtc = st.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endUtc = new Date(st.date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const uid = `bazi-jieqi-${st.date.getFullYear()}-${st.name}@bazi.app`;

      events.push(`BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowUtc}
DTSTART:${startUtc}
DTEND:${endUtc}
SUMMARY:${title}
END:VEVENT`);
    }
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AIStudio//BaZi Calendar//TW
${events.join('\n')}
END:VCALENDAR`;
}

function formatDateToYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function getSolarTermsForYear(year: number) {
  const terms: { name: string, date: Date }[] = [];
  
  // We need to check from Jan 1st to Dec 31st
  // lunar-javascript's JieQiTable returns terms for a lunar year.
  // To get all terms in a solar year, we can just check the JieQiTable of the solar year's Jan 1st and Dec 31st.
  const solarStart = Solar.fromDate(new Date(year, 0, 15));
  const table1 = solarStart.getLunar().getJieQiTable();
  
  const solarEnd = Solar.fromDate(new Date(year, 11, 15));
  const table2 = solarEnd.getLunar().getJieQiTable();

  const added = new Set<string>();

  const processTable = (table: any) => {
    // Only pick the 12 main terms that mark the start of a month, or all of them?
    // The user mentioned "交節月" - usually this refers to the 12 terms (立春, 惊蛰, 清明, 立夏, 芒种, 小暑, 立秋, 白露, 寒露, 立冬, 大雪, 小寒).
    // Let's filter to just these 12.
    const mainTerms = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
    
    for (const name of mainTerms) {
      const s = table[name];
      if (s) {
        const d = new Date(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute());
        if (d.getFullYear() === year) {
          const key = name + d.getTime();
          if (!added.has(key)) {
             // Use traditional characters
             let tradName = name;
             if (name === '惊蛰') tradName = '驚蟄';
             if (name === '芒种') tradName = '芒種';
             terms.push({ name: tradName, date: d });
             added.add(key);
          }
        }
      }
    }
  };

  processTable(table1);
  processTable(table2);

  terms.sort((a, b) => a.date.getTime() - b.date.getTime());
  return terms;
}
