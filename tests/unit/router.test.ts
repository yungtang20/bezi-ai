// tests/unit/router.test.ts
// [AI MOD] Hash deep-link 路由的 golden test：step ↔ slug 一一對應、無法辨識回 null。
import { describe, it, expect } from 'vitest';
import { parseStepFromHash, stepToHash } from '../../src/lib/router';
import type { Step } from '../../src/App';

const ALL_STEPS: Step[] = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12];

describe('Router (hash deep-link)', () => {
  it('parses a step from its hash slug', () => {
    expect(parseStepFromHash('#/today')).toBe(4);
    expect(parseStepFromHash('#/me')).toBe(12);
    expect(parseStepFromHash('#/calibrate')).toBe(3);
    expect(parseStepFromHash('/flow')).toBe(6);
  });

  it('returns null for empty or unknown slugs', () => {
    expect(parseStepFromHash('')).toBeNull();
    expect(parseStepFromHash('#')).toBeNull();
    expect(parseStepFromHash('#/')).toBeNull();
    expect(parseStepFromHash('#/bogus')).toBeNull();
  });

  it('round-trips every routable step through stepToHash', () => {
    for (const step of ALL_STEPS) {
      const hash = stepToHash(step);
      expect(hash).toMatch(/^#\//);
      const parsed = parseStepFromHash(hash);
      // step 5 已併入 today（slug 不唯一），其餘 step 必須一一還原。
      if (step === 5) {
        expect(parsed).toBe(4);
      } else {
        expect(parsed).toBe(step);
      }
    }
  });

  it('maps step 5 and step 4 to the same today slug', () => {
    expect(stepToHash(5)).toBe(stepToHash(4));
  });
});
