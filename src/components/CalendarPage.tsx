// src/components/CalendarPage.tsx
// [AI MOD] 流年預警日曆頁面 — 顯示每月每日五行能量與犯太歲警示

import { useState, useMemo } from 'react';
import { Solar } from 'lunar-javascript';

interface Props {
  chart?: any;
  favorable?: string[];
  unfavorable?: string[];
  onNavigate?: (step: number) => void;
}

// 五行顏色對照
const ELEMENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  '木': { bg: 'bg-green-600', text: 'text-green-100', label: '木' },
  '火': { bg: 'bg-red-600', text: 'text-red-100', label: '火' },
  '土': { bg: 'bg-yellow-600', text: 'text-yellow-100', label: '土' },
  '金': { bg: 'bg-gray-300', text: 'text-gray-800', label: '金' },
  '水': { bg: 'bg-blue-600', text: 'text-blue-100', label: '水' },
};

// 天干五行對照
const GAN_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支五行對照
const ZHI_TO_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 地支六沖對照
const CHONG_MAP: Record<string, string> = {
  '子': '午', '午': '子', '寅': '申', '申': '寅',
  '辰': '戌', '戌': '辰', '丑': '未', '未': '丑',
  '卯': '酉', '酉': '卯', '巳': '亥', '亥': '巳',
};

// 地支六害對照
const HARM_MAP: Record<string, string> = {
  '子': '未', '丑': '午', '寅': '巳', '卯': '辰',
  '申': '亥', '酉': '戌',
};

// 地支六破對照
const BREAK_MAP: Record<string, string> = {
  '子': '酉', '丑': '辰', '寅': '亥', '卯': '午',
  '巳': '申', '未': '戌',
};

// 三刑對照
const TRIPLE_PUNISHMENT: Record<string, string[]> = {
  '寅巳申': ['寅', '巳', '申'],
  '丑戌未': ['丑', '戌', '未'],
};

// 太歲類型說明
const TAI_SUI_INFO: Record<string, { type: string; warning: string; solution: string }> = {
  '值太歲': {
    type: '本命年',
    warning: '運勢起伏大，容易有變動',
    solution: '主動見血（洗牙、捐血）、補充用神能量',
  },
  '沖太歲': {
    type: '變動年',
    warning: '直接明顯的變動、衝突、走動、車關、搬遷',
    solution: '車輛維護保養、注意行車安全',
  },
  '刑太歲': {
    type: '糾紛年',
    warning: '心情壓抑起伏、人際衝突、車關、法律問題',
    solution: '保持低调、避免訴訟、多行善積德',
  },
  '害太歲': {
    type: '人際摩擦年',
    warning: '易有人際摩擦、遭人嫉妒或暗中阻撓',
    solution: '謹言慎行、避免與人爭執',
  },
  '破太歲': {
    type: '計劃受阻年',
    warning: '突如其來的阻力、計畫生變或物品損壞',
    solution: '重要計畫準備備案、保持彈性',
  },
};

// 每日資料介面
interface DayInfo {
  day: number;
  gan: string;
  zhi: string;
  element: string;
  taiSuiType: string | null;
  isToday: boolean;
  isFavorable: boolean;
  events: string[];
}

// 支援年份範圍
const SUPPORTED_YEARS = [2025, 2026, 2027];

// 取得指定月份的天數
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 取得該月第一天是星期幾（0=日, 1=一, ..., 6=六）
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

// 檢查是否犯太歲
function checkTaiSui(yearZhi: string, zhi: string): string | null {
  if (yearZhi === zhi) return '值太歲';
  if (CHONG_MAP[yearZhi] === zhi) return '沖太歲';
  if (HARM_MAP[yearZhi] === zhi) return '害太歲';
  if (BREAK_MAP[yearZhi] === zhi) return '破太歲';
  // 簡化版刑太歲判斷
  if ((yearZhi === '寅' && (zhi === '巳' || zhi === '申')) ||
      (yearZhi === '巳' && (zhi === '寅' || zhi === '申')) ||
      (yearZhi === '申' && (zhi === '寅' || zhi === '巳')) ||
      (yearZhi === '丑' && (zhi === '戌' || zhi === '未')) ||
      (yearZhi === '戌' && (zhi === '丑' || zhi === '未')) ||
      (yearZhi === '未' && (zhi === '丑' || zhi === '戌'))) {
    return '刑太歲';
  }
  return null;
}

// 檢查是否為吉日
function checkFavorableEvents(gan: string, zhi: string, favorable: string[]): string[] {
  const events: string[] = [];
  const ganEl = GAN_TO_ELEMENT[gan];
  const zhiEl = ZHI_TO_ELEMENT[zhi];

  if (favorable.includes(ganEl)) events.push('天干為喜用神');
  if (favorable.includes(zhiEl)) events.push('地支為喜用神');

  return events;
}

export default function CalendarPage({ chart, favorable = [], unfavorable = [], onNavigate }: Props) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // 假設年支（實際應從 chart 取得）
  const yearZhi = chart?.year?.zhi || '辰';

  // 生成當月每日資料
  const daysData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const result: (DayInfo | null)[] = [];

    // 填入空白
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }

    // 填入每日 — 使用 lunar-javascript 動態計算
    for (let day = 1; day <= daysInMonth; day++) {
      try {
        const solar = Solar.fromYmd(currentYear, currentMonth, day);
        const lunar = solar.getLunar();
        const gan = lunar.getGan();
        const zhi = lunar.getZhi();
        const element = GAN_TO_ELEMENT[gan] || '土';
        const taiSuiType = checkTaiSui(yearZhi, zhi);
        const isToday =
          currentYear === today.getFullYear() &&
          currentMonth === today.getMonth() + 1 &&
          day === today.getDate();
        const events = checkFavorableEvents(gan, zhi, favorable);

        result.push({
          day,
          gan,
          zhi,
          element,
          taiSuiType,
          isToday,
          isFavorable: events.length > 0,
          events,
        });
      } catch {
        // 計算失敗時使用預設值
        result.push({
          day,
          gan: '甲',
          zhi: '子',
          element: '水',
          taiSuiType: null,
          isToday: false,
          isFavorable: false,
          events: [],
        });
      }
    }

    return result;
  }, [currentYear, currentMonth, yearZhi, favorable, today]);

  // 上個月
  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  // 下個月
  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  // 月份名稱
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ];

  const selectedDayInfo = selectedDay
    ? daysData.find((d) => d?.day === selectedDay)
    : null;

  // 檢查年份是否在支援範圍內
  const isYearSupported = SUPPORTED_YEARS.includes(currentYear);

  return (
    <div className="min-h-screen bg-zen-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zen-text mb-2">
            流年預警日曆
          </h1>
          <p className="text-zen-sage text-sm">
            查看每日五行能量與犯太歲警示
          </p>
        </div>

        {/* 年份支援範圍提示 */}
        {!isYearSupported && (
          <div className="mb-6 bg-amber-900/30 border border-amber-600 rounded-lg p-4 text-center">
            <p className="text-amber-400 font-semibold">⚠️ 年份超出支援範圍</p>
            <p className="text-amber-300 text-sm mt-1">目前僅支援 2025-2027 年</p>
          </div>
        )}

        {/* 月份切換 */}
        <div className="flex items-center justify-between mb-6 bg-zen-card rounded-lg p-4 border border-zinc-700">
          <button
            onClick={goToPrevMonth}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zen-text rounded-lg transition-colors"
          >
            ← 上個月
          </button>
          <h2 className="text-xl font-semibold text-zen-text">
            {currentYear} 年 {monthNames[currentMonth - 1]}
          </h2>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zen-text rounded-lg transition-colors"
          >
            下個月 →
          </button>
        </div>

        {/* 五行圖例 */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {Object.entries(ELEMENT_COLORS).map(([el, { bg, label }]) => (
            <div key={el} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${bg}`} />
              <span className="text-xs text-zen-sage">{label}={el}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-4">
            <div className="w-4 h-4 rounded bg-purple-600" />
            <span className="text-xs text-zen-sage">犯太歲</span>
          </div>
        </div>

        {/* 日曆 */}
        <div className="bg-zen-card rounded-lg border border-zinc-700 overflow-hidden">
          {/* 星期標題 */}
          <div className="grid grid-cols-7 bg-zinc-800">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-zen-sage"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7">
            {daysData.map((dayInfo, index) => {
              if (!dayInfo) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const colorInfo = ELEMENT_COLORS[dayInfo.element];
              const isSelected = selectedDay === dayInfo.day;

              return (
                <button
                  key={dayInfo.day}
                  onClick={() => setSelectedDay(dayInfo.day)}
                  className={`
                    aspect-square p-1 relative border border-zinc-700/50
                    transition-transform transition-shadow hover:scale-105 hover:z-10
                    ${isSelected ? 'ring-2 ring-amber-400 z-10' : ''}
                  `}
                >
                  {/* 日期數字 */}
                  <div
                    className={`
                      w-full h-full rounded-lg flex flex-col items-center justify-center
                      ${colorInfo.bg} ${colorInfo.text}
                      ${dayInfo.isToday ? 'ring-2 ring-amber-300' : ''}
                    `}
                  >
                    <span className="text-sm font-medium">{dayInfo.day}</span>

                    {/* 犯太歲標記 */}
                    {dayInfo.taiSuiType && (
                      <span className="text-[10px] bg-purple-600 text-white px-1 rounded mt-0.5">
                        {dayInfo.taiSuiType.replace('太歲', '')}
                      </span>
                    )}

                    {/* 吉日標記 */}
                    {dayInfo.isFavorable && !dayInfo.taiSuiType && (
                      <span className="text-[10px]">★</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 詳細資訊面板 */}
        {selectedDayInfo && (
          <div className="mt-6 bg-zen-card rounded-lg border border-zinc-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zen-text">
                {currentYear} 年 {currentMonth} 月 {selectedDayInfo.day} 日
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-zen-sage hover:text-zen-text"
              >
                ✕
              </button>
            </div>

            {/* 干支資訊 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-zinc-800 rounded-lg p-3">
                <span className="text-zen-sage text-sm">天干</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-zen-text">
                    {selectedDayInfo.gan}
                  </span>
                  <span className={`text-sm px-2 py-0.5 rounded ${ELEMENT_COLORS[GAN_TO_ELEMENT[selectedDayInfo.gan]]?.bg}`}>
                    {GAN_TO_ELEMENT[selectedDayInfo.gan]}
                  </span>
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <span className="text-zen-sage text-sm">地支</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-zen-text">
                    {selectedDayInfo.zhi}
                  </span>
                  <span className={`text-sm px-2 py-0.5 rounded ${ELEMENT_COLORS[ZHI_TO_ELEMENT[selectedDayInfo.zhi]]?.bg}`}>
                    {ZHI_TO_ELEMENT[selectedDayInfo.zhi]}
                  </span>
                </div>
              </div>
            </div>

            {/* 犯太歲警示 */}
            {selectedDayInfo.taiSuiType && (
              <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400 font-bold">
                    ⚠️ {selectedDayInfo.taiSuiType}
                  </span>
                </div>
                <p className="text-zen-sage text-sm mb-2">
                  {TAI_SUI_INFO[selectedDayInfo.taiSuiType]?.warning}
                </p>
                <div className="bg-purple-800/30 rounded p-2">
                  <span className="text-purple-300 text-xs">化解方法：</span>
                  <p className="text-zen-text text-sm">
                    {TAI_SUI_INFO[selectedDayInfo.taiSuiType]?.solution}
                  </p>
                </div>
              </div>
            )}

            {/* 吉利事件 */}
            {selectedDayInfo.events.length > 0 && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                <span className="text-green-400 font-bold mb-2 block">✨ 吉利指標</span>
                <ul className="text-zen-text text-sm space-y-1">
                  {selectedDayInfo.events.map((event, i) => (
                    <li key={i}>• {event}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 通用注意事項 */}
            <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
              <p className="text-zen-sage text-xs">
                💡 提示：以上為流年五行能量參考，實際運勢需結合個人八字命盤綜合分析。
                若該日犯太歲，建議低調行事、注意安全、多行善積德。
              </p>
            </div>
          </div>
        )}

        {/* 返回按鈕 */}
        {onNavigate && (
          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate(4)}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-zen-text rounded-lg transition-colors"
            >
              ← 返回分析
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
