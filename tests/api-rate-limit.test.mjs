import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const PORT = 3106;
const BASE = `http://127.0.0.1:${PORT}`;
let serverProcess;

async function waitForServer() {
  for (let i = 0; i < 360; i++) {
    try { await fetch(`${BASE}/`); return; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  throw new Error('Server did not start within timeout');
}

async function requestToken() {
  const response = await fetch(`${BASE}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 200, 'anonymous mode should issue a token');
  const payload = await response.json();
  return payload.token;
}

before(async () => {
  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: { ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      ENABLE_DEV_FIXTURE: 'false',
      AGNES_API_KEY: '',
      BEZI_CHAT_API_KEY: 'test-chat-key',
      BEZI_AUTH_CLIENT_SECRET: 'test-client-secret',
      ENABLE_ANONYMOUS_CHAT: 'true',
      ALLOWED_ORIGINS: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});
  await waitForServer();
});

after(() => serverProcess?.kill());

test('exceeding chat rate limit returns SSE 429', async () => {
  const token = await requestToken();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const body = JSON.stringify({ messages: [{ role: 'user', content: '測試' }] });

  let saw429 = false;
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    const response = await fetch(`${BASE}/api/chat`, { method: 'POST', headers, body });
    if (response.status === 429) {
      saw429 = true;
      const text = await response.text();
      assert.match(text, /請求過於頻繁/);
      break;
    }
    // Drain SSE body so the socket can be reused.
    await response.text();
  }
  assert.ok(saw429, 'expected at least one 429 within the first 40 requests');
});
