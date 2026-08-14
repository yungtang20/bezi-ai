import { describe, expect, it } from 'vitest';
import { readChatHttpError } from '../../src/api/chatError';

describe('chat HTTP error messages', () => {
  it('shows the backend API-key guidance instead of a generic 401', async () => {
    const response = new Response(JSON.stringify({
      error: '請提供 Gemini API Key。伺服器共用金鑰預設停用。',
      code: 'API_KEY_REQUIRED',
      timestamp: 1,
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(readChatHttpError(response)).resolves.toBe(
      '請提供 Gemini API Key。伺服器共用金鑰預設停用。',
    );
  });

  it('keeps a stable fallback for non-JSON upstream failures', async () => {
    const response = new Response('Bad Gateway', { status: 502 });
    await expect(readChatHttpError(response)).resolves.toBe('HTTP 錯誤 502');
  });
});
