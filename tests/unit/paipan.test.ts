import { describe, it, expect } from 'vitest';
import { calculateChart } from '../../src/paipan';
import { getFiveElementData, getTenGodData } from '../../packages/core/src/chartTransform';

/**
 * Golden 回歸測試：四柱值以「獨立」方法驗證後硬編碼，防止排盤引擎回歸。
 *
 * 獨立驗證來源（非 lunar-javascript、非本引擎）：
 * 1. 日柱 = JDN 六十週期公式，錨點 1949-10-01 = 甲子（公開歷史事實）。
 *    jdn(y,m,d) 標準公式；index = (JDN + 49) mod 60。
 *    驗證：1949-10-01 → 甲子 ✓。
 * 2. 年柱（立春學派，子平法）：立春時辰前 = 上年。立春時刻以 Meeus 低精度
 *    太陽黃經獨立計算（誤差 ~1-2 分）：
 *      立春 1995 = 1995-02-04 07:19 UTC；立春 2000 = 2000-02-04 12:36 UTC。
 * 3. 月柱節氣（獨立計算）：清明 1984 = 04-04 14:28 UTC、立夏 1991 = 05-06 00:19 UTC、
 *    立冬 1985 = 11-07 11:24 UTC。月份由節氣區間決定，月干由五虎遁推導。
 * 4. 時柱 = 五鼠遁（甲己還加甲、乙庚丙作初、丙辛從戊起、丁壬庚子居、戊癸起壬子）。
 * 5. 起運年齡 = 出生日至順/逆節氣日數 ÷ 3（3 天 = 1 年），節氣時刻同上獨立計算。
 *
 * 注意 23:00（早子時）案例：日柱維持當日（庚辰/丙寅），時柱為「次日日干」的子時
 * （戊子/庚子）——此為 lunar-javascript EightChar 標準行為，本測試將其釘住。
 */

describe('Paipan golden values (independently verified)', () => {
  it('1984-03-25 10:00 男 → 甲子 丁卯 戊午 丁巳（demo-001；清明 1984 = 04-04 14:28 UTC，仍在卯月）', () => {
    const c = calculateChart(1984, 3, 25, 10, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['甲子', '丁卯', '戊午', '丁巳']);
    expect(c.dayMaster).toBe('戊');
    expect(c.zodiac).toBe('鼠');
  });

  it('1985-10-20 08:00 女 → 乙丑 丙戌 壬辰 甲辰（demo-002；日柱壬辰 = JDN 獨立驗證）', () => {
    const c = calculateChart(1985, 10, 20, 8, '女');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['乙丑', '丙戌', '壬辰', '甲辰']);
    expect(c.dayMaster).toBe('壬');
  });

  it('1990-05-15 14:00 男 → 庚午 辛巳 庚辰 癸未（日柱庚辰 = JDN 獨立驗證；午月由小滿 06-06 決定，未過）', () => {
    const c = calculateChart(1990, 5, 15, 14, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['庚午', '辛巳', '庚辰', '癸未']);
  });

  it('1991-05-15 14:00 男 → 辛未 癸巳 乙酉 癸未（日柱乙酉 = JDN 獨立驗證）', () => {
    const c = calculateChart(1991, 5, 15, 14, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['辛未', '癸巳', '乙酉', '癸未']);
  });

  it('1995-02-04 07:00 男 → 甲戌 丁丑 丙寅 壬辰（立春 1995 = 02-04 07:19 UTC 前 → 仍屬甲戌年丑月）', () => {
    const c = calculateChart(1995, 2, 4, 7, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['甲戌', '丁丑', '丙寅', '壬辰']);
    expect(c.zodiac).toBe('狗');
  });

  it('1995-02-04 16:00 男 → 乙亥 戊寅 丙寅 丙申（立春 1995 後 → 乙亥年寅月，日柱不變 = 丙寅）', () => {
    const c = calculateChart(1995, 2, 4, 16, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['乙亥', '戊寅', '丙寅', '丙申']);
    expect(c.zodiac).toBe('豬');
  });

  it('1995-01-20 12:00 男 → 甲戌 丁丑 辛亥 甲午（立春前；若誤用農曆正月換年學派會得乙亥/戊寅，大運方向亦反）', () => {
    const c = calculateChart(1995, 1, 20, 12, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['甲戌', '丁丑', '辛亥', '甲午']);
  });

  it('2000-02-04 12:00 男 → 己卯 丁丑 壬辰 丙午（立春 2000 = 02-04 12:36 UTC 前 → 仍己卯年丑月）', () => {
    const c = calculateChart(2000, 2, 4, 12, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['己卯', '丁丑', '壬辰', '丙午']);
  });

  it('2000-02-05 00:00 男 → 庚辰 戊寅 癸巳 壬子（立春 2000 後 → 庚辰年寅月；日柱癸巳 = JDN 獨立驗證）', () => {
    const c = calculateChart(2000, 2, 5, 0, '男');
    expect([c.year, c.month, c.day, c.hour].map(p => p.gan + p.zhi)).toEqual(['庚辰', '戊寅', '癸巳', '壬子']);
  });

  it('1990-05-15 23:00 男 → 早子時：日柱庚辰不變、時柱戊子（EightChar 標準子時行為，防回歸）', () => {
    const c = calculateChart(1990, 5, 15, 23, '男');
    expect(c.day.gan + c.day.zhi).toBe('庚辰');
    expect(c.hour.gan + c.hour.zhi).toBe('戊子');
  });

  it('時辰未知：前三柱正常、時柱為空', () => {
    const c = calculateChart(1984, 3, 25, -1, '男', true);
    expect([c.year, c.month, c.day].map(p => p.gan + p.zhi)).toEqual(['甲子', '丁卯', '戊午']);
    expect(c.hour.gan).toBe('');
    expect(c.hour.zhi).toBe('');
  });

  it('五行與十神分布與 demo-001（1984-03-25 10:00 男）engine 輸出一致', () => {
    const c = calculateChart(1984, 3, 25, 10, '男');
    const elems = Object.fromEntries(getFiveElementData(c).map(i => [i.name, i.value]));
    const gods = Object.fromEntries(getTenGodData(c).map(i => [i.name, i.value]));
    // 五行 = 四柱天干地支五行計數正規化（木:甲1 / 火:丁午丁3 / 土:戊1 / 水:子藏癸1）
    expect(elems).toEqual({ 木: 50, 火: 100, 土: 25, 金: 0, 水: 25 });
    // 十神 = 四柱天干 + 藏干（相對日主戊），與 data/bazi_records.json demo-001 一致
    expect(gods).toEqual({
      比肩: 2, 劫財: 1, 食神: 1, 傷官: 1,
      偏財: 1, 正財: 1, 七殺: 1, 正官: 1, 偏印: 1, 正印: 3,
    });
  });
});
