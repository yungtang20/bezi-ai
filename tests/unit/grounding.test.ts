import { describe, expect, it } from 'vitest';
import { missingEvidenceOutput, validateAIOutput, validateEvidenceBundle, type EvidenceBundle } from '../../src/ai/grounding';

const bundle: EvidenceBundle = {
  requestId: 'req-1', userId: 'user-1', query: '問題',
  items: [{ sourceId: 'sql:chart:1', sourceType: 'sql', title: '命盤', content: '日主甲木', retrievedAt: '2026-09-22T00:00:00Z', schemaVersion: '1', supports: ['日主為甲木'] }],
  limitations: [], allowedClaims: ['日主為甲木'], expiresAt: '2026-09-22T01:00:00Z',
};

describe('grounding validators', () => {
  it('rejects malformed evidence', () => expect(validateEvidenceBundle({}).valid).toBe(false));
  it('rejects citations outside the evidence bundle', () => {
    const result = validateAIOutput({ status: 'answered', answer: 'x', claims: [{ text: 'x', sourceIds: ['mcp:fake'], confidence: 'high' }], limitations: [], nextQuestions: [] }, bundle);
    expect(result.valid).toBe(false);
  });
  it('requires claims for answered output', () => {
    const result = validateAIOutput({ status: 'answered', answer: 'x', claims: [], limitations: [], nextQuestions: [] }, bundle);
    expect(result.valid).toBe(false);
  });
  it('rejects a claim that is not present in the answer even with a real sourceId (#44)', () => {
    const result = validateAIOutput({
      status: 'answered',
      answer: '請注意睡眠與生活作息。',
      claims: [{ text: '您的日主一定是甲', sourceIds: ['sql:chart:1'], confidence: 'high' }],
      limitations: [], nextQuestions: [],
    }, bundle);
    expect(result.valid).toBe(false);
    expect(result.errors.join(';')).toMatch(/主張.*回答/);
  });
  it('produces an explicit missing-data refusal', () => {
    expect(missingEvidenceOutput(['出生時間']).status).toBe('needs_data');
  });
  it('accepts server-computed session evidence', () => {
    const computed: EvidenceBundle = {
      ...bundle,
      items: [{ ...bundle.items[0], sourceId: 'computed:current-1', sourceType: 'computed' }],
      source: { type: 'computed', id: 'current-1' },
    };
    expect(validateEvidenceBundle(computed).valid).toBe(true);
  });
});
