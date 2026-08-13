import { describe, expect, it } from 'vitest';
import { calculatePatternSupportScore } from '../../src/domain/patternScoring';

describe('pattern support scoring', () => {
  it('scores the documented year-month-day-hour weights without the day stem', () => {
    const result = calculatePatternSupportScore({
      dayElement: '木',
      gans: ['甲', '庚', '甲', '癸'],
      zhis: ['寅', '申', '子', '午'],
    });

    expect(result.capacity).toBe(100);
    expect(result.rawSupport).toBe(50);
    expect(result.score).toBe(50);
    expect(result.contributions.some((item) =>
      item.source === 'stem' && item.pillarIndex === 2)).toBe(false);
  });

  it('normalizes an unknown hour from the documented 85-point capacity', () => {
    const result = calculatePatternSupportScore({
      dayElement: '木',
      gans: ['甲', '庚', '甲', ''],
      zhis: ['寅', '申', '子', ''],
    });

    expect(result.capacity).toBe(85);
    expect(result.rawSupport).toBe(45);
    expect(result.score).toBeCloseTo(52.941, 3);
  });

  it('keeps stem and branch transformations on separate scoring paths', () => {
    const result = calculatePatternSupportScore({
      dayElement: '土',
      gans: ['甲', '庚', '戊', '壬'],
      zhis: ['寅', '申', '卯', '酉'],
      branchTransformations: new Map([[0, ['火'] as const]]),
    });
    const yearStem = result.contributions.find((item) =>
      item.source === 'stem' && item.pillarIndex === 0);
    const yearBranch = result.contributions.find((item) =>
      item.source === 'branch' && item.pillarIndex === 0);

    expect(yearStem?.elements).toEqual(['木']);
    expect(yearStem?.supporting).toBe(false);
    expect(yearBranch?.elements).toEqual(['火']);
    expect(yearBranch?.supporting).toBe(true);
  });

  it('counts a multi-element transformation only when every stated outcome supports', () => {
    const fireDayMaster = calculatePatternSupportScore({
      dayElement: '火',
      gans: ['庚', '庚', '丙', '庚'],
      zhis: ['午', '申', '申', '申'],
      branchTransformations: new Map([[0, ['火', '土'] as const]]),
    });
    const earthDayMaster = calculatePatternSupportScore({
      dayElement: '土',
      gans: ['庚', '庚', '戊', '庚'],
      zhis: ['午', '申', '申', '申'],
      branchTransformations: new Map([[0, ['火', '土'] as const]]),
    });

    expect(fireDayMaster.contributions.find((item) =>
      item.source === 'branch' && item.pillarIndex === 0)?.supporting).toBe(false);
    expect(earthDayMaster.contributions.find((item) =>
      item.source === 'branch' && item.pillarIndex === 0)?.supporting).toBe(true);
  });
});
