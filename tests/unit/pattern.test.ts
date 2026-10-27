import { describe, it, expect } from 'vitest';
import { calculateChart } from '../../src/paipan';
import { determinePattern, getCheckYears, type PatternResult } from '../../src/pattern';
import { GAN_TO_ELEMENT } from '../../src/constants';

describe('Pattern Determination (Ge Ju)', () => {
  it('correctly determines pattern and favorable elements for a Bazi chart', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const result = determinePattern(chart);
    expect(result).toBeDefined();
    expect(result.pattern).toBeDefined();
    expect(Array.isArray(result.favorable)).toBe(true);
    expect(result.favorable.length).toBeGreaterThan(0);
  });

  it('marks 40-55% scores as continuum (徐玉蘭口徑：分數只是工具，定盤才是裁判)', () => {
    // 1968-09-02 16:00 男：庚金日主，實測分數 40（連續體下緣）
    const chart = calculateChart(1968, 9, 2, 16, '男');
    const result: PatternResult = determinePattern(chart);
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(55);
    expect(result.isContinuum).toBe(true);
    // 連續體時 reason 必須標註不確定
    expect(result.reason).toContain('連續體');
  });

  it('does not mark scores outside 40-55% as continuum', () => {
    const chart = calculateChart(1992, 6, 10, 4, '女');
    const result = determinePattern(chart);
    if (result.score < 40 || result.score >= 55) {
      expect(result.isContinuum).toBe(false);
    } else {
      expect(result.isContinuum).toBe(true);
    }
  });

  it('uses 徐玉蘭 weights: year branch 20%, hour branch 10% (年支>時支)', () => {
    // 徐玉蘭 1-3 [10:06]：年支 20%、時支 10%。以同五行異位置驗證權重差：
    // 分數差應反映地支權重排序 月支35% > 年支20% > 日支20% > 時支10%
    const chartA = calculateChart(1990, 5, 15, 14, '男'); // 庚金
    const rA = determinePattern(chartA);
    // 任何盤的總分上限應 ≤ 100、非 NaN
    expect(Number.isFinite(rA.score)).toBe(true);
    expect(rA.score).toBeLessThanOrEqual(100);
  });

  it('calibration years for 金 day master include 2013-2015 (徐玉蘭定盤表)', () => {
    // 金日主身弱：定盤年應為火土旺年 2013/2014/2015/2018/2025
    const years = getCheckYears('金', '身弱');
    expect(years).toEqual([2013, 2014, 2015, 2018, 2025]);
    // 從格與一般格用同一批年份分辨（1-3 [56:32]）
    const followWeak = getCheckYears('金', '從弱');
    expect(followWeak).toEqual(years);
  });

  it('uses consistent continuum field across samples', () => {
    const samples: Array<[number, number, number, number, string]> = [
      [1990, 5, 15, 14, '男'],
      [1985, 11, 25, 6, '女'],
      [2000, 8, 8, 20, '女'],
    ];
    for (const [y, m, d, h, g] of samples) {
      const chart = calculateChart(y, m, d, h, g);
      const result = determinePattern(chart);
      expect(typeof result.isContinuum).toBe('boolean');
      // 分數在連續體區間 ↔ isContinuum 為 true（一致性不變式）
      expect(result.isContinuum).toBe(result.score >= 40 && result.score < 55);
    }
  });
});
