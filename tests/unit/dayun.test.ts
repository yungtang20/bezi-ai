import { describe, it, expect } from 'vitest';
import { calculateDaYun, getDaYunQuality, getLiuNian, getFutureLiuNian, getDaYunSegmentQuality } from '../../src/dayun';
import { calculateChart } from '../../src/paipan';

/**
 * Golden 回歸測試：大運/流年值以「獨立」方法驗證後硬編碼。
 *
 * 獨立驗證來源：
 * 1. 起運年齡 = 出生日 → 順/逆方向最近「節氣」日數 ÷ 3（3 天 = 1 年，子平標準）。
 *    節氣時刻用 Meeus 低精度太陽黃經獨立計算：
 *      清明 1984 = 04-04 14:28 UTC（demo-001 男/陽年順行 → 下一節）
 *      立夏 1991 = 05-06 00:19 UTC（demo 1991-05-15 男/陰年逆行 → 上一節）
 *      芒種 1990 = 06-05 22:45 UTC（1990-05-15 男/陽年順行 → 下一節）
 *      立冬 1985 = 11-07 11:24 UTC（1985-10-20 女/陰年陽女 → 順行 → 下一節）
 *    日數 ÷ 3 ≈ 起運虛歲：
 *      1984-03-25 10:00 → 04-04 14:28 ≈ 10.19 日 /3 ≈ 3.4 → 4 歲（1987 起）
 *      1985-10-20 08:00 → 11-07 11:24 ≈ 18.14 日 /3 ≈ 6.0 → 7 歲（1991 起）
 *      1990-05-15 14:00 → 06-05 22:45 ≈ 21.36 日 /3 ≈ 7.1 → 8 歲（1997 起）
 *      1991-05-15 14:00 → 05-06 00:19 ≈ 9.19 日（回溯）/3 ≈ 3.06 → 4 歲（1994 起）
 * 2. 大運干支 = 月柱 ±1（順/逆行），由月柱干支直接推導（六十甲子表）。
 *    demo-001 月柱丁卯 → 順行戊辰、己巳；demo-002 月柱丙戌 → 順行丁亥、戊子；
 *    1990 月柱辛巳 → 順行壬午、癸未；1991 月柱癸巳 → 逆行壬辰、辛卯。
 * 3. 流年干支 = (year - 3) mod 60 六十甲子：2026 = 丙午、2025 = 乙巳、2027 = 丁未。
 *    十神關係 = 流年干 vs 日主的五行生剋 + 陰陽同異（十神標準表）。
 */
describe('Da Yun & Liu Nian golden values (independently verified)', () => {
  it('1984-03-25 10:00 男（甲子 丁卯月）→ 順行，首兩步 戊辰(起1987) 己巳(起1997)', () => {
    const chart = calculateChart(1984, 3, 25, 10, '男');
    const dy = calculateDaYun(chart).slice(0, 2);
    expect(dy.map(d => [d.ganZhi, d.startYear])).toEqual([['戊辰', 1987], ['己巳', 1997]]);
    expect(dy[0].startAge).toBe(4);
    expect(dy[0].endYear).toBe(1996);
    expect(dy[0].tenGod).toBe('比肩'); // 戊 vs 日主戊
  });

  it('1985-10-20 08:00 女（乙丑 丙戌月）→ 順行，首兩步 丁亥(起1991) 戊子(起2001)', () => {
    const chart = calculateChart(1985, 10, 20, 8, '女');
    const dy = calculateDaYun(chart).slice(0, 2);
    expect(dy.map(d => [d.ganZhi, d.startYear])).toEqual([['丁亥', 1991], ['戊子', 2001]]);
    expect(dy[0].startAge).toBe(7);
    expect(dy[0].endYear).toBe(2000);
    expect(dy[0].tenGod).toBe('正財'); // 丁火生壬水日主，陰生陽 = 正財
  });

  it('1990-05-15 14:00 男（庚午 辛巳月）→ 順行，首兩步 壬午(起1997) 癸未(起2007)', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const dy = calculateDaYun(chart).slice(0, 2);
    expect(dy.map(d => [d.ganZhi, d.startYear])).toEqual([['壬午', 1997], ['癸未', 2007]]);
    expect(dy[0].startAge).toBe(8);
    expect(dy[0].endYear).toBe(2006);
    expect(dy[0].tenGod).toBe('食神'); // 庚金生壬水，陽生陽 = 食神
  });

  it('1991-05-15 14:00 男（辛未 癸巳月）→ 逆行，首兩步 壬辰(起1994) 辛卯(起2004)', () => {
    const chart = calculateChart(1991, 5, 15, 14, '男');
    const dy = calculateDaYun(chart).slice(0, 2);
    expect(dy.map(d => [d.ganZhi, d.startYear])).toEqual([['壬辰', 1994], ['辛卯', 2004]]);
    expect(dy[0].startAge).toBe(4);
    expect(dy[0].endYear).toBe(2003);
    expect(dy[0].tenGod).toBe('正印'); // 壬水生乙木日主，陽生陰 = 正印
  });

  it('流年 2026 = 丙午；對不同日主的十神關係正確', () => {
    expect(getLiuNian(2026, '庚').ganZhi).toBe('丙午');
    expect(getLiuNian(2026, '庚').relation).toBe('七殺'); // 丙火剋庚金，陽剋陽
    expect(getLiuNian(2025, '庚').ganZhi).toBe('乙巳');
    expect(getLiuNian(2025, '庚').relation).toBe('正財'); // 庚金剋乙木，陽剋陰
    expect(getLiuNian(2026, '戊').ganZhi).toBe('丙午');
    expect(getLiuNian(2026, '戊').relation).toBe('偏印'); // 丙火生戊土，陽生陽
    expect(getLiuNian(2026, '辛').ganZhi).toBe('丙午');
    expect(getLiuNian(2026, '辛').relation).toBe('正官'); // 丙火剋辛金，陽剋陰
  });

  it('getFutureLiuNian 連續年份干支依六十甲子推進', () => {
    const future = getFutureLiuNian(2025, 5, '甲');
    expect(future.map(l => l.year)).toEqual([2025, 2026, 2027, 2028, 2029]);
    expect(future.map(l => l.ganZhi)).toEqual(['乙巳', '丙午', '丁未', '戊申', '己酉']);
  });
});

describe('DaYun Quality (徐玉蘭口徑：前 5 年走天干、後 5 年走地支)', () => {
  // 庚金日主：favorable 取 [金, 土]，unfavorable 取 [火]
  const favorable = ['金', '土'];
  const unfavorable = ['火'];

  it('大運前五年以天干為主', () => {
    // 壬午大運（startYear 2000）：壬=水（平）、午=火（忌）。
    // 前五年天干為主、地支為次：天干平局 → 看地支，地支忌 → 壞運。
    expect(getDaYunQuality('壬', '午', favorable, unfavorable, { daYunStartYear: 2000, year: 2000 })).toBe('壞運');
    expect(getDaYunQuality('壬', '午', favorable, unfavorable, { daYunStartYear: 2000, year: 2004 })).toBe('壞運');
  });

  it('大運後五年以地支為主', () => {
    // 2005 起屬後五年，地支午=火為忌 → 壞運
    expect(getDaYunQuality('壬', '午', favorable, unfavorable)).toBe('壞運');
    expect(getDaYunQuality('壬', '午', favorable, unfavorable, { daYunStartYear: 2000, year: 2005 })).toBe('壞運');
  });

  it('天干為喜時前五年判好運', () => {
    // 辛巳大運（startYear 2010）：辛=金為喜。2010-2014 前五年天干為主 → 好運
    expect(getDaYunQuality('辛', '巳', favorable, unfavorable, { daYunStartYear: 2010, year: 2010 })).toBe('好運');
    expect(getDaYunQuality('辛', '巳', favorable, unfavorable, { daYunStartYear: 2010, year: 2014 })).toBe('好運');
  });

  it('流年不傳年份時維持地支優先', () => {
    // 流年庚午：地支午=火為忌 → 壞運（不傳 opts）
    expect(getDaYunQuality('庚', '午', favorable, unfavorable)).toBe('壞運');
  });

  it('calculateDaYun 回傳結構完整', () => {
    const chart = calculateChart(1990, 5, 15, 14, '男');
    const daYun = calculateDaYun(chart.chart ?? chart);
    expect(daYun.length).toBeGreaterThan(0);
    for (const dy of daYun) {
      expect(typeof dy.startYear).toBe('number');
      expect(typeof dy.startAge).toBe('number');
      expect(dy.gan).toBeTruthy();
      expect(dy.zhi).toBeTruthy();
    }
  });
});

describe('DaYun segment quality override (老師口徑例外表)', () => {
  const favorable = ['金', '土', '水'];
  const unfavorable = ['火', '土'];

  it('癸男壬午大運命中 override → 好運', () => {
    // getDaYunQuality: 壬=水（平）、午=火（忌） → 壞運；
    // override 表以老師口徑為準 → 好運。
    expect(getDaYunSegmentQuality('癸', '男', '壬', '午', favorable, unfavorable, { daYunStartYear: 2000, year: 2000 })).toBe('好運');
    expect(getDaYunSegmentQuality('癸', '男', '壬', '午', favorable, unfavorable, { daYunStartYear: 2000, year: 2005 })).toBe('好運');
  });

  it('非 override 命中時退回 getDaYunQuality 邏輯', () => {
    // 壬男壬午不在 override 表；壬=水在 favourable 清單 → 機率模型判好運
    expect(getDaYunSegmentQuality('壬', '男', '壬', '午', favorable, unfavorable, { daYunStartYear: 2000, year: 2000 })).toBe('好運');
    // 以木日主、庚金天干（金剋木，忌神）驗證機率模型會回壞運
    expect(getDaYunSegmentQuality('甲', '男', '庚', '申', ['木', '水'], ['金', '火'], { daYunStartYear: 2000, year: 2000 })).toBe('壞運');
  });
});
