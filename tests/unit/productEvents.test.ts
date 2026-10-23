import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readProductEventCounters, trackProductEvent } from '../../src/lib/productEvents';

describe('local product event counters', () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  it('只累積事件名稱、次數與最後時間', () => {
    trackProductEvent('share_preview_opened');
    trackProductEvent('share_preview_opened');
    const counters = readProductEventCounters();
    expect(counters.share_preview_opened?.count).toBe(2);
    expect(counters.share_preview_opened?.lastAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(JSON.stringify(counters)).not.toContain('birth');
  });
});
