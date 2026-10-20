import { describe, expect, it } from 'vitest';
import { parseAgnesResponse } from '../../src/lib/parseAgnesResponse';

describe('parseAgnesResponse', () => {
  it('parses the standard JSON footer without removing term markup', () => {
    const result = parseAgnesResponse('## 核心洞察\n<term>身強</term>。\n\n```json\n{"insight":"一句話","terms":["身強"],"advice":["先觀察"]}\n```');
    expect(result.metadataValid).toBe(true);
    expect(result.metadata).toEqual({ insight: '一句話', terms: ['身強'], advice: ['先觀察'] });
    expect(result.content).toContain('<term>身強</term>');
    expect(result.content).not.toContain('"insight"');
  });

  it('returns safe defaults when the JSON footer is missing', () => {
    const result = parseAgnesResponse('## 核心洞察\n<term>用神</term>');
    expect(result.metadataValid).toBe(false);
    expect(result.metadata).toEqual({ insight: '', terms: [], advice: [] });
    expect(result.content).toContain('<term>用神</term>');
  });

  it('returns safe defaults for malformed or incomplete JSON', () => {
    expect(parseAgnesResponse('文字\n```json\n{"terms":["用神"]}\n```').metadataValid).toBe(false);
    expect(parseAgnesResponse('文字\n```json\n{not-json}\n```').metadata).toEqual({ insight: '', terms: [], advice: [] });
  });
});
