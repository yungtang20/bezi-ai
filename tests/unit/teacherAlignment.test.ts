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
import { GENDER_PALACE_DECOR } from '../../src/data/charts/homeDecorGuide';
import { getWealthCareer } from '../../src/data/charts/wealthCareers';
import { DAY_MASTER_TRAITS } from '../../src/data/core/dayMasterTraits';
import { determinePattern, isWetEarth } from '../../src/pattern';
import { calculateChart } from '../../src/paipan';

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

// 《軟裝添運對照表》（docx-軟裝添運對照表.md）是子息宮／桃花宮的唯一權威。
// 曾經因為「只用五行規則推導、沒回頭對原表」而寫錯水命女／火命女／土命女的子息與桃花。
// 這張表逐格釘住老師原表的方位、色彩、生肖，任何一格被改動就會紅燈。
describe('軟裝添運對照表：子息宮／桃花宮 20 格（老師原表）', () => {
  const EXPECTED: Record<string, { dirs: string[]; colors: string; zodiac: string }> = {
    '金男 子息宮': { dirs: ['南', '東南', '西南'], colors: '紅、黃、橘、綠色系', zodiac: '虎、蛇、馬、羊、狗' },
    '金女 子息宮': { dirs: ['東北', '西北', '北'], colors: '藍、藍綠、黑色系', zodiac: '鼠、龍、猴、豬' },
    '金男 桃花宮': { dirs: ['南', '東南', '西南', '東', '西'], colors: '綠色、藍綠色系', zodiac: '虎、兔、龍、羊、豬' },
    '金女 桃花宮': { dirs: ['南', '東南', '西南'], colors: '紅、黃、粉、橘色系', zodiac: '虎、蛇、馬、羊、狗' },
    '木男 子息宮': { dirs: ['西', '西北', '西南', '東北'], colors: '白、灰、金、銀色系', zodiac: '牛、蛇、猴、雞' },
    '木女 子息宮': { dirs: ['南', '東南', '西南'], colors: '紅、橘、黃色系', zodiac: '蛇、馬、羊、狗' },
    '木男 桃花宮': { dirs: ['南', '東南', '西南'], colors: '紅、橘、黃、土黃色系', zodiac: '牛、龍、蛇、馬、羊、狗' },
    '木女 桃花宮': { dirs: ['西', '西北', '西南', '東北'], colors: '白、灰、金、銀色系', zodiac: '牛、蛇、猴、雞' },
    '水男 子息宮': { dirs: ['南', '東南', '西南'], colors: '紅、黃、橘、土黃色系', zodiac: '牛、龍、蛇、馬、羊、狗' },
    '水女 子息宮': { dirs: ['東北', '東', '東南', '北'], colors: '綠、藍綠色系', zodiac: '虎、兔、龍、羊、豬' },
    '水男 桃花宮': { dirs: ['南', '東南', '西南', '東'], colors: '紅、橘、黃、綠色系', zodiac: '虎、蛇、馬、羊、狗' },
    '水女 桃花宮': { dirs: ['南', '東南', '西南'], colors: '紅、黃、橘、土黃色系', zodiac: '牛、龍、蛇、馬、羊、狗' },
    '火男 子息宮': { dirs: ['南', '東南', '西南', '東', '西', '北'], colors: '藍、藍綠、黑、白、灰、金、銀色系', zodiac: '鼠、牛、龍、猴、雞、豬' },
    '火女 子息宮': { dirs: ['南', '東南', '西南', '東北', '西北'], colors: '紅、黃、橘、土黃色系', zodiac: '牛、龍、蛇、馬、羊、狗' },
    '火男 桃花宮': { dirs: ['南', '西南', '西', '西北'], colors: '白、灰、金、銀色系', zodiac: '牛、蛇、猴、雞' },
    '火女 桃花宮': { dirs: ['南', '東南', '西南', '東', '西', '北'], colors: '藍、藍綠、黑、白、灰、金、銀色系', zodiac: '鼠、牛、龍、猴、雞、豬' },
    '土男 子息宮': { dirs: ['東北', '東', '東南', '北'], colors: '藍、藍綠、綠色系', zodiac: '虎、兔、龍、羊、豬' },
    '土女 子息宮': { dirs: ['南', '西南', '西', '西北'], colors: '白、灰、金、銀色系', zodiac: '牛、蛇、猴、雞' },
    '土男 桃花宮': { dirs: ['南', '西南', '西', '西北'], colors: '藍、藍綠、黑、白、灰、金、銀色系', zodiac: '鼠、牛、龍、猴、雞、豬' },
    '土女 桃花宮': { dirs: ['東北', '東', '東南', '北'], colors: '藍、藍綠、綠色系', zodiac: '虎、兔、龍、羊、豬' },
  };

  for (const [key, exp] of Object.entries(EXPECTED)) {
    it(`${key} 方位／色彩／生肖與原表一致`, () => {
      const [el, palace] = key.split(' ');
      const gender = el.endsWith('男') ? 'male' : 'female';
      const element = el[0] as '金' | '木' | '水' | '火' | '土';
      const d = GENDER_PALACE_DECOR[element][palace as '子息宮' | '桃花宮'][gender];
      expect(d, `${key} 應存在`).toBeTruthy();
      expect(d.directions).toEqual(exp.dirs);
      expect(d.colors).toBe(exp.colors);
      expect(d.zodiac).toBe(exp.zodiac);
    });
  }
});

// 講義 1-4 [07:14]：「濕土能生金，燥土比較無法生金」。
// 地支層面老師點名辰、丑；天干層面依同一定義，己（田園濕土）算、戊（燥土）不算。
describe('濕土生金：辰、丑、己算印；未、戌、戊不算（1-4 [07:14]）', () => {
  it('濕土判定：辰、丑、己為濕土；未、戌、戊為燥土', () => {
    for (const s of ['辰', '丑', '己']) expect(isWetEarth(s), `${s} 應為濕土`).toBe(true);
    for (const s of ['未', '戌', '戊']) expect(isWetEarth(s), `${s} 應為燥土`).toBe(false);
  });

  it('天干確實接進計分：同盤換月干，己（濕土）高於戊（燥土）', () => {
    // 用真實命盤（1990-05-15 14:00 男，庚金日主）只換月干，地支不動，排除其他變因
    const base = calculateChart(1990, 5, 15, 14, '男');
    const withMonthGan = (gan: string) => ({ ...base, month: { ...base.month, gan } });
    expect(determinePattern(withMonthGan('己')).score)
      .toBeGreaterThan(determinePattern(withMonthGan('戊')).score);
  });
});

describe('3-3 官殺×印：長官緣佳（不是長輩緣佳）', () => {
  it('官殺為主星、印星為次星時，文字用「長官緣佳」與「身殺兩停」', () => {
    const r = getWealthCareer('正官', '正印');
    expect(r).toBeTruthy();
    expect(r!.suitableCareers).toContain('長官緣佳');
    expect(r!.suitableCareers).toContain('身殺兩停');
    expect(r!.suitableCareers).not.toContain('長輩緣佳');
  });
});

// 講義 1-1 [44:49]–[50:56] 講的是「五行偏旺／偏弱」，不是逐干各一套。
// 曾經把「金偏旺」寫給辛、把庚的身弱寫成「剛硬」（那其實是金偏旺），
// 丙、戊、庚、壬 也都各有一半是憑印象補的。
describe('日主身強／身弱 = 講義的五行偏旺／偏弱（1-1）', () => {
  const PAIRS: Array<[string, string]> = [['甲', '乙'], ['丙', '丁'], ['戊', '己'], ['庚', '辛'], ['壬', '癸']];

  for (const [yang, yin] of PAIRS) {
    it(`${yang}與${yin}同屬一行，身強／身弱敘述必須逐字相同`, () => {
      const a = DAY_MASTER_TRAITS[yang as keyof typeof DAY_MASTER_TRAITS];
      const b = DAY_MASTER_TRAITS[yin as keyof typeof DAY_MASTER_TRAITS];
      expect(a.strong).toBe(b.strong);
      expect(a.weak).toBe(b.weak);
    });
  }

  it('五行偏旺的關鍵語句與講義一致', () => {
    expect(DAY_MASTER_TRAITS['甲'].strong).toContain('很希望成長突破');
    expect(DAY_MASTER_TRAITS['丙'].strong).toContain('太情緒化');
    expect(DAY_MASTER_TRAITS['戊'].strong).toContain('原則性太強');
    expect(DAY_MASTER_TRAITS['庚'].strong).toContain('敢衝敢拼');
    expect(DAY_MASTER_TRAITS['辛'].strong).toContain('嫉惡如仇');
    expect(DAY_MASTER_TRAITS['壬'].strong).toContain('想太多');
  });

  it('五行偏弱的關鍵語句與講義一致（不得混入偏旺的性格）', () => {
    expect(DAY_MASTER_TRAITS['甲'].weak).toContain('缺乏自信');
    expect(DAY_MASTER_TRAITS['丙'].weak).toContain('很怕衝突');
    expect(DAY_MASTER_TRAITS['戊'].weak).toContain('比較沒有責任感');
    expect(DAY_MASTER_TRAITS['庚'].weak).toContain('該斷不斷');
    expect(DAY_MASTER_TRAITS['癸'].weak).toContain('容易被表面的假象騙');

    // 「固執」「剛硬」「敢衝敢拼」都是偏旺，不該出現在偏弱
    for (const stem of ['甲', '丙', '戊', '庚', '壬'] as const) {
      const w = DAY_MASTER_TRAITS[stem].weak;
      expect(w, `${stem} 身弱不應含偏旺性格`).not.toMatch(/固執|剛硬|敢衝敢拼|嫉惡如仇/);
    }
  });
});
