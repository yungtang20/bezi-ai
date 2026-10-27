// tests/unit/dayunLiunian.test.ts
// 徐玉蘭口徑：大運流年補運架構的「身弱補運看大運」分支（2.5 十張表 + 2-1-2）
import { describe, it, expect } from 'vitest';
import { getDayunLiunianGuide, DAYUN_LIUNIAN_GUIDES } from '../../src/data/rules/dayunLiunian';

describe('大運流年補運架構（徐玉蘭 2.5 補運分支）', () => {
  it('身強：補運只有一組，永遠是耗洩組，不隨大運好壞改變', () => {
    const guide = getDayunLiunianGuide('金', '身強');
    expect(guide.remedyAlways).toEqual(['水', '木', '火']);
    // 大運好壞不影響結果
    expect(getDayunLiunianGuide('金', '身強', true).remedyAlways).toEqual(['水', '木', '火']);
    expect(getDayunLiunianGuide('金', '身強', false).remedyAlways).toEqual(['水', '木', '火']);
    expect(guide.goodDayun).toEqual(['水', '木', '火']);
    expect(guide.badDayun).toEqual(['土', '金']);
  });

  it('身弱：補運看大運不看流年——大運走生扶補耗洩、大運走耗洩補生扶', () => {
    const guide = getDayunLiunianGuide('金', '身弱');
    // 好大運＝生扶組（土金）；補運分支：
    expect(guide.goodDayun).toEqual(['土', '金']);
    expect(guide.badDayun).toEqual(['水', '木', '火']);
    // 大運走生扶 → 補耗洩（既有配置兌現，非新事件）
    expect(guide.remedyWhenDayunGood).toEqual(['水', '木', '火']);
    // 大運走耗洩 → 補生扶
    expect(guide.remedyWhenDayunBad).toEqual(['土', '金']);
    // 明確要求分支時，getDayunLiunianGuide 的 remedyAlways 會帶入對應分支
    expect(getDayunLiunianGuide('金', '身弱', true).remedyAlways).toEqual(['水', '木', '火']);
    expect(getDayunLiunianGuide('金', '身弱', false).remedyAlways).toEqual(['土', '金']);
    // 未判大運時保守回生扶組（不做「一律補印比」的錯誤簡化以外的假設）
    expect(guide.remedyAlways).toEqual(['土', '金']);
  });

  it('從強求順勢：喜忌同身弱方向（生扶），note 說明成格全好破格全壞', () => {
    const guide = getDayunLiunianGuide('木', '從強');
    expect(guide.goodDayun).toEqual(['水', '木']);
    expect(guide.remedyWhenDayunBad).toEqual(['水', '木']);
    expect(guide.note).toContain('順勢');
    expect(guide.note).toContain('成格全好');
  });

  it('從弱求順勢：喜忌同身強方向（耗洩），補運一律耗洩組', () => {
    const guide = getDayunLiunianGuide('水', '從弱');
    expect(guide.goodDayun).toEqual(['木', '火', '土']);
    expect(guide.remedyAlways).toEqual(['木', '火', '土']);
    expect(guide.note).toContain('順勢');
  });

  it('金的濕土例外：僅金日主且身弱/從強附濕土註記（辰丑），其他日主不附', () => {
    expect(DAYUN_LIUNIAN_GUIDES['金']['身弱'].note).toContain('濕土');
    expect(DAYUN_LIUNIAN_GUIDES['金']['從強'].note).toContain('濕土');
    expect(DAYUN_LIUNIAN_GUIDES['木']['身弱'].note).not.toContain('濕土');
    expect(DAYUN_LIUNIAN_GUIDES['土']['身強'].note).not.toContain('濕土');
  });

  it('五個日主 × 四個格局都有指引且內容合理（喜忌互為反向組）', () => {
    for (const element of ['木', '火', '土', '金', '水'] as const) {
      for (const pattern of ['身強', '身弱', '從強', '從弱'] as const) {
        const guide = DAYUN_LIUNIAN_GUIDES[element][pattern];
        expect(guide.goodDayun.length).toBeGreaterThan(0);
        expect(guide.badDayun.length).toBeGreaterThan(0);
        expect(guide.note.length).toBeGreaterThan(0);
        // 好大運與不好的大運不得整組重疊
        for (const g of guide.goodDayun) {
          expect(guide.badDayun).not.toContain(g);
        }
      }
    }
  });
});
