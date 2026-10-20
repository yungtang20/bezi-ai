import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

let serverProcess;

async function waitForServer(url) {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    try {
      await fetch(url, { method: 'GET' });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error('Server did not start within timeout');
}

before(async () => {
  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      AGNES_API_KEY: '',
      NODE_ENV: 'production',
      ENABLE_DEV_FIXTURE: 'false',
      BEZI_CHAT_API_KEY: 'test-chat-key',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});

  await waitForServer('http://127.0.0.1:3000/');
});

after(() => {
  serverProcess?.kill();
});

test('rejects non-string apiKey before provider selection', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '你好' }],
      apiKey: { value: 'ak_not_a_string' },
    }),
  });

  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /API Key 格式無效/);
  assert.doesNotMatch(body, /伺服器處理異常/);
});

test('rejects non-string customPrompt before provider selection', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: '你好' }],
      customPrompt: { text: 'not a string' },
    }),
  });

  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /系統提示格式無效/);
  assert.doesNotMatch(body, /伺服器處理異常/);
});

test('sets CORS headers on /api/chat OPTIONS preflight', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  assert.equal(response.status, 204);
  assert.match(response.headers.get('access-control-allow-origin') || '', /http:\/\/localhost:3000|\*/);
  assert.match(response.headers.get('access-control-allow-methods') || '', /POST/);
});

test('creates session-scoped current-chart evidence from validated birth input', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/evidence/current', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({ birthDate: '1990-01-15', birthTime: '14', gender: 'female' }),
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.match(body.record_id, /^current-[a-f0-9-]+$/);
  assert.equal(body.source, 'current');
  assert.equal(body.gender, '女');
  assert.equal(body.time_known, true);

  const chatResponse = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({ messages: [{ role: 'user', content: '請分析目前命盤' }], record_id: body.record_id }),
  });
  const chatBody = await chatResponse.text();
  assert.equal(chatResponse.status, 200);
  assert.doesNotMatch(chatBody, /目前資料不足/);
  assert.match(chatBody, /目前無法完成分析/);
});

test('marks unknown birth hour and still creates bounded three-pillar evidence', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/evidence/current', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({ birthDate: '1990-01-15', birthTime: '', gender: 'male' }),
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.time_known, false);
});

test('rejects invalid birth input before creating current-chart evidence', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/evidence/current', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({ birthDate: '2035-02-30', birthTime: '99', gender: 'female' }),
  });
  assert.equal(response.status, 400);
  assert.match(await response.text(), /出生資料格式無效/);
});

test('rejects oversized request body', async () => {
  const bigContent = 'x'.repeat(2_000_000);
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: bigContent }],
    }),
  });

  // 超過 1mb 應被拒絕（413 或 400），而非 200
  assert.ok(response.status === 413 || response.status === 400 || response.status === 500,
    `Expected 413/400/500 for oversized body, got ${response.status}`);
});
