import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

describe('production index HTML security', () => {
  it('does not contain executable inline scripts that the production CSP blocks', async () => {
    const indexHtml = await readFile(path.join(process.cwd(), 'index.html'), 'utf8');
    const executableInlineScripts = [...indexHtml.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
      .map((match) => match[1].trim())
      .filter(Boolean);

    expect(executableInlineScripts).toEqual([]);
  });
});
