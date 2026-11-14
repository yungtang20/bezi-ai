import { describe, it, expect } from 'vitest';
import { checkDayType } from '../../packages/core/src/data/rules/dailyFlowDays';

// 老師的判準（2-4 犯小人時機 [06:28]–[07:39]）：流日干支皆為比劫（同我）＝日主五行最強之日。
// 同單元 [11:47]–[13:23] 另說「健康注意日／犯小人日同源，第一判準為日主能量最強的那一天」。
// 因此這兩個標籤必須是同一組日子；兩張表不得各自維護。

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

const ALL_PILLARS = Array.from(
  { length: 60 },
  (_, i) => GAN[i % 10] + ZHI[i % 12]
);

const DAY_MASTERS = {
  木: '甲',
  火: '丙',
  土: '戊',
  金: '庚',
  水: '壬',
} as const;

describe('犯小人日 / 健康注意日', () => {
  it('癸水日主逢壬辰要標記（壬為劫財、辰藏癸為比肩）', () => {
    const types = checkDayType('壬', '辰', '癸', '男');
    expect(types).toContain('犯小人日');
    expect(types).toContain('健康注意日');
  });

  it('健康注意日與犯小人日必須同源，五種日主都不可分歧', () => {
    const divergences: string[] = [];
    for (const [element, dayMaster] of Object.entries(DAY_MASTERS)) {
      for (const pillar of ALL_PILLARS) {
        const types = checkDayType(pillar[0], pillar[1], dayMaster, '男');
        const villain = types.includes('犯小人日');
        const health = types.includes('健康注意日');
        if (villain !== health) {
          divergences.push(
            `${element}日主(${dayMaster}) 逢 ${pillar}: 犯小人=${villain} 健康=${health}`
          );
        }
      }
    }
    expect(divergences).toEqual([]);
  });
});
