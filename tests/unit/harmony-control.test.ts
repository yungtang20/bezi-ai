import { describe, expect, it } from 'vitest';
import { calculateChart } from '../../src/paipan';
import { determinePattern } from '../../src/pattern';

function chartWithHour(gan: string) {
  const chart = calculateChart(1990, 5, 15, 14, '男');
  return {
    ...chart,
    dayMaster: '庚',
    year: { ...chart.year, gan: '庚', zhi: '辰' },
    month: { ...chart.month, gan: '己', zhi: '酉' },
    day: { ...chart.day, gan: '庚', zhi: '子' },
    hour: { ...chart.hour, gan, zhi: '申' },
  };
}

describe('地支合化的受剋方向', () => {
  it('辰酉化金時，木天干不剋金', () => {
    const result = determinePattern(chartWithHour('甲'));
    expect(result.reason).toContain('P1天干合化金');
  });

  it('辰酉化金時，火天干剋金', () => {
    const result = determinePattern(chartWithHour('丙'));
    expect(result.reason).not.toContain('P1天干合化金');
  });
});
