import { describe, expect, it } from 'vitest';
import type { BaziChart } from '../../packages/core/src/paipan';
import { inspectBaziInteractions } from '../../packages/core/src/evidenceInteractions';

const pillar = (s: string) => ({
  gan: s[0] || '', zhi: s[1] || '',
  hiddenGan: [], tenGod: '', hiddenTenGods: [],
});
function chart(year: string, month: string, day: string, hour: string): BaziChart {
  return {
    year: pillar(year), month: pillar(month), day: pillar(day), hour: pillar(hour),
    dayMaster: day[0], gender: '男', birthYear: 0, birthMonth: 0,
    birthDay: 0, birthHour: 0, zodiac: '',
  };
}

describe('徐玉蘭規則證據閘門：只識別候選，不私自扣分或宣布合化', () => {
  it('官網個案保留子酉非相鄰破、兩組酉丑半合和子丑六合', () => {
    const trace = inspectBaziInteractions(chart('甲子', '丁丑', '癸酉', '癸丑'));
    expect(trace.pairs.some(r => r.kind === '破' && r.positions.join() === 'year,day')).toBe(true);
    expect(trace.pairs.some(r => r.kind === '六合' && r.positions.join() === 'year,month')).toBe(true);
    expect(trace.formations.filter(r => r.kind === '半合' && r.branches.includes('酉') && r.branches.includes('丑'))).toHaveLength(2);
    expect(trace.gates.find(g => g.positions.join() === 'year,month')?.status).toBe('BLOCKED');
    expect(trace.gates.find(g => g.positions.join() === 'year,hour')?.status).toBe('BLOCKED');
    expect(trace.status).toBe('REVIEW_REQUIRED');
  });

  it('同一地支有不同關係候選，保留衝突而不自動宣布刑勝過合', () => {
    const trace = inspectBaziInteractions(chart('甲寅', '己亥', '丙巳', '庚申'));
    expect(trace.pairs.filter(r => r.positions.join() === 'year,month').map(r => r.kind).sort())
      .toEqual(['六合', '破']);
    const kinds = trace.pairs.filter(r => r.positions.join() === 'day,hour').map(r => r.kind);
    expect(kinds).toContain('六合');
    expect(kinds).toContain('刑');
    expect(kinds).toContain('破');
    expect(trace.conflicts.some(c => c.positions.join() === 'day,hour')).toBe(true);
    expect(trace.adjustment).toBe('NEVER_AUTOMATIC');
  });

  it('六合相鄰且有化神透干仍不能略過化神旺與無剋條件', () => {
    const trace = inspectBaziInteractions(chart('戊子', '己丑', '癸酉', '壬申'));
    const gate = trace.gates.find(g => g.positions.join() === 'year,month');
    expect(gate?.status).toBe('UNRESOLVED');
    expect(gate?.checks.adjacent).toBe(true);
    expect(gate?.checks.elementExposed).toBe(true);
    expect(gate?.checks.elementStrong).toBeNull();
    expect(gate?.checks.unrestrained).toBeNull();
  });

  it('三合與三會只列候選，庫只列透干線索', () => {
    const trace = inspectBaziInteractions(chart('庚申', '壬子', '乙辰', '癸亥'));
    expect(trace.formations.some(f => f.kind === '三合' && f.element === '水')).toBe(true);
    expect(trace.tombs.some(t => t.position === 'day' && t.branch === '辰' && t.exposedElements.includes('水'))).toBe(true);
    expect(trace.status).toBe('REVIEW_REQUIRED');
  });

  it('缺時柱明確回傳 INCOMPLETE，不產生最終定盤', () => {
    const trace = inspectBaziInteractions(chart('甲子', '丁丑', '癸酉', ''));
    expect(trace.status).toBe('INCOMPLETE');
    expect(trace.finalPattern).toBeNull();
  });
});
