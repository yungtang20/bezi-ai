// [AI MOD] FiveElementFengShui.tsx — 五行開運 5 方位 Grid 共用元件
// 用於 WealthPage / CareerPage / RomancePage 重複的五行開運卡片區塊

export interface FengShuiItem {
  /** 方位名稱，顯示於卡片左上（如「南方（火）」） */
  direction: string;
  /** 顏色屬性值 */
  color: string;
  /** 位置屬性值 */
  position: string;
  /** 生肖屬性值 */
  zodiac: string;
  /** 物品屬性值 */
  item: string;
}

export interface FiveElementFengShuiProps {
  title?: string;
  subtitle?: string;
  items: FengShuiItem[];
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

type FengShuiItemKey = keyof FengShuiItem;

interface AttributeRow {
  key: FengShuiItemKey;
  label: string;
}

const ATTRIBUTE_ROWS: AttributeRow[] = [
  { key: 'color', label: '顏色' },
  { key: 'position', label: '位置' },
  { key: 'zodiac', label: '生肖' },
  { key: 'item', label: '物品' },
];

const CARD_EMOJIS = ['🗺️', '🎨', '📍', '🧸', '🎁'] as const;

/**
 * 五行開運 5 方位 Grid 共用元件
 *
 * 每張卡片代表一個五行方位，標題顯示方位名稱（使用 accentColor），
 * 內容顯示該方位的 4 個開運屬性：顏色、位置、生肖、物品。
 *
 * @param title 主標題（選填，有值時顯示）
 * @param subtitle 副標題（選填）
 * @param items 5 筆資料，順序為 [南, 東, 中, 西, 北]
 * @param accentColor 強調色 class（如 `"text-yellow-400"`）
 * @param accentBg 背景色 class（如 `"bg-yellow-500/10"`）
 * @param accentBorder 邊框色 class（如 `"border-yellow-500/20"`）
 */
export default function FiveElementFengShui({
  title,
  subtitle,
  items,
  accentColor,
}: FiveElementFengShuiProps) {
  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-zen-text mb-1">{title}</h3>}
          {subtitle && <p className="text-xs text-zen-muted">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-4 flex flex-col justify-between transition-all"
          >
            <div>
              <h3
                className={`font-bold text-sm mb-3.5 flex items-center gap-1.5 border-b border-zen-border pb-2 ${accentColor}`}
              >
                <span className="text-base">{CARD_EMOJIS[idx] ?? '●'}</span>{' '}
                {item.direction}
              </h3>

              <div className="space-y-3 text-xs text-zen-text">
                {ATTRIBUTE_ROWS.map((row) => {
                  const value = item[row.key];
                  if (!value) return null;
                  return (
                    <div key={row.key} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-zen-muted">●</span>
                      <div>
                        <span className="text-[10px] text-zen-muted block mb-0.5">
                          {row.label}：
                        </span>
                        <span className="text-zen-text font-medium leading-relaxed">
                          {value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
