import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const PORT = 3105;
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

function bearer(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
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

test('cross-token computed evidence access is rejected', async () => {
  const tokenA = await requestToken();
  const tokenB = await requestToken();

  const evidenceResponse = await fetch(`${BASE}/api/evidence/current`, {
    method: 'POST',
    headers: bearer(tokenA),
    body: JSON.stringify({ birthDate: '1990-01-15', birthTime: '14', gender: 'female' }),
  });
  assert.equal(evidenceResponse.status, 201);
  const { record_id } = await evidenceResponse.json();

  const chatResponse = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: bearer(tokenB),
    body: JSON.stringify({ messages: [{ role: 'user', content: '請分析目前命盤' }], record_id }),
  });
  const chatBody = await chatResponse.text();
  assert.equal(chatResponse.status, 200, 'SSE errors still stream a 200 response');
  assert.match(chatBody, /目前資料不足/, 'token B must not read token A evidence');
  assert.doesNotMatch(chatBody, /current-/);
});

test('same-token computed evidence access succeeds', async () => {
  const token = await requestToken();
  const evidenceResponse = await fetch(`${BASE}/api/evidence/current`, {
    method: 'POST',
    headers: bearer(token),
    body: JSON.stringify({ birthDate: '1990-01-15', birthTime: '14', gender: 'female' }),
  });
  assert.equal(evidenceResponse.status, 201);
  const { record_id } = await evidenceResponse.json();

  const chatResponse = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: bearer(token),
    body: JSON.stringify({ messages: [{ role: 'user', content: '請分析目前命盤' }], record_id }),
  });
  const chatBody = await chatResponse.text();
  assert.equal(chatResponse.status, 200);
  assert.doesNotMatch(chatBody, /目前資料不足/);
});

test('different credential string cannot read another token evidence', async () => {
  const tokenA = await requestToken();
  const tokenB = await requestToken();
  assert.notEqual(tokenA, tokenB, 'tokens must be unique');

  const evidenceResponse = await fetch(`${BASE}/api/evidence/current`, {
    method: 'POST',
    headers: bearer(tokenA),
    body: JSON.stringify({ birthDate: '1990-01-15', birthTime: '14', gender: 'female' }),
  });
  assert.equal(evidenceResponse.status, 201);
  const { record_id } = await evidenceResponse.json();

  const chatResponse = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: bearer(tokenB),
    body: JSON.stringify({ messages: [{ role: 'user', content: '請分析' }], record_id }),
  });
  assert.match(await chatResponse.text(), /目前資料不足/);
});
