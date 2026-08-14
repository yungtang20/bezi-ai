import { describe, expect, it } from 'vitest';
import { evaluateHarmonies, getPillarPairKey } from '../../src/domain/harmony';

function findInteraction(
  result: ReturnType<typeof evaluateHarmonies>,
  kind: 'stem' | 'branch',
  pairText: string,
) {
  return result.interactions.find((item) =>
    item.kind === kind && item.pair.join('') === pairText);
}

describe('source-backed harmony evaluation', () => {
  it('requires month support, roots, no interference, and adjacency for stem transformation', () => {
    const valid = evaluateHarmonies({
      gans: ['甲', '己', '丙', '丁'],
      zhis: ['寅', '辰', '午', '酉'],
    });
    const wrongMonth = evaluateHarmonies({
      gans: ['甲', '己', '丙', '丁'],
      zhis: ['寅', '子', '午', '酉'],
    });

    expect(findInteraction(valid, 'stem', '甲己')?.status).toBe('transformed');
    expect(findInteraction(wrongMonth, 'stem', '甲己')).toMatchObject({
      status: 'bound',
      reasons: expect.arrayContaining(['月令不符']),
    });
  });

  it('turns duplicated stem participants into binding instead of transformation', () => {
    const result = evaluateHarmonies({
      gans: ['甲', '己', '甲', '丁'],
      zhis: ['寅', '辰', '午', '酉'],
    });

    expect(findInteraction(result, 'stem', '甲己')).toMatchObject({
      status: 'bound',
      reasons: expect.arrayContaining(['出現爭合、妒合或干擾']),
    });
  });

  it('requires both local overlying stems for a branch transformation', () => {
    const localExposure = evaluateHarmonies({
      gans: ['戊', '己', '庚', '辛'],
      zhis: ['子', '丑', '寅', '卯'],
    });
    const nonLocalExposure = evaluateHarmonies({
      gans: ['庚', '辛', '戊', '己'],
      zhis: ['子', '丑', '寅', '卯'],
    });

    expect(findInteraction(localExposure, 'branch', '子丑')?.status).toBe('transformed');
    expect(findInteraction(nonLocalExposure, 'branch', '子丑')).toMatchObject({
      status: 'bound',
      reasons: expect.arrayContaining(['配對兩柱未同時透出化神']),
    });
  });

  it('blocks branch transformation when another visible stem controls the result', () => {
    const result = evaluateHarmonies({
      gans: ['戊', '己', '甲', '辛'],
      zhis: ['子', '丑', '寅', '卯'],
    });

    expect(findInteraction(result, 'branch', '子丑')).toMatchObject({
      status: 'bound',
      reasons: expect.arrayContaining(['化神被其他天干剋制']),
    });
  });

  it('requires both branches of a listed alternative seasonal combination', () => {
    const fullCombination = evaluateHarmonies({
      gans: ['乙', '庚', '壬', '癸'],
      zhis: ['巳', '子', '丑', '亥'],
    });
    const singleAlternativeBranch = evaluateHarmonies({
      gans: ['乙', '庚', '壬', '癸'],
      zhis: ['巳', '子', '午', '亥'],
    });

    expect(findInteraction(fullCombination, 'stem', '乙庚')?.status).toBe('transformed');
    expect(findInteraction(singleAlternativeBranch, 'stem', '乙庚')).toMatchObject({
      status: 'bound',
      reasons: expect.arrayContaining(['月令不符']),
    });
  });

  it('preserves the lecture dual fire-and-earth result for 午未', () => {
    const result = evaluateHarmonies({
      gans: ['丙', '己', '庚', '辛'],
      zhis: ['午', '未', '申', '酉'],
    });
    const interaction = findInteraction(result, 'branch', '午未');

    expect(interaction?.status).toBe('transformed');
    expect(interaction?.resultElements).toEqual(['火', '土']);
  });

  it('honors branch pairs already consumed by a higher-priority clash or punishment', () => {
    const result = evaluateHarmonies(
      {
        gans: ['戊', '己', '庚', '辛'],
        zhis: ['子', '丑', '寅', '卯'],
      },
      new Set([getPillarPairKey(0, 1)]),
    );

    expect(findInteraction(result, 'branch', '子丑')).toBeUndefined();
  });
});
