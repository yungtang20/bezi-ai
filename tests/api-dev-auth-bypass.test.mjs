import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

let serverProcess;

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { await fetch('http://127.0.0.1:3000/'); return; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  throw new Error('Server did not start within timeout');
}

before(async () => {
  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'development', ENABLE_DEV_AUTH_BYPASS: 'true', ENABLE_DEV_FIXTURE: 'false', AGNES_API_KEY: 'test-key' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});
  await waitForServer();
});

after(() => serverProcess?.kill());

test('development-only auth bypass issues a token without a secret', async () => {
  const tokenResponse = await fetch('http://127.0.0.1:3000/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(tokenResponse.status, 200);
  const { token } = await tokenResponse.json();
  const chatResponse = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: '測試' }] }),
  });
  assert.equal(chatResponse.status, 200);
  assert.match(await chatResponse.text(), /目前資料不足/);
});
