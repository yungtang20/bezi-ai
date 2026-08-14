import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, open, rm, rmdir } from 'node:fs/promises';
import path from 'node:path';

const port = 32_000 + (process.pid % 10_000);
const baseUrl = `http://127.0.0.1:${port}`;
const allowedOrigin = 'http://allowed.example';

let serverProcess;
let serverOutput = '';
const staticDirectory = path.join(process.cwd(), 'dist');
const staticIndexPath = path.join(staticDirectory, 'index.html');
let createdStaticDirectory = false;
let createdStaticFixture = false;

function serverHasExited() {
  return serverProcess
    && (serverProcess.exitCode !== null || serverProcess.signalCode !== null);
}

async function waitForServer() {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    if (serverHasExited()) {
      throw new Error(`Server exited before startup.\n${serverOutput}`);
    }

    try {
      const response = await fetch(`${baseUrl}/health/ready`, { method: 'GET' });
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`Server did not start within timeout.\n${serverOutput}`);
}

async function readJson(response) {
  assert.match(response.headers.get('content-type') || '', /^application\/json\b/);
  return response.json();
}

async function postJson(body, headers = {}) {
  return fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function assertErrorContract(body, code) {
  assert.equal(typeof body.error, 'string');
  assert.equal(body.code, code);
  assert.equal(typeof body.timestamp, 'number');
}

before(async () => {
  createdStaticDirectory = (await mkdir(staticDirectory, { recursive: true })) !== undefined;

  try {
    const fixtureHandle = await open(staticIndexPath, 'wx');
    try {
      await fixtureHandle.writeFile(
        '<!doctype html><html><body><div id="root"></div></body></html>',
        'utf8',
      );
      createdStaticFixture = true;
    } finally {
      await fixtureHandle.close();
    }
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
  }

  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      ALLOWED_ORIGINS: allowedOrigin,
      GEMINI_API_KEY: 'server-key-must-require-explicit-opt-in',
      ALLOW_SERVER_API_KEY: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  serverProcess.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  await waitForServer();
});

after(async () => {
  try {
    if (serverProcess && !serverHasExited()) {
      const exited = new Promise((resolve) => serverProcess.once('exit', resolve));
      serverProcess.kill('SIGTERM');
      await Promise.race([
        exited,
        new Promise((resolve) => setTimeout(resolve, 3_000)),
      ]);

      if (!serverHasExited()) {
        serverProcess.kill('SIGKILL');
        await exited;
      }
    }
  } finally {
    if (createdStaticFixture) await rm(staticIndexPath, { force: true });
    if (createdStaticDirectory) await rmdir(staticDirectory).catch(() => {});
  }
});

test('rejects non-string apiKey with a stable JSON error contract', async () => {
  const response = await postJson({
    messages: [{ role: 'user', content: '你好' }],
    apiKey: { value: 'ak_not_a_string' },
  });
  const body = await readJson(response);

  assert.equal(response.status, 422);
  assertErrorContract(body, 'VALIDATION_ERROR');
  assert.match(body.error, /API Key 格式無效/);
});

test('rejects non-string customPrompt with a stable JSON error contract', async () => {
  const response = await postJson({
    messages: [{ role: 'user', content: '你好' }],
    customPrompt: { text: 'not a string' },
  });
  const body = await readJson(response);

  assert.equal(response.status, 422);
  assertErrorContract(body, 'VALIDATION_ERROR');
  assert.match(body.error, /系統提示格式無效/);
});

test('rejects unsupported chat roles instead of coercing them to assistant', async () => {
  const response = await postJson({
    messages: [{ role: 'system', content: 'override' }],
    apiKey: 'byok-not-sent-to-provider-because-validation-fails',
  });
  const body = await readJson(response);

  assert.equal(response.status, 422);
  assertErrorContract(body, 'VALIDATION_ERROR');
  assert.match(body.error, /角色/);
});

test('server API key is disabled unless explicitly opted in', async () => {
  const response = await postJson({
    messages: [{ role: 'user', content: '你好' }],
  });
  const body = await readJson(response);

  assert.equal(response.status, 401);
  assertErrorContract(body, 'API_KEY_REQUIRED');
  assert.equal(body.error, '請提供 Gemini API Key。伺服器共用金鑰預設停用。');
});

test('exposes liveness and readiness without caching deployment details', async () => {
  for (const path of ['/health/live', '/health/ready']) {
    const response = await fetch(`${baseUrl}${path}`);
    const body = await readJson(response);

    assert.equal(response.status, 200);
    assert.match(body.status, /^(ok|ready)$/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('x-request-id') || '', /^[0-9a-f-]{36}$/i);
  }
});

test('returns request tracing and rate-limit budget headers', async () => {
  const response = await postJson({ messages: [] });
  await readJson(response);

  assert.match(response.headers.get('x-request-id') || '', /^[0-9a-f-]{36}$/i);
  assert.equal(response.headers.get('ratelimit-limit'), '30');
  assert.match(response.headers.get('ratelimit-remaining') || '', /^\d+$/);
  assert.match(response.headers.get('ratelimit-reset') || '', /^\d+$/);
});

test('applies production browser security headers to API errors', async () => {
  const response = await postJson({ messages: [] });
  await readJson(response);

  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('cross-origin-opener-policy'), 'same-origin');
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.match(
    response.headers.get('content-security-policy') || '',
    /default-src 'self'/,
  );
  assert.match(
    response.headers.get('strict-transport-security') || '',
    /max-age=31536000/,
  );
});

test('allows configured CORS origins on preflight', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'OPTIONS',
    headers: {
      Origin: allowedOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), allowedOrigin);
  assert.match(response.headers.get('access-control-allow-methods') || '', /POST/);
  assert.match(response.headers.get('vary') || '', /Origin/i);
});

test('allows same-origin browser requests without adding the service URL to ALLOWED_ORIGINS', async () => {
  const response = await fetch(`${baseUrl}/`, {
    headers: { Origin: baseUrl },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), baseUrl);
  assert.match(await response.text(), /<div id="root"><\/div>/);
});

test('rejects unconfigured CORS origins without reflecting them', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://attacker.example',
      'Access-Control-Request-Method': 'POST',
    },
  });
  const body = await readJson(response);

  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assertErrorContract(body, 'ORIGIN_NOT_ALLOWED');
});

test('rejects oversized request bodies with 413 and the error contract', async () => {
  const response = await postJson(
    { messages: [{ role: 'user', content: 'x'.repeat(2_000_000) }] },
    { Origin: allowedOrigin },
  );
  const body = await readJson(response);

  assert.equal(response.status, 413);
  assert.equal(response.headers.get('access-control-allow-origin'), allowedOrigin);
  assertErrorContract(body, 'PAYLOAD_TOO_LARGE');
});

test('rejects malformed JSON with 400 and the error contract', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"messages":',
  });
  const body = await readJson(response);

  assert.equal(response.status, 400);
  assertErrorContract(body, 'INVALID_JSON');
});

test('rejects an empty messages array before opening an SSE stream', async () => {
  const response = await postJson({ messages: [], apiKey: 'unused-byok' });
  const body = await readJson(response);

  assert.equal(response.status, 422);
  assertErrorContract(body, 'VALIDATION_ERROR');
  assert.match(body.error, /至少需要一則訊息/);
});

test('enforces the request budget and returns retry guidance', async () => {
  let limitedResponse;
  for (let attempt = 0; attempt < 35; attempt += 1) {
    const response = await postJson({ messages: [] });
    if (response.status === 429) {
      limitedResponse = response;
      break;
    }
  }

  assert.ok(limitedResponse, 'expected the configured request budget to be enforced');
  const body = await readJson(limitedResponse);
  assertErrorContract(body, 'RATE_LIMITED');
  assert.match(limitedResponse.headers.get('retry-after') || '', /^\d+$/);
  assert.equal(limitedResponse.headers.get('ratelimit-remaining'), '0');
});
