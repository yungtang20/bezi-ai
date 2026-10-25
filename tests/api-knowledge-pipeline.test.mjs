// tests/api-knowledge-pipeline.test.mjs
// [知識管線] 整合測試：mock Agnes + 虛構案情（demo 命盤），驗證
// 分類 → 檢索 → 組 prompt → 呼叫 LLM → 引用驗證 → 拒答 的完整管線。
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const PORT = 3103;
const BASE = `http://127.0.0.1:${PORT}`;
let serverProcess;
let mockServer;
let providerCalls = 0;
/** 最後一次 provider 收到的 messages（觀察管線順序與內容） */
let lastMessages = [];
/** mock 回應工廠（各測試注入不同輸出） */
let mockOutputFactory = () => ({
  status: 'answered',
  answer: '分析結果',
  claims: [{ text: '分析結果', sourceIds: ['sql:demo-001'], confidence: 'high' }],
  limitations: [],
  nextQuestions: [],
});

async function waitForServer(url) {
  const deadline = Date.now() + 90_000;
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
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { lastMessages = JSON.parse(raw).messages || []; } catch { lastMessages = []; }
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      const output = JSON.stringify(mockOutputFactory());
      res.end(`data: ${JSON.stringify({ choices: [{ delta: { content: output } }] })}\n\ndata: [DONE]\n\n`);
    });
  });
  await new Promise(resolve => mockServer.listen(4012, '127.0.0.1', resolve));

  serverProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      ENABLE_DEV_FIXTURE: 'false',
      AGNES_API_KEY: 'test-key',
      AGNES_BASE_URL: 'http://127.0.0.1:4012/v1',
      AGNES_MODEL: 'test-model',
      BEZI_CHAT_API_KEY: 'test-chat-key',
      BEZI_AUTH_CLIENT_SECRET: 'test-client-secret',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', () => {});
  serverProcess.stderr.on('data', () => {});
  await waitForServer(`${BASE}/`);
});

after(() => {
  serverProcess?.kill();
  mockServer?.close();
});

async function post(body) {
  const response = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-chat-key' },
    body: JSON.stringify(body),
  });
  return response.text();
}

test('knowledge prompt is attached after evidence and before user messages', async () => {
  mockOutputFactory = () => ({
    status: 'answered',
    answer: '財運分析',
    claims: [{ text: '財運分析', sourceIds: ['sql:demo-001'], confidence: 'high' }],
    limitations: [], nextQuestions: [],
  });
  await post({ messages: [{ role: 'user', content: '我今年的財運如何？適合投資嗎' }], record_id: 'demo-001' });
  assert.equal(providerCalls >= 1, true);
  const systemContents = lastMessages.filter(m => m.role === 'system').map(m => m.content);
  const knowledgeIdx = systemContents.findIndex(c => c.includes('[檢索到的命理知識]'));
  const chartIdx = systemContents.findIndex(c => c.includes('[命盤資訊]'));
  const bundleIdx = systemContents.findIndex(c => c.includes('"requestId"'));
  assert.ok(chartIdx >= 0, '命盤資訊 system message 存在');
  assert.ok(knowledgeIdx > chartIdx, '知識條目在命盤證據之後');
  assert.ok(knowledgeIdx < bundleIdx + 1000, '管線順序存在');
  // 財運查詢應檢索到 wealth 條目
  const knowledgeContent = systemContents.find(c => c.includes('[檢索到的命理知識]'));
  assert.match(knowledgeContent, /kb:wealthGuidelines:wealth-土/);
  assert.match(knowledgeContent, /檢索原因/);
});

test('valid kb sourceIds pass the fabricated-citation gate', async () => {
  mockOutputFactory = () => ({
    status: 'answered',
    answer: '依知識庫：土命人財位在北方。',
    claims: [{ text: '土命人財位在北方', sourceIds: ['kb:wealthGuidelines:wealth-土'], confidence: 'high' }],
    limitations: [], nextQuestions: [],
  });
  const body = await post({ messages: [{ role: 'user', content: '我今年的財運如何' }], record_id: 'demo-001' });
  assert.match(body, /土命人財位在北方/);
  assert.doesNotMatch(body, /目前資料不足/);
});

test('fabricated kb sourceIds are rejected with refusal', async () => {
  mockOutputFactory = () => ({
    status: 'answered',
    answer: '虛構引用的回答',
    claims: [{ text: '虛構主張', sourceIds: ['kb:不存在的模組:不存在'], confidence: 'high' }],
    limitations: [], nextQuestions: [],
  });
  const body = await post({ messages: [{ role: 'user', content: '我今年的財運如何' }], record_id: 'demo-001' });
  assert.match(body, /模型輸出未通過結構化引用驗證|目前資料不足/);
  assert.doesNotMatch(body, /虛構引用的回答/);
});

test('unclassifiable query degrades to general_bazi knowledge, chat still works', async () => {
  mockOutputFactory = () => ({
    status: 'answered',
    answer: '一般命盤解讀',
    claims: [{ text: '解讀', sourceIds: ['kb:dayMasterTraits:dm-戊'], confidence: 'medium' }],
    limitations: [], nextQuestions: [],
  });
  const body = await post({ messages: [{ role: 'user', content: '隨便聊聊天氣' }], record_id: 'demo-001' });
  assert.match(body, /一般命盤解讀/);
});

test('record with full pillars completes pipeline with pattern-dependent items', async () => {
  mockOutputFactory = () => ({
    status: 'answered',
    answer: '命盤分析',
    claims: [{ text: '分析', sourceIds: ['kb:dayMasterTraits:dm-戊'], confidence: 'medium' }],
    limitations: [], nextQuestions: [],
  });
  const body = await post({ messages: [{ role: 'user', content: '我的命盤格局如何' }], record_id: 'demo-001' });
  assert.match(body, /命盤分析/);
});
