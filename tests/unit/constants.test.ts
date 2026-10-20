import { describe, it, expect } from 'vitest';
import { getTenGod, GAN_TO_ELEMENT, ZHI_TO_ELEMENT } from '../../src/constants';

describe('Constants & Ten Gods calculations', () => {
  it('correctly maps Tian Gan to Wu Xing elements', () => {
    expect(GAN_TO_ELEMENT['甲']).toBe('木');
    expect(GAN_TO_ELEMENT['丙']).toBe('火');
    expect(GAN_TO_ELEMENT['戊']).toBe('土');
    expect(GAN_TO_ELEMENT['庚']).toBe('金');
    expect(GAN_TO_ELEMENT['壬']).toBe('水');
  });

  it('correctly maps Di Zhi to Wu Xing elements', () => {
    expect(ZHI_TO_ELEMENT['子']).toBe('水');
    expect(ZHI_TO_ELEMENT['寅']).toBe('木');
    expect(ZHI_TO_ELEMENT['午']).toBe('火');
    expect(ZHI_TO_ELEMENT['戌']).toBe('土');
    expect(ZHI_TO_ELEMENT['酉']).toBe('金');
  });

  it('correctly calculates Ten Gods (Shi Shen)', () => {
    expect(getTenGod('甲', '甲')).toBe('比肩');
    expect(getTenGod('甲', '乙')).toBe('劫財');
    expect(getTenGod('甲', '丙')).toBe('食神');
    expect(getTenGod('甲', '丁')).toBe('傷官');
    expect(getTenGod('甲', '戊')).toBe('偏財');
    expect(getTenGod('甲', '己')).toBe('正財');
    expect(getTenGod('甲', '庚')).toBe('七殺');
    expect(getTenGod('甲', '辛')).toBe('正官');
    expect(getTenGod('甲', '壬')).toBe('偏印');
    expect(getTenGod('甲', '癸')).toBe('正印');
  });
});
