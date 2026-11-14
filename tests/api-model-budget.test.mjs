import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const PORT = 3110;
const MOCK_PORT = 4016;
const BASE = `http://127.0.0.1:${PORT}`;
let app;
let provider;
let providerCalls = 0;

async function waitForServer(url) {
  const end = Date.now() + 90_000;
  while (Date.now() < end) {
    try { await fetch(url); return; }
    catch { await new Promise(r => setTimeout(r, 250)); }
  }
  throw new Error('model-budget API did not start');
}

before(async () => {
  provider = createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
      res.writeHead(404).end();
      return;
    }
    providerCalls++;
    req.resume();
    const first = providerCalls === 1;
    const output = first
      ? { status: 'answered', answer: '不應放行', claims: [{ text: '不應放行', sourceIds: ['kb:fake:source'], confidence: 'high' }], limitations: [], nextQuestions: [] }
      : { status: 'answered', answer: '分析結果', claims: [{ text: '分析結果', sourceIds: ['sql:demo-001'], confidence: 'high' }], limitations: [], nextQuestions: [] };
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end(`data: ${JSON.stringify({ choices: [{ delta: { content: JSON.stringify(output) } }] })}\n\ndata: [DONE]\n\n`);
  });
  await new Promise(r => provider.listen(MOCK_PORT, '127.0.0.1', r));
  app = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'production', PORT: String(PORT), ENABLE_DEV_FIXTURE: 'false',
      AGNES_API_KEY: 'test-key', AGNES_BASE_URL: `http://127.0.0.1:${MOCK_PORT}/v1`,
      AGNES_MODEL: 'test-model', BEZI_CHAT_API_KEY: 'test-chat-key',
      BEZI_AUTH_CLIENT_SECRET: 'test-client-secret',
      BEZI_MODEL_MAX_CALLS_PER_WINDOW: '3',
      BEZI_MODEL_MAX_GLOBAL_CALLS_PER_WINDOW: '10',
      BEZI_MODEL_MAX_ACTIVE_PER_CLIENT: '1',
      BEZI_MODEL_MAX_ACTIVE_GLOBAL: '2',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  app.stdout.on('data', () => {});
  app.stderr.on('data', () => {});
  await waitForServer(BASE + '/');
});

after(() => {
  app?.kill();
  provider?.close();
});

async function chat(endpoint) {
  const r = await fetch(BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify({ messages: [{ role: 'user', content: '請分析命盤' }], record_id: 'demo-001' }),
  });
  return r.text();
}

test('one shared model-call budget spans all chat routes and counts correction retries (#47)', async () => {
  const first = await chat('/api/chat');
  assert.match(first, /分析結果/);
  assert.equal(providerCalls, 2, 'first invalid response must consume two model calls including retry');
  const second = await chat('/api/chat/dayun');
  assert.match(second, /分析結果/);
  assert.equal(providerCalls, 3);
  const denied = await chat('/api/chat/synastry');
  assert.match(denied, /AI 呼叫量.*上限|AI 使用額度.*上限/);
  assert.equal(providerCalls, 3, 'budget refusal must occur before spending an additional provider call');
});
