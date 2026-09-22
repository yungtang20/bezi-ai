import { describe, expect, it } from 'vitest';
import { parseTermSegments } from '../../src/lib/termParser';

describe('termParser', () => {
  it('keeps term text and removes unsafe markup', () => {
    const segments = parseTermSegments('目前正走 <term>傷官見官<script>alert(1)</script></term>。');
    expect(segments.some(segment => segment.term === '傷官見官')).toBe(true);
    expect(segments.join('')).not.toContain('<script>');
  });

  it('ignores empty terms', () => {
    expect(parseTermSegments('A<term></term>B')).toEqual([{ text: 'AB' }]);
  });
});
