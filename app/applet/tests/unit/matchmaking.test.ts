import { describe, it, expect } from 'vitest';
import {
  checkLiuChong,
  checkLiuHe,
  checkSanHe,
  checkSanHui,
  checkXiangXing,
  checkLiuPo,
  checkLiuHai,
} from '../../src/matchmaking';

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
    expect(checkSanHe('申', '子')).toBe('申子辰三場合水局'.replace('申子辰三場合水局', '申子辰三合水局'));
    expect(checkSanHe('寅', '午')).toBe('寅午戌三合火局');
    expect(checkSanHe('子', '午')).toBeNull();
  });

  it('correctly identifies San Hui (三會)', () => {
    expect(checkSanHui('寅', '卯')).toBe('寅卯辰三會木局');
    expect(checkSanHui('巳', '午')).toBe('巳午未三會火局');
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
});
