import { describe, it, expect, vi } from 'vitest';
import type { BaziChart } from '../../src/paipan';

const { determinePatternMock } = vi.hoisted(() => ({
  determinePatternMock: vi.fn(),
}));

vi.mock('../../src/pattern', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/pattern')>();
  return { ...actual, determinePattern: determinePatternMock };
});

import {
  checkLiuChong,
  checkLiuHe,
  checkSanHe,
  checkSanHui,
  checkXiangXing,
  checkLiuPo,
  checkLiuHai,
  checkMutualComplement,
} from '../../src/matchmaking';

function makeChart(dayMaster: string): BaziChart {
  const pillar = { gan: dayMaster, zhi: '子', hiddenGan: [], tenGod: '', hiddenTenGods: [] };
  return {
    year: { ...pillar },
    month: { ...pillar },
    day: { ...pillar },
    hour: { ...pillar },
    dayMaster,
    gender: '男',
    birthYear: 2000,
    birthMonth: 1,
    birthDay: 1,
    birthHour: 0,
    zodiac: '龍',
  };
}

describe('Matchmaking Module (compatibility and branch interactions)', () => {
  it('correctly identifies Liu Chong (六沖)', () => {
    expect(checkLiuChong('子', '午')).toBe('子午沖');
    expect(checkLiuChong('午', '子')).toBe('午子沖');
    expect(checkLiuChong('子', '丑')).toBeNull();
  });

  it('correctly identifies Liu He (六合)', () => {
    expect(checkLiuHe('子', '丑')).toBe('子丑合');
    expect(checkLiuHe('寅', '亥')).toBe('寅亥合');
    expect(checkLiuHe('子', '午')).toBeNull();
  });

  it('correctly identifies San He (三合)', () => {
    const result = checkSanHe('申', '子');
    expect(result).not.toBeNull();
    expect(result).toContain('三合');
    expect(result).toContain('水');
    expect(checkSanHe('子', '午')).toBeNull();
  });

  it('correctly identifies San Hui (三會)', () => {
    const result = checkSanHui('寅', '卯');
    expect(result).not.toBeNull();
    expect(result).toContain('三會');
    expect(result).toContain('木');
    expect(checkSanHui('寅', '申')).toBeNull();
  });

  it('correctly identifies Xiang Xing (相刑)', () => {
    expect(checkXiangXing('寅', '巳')).toBe('無恩之刑(寅巳)');
    expect(checkXiangXing('子', '卯')).toBe('恩愛之刑(子卯)');
    expect(checkXiangXing('辰', '辰')).toBe('自刑(辰辰)');
    expect(checkXiangXing('子', '寅')).toBeNull();
  });

  it('correctly identifies Liu Po (六破) and Liu Hai (六害)', () => {
    expect(checkLiuPo('子', '酉')).toBe('子酉破');
    expect(checkLiuPo('午', '卯')).toBe('午卯破');
    expect(checkLiuHai('子', '未')).toBe('子未害');
    expect(checkLiuHai('丑', '午')).toBe('丑午害');
    expect(checkLiuPo('子', '未')).toBeNull();
  });

  it('preserves root-aware patterns instead of re-inferring them from scores', () => {
    determinePatternMock
      .mockReturnValueOnce({
        pattern: '身弱',
        score: 10,
        favorable: ['水', '木'],
        unfavorable: ['火', '土', '金'],
        weakestElement: '火',
        weakestElements: ['火'],
      })
      .mockReturnValueOnce({
        pattern: '身強',
        score: 90,
        favorable: ['木', '火', '土'],
        unfavorable: ['金', '水'],
        weakestElement: '水',
        weakestElements: ['水'],
      });

    expect(checkMutualComplement(makeChart('甲'), makeChart('庚'))).toBe(
      '身強身弱互補，能夠截長補短。'
    );
  });
});
