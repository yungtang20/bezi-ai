// tests/unit/teacherAlignment.test.ts
// 徐玉蘭口徑回歸測試：把「網頁資料 = 上課講義」的關鍵事實釘住，
// 避免日後有人「覺得講義怪怪的就自行修正」，造成與老師口徑不一致。
import { describe, it, expect } from 'vitest';
import { WEALTH_GUIDELINES } from '../../src/data/charts/wealthGuidelines';
import { CAREER_GUIDELINES } from '../../src/data/charts/careerGuidelines';
import { DAY_MASTER_FENG_SHUI } from '../../src/data/charts/romanceFengShui';
import { ROMANCE_FENG_SHUI_DATA } from '../../src/data/charts/romanceRemediesData';
import { getFlyingStarsForYear } from '../../src/data/charts/fengShui2026';
import { getRemedyStrategy } from '../../src/data/elementRemedyHelper';

const EL = ['木', '火', '土', '金', '水'] as const;

describe('講義原樣（不可自行「修正」的頁面）', () => {
  it('3-4 事業位：金與木兩個日主逐字相同（方位、色彩、擺件全同）', () => {
    const gold = CAREER_GUIDELINES['金'].fengShui;
    const wood = CAREER_GUIDELINES['木'].fengShui;
    expect(gold.directions).toEqual(wood.directions);
    expect(gold.colors).toEqual(wood.colors);
    expect(gold.luckyItems).toEqual(wood.luckyItems);
    expect(gold.directions).toEqual(['正西方', '西南方', '西北方', '東北方']);
    expect(gold.colors).toBe('白色、灰色、金色、銀色');
  });

  it('3-4 官運旺流日：金木水火土都與講義一致', () => {
    expect(CAREER_GUIDELINES['金'].goodDays.combinations).toEqual(['丙寅', '丁巳', '丙午', '丁未', '丙戌']);
    expect(CAREER_GUIDELINES['木'].goodDays.combinations).toEqual(['庚申', '庚戌', '辛丑', '辛巳', '辛酉', '庚辰']);
    expect(CAREER_GUIDELINES['土'].goodDays.combinations).toEqual(['甲寅', '乙卯', '甲辰', '乙未', '乙亥']);
    expect(CAREER_GUIDELINES['火'].goodDays.combinations).toEqual(['壬子', '癸丑', '壬辰', '壬申', '癸亥']);
    expect(CAREER_GUIDELINES['水'].goodDays.combinations).toEqual(['戊寅', '戊辰', '戊午', '戊申', '戊戌', '己巳', '己丑', '己未']);
  });
});

describe('4-7 補桃花方位（方位集合只由五行決定）', () => {
  it('水命男（補火）只有 3 個方位：正南、東南、西南——不含正東', () => {
    const dirs = DAY_MASTER_FENG_SHUI['水'].genderGuide['男'].directions;
    expect(dirs).toEqual(['正南方', '東南方', '西南方']);
    expect(dirs).not.toContain('正東方');
  });

  it('romanceFengShui 與 romanceRemediesData 兩份資料方位一致', () => {
    for (const el of EL) {
      const male = DAY_MASTER_FENG_SHUI[el].genderGuide['男'].directions;
      const female = DAY_MASTER_FENG_SHUI[el].genderGuide['女'].directions;
      const row = ROMANCE_FENG_SHUI_DATA[el];
      expect(row, `${el} 日主在 romanceRemediesData 應有資料`).toBeTruthy();
      const norm = (s: string) => s.replace(/方$/g, '');
      const femaleSet = new Set(female.map(norm));
      const rowFemaleSet = new Set(row['女'].direction.split('、').map(d => norm(d.trim())));
      expect(femaleSet).toEqual(rowFemaleSet);
      expect(male.length).toBeGreaterThan(0);
    }
  });
});

describe('2026 流年飛星位置（有年份、不可外推）', () => {
  it('九紫東南、一白中宮、二黑西北、五黃正南', () => {
    const { stars } = getFlyingStarsForYear(2026);
    const loc = (prefix: string) => stars.find(s => s.name.includes(prefix))?.location;
    expect(loc('九紫')).toBe('東南方');
    expect(loc('一白')).toBe('中宮');
    expect(loc('二黑')).toBe('西北方');
    expect(loc('五黃')).toBe('正南方');
  });
});

describe('男桃花流日 = 得財流日（4-4 與 3-1 是同一批干支）', () => {
  it('五金日主的得財日與 4-4 男命桃花日一致', () => {
    expect(WEALTH_GUIDELINES['金'].goodWealthDays.combinationsDetail).toEqual(['甲寅', '甲子', '乙卯', '甲辰', '壬寅', '癸卯', '乙未']);
    expect(WEALTH_GUIDELINES['木'].goodWealthDays.combinationsDetail).toEqual(['丙寅', '丙午', '丙戌', '丁未', '丁巳', '戊戌', '戊寅', '戊午', '己未', '己巳']);
    expect(WEALTH_GUIDELINES['水'].goodWealthDays.combinationsDetail).toEqual(['甲寅', '丙辰', '乙未', '乙巳', '甲午', '甲戌', '丙午', '丙戌', '丙寅', '丁未', '丁巳']);
    expect(WEALTH_GUIDELINES['火'].goodWealthDays.combinationsDetail).toEqual(['庚辰', '辛丑', '己丑', '戊申', '庚申', '辛酉']);
    expect(WEALTH_GUIDELINES['土'].goodWealthDays.combinationsDetail).toEqual(['壬申', '壬子', '壬辰', '癸酉', '癸丑', '癸亥', '庚子', '庚辰', '庚申', '辛亥']);
  });
});

describe('補洩法（1-4／1-5）：身強補耗洩，不得混入印比劫', () => {
  it('身強金：方位／顏色只有耗洩三行（財、官殺、食傷），不含西方白金色', () => {
    const r = getRemedyStrategy('金', false);
    expect(r.method).toBe('洩法');
    // 金耗洩＝水（北方）、木（東方）、火（南方）
    expect(r.directions.sort()).toEqual(['南方', '北方', '東方'].sort());
    expect(r.colors.sort()).toEqual(['紅色', '藍色', '綠色'].sort());
    expect(r.directions).not.toContain('西方');
    expect(r.avoid).toContain('印、比劫');
  });

  it('身弱金：補生扶組（印土＋比劫金）', () => {
    const r = getRemedyStrategy('金', true);
    expect(r.method).toBe('補法');
    expect(r.directions.sort()).toEqual(['南方（土無方位，借火）', '西方'].sort());
  });
});

describe('財星＝我剋（錢是「我剋的」）', () => {
  it('五個日主的 wealthElement 對應正確', () => {
    expect(WEALTH_GUIDELINES['金'].wealthElement).toBe('木');
    expect(WEALTH_GUIDELINES['木'].wealthElement).toBe('土');
    expect(WEALTH_GUIDELINES['水'].wealthElement).toBe('火');
    expect(WEALTH_GUIDELINES['火'].wealthElement).toBe('金');
    expect(WEALTH_GUIDELINES['土'].wealthElement).toBe('水');
  });
});
