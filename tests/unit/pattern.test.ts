import { describe, it, expect } from 'vitest';
import { calculateChart, type BaziChart } from '../../src/paipan';
import { determinePattern } from '../../src/pattern';

function makeChart(
  gans: [string, string, string, string],
  zhis: [string, string, string, string]
): BaziChart {
  const pillar = (gan: string, zhi: string) => ({
    gan,
    zhi,
    hiddenGan: [],
    tenGod: '',
    hiddenTenGods: [],
  });

  return {
    year: pillar(gans[0], zhis[0]),
    month: pillar(gans[1], zhis[1]),
    day: pillar(gans[2], zhis[2]),
    hour: pillar(gans[3], zhis[3]),
    dayMaster: gans[2],
    gender: '男',
    birthYear: 2000,
    birthMonth: 1,
    birthDay: 1,
    birthHour: 0,
    zodiac: '龍',
  };
}

describe('Pattern Determination (Ge Ju)', () => {
  it('correctly determines pattern and favorable elements for a Bazi chart', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const result = determinePattern(chart);
    expect(result).toBeDefined();
    expect(result.pattern).toBeDefined();
    expect(Array.isArray(result.favorable)).toBe(true);
    expect(result.favorable.length).toBeGreaterThan(0);
  });

  it('blocks a branch transformation when a visible element controls the result', () => {
    // 子丑合化土；甲木是「剋土」的元素，應阻止合化。
    const controlled = determinePattern(
      makeChart(['甲', '己', '戊', '庚'], ['子', '丑', '辰', '巳'])
    );
    const unblocked = determinePattern(
      makeChart(['庚', '己', '戊', '辛'], ['子', '丑', '辰', '巳'])
    );

    expect(unblocked.reason).toContain('合化土');
    expect(controlled.reason).not.toContain('合化土');
  });

  it('evaluates every activation rule for the same tomb branch', () => {
    // 辰有水庫與木庫兩條規則；沒有壬癸但有甲時應啟動木庫。
    const result = determinePattern(
      makeChart(['庚', '辛', '甲', '庚'], ['辰', '午', '申', '丑'])
    );

    expect(result.reason).toContain('辰啟動為木庫');
  });
});
