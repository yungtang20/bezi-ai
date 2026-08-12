declare module 'lunar-javascript' {
  // 根據 lunar-javascript@1.7.7 實際 JSDoc / index.js 精簡整理。

  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getLunar(): Lunar;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getYearInGanZhi(): string;
    getYearInGanZhiExact(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthInGanZhi(): string;
    getMonthInGanZhiExact(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDayInGanZhi(): string;
    getDayInGanZhiExact(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeInGanZhi(): string;
    getGan(): string;
    getZhi(): string;
    getEightChar(): EightChar;
    getJieQi(): string;
    getJieQiTable(): Record<string, Solar>;
    getYun(gender: number, sect?: number): Yun;
    getDayYi(sect?: number): string[];
    getDayJi(sect?: number): string[];
    getMonthYi(): string[];
    getMonthJi(): string[];
    getYearYi(): string[];
    getYearJi(): string[];
    getDayYi(sect?: number): string[];
    getDayJi(sect?: number): string[];
    getDayJiShen(): string;
    getMonthYi(): string[];
    getMonthJi(): string[];
    getYearYi(): string[];
    getYearJi(): string[];
    getDayJiShen(): string;
  }

  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYun(gender: number, sect?: number): Yun;
  }

  export class Yun {
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getStartAge(): number;
    getStartYear(): number;
    getEndAge(): number;
    getGanZhi(): string;
    getLiuNian(): LiuNian[];
  }

  export class LiuNian {
    getGanZhi(): string;
  }
}
