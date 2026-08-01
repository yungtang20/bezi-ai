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
  serverProcess = spawn('C:/Program Files/nodejs/node.exe', ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      LONGCAT_API_KEY: '',
      GEMINI_API_KEY: '',
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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

test('rejects oversized request body', async () => {
  const bigContent = 'x'.repeat(2_000_000);
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: bigContent }],
    }),
  });

  // 超過 1mb 應被拒絕（413 或 400），而非 200
  assert.ok(response.status === 413 || response.status === 400 || response.status === 500,
    `Expected 413/400/500 for oversized body, got ${response.status}`);
});
