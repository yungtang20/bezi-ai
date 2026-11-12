import { describe, expect, it } from 'vitest';
import type { BaziChart } from '../../packages/core/src/paipan';
import { calculateHandoutStrength, HANDOUT_SEVEN_WEIGHTS } from '../../packages/core/src/handoutStrength';
import { determinePattern } from '../../packages/core/src/pattern';

// 單元測試使用虛構的四柱資料，不以姓名/生日建立個資資料集。
// 官網證據是四柱甲子/丁丑/癸酉/癸丑的逐位置分數，而非模型訓練答案。
function mockChart(year: string, month: string, day: string, hour: string): BaziChart {
  const pillar = (s: string) => ({
    gan: s.charAt(0), zhi: s.charAt(1),
    hiddenGan: [] as string[], tenGod: '', hiddenTenGods: [] as string[],
  });
  return {
    year: pillar(year), month: pillar(month),
    day: pillar(day), hour: pillar(hour), dayMaster: day.charAt(0),
    gender: '男', birthYear: 0, birthMonth: 0, birthDay: 0,
    birthHour: 0, zodiac: '',
  };
}

describe('徐玉蘭講義七字位置分 + 半合位置覆寫（證據分級）', () => {
  it('日干的權重必須為零，七字權重剛好100', () => {
    const total = Object.values(HANDOUT_SEVEN_WEIGHTS)
      .reduce((sum, weights) => sum + weights.stem + weights.branch, 0);
    expect(total).toBe(100);
    expect(HANDOUT_SEVEN_WEIGHTS.day.stem).toBe(0);
  });

  it('官網個案：甲子/丁丑/癸酉/癸丑 45→90，月丑35+時丑10', () => {
    const chart = mockChart('甲子', '丁丑', '癸酉', '癸丑');
    const trace = calculateHandoutStrength(chart);
    expect(trace.status).toBe('READY');
    expect(trace.baseline).toBe(45);
    expect(trace.score).toBe(90);
    expect(trace.delta).toBe(45);
    expect(trace.pairs.map(p => p.positions)).toEqual([['month', 'day'], ['day', 'hour']]);
    expect(trace.changes.map(p => [p.position, p.symbol, p.beforePoints, p.afterPoints]))
      .toEqual([['month', '丑', 0, 35], ['hour', '丑', 0, 10]]);
    expect(trace.positions.find(p => p.position === 'day' && p.slot === 'branch')?.afterPoints)
      .toBe(20);

    const result = determinePattern(chart);
    expect(result.pattern).toBe('從強');
    expect(result.score).toBe(90);
    expect(result.handoutTrace?.score).toBe(90);
    expect(result.verificationStatus).toBe('OBSERVED_SITE_CASE');
    expect(result.interactionTrace?.gates.some(g => g.status === 'BLOCKED')).toBe(true);
  });

  it('同一個酉在兩側與兩個丑各半合，不能漏掉時丑，也不能重複計酉', () => {
    const trace = calculateHandoutStrength(mockChart('甲子', '丁丑', '癸酉', '癸丑'));
    expect(trace.pairs).toHaveLength(2);
    expect(trace.changes).toHaveLength(2);
    expect(trace.positions.filter(p => p.position === 'day' && p.slot === 'branch')).toHaveLength(1);
    expect(trace.score).toBeLessThanOrEqual(100);
  });

  it('課堂類型的卯未半合木，可將原本不加分的未支整筆20分改列木', () => {
    // 這是用來測試「改列20」的虛構單元盤，並不是 1-3 課堂完整四柱。
    const trace = calculateHandoutStrength(mockChart('辛酉', '己卯', '甲未', '丁巳'));
    const dayBranch = trace.positions.find(p => p.position === 'day' && p.slot === 'branch');
    expect(dayBranch?.beforePoints).toBe(0);
    expect(dayBranch?.afterPoints).toBe(20);
    // 只有課堂片段的局部覆寫線索，沒有完整官網四柱驗證，不能對外公布確定分數。
    expect(trace.status).toBe('REVIEW_REQUIRED');
    expect(trace.score).toBeNull();
    expect(trace.delta).toBeNull();
  });

  it('不同命盤即使出現相同酉丑半合，不得把單一官網案例外推為已驗證定格局', () => {
    const chart = mockChart('乙子', '丁丑', '癸酉', '癸丑');
    const trace = calculateHandoutStrength(chart);
    expect(trace.baseline).toBe(45);
    expect(trace.changes.map(p => [p.position, p.afterPoints]))
      .toEqual([['month', 35], ['hour', 10]]);
    expect(trace.status).toBe('REVIEW_REQUIRED');
    expect(trace.score).toBeNull();
    expect(trace.delta).toBeNull();

    const result = determinePattern(chart);
    expect(result.handoutTrace?.status).toBe('REVIEW_REQUIRED');
    expect(result.verificationStatus).toBe('PROVISIONAL_REVIEW');
    expect(result.reason).toContain('未經跨盤驗證');
  });

  it('非相鄰酉丑不得僅因字面同盤就觸發此「相鄰半合」模組', () => {
    const trace = calculateHandoutStrength(mockChart('己丑', '甲寅', '癸酉', '丁未'));
    expect(trace.pairs).toHaveLength(0);
    expect(trace.changes).toHaveLength(0);
    expect(trace.score).toBe(trace.baseline);
  });

  it('日主自己的天干只識別日主，不計額外5分', () => {
    const trace = calculateHandoutStrength(mockChart('甲寅', '丁巳', '癸未', '丁卯'));
    const dayStem = trace.positions.find(p => p.position === 'day' && p.slot === 'stem');
    expect(dayStem?.weight).toBe(0);
    expect(dayStem?.afterPoints).toBe(0);
  });

  it('缺時柱要標記未完成，不能算成完整100%命盤', () => {
    const trace = calculateHandoutStrength(mockChart('甲子', '丁丑', '癸酉', ''));
    expect(trace.status).toBe('INCOMPLETE');
    expect(trace.score).toBeNull();
  });
});
