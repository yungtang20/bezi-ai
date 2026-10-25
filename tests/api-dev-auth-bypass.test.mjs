import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const PORT = 3104;
const BASE = `http://127.0.0.1:${PORT}`;
let serverProcess;

async function waitForServer() {
  for (let i = 0; i < 360; i++) {
    try { await fetch(`${BASE}/`); return; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  throw new Error('Server did not start within timeout');
}

before(async () => {
  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: { ...process.env,
      PORT: String(PORT), NODE_ENV: 'development', ENABLE_DEV_AUTH_BYPASS: 'true', ENABLE_DEV_FIXTURE: 'false', AGNES_API_KEY: 'test-key' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});
  await waitForServer();
});

after(() => serverProcess?.kill());

test('development-only auth bypass issues a token without a secret', async () => {
  const tokenResponse = await fetch(`${BASE}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(tokenResponse.status, 200);
  const { token } = await tokenResponse.json();
  const chatResponse = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: '測試' }] }),
  });
  assert.equal(chatResponse.status, 200);
  assert.match(await chatResponse.text(), /目前資料不足/);
});
