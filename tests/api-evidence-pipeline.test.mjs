import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

let serverProcess;
let mockServer;
let providerCalls = 0;

async function waitForServer(url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try { await fetch(url); return; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  throw new Error('Server did not start within timeout');
}

before(async () => {
  mockServer = createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
      res.writeHead(404).end();
      return;
    }
    providerCalls++;
    req.resume();
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const output = JSON.stringify({ status: 'answered', answer: '分析結果', claims: [{ text: '分析結果', sourceIds: ['sql:demo-001'], confidence: 'high' }], limitations: [], nextQuestions: [] });
    res.end(`data: ${JSON.stringify({ choices: [{ delta: { content: output } }] })}\n\ndata: [DONE]\n\n`);
  });
  await new Promise(resolve => mockServer.listen(4011, '127.0.0.1', resolve));

  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      ENABLE_DEV_FIXTURE: 'false',
      AGNES_API_KEY: 'test-key',
      AGNES_BASE_URL: 'http://127.0.0.1:4011/v1',
      AGNES_MODEL: 'test-model',
      BEZI_CHAT_API_KEY: 'test-chat-key',
      BEZI_AUTH_CLIENT_SECRET: 'test-client-secret',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});
  await waitForServer('http://127.0.0.1:3000/');
});

after(() => {
  serverProcess?.kill();
  mockServer?.close();
});

async function post(body) {
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify(body),
  });
  return response.text();
}

test('rejects missing authorization before querying evidence', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: '請分析五行' }], record_id: 'demo-001' }),
  });
  assert.equal(response.status, 401);
  assert.match(await response.text(), /Unauthorized/);
});

test('records endpoint requires authorization and returns summaries', async () => {
  const unauthorized = await fetch('http://127.0.0.1:3000/api/records');
  assert.equal(unauthorized.status, 401);
  const authorized = await fetch('http://127.0.0.1:3000/api/records', { headers: { Authorization: 'Bearer test-chat-key' } });
  assert.equal(authorized.status, 200);
  const records = await authorized.json();
  assert.deepEqual(records.map(record => record.record_id), ['demo-001', 'demo-002']);
});

test('rejects an invalid client secret', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_secret: 'wrong-secret' }),
  });
  assert.equal(response.status, 401);
});

test('issues a session token that authorizes chat', async () => {
  const tokenResponse = await fetch('http://127.0.0.1:3000/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_secret: 'test-client-secret' }),
  });
  assert.equal(tokenResponse.status, 200);
  const { token } = await tokenResponse.json();
  assert.equal(typeof token, 'string');
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: '請分析五行' }], record_id: 'demo-001' }),
  });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /分析結果/);
});

test('valid record_id passes the gate and calls the provider', async () => {
  providerCalls = 0;
  const body = await post({ messages: [{ role: 'user', content: '請分析五行' }], record_id: 'demo-001' });
  assert.equal(providerCalls, 1);
  assert.match(body, /分析結果/);
  assert.doesNotMatch(body, /目前資料不足/);
});

test('invalid record_id returns needs_data without calling the provider', async () => {
  providerCalls = 0;
  const body = await post({ messages: [{ role: 'user', content: '請分析五行' }], record_id: 'missing-record' });
  assert.equal(providerCalls, 0);
  assert.match(body, /目前資料不足/);
});

test('missing record_id returns needs_data without calling the provider', async () => {
  providerCalls = 0;
  const body = await post({ messages: [{ role: 'user', content: '請分析五行' }] });
  assert.equal(providerCalls, 0);
  assert.match(body, /目前資料不足/);
});
