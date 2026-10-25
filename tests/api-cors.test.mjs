// tests/api-cors.test.mjs
// [AI MOD] CORS 回歸測試：
// 背景 — Vite 產出的 module script 帶 crossorigin 屬性，瀏覽器連「同源」請求也會附 Origin header。
// 舊實作直接用 ALLOWED_ORIGINS 過濾 Origin，導致正式站前端資源全被 403（React 無法掛載）。
// 本測試確保：同源請求永不被阻擋、外來 origin 仍被阻擋。
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const PORT = 3100;
const BASE = `http://127.0.0.1:${PORT}`;
let serverProcess;

async function waitForServer(url) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.status >= 200) return;
    } catch {
      /* server is still starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Server did not start within timeout');
}

before(async () => {
  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      AGNES_API_KEY: '',
      BEZI_CHAT_API_KEY: 'test-chat-key',
      ALLOWED_ORIGINS: 'https://allowed.example.com',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});
  await waitForServer(`${BASE}/`);
});

after(() => {
  serverProcess?.kill();
});

test('同源請求（含 Origin header）不被阻擋', async () => {
  const response = await fetch(`${BASE}/api/records`, {
    headers: { Origin: BASE, Authorization: 'Bearer test-chat-key' },
  });
  assert.notEqual(response.status, 403, '同源請求不應被 403');
});

test('外來 origin 仍被阻擋', async () => {
  const response = await fetch(`${BASE}/api/records`, {
    headers: { Origin: 'https://evil.example.com', Authorization: 'Bearer test-chat-key' },
  });
  assert.equal(response.status, 403);
});

test('允許清單內的 origin 通過', async () => {
  const response = await fetch(`${BASE}/api/records`, {
    headers: { Origin: 'https://allowed.example.com', Authorization: 'Bearer test-chat-key' },
  });
  assert.notEqual(response.status, 403);
});

test('無 Origin header 的請求（server-to-server）通過', async () => {
  const response = await fetch(`${BASE}/api/records`, {
    headers: { Authorization: 'Bearer test-chat-key' },
  });
  assert.notEqual(response.status, 403);
});
