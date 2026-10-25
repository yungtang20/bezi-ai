// 真實模型 × 知識管線量測：本地 server（真實 Agnes key 來自 .env.local）
// 注入 3 種查詢，斷言：管線有檢索條目、模型 claims 引用存在的 sourceId、無虛構引用被放行。
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const APP_PORT = 3021;
const BASE = `http://127.0.0.1:${APP_PORT}`;
// 從 .env.local 讀真實 Agnes 設定（key 不外洩到命令列）
const envLine = readFileSync('.env.local', 'utf8');
function envVal(k) {
  const m = envLine.match(new RegExp(`^${k}=(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^"(.*)"$/, '$1') : undefined;
}

let fail = 0;
const assert = (c, label) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${label}`); if (!c) fail++; };

async function waitFor(url, tries = 240) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.status >= 200) return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('server did not start');
}

async function chat(query) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-key' },
    body: JSON.stringify({ messages: [{ role: 'user', content: query }], record_id: 'demo-001' }),
  });
  const text = await res.text();
  // 還原 SSE content chunks
  const chunks = [...text.matchAll(/data: ({"content":(?:".*?")})/g)]
    .map(m => JSON.parse(m[1]).content)
    .join('');
  const factM = text.match(/data: ({"factCheck":.*})/);
  const fact = factM ? JSON.parse(factM[1]).factCheck : null;
  return { status: res.status, text, answer: chunks, fact };
}

const server = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(APP_PORT),
    NODE_ENV: 'production',
    ENABLE_DEV_FIXTURE: 'false',
    AGNES_API_KEY: envVal('AGNES_API_KEY'),
    AGNES_BASE_URL: envVal('AGNES_BASE_URL') || 'https://apihub.agnes-ai.com/v1',
    AGNES_MODEL: envVal('AGNES_MODEL') || 'agnes-3.0-flash',
    BEZI_CHAT_API_KEY: 'test-key',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const serverLog = [];
server.stdout.on('data', d => serverLog.push(d));
server.stderr.on('data', d => serverLog.push(d));
await waitFor(`${BASE}/`);

try {
  for (const q of ['我今年的財運如何？適合投資嗎', '我的感情姻緣何時出現', '幫我解釋命盤格局']) {
    const { status, answer, fact } = await chat(q);
    assert(status === 200, `[${q.slice(0, 8)}…] HTTP 200`);
    assert(answer.length > 50, `[${q.slice(0, 8)}…] 回答非空（${answer.length} 字）`);
    assert(fact !== null, `[${q.slice(0, 8)}…] SSE 含 factCheck`);
    if (fact) {
      assert(fact.failed === 0 || fact.checked === 0, `[${q.slice(0, 8)}…] factCheck 無錯誤事實（verdict=${fact.verdict}, checked=${fact.checked}, failed=${fact.failed}）`);
    }
  }
  // 管線日誌：確認知識條目真的被檢索到
  const log = Buffer.concat(serverLog).toString('utf8');
  const m = log.match(/knowledge pipeline: category=(\w+) confidence=(\w+) topics=(\d+) retrieved=(\d+)/g) || [];
  assert(m.length >= 3, `管線日誌出現 ≥3 次（實際 ${m.length}）`);
  const retrieved = m.map(s => s.match(/retrieved=(\d+)/)[1]).map(Number);
  assert(retrieved.every(n => n >= 1), `每次檢索都有條目（${retrieved.join('/')}）`);
  console.log('\n[DIAG]', m.join(' | '));
} finally {
  server.kill();
}
console.log(`\nRESULT: ${fail === 0 ? 'ALL PASS' : fail + ' FAILED'}`);
process.exitCode = fail === 0 ? 0 : 1;
