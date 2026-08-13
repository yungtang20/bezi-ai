import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

let serverProcess;

function waitForServer(process) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Server did not start within timeout'));
    }, 15_000);

    const onData = (chunk) => {
      if (String(chunk).includes('actively listening')) {
        cleanup();
        resolve();
      }
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`Server exited before startup (code ${code ?? 'unknown'})`));
    };
    const cleanup = () => {
      clearTimeout(timeout);
      process.stdout.off('data', onData);
      process.off('error', onError);
      process.off('exit', onExit);
    };

    process.stdout.on('data', onData);
    process.once('error', onError);
    process.once('exit', onExit);
  });
}

before(async () => {
  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NVIDIA_API_KEY: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stderr.on('data', () => {});

  await waitForServer(serverProcess);
});

after(async () => {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  await new Promise((resolve) => {
    serverProcess.once('exit', resolve);
    serverProcess.kill();
  });
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

test('rejects disallowed CORS preflight origins', async () => {
  const response = await fetch('http://127.0.0.1:3000/api/chat', {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://evil.example',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('returns retry metadata after rate limit is exceeded', async () => {
  let limitedResponse;
  for (let i = 0; i < 31; i += 1) {
    limitedResponse = await fetch('http://127.0.0.1:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'rate-limit-test' }] }),
    });
    if (limitedResponse.status === 429) break;
    await limitedResponse.arrayBuffer();
  }

  assert.equal(limitedResponse?.status, 429);
  assert.match(limitedResponse?.headers.get('retry-after') || '', /^\d+$/);
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
