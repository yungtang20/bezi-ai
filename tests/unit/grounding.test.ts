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
  it('produces an explicit missing-data refusal', () => {
    expect(missingEvidenceOutput(['出生時間']).status).toBe('needs_data');
  });
});
