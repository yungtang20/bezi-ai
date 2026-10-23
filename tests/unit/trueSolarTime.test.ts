// tests/unit/trueSolarTime.test.ts
// [P2] 真太陽時（true solar time）：指定出生地經度時，出生時刻經「經度差 + 均時差」
// 調整後影響時辰（以及跨午夜時的日柱）。以下以固定城市經度對照「無調整」結果，
// 錨定學派行為，防止引擎改動悄悄改變排盤結果。
import { describe, it, expect } from 'vitest';
import { calculateChart } from '../../src/paipan';

// 台北 121.5°E（標準子午線 120°E → 經度差約 +6 分，1 月約 -3 分鐘均時差）
const TAIPEI = 121.5;

describe('True Solar Time (真太陽時)', () => {
  it('默认（無 longitude）行為完全不變，且不寫入 trueSolar* 欄位', () => {
    for (const [m, d, h] of [[2, 10, 0], [1, 15, 23], [6, 1, 14], [12, 31, 23], [7, 4, 0]]) {
      const base = calculateChart(1990, m, d, h, '男');
      const explicit = calculateChart(1990, m, d, h, '男', false, undefined);
      expect(JSON.stringify([explicit.year, explicit.month, explicit.day, explicit.hour]))
        .toBe(JSON.stringify([base.year, base.month, base.day, base.hour]));
      expect(explicit.trueSolarYear).toBeUndefined();
      expect(explicit.trueSolarMonth).toBeUndefined();
      expect(explicit.trueSolarDay).toBeUndefined();
      expect(explicit.trueSolarHour).toBeUndefined();
    }
  });

  it('凌晨 0 時出生（早子時）：真太陽時回退到前一日 23 時 → 日柱前移一天', () => {
    const base = calculateChart(1990, 2, 10, 0, '男');
    const adj = calculateChart(1990, 2, 10, 0, '男', false, TAIPEI);
    // 無調整：1990-02-10 00:00 → 丙午日 戊子時
    expect(base.day.gan + base.day.zhi).toBe('丙午');
    expect(base.hour.gan + base.hour.zhi).toBe('戊子');
    // 真太陽時：1990-02-09 23:00（前一日晚子時）→ 日柱 = 乙巳
    expect(adj.trueSolarYear).toBe(1990);
    expect(adj.trueSolarMonth).toBe(2);
    expect(adj.trueSolarDay).toBe(9);
    expect(adj.trueSolarHour).toBe(23);
    expect(adj.day.gan + adj.day.zhi).toBe('乙巳');
    // 時辰仍屬子時（早子時 vs 晚子時不影響時支）
    expect(adj.hour.gan + adj.hour.zhi).toBe('戊子');
    // 日主同步為新日柱天干
    expect(adj.dayMaster).toBe('乙');
  });

  it('23 時出生：真太陽時低於 23:00 → 時辰由子時改為亥時', () => {
    const base = calculateChart(1990, 1, 15, 23, '男');
    const adj = calculateChart(1990, 1, 15, 23, '男', false, TAIPEI);
    // 無調整：1990-01-15 23:00 → 庚辰日 戊子時
    expect(base.day.gan + base.day.zhi).toBe('庚辰');
    expect(base.hour.gan + base.hour.zhi).toBe('戊子');
    // 真太陽時：1990-01-15 22:00 → 亥時（時干重算為丁）
    expect(adj.trueSolarDay).toBe(15);
    expect(adj.trueSolarHour).toBe(22);
    expect(adj.hour.gan + adj.hour.zhi).toBe('丁亥');
    // 日期未跨天，日柱不變
    expect(adj.day.gan + adj.day.zhi).toBe('庚辰');
  });

  it('birthYear/Day 仍保留民用值（顯示不受真太陽時影響）', () => {
    const adj = calculateChart(1990, 2, 10, 0, '男', false, TAIPEI);
    expect(adj.birthYear).toBe(1990);
    expect(adj.birthMonth).toBe(2);
    expect(adj.birthDay).toBe(10);
    expect(adj.birthHour).toBe(0);
  });
});
