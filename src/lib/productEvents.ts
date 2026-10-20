export type ProductEventName =
  | 'app_view'
  | 'example_chart_started'
  | 'chart_created'
  | 'calibration_skipped'
  | 'calibration_completed'
  | 'daily_checkin_viewed'
  | 'share_preview_opened'
  | 'share_exported'
  | 'ai_panel_opened'
  | 'ai_question_sent';

export interface ProductEventCounter {
  count: number;
  lastAt: string;
}

export type ProductEventCounters = Partial<Record<ProductEventName, ProductEventCounter>>;

const STORAGE_KEY = 'bezi_local_product_events_v1';

/**
 * 本機、彙總式產品事件。只記錄事件名稱、次數與最後時間，
 * 不記姓名、生日、命盤、問題內容或其他個人資料，也不送往外部服務。
 */
export function trackProductEvent(name: ProductEventName): void {
  if (typeof window === 'undefined') return;
  try {
    const current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as ProductEventCounters;
    const previous = current[name];
    current[name] = {
      count: (previous?.count || 0) + 1,
      lastAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // 隱私模式或儲存空間不可用時，不影響主要流程。
  }
}

export function readProductEventCounters(): ProductEventCounters {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as ProductEventCounters;
  } catch {
    return {};
  }
}
