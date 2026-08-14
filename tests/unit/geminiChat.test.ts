import { describe, expect, it } from 'vitest';
import { toGeminiContents } from '../../src/server/geminiChat';

describe('Gemini chat history conversion', () => {
  it('maps assistant turns to model and preserves message text', () => {
    expect(toGeminiContents([
      { role: 'user', content: '第一問' },
      { role: 'assistant', content: '第一答' },
      { role: 'user', content: '第二問' },
    ])).toEqual([
      { role: 'user', parts: [{ text: '第一問' }] },
      { role: 'model', parts: [{ text: '第一答' }] },
      { role: 'user', parts: [{ text: '第二問' }] },
    ]);
  });
});
