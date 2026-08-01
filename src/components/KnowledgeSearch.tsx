// src/components/KnowledgeSearch.tsx
// [AI MOD] 全文搜尋元件 — 搜尋所有 Wiki MD 的標題與內容比對

import { useState, useEffect, useMemo, useCallback } from 'react';

// 知識索引項目介面
interface KnowledgeItem {
  category: string;
  categoryPath: string;
  title: string;
  level: 2 | 3;
  ref: string; // 交叉引用關鍵字
  snippet: string; // 內容片段
}

// 搜尋結果群組
interface SearchResultGroup {
  category: string;
  items: KnowledgeItem[];
}

// 從 9 個 MD 檔案提取的靜態知識索引
const KNOWLEDGE_INDEX: KnowledgeItem[] = [
  // 01_基礎理論
  {
    category: '基礎理論',
    categoryPath: '01_基礎理論',
    title: '八字基礎概念',
    level: 2,
    ref: '八字',
    snippet: '八字是根據出生年、月、日、時的天干地支組合，共八個字，用來分析一個人的命運走势。',
  },
  {
    category: '基礎理論',
    categoryPath: '01_基礎理論',
    title: '四柱八字',
    level: 3,
    ref: '四柱',
    snippet: '年柱、月柱、日柱、時柱，每柱由一天干與一地支組成，共八字，是命理分析的基礎。',
  },
  {
    category: '基礎理論',
    categoryPath: '01_基礎理論',
    title: '日主',
    level: 3,
    ref: '日主',
    snippet: '日柱的天干代表自己，是八字分析的核心，所有十神關係都以此為中心推算。',
  },
  {
    category: '基礎理論',
    categoryPath: '01_基礎理論',
    title: '命盤格局',
    level: 3,
    ref: '格局',
    snippet: '根據日主強弱與十神分布，分為身強、身弱、從強、從弱等格局，影響喜忌判斷。',
  },

  // 02_財運
  {
    category: '財運',
    categoryPath: '02_財運',
    title: '財運分析',
    level: 2,
    ref: '財運',
    snippet: '從八字中的財星（正財、偏財）位置與強弱，分析個人財運走勢與理財方向。',
  },
  {
    category: '財運',
    categoryPath: '02_財運',
    title: '正財與偏財',
    level: 3,
    ref: '正財',
    snippet: '正財代表穩定收入、正當投資；偏財代表意外之財、投機理財。兩者對財運影響不同。',
  },
  {
    category: '財運',
    categoryPath: '02_財運',
    title: '財星喜忌',
    level: 3,
    ref: '財星',
    snippet: '身強見財星為喜，得財機會多；身弱見財星為忌，易有財務壓力或父親健康問題。',
  },
  {
    category: '財運',
    categoryPath: '02_財運',
    title: '投資理財建議',
    level: 3,
    ref: '投資',
    snippet: '根據個人八字五行喜忌，選擇適合的投資屬性（如木屬科技、火屬能源等）。',
  },

  // 03_事業
  {
    category: '事業',
    categoryPath: '03_事業',
    title: '事業運分析',
    level: 2,
    ref: '事業',
    snippet: '從官殺星、印星與十神關係，分析適合的行業、職業發展方向與工作運勢。',
  },
  {
    category: '事業',
    categoryPath: '03_事業',
    title: '官殺星',
    level: 3,
    ref: '官殺',
    snippet: '正官代表穩定工作、主管賞識；七殺代表競爭壓力、創業契機。女生也代表桃花。',
  },
  {
    category: '事業',
    categoryPath: '03_事業',
    title: '適合行業',
    level: 3,
    ref: '行業',
    snippet: '根據五行喜忌選擇行業：木屬文教、火屬能源、土屬房地產、金屬機械、水屬運輸。',
  },
  {
    category: '事業',
    categoryPath: '03_事業',
    title: '升職與轉職',
    level: 3,
    ref: '升職',
    snippet: '官殺流年利於升職；食傷流年適合表現才華；比劫流年需注意人際關係。',
  },

  // 04_感情姻緣
  {
    category: '感情姻緣',
    categoryPath: '04_感情姻緣',
    title: '姻緣分析',
    level: 2,
    ref: '姻緣',
    snippet: '從夫妻宮（日支）與桃花星位置，分析感情運勢、婚姻時機與伴侶特質。',
  },
  {
    category: '感情姻緣',
    categoryPath: '04_感情姻緣',
    title: '夫妻宮',
    level: 3,
    ref: '夫妻宮',
    snippet: '日支代表配偶宮位，與日主的關係反映婚姻狀態。逢沖、逢合時感情易有變化。',
  },
  {
    category: '感情姻緣',
    categoryPath: '04_感情姻緣',
    title: '桃花星',
    level: 3,
    ref: '桃花',
    snippet: '子午卯酉為四桃花，命中帶桃花或逢桃花流年，感情機會增多，但也需注意爛桃花。',
  },
  {
    category: '感情姻緣',
    categoryPath: '04_感情姻緣',
    title: '男命與女命',
    level: 3,
    ref: '男命',
    snippet: '男命以財星看感情，女命以官殺看感情。身強者桃花旺，身弱者需等大運扶助。',
  },

  // 05_健康
  {
    category: '健康',
    categoryPath: '05_健康',
    title: '健康分析',
    level: 2,
    ref: '健康',
    snippet: '從五行平衡與十神關係，分析身體健康狀況、易患疾病與養生方向。',
  },
  {
    category: '健康',
    categoryPath: '05_健康',
    title: '五行與五臟',
    level: 3,
    ref: '五臟',
    snippet: '木主肝、火主心、土主脾、金主肺、水主腎。五行失衡時對應臟腑容易出現問題。',
  },
  {
    category: '健康',
    categoryPath: '05_健康',
    title: '健康警示日',
    level: 3,
    ref: '健康警示',
    snippet: '極端能量日（如甲寅、丙午等）需特別注意健康，避免開刀、熬夜、過度勞累。',
  },
  {
    category: '健康',
    categoryPath: '05_健康',
    title: '養生建議',
    level: 3,
    ref: '養生',
    snippet: '根據五行喜忌選擇養生方式：木弱者多親近綠色、火弱者多接觸陽光、土弱者注意脾胃。',
  },

  // 06_人際
  {
    category: '人際',
    categoryPath: '06_人際',
    title: '人際關係分析',
    level: 2,
    ref: '人際',
    snippet: '從比劫星、印星與十神關係，分析人際互動、朋友圈與貴人運。',
  },
  {
    category: '人際',
    categoryPath: '06_人際',
    title: '比劫星',
    level: 3,
    ref: '比劫',
    snippet: '比肩代表同輩朋友、劫財代表競爭者。身強者易犯小人，身弱者得朋友幫助。',
  },
  {
    category: '人際',
    categoryPath: '06_人際',
    title: '貴人星',
    level: 3,
    ref: '貴人',
    snippet: '印星為貴人星，代表長輩、貴人幫助。身弱者得印星助力，身強者反有壓力。',
  },
  {
    category: '人際',
    categoryPath: '06_人際',
    title: '犯小人',
    level: 3,
    ref: '小人',
    snippet: '比劫日或特定干支組合易犯小人，需注意合作關係、避免金錢借貸、謹言慎行。',
  },

  // 07_軟裝風水
  {
    category: '軟裝風水',
    categoryPath: '07_軟裝風水',
    title: '軟裝風水',
    level: 2,
    ref: '軟裝',
    snippet: '根據個人八字五行喜忌，選擇適合的居家軟裝顏色、材質與擺設，提升運勢。',
  },
  {
    category: '軟裝風水',
    categoryPath: '07_軟裝風水',
    title: '五行顏色',
    level: 3,
    ref: '顏色',
    snippet: '木綠、火紅、土黃、金白、水黑。根據喜用神選擇主色調，忌神顏色宜少用。',
  },
  {
    category: '軟裝風水',
    categoryPath: '07_軟裝風水',
    title: '材質選擇',
    level: 3,
    ref: '材質',
    snippet: '木材屬木、金屬屬金、布料屬火、陶瓷屬土、玻璃屬水。空間材質應配合五行喜忌。',
  },
  {
    category: '軟裝風水',
    categoryPath: '07_軟裝風水',
    title: '方位佈局',
    level: 3,
    ref: '方位',
    snippet: '東方屬木、南方屬火、中央屬土、西方屬金、北方屬水。辦公桌朝向配合喜用神方位。',
  },

  // 08_大運流年
  {
    category: '大運流年',
    categoryPath: '08_大運流年',
    title: '大運流年',
    level: 2,
    ref: '大運',
    snippet: '大運十年一換，流年每年一換，影響個人運勢起伏。身強者喜財官食傷，身弱者喜印比劫。',
  },
  {
    category: '大運流年',
    categoryPath: '08_大運流年',
    title: '大運排法',
    level: 3,
    ref: '順排',
    snippet: '陽男陰女順排，陰男陽女逆排。從月柱起算，每十年換一次大運，前五年看天干，後五年看地支。',
  },
  {
    category: '大運流年',
    categoryPath: '08_大運流年',
    title: '流年定盤',
    level: 3,
    ref: '流年',
    snippet: '流年五行與日主關係決定運勢同五行、生日主、剋日主、日主剋、日主生，各有不同影響。',
  },
  {
    category: '大運流年',
    categoryPath: '08_大運流年',
    title: '太歲類型',
    level: 3,
    ref: '太歲',
    snippet: '值太歲（本命年）、沖太歲、刑太歲、害太歲、破太歲。犯太歲年需特別注意變動與安全。',
  },
  {
    category: '大運流年',
    categoryPath: '08_大運流年',
    title: '化解方法',
    level: 3,
    ref: '化解',
    snippet: '犯太歲可透過見血（洗牙、捐血）、車關維護、增加捐款、補充用神能量等方式化解。',
  },

  // 09_古籍
  {
    category: '古籍',
    categoryPath: '09_古籍',
    title: '古籍經典',
    level: 2,
    ref: '古籍',
    snippet: '收錄《淵海子平》《三命通會》《滴天髓》等經典命理古籍的重點摘要與現代解讀。',
  },
  {
    category: '古籍',
    categoryPath: '09_古籍',
    title: '淵海子平',
    level: 3,
    ref: '淵海子平',
    snippet: '宋代徐子平所著，為八字命理之祖。強調日主為核心，十神關係為斷命基礎。',
  },
  {
    category: '古籍',
    categoryPath: '09_古籍',
    title: '三命通會',
    level: 3,
    ref: '三命通會',
    snippet: '明代萬民英所著，詳述八字、紫微、命理，被譽為命理百科全書。',
  },
  {
    category: '古籍',
    categoryPath: '09_古籍',
    title: '滴天髓',
    level: 3,
    ref: '滴天髓',
    snippet: '相傳為京圖所著，為八字命理最高境界之作，強調五行流通、氣勢順暢為貴命。',
  },
];

// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function KnowledgeSearch() {
  const [query, setQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const debouncedQuery = useDebounce(query, 300);

  // 搜尋邏輯
  const searchResults = useMemo((): SearchResultGroup[] => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    if (!trimmed) return [];

    // 搜尋所有項目
    const matched = KNOWLEDGE_INDEX.filter((item) => {
      const searchableText = [
        item.category,
        item.title,
        item.ref,
        item.snippet,
      ]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(trimmed);
    });

    // 按分類群組
    const grouped: Record<string, KnowledgeItem[]> = {};
    matched.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // 轉換為陣列
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }));
  }, [debouncedQuery]);

  // 展開/收合項目
  const toggleExpand = useCallback((key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // 高亮搜尋關鍵字
  const highlightText = useCallback((text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    // [AI MOD] 限制查詢長度，防止 regex 效能問題
    if (query.length > 100) return text;

    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-amber-400 text-black px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch {
      // [AI MOD] regex 解析失敗時退回純文字
      return text;
    }
  }, []);

  return (
    <div className="min-h-screen bg-zen-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zen-text mb-2">
            知識庫搜尋
          </h1>
          <p className="text-zen-sage text-sm">
            搜尋八字命理 Wiki 的所有標題與內容
          </p>
        </div>

        {/* 搜尋框 */}
        <div role="search" aria-label="搜尋知識庫" className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="輸入關鍵字搜尋（如：財運、桃花、健康...）"
            aria-label="搜尋知識庫"
            className="w-full px-4 py-3 pl-12 bg-zen-card border border-zen-border rounded-lg text-zen-text placeholder-zen-sage focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zen-sage">
            🔍
          </div>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zen-sage hover:text-zen-text"
            >
              ✕
            </button>
          )}
        </div>

        {/* 搜尋提示 */}
        {!debouncedQuery && (
          <div className="glass-card p-6 text-center">
            <p className="text-zen-sage">
              💡 輸入關鍵字開始搜尋，例如：
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {['財運', '桃花', '健康', '事業', '太歲', '貴人', '小人', '化解'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1 bg-zen-surface/80 hover:bg-zen-surface/60 text-zen-text text-sm rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 搜尋結果統計 */}
        {debouncedQuery && (
          <div aria-live="polite" className="mb-4 text-zen-sage text-sm">
            找到 {searchResults.reduce((sum, g) => sum + g.items.length, 0)} 筆結果
            {debouncedQuery && ` — 「${debouncedQuery}」`}
          </div>
        )}

        {/* 搜尋結果 */}
        {debouncedQuery && searchResults.length === 0 && (
          <div className="glass-card p-6 text-center">
            <p className="text-zen-sage">
              ❌ 找不到符合「{debouncedQuery}」的結果
            </p>
            <p className="text-zen-sage text-sm mt-2">
              試試其他關鍵字，如：八字、五行、大運、流年
            </p>
          </div>
        )}

        {/* 搜尋結果列表 */}
        <div className="space-y-6">
          {searchResults.map((group) => (
            <div key={group.category} className="glass-card overflow-hidden">
              {/* 分類標題 */}
              <div className="bg-zen-surface/80 px-4 py-3 border-b border-zen-border">
                <h2 className="text-lg font-semibold text-zen-text">
                  📁 {group.category}
                </h2>
                <p className="text-zen-sage text-xs">
                  {group.items.length} 筆結果
                </p>
              </div>

              {/* 項目列表 */}
              <div className="divide-y divide-zen-border">
                {group.items.map((item) => {
                  const itemKey = `${item.category}-${item.title}`;
                  const isExpanded = expandedItems.has(itemKey);

                  return (
                    <div key={itemKey} className="p-4">
                      {/* 標題行 */}
                      <button
                        onClick={() => toggleExpand(itemKey)}
                        aria-expanded={isExpanded}
                        className="w-full text-left flex items-start gap-3 group"
                      >
                        {/* 層級標記 */}
                        <div className="flex-shrink-0 mt-1">
                          {item.level === 2 ? (
                            <span className="text-amber-400 text-lg">▪</span>
                          ) : (
                            <span className="text-zen-sage text-sm ml-2">▫</span>
                          )}
                        </div>

                        {/* 標題與片段 */}
                        <div className="flex-1">
                          <h3
                            className={`
                              font-medium group-hover:text-amber-400 transition-colors
                              ${item.level === 2 ? 'text-zen-text' : 'text-zen-sage'}
                            `}
                          >
                            {highlightText(item.title, debouncedQuery)}
                          </h3>
                          <p className="text-zen-sage text-sm mt-1 line-clamp-2">
                            {highlightText(item.snippet, debouncedQuery)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-zen-surface/80 text-zen-sage px-2 py-0.5 rounded">
                              {item.ref}
                            </span>
                          </div>
                        </div>

                        {/* 展開指示器 */}
                        <div className="flex-shrink-0 text-zen-sage group-hover:text-zen-text transition-colors">
                          {isExpanded ? '▲' : '▼'}
                        </div>
                      </button>

                      {/* 展開內容 */}
                      {isExpanded && (
                        <div className="mt-4 ml-6 p-4 bg-zen-surface/80 rounded-lg">
                          <h4 className="text-zen-sage text-sm font-medium mb-2">
                            📖 詳細內容
                          </h4>
                          <p className="text-zen-text text-sm leading-relaxed">
                            {highlightText(item.snippet, debouncedQuery)}
                          </p>
                          <div className="mt-3 pt-3 border-t border-zen-border">
                            <p className="text-zen-sage text-xs">
                              📂 分類：{item.category} ｜ 🔖 引用：{item.ref}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 底部資訊 */}
        <div className="mt-8 text-center">
          <p className="text-zen-sage text-xs">
            本搜尋涵蓋 9 個分類、共 {KNOWLEDGE_INDEX.length} 筆知識項目
          </p>
          <p className="text-zen-sage text-xs mt-1">
            資料來源：D:\徐玉蘭\八字\已整理\
          </p>
        </div>
      </div>
    </div>
  );
}
