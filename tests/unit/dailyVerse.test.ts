// tests/unit/dailyVerse.test.ts
// [AI MOD] 「每日一句」規則引擎 golden test：deterministic、ten-god×pattern 組合命中、
// 打卡狀態改變鉤子、未知輸入有 fallback。
import { describe, it, expect } from 'vitest';
import { buildDailyVerse, type DailyVerseInput } from '../../src/lib/dailyVerse';

const base: DailyVerseInput = {
  dayTenGodType: '財星',
  dayBranchElement: '木',
  pattern: '身強',
  checkedToday: false,
  recentOutcome: null,
  isSteady: false,
};

describe('DailyVerse (每日一句規則引擎)', () => {
  it('produces deterministic output for the same input', () => {
    const a = buildDailyVerse(base);
    const b = buildDailyVerse(base);
    expect(a).toEqual(b);
  });

  it('hits the ten-god × pattern matrix for all ten-god types', () => {
    const tenGods = ['財星', '官殺', '食傷', '比劫', '印星'];
    for (const dayTenGodType of tenGods) {
      const verse = buildDailyVerse({ ...base, dayTenGodType });
      expect(verse.headline.length).toBeGreaterThan(0);
      expect(verse.context.length).toBeGreaterThan(0);
      expect(verse.hook.length).toBeGreaterThan(0);
      expect(verse.stamp.tenGod).toBe(dayTenGodType);
      expect(verse.stamp.element).toBe('木');
    }
  });

  it('covers every pattern for a fixed ten-god', () => {
    const patterns = ['身強', '身弱', '從強', '從弱'];
    for (const pattern of patterns) {
      const verse = buildDailyVerse({ ...base, pattern });
      expect(verse.context.length).toBeGreaterThan(0);
    }
  });

  it('switches the hook to a calibration follow-up when checked in', () => {
    const unchecked = buildDailyVerse(base);
    const good = buildDailyVerse({ ...base, checkedToday: true, recentOutcome: 'good' });
    const bad = buildDailyVerse({ ...base, checkedToday: true, recentOutcome: 'bad' });
    expect(good.hook).not.toBe(unchecked.hook);
    expect(bad.hook).not.toBe(good.hook);
    expect(good.hook).toContain('順利');
    expect(bad.hook).toContain('不順');
  });

  it('uses the steady hook when the day has no evaluable direction', () => {
    const steady = buildDailyVerse({ ...base, isSteady: true });
    expect(steady.hook).toContain('平穩');
  });

  it('falls back gracefully for unknown ten-god or pattern', () => {
    const verse = buildDailyVerse({ ...base, dayTenGodType: '未知星', pattern: '未知格局' });
    expect(verse.headline).toContain('未知星');
    expect(verse.context).toContain('木');
    expect(verse.hook).toBe('今天先觀察，明天再動。');
  });
});
