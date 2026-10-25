// tests/unit/factChecker.test.ts
// [Q4] 決定性事實檢查器金值測試：對 / 錯 / 不可查（時辰未知）/ 無事實 / 不罰沒說的事。
import { describe, it, expect } from 'vitest';
import { checkFactualClaims, type FactualBaziRecord } from '../../src/ai/factChecker';

// 金值命盤：1984-03-25 巳時男（甲子年丁卯月戊午日丁巳時），火最旺、金最弱。
// 與 data/bazi_records.json demo-001 同盤。
const record: FactualBaziRecord = {
  bazi: { year: '甲子', month: '丁卯', day: '戊午', time: '丁巳', dayMaster: '戊', gender: '男' },
  fiveElements: { wood: 50, fire: 100, earth: 25, metal: 0, water: 25 },
  dayun: [{ ganZhi: '戊辰' }, { ganZhi: '己巳' }],
};

describe('checkFactualClaims', () => {
  it('all-correct answer is fully verified', () => {
    const answer = '此命日主為戊，屬鼠。年柱甲子、月柱丁卯、日柱戊午、時柱丁巳。\n五行火最旺，金最弱。目前行戊辰大運。';
    const result = checkFactualClaims(answer, record);
    expect(result.failed).toBe(0);
    expect(result.accuracy).toBe(1);
    expect(result.verdict).toBe('all_correct');
    expect(result.facts.map(f => f.type).sort()).toEqual([
      'day_master', 'day_pillar', 'dayun', 'hour_pillar', 'month_pillar',
      'strongest_element', 'weakest_element', 'year_pillar', 'zodiac',
    ]);
  });

  it('flags a wrong day master', () => {
    const result = checkFactualClaims('日主為甲', record);
    expect(result.verdict).toBe('has_errors');
    expect(result.facts.find(f => f.type === 'day_master')).toEqual({ type: 'day_master', claimed: '甲', actual: '戊', verdict: 'wrong' });
    expect(result.accuracy).toBe(0);
  });

  it('flags a fabricated dayun not in evidence', () => {
    const result = checkFactualClaims('目前行壬寅大運。', record);
    expect(result.facts.find(f => f.type === 'dayun')).toEqual({ type: 'dayun', claimed: '壬寅', actual: '戊辰,己巳', verdict: 'wrong' });
  });

  it('accepts a dayun that matches any evidence period', () => {
    const result = checkFactualClaims('第二步己巳大運將開始。', record);
    expect(result.verdict).toBe('all_correct');
  });

  it('does not flag the model for facts it did not claim', () => {
    const result = checkFactualClaims('大運期間整體平穩，流年以沖合為主，宜守。', record);
    expect(result.verdict).toBe('no_facts');
    expect(result.facts).toHaveLength(0);
    expect(result.accuracy).toBeNull();
  });

  it('marks hour pillar unverifiable when birth hour is unknown', () => {
    const unknownHour: FactualBaziRecord = { ...record, bazi: { ...record.bazi, time: '時辰未知' } };
    const result = checkFactualClaims('時柱丁巳。', unknownHour);
    const hour = result.facts.find(f => f.type === 'hour_pillar');
    expect(hour?.verdict).toBe('unverifiable');
    expect(hour?.actual).toBeNull();
    expect(result.checked).toBe(0);
    expect(result.accuracy).toBeNull();
    expect(result.verdict).toBe('all_unverifiable');
  });

  it('ignores <term> tags and JSON footer when extracting', () => {
    const answer = '日主<term>為</term>戊，年柱甲子。\n\n```json\n{"insight":"x","terms":[],"advice":[]}\n```';
    const result = checkFactualClaims(answer, record);
    expect(result.verdict).toBe('all_correct');
    expect(result.facts.map(f => f.type)).toEqual(['day_master', 'year_pillar']);
  });

  it('treats a wrong zodiac as an error', () => {
    const result = checkFactualClaims('命主屬牛。', record);
    expect(result.facts.find(f => f.type === 'zodiac')).toEqual({ type: 'zodiac', claimed: '牛', actual: '鼠', verdict: 'wrong' });
  });

  it('flags a wrong strongest element', () => {
    const result = checkFactualClaims('五行木最旺。', record);
    expect(result.facts.find(f => f.type === 'strongest_element')).toEqual({ type: 'strongest_element', claimed: '木', actual: '火', verdict: 'wrong' });
  });

  it('mixed correct and wrong claims score partially', () => {
    const result = checkFactualClaims('日主為戊，年柱乙丑。', record);
    expect(result.checked).toBe(2);
    expect(result.passed).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.accuracy).toBe(0.5);
    expect(result.verdict).toBe('has_errors');
  });
});
