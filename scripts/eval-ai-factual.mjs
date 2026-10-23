// scripts/eval-ai-factual.mjs
// [Q4] 可重跑評測：證明「AI 命理事實對錯」有決定性證據，不依賴 AI 自述。
// 做法：mock Agnes 端點注入「刻意含錯」的結構化回答 → 完整管線（/api/chat SSE）
// → 斷言 SSE 回傳的 factCheck 抓出錯誤、正確答案則全數通過。
// 用法：node scripts/eval-ai-factual.mjs  （自動起 mock + server，結束時全數清理）

import http from 'node:http';
import { spawn } from 'node:child_process';

const MOCK_PORT = 4013;
const APP_PORT = 3013;
const BASE = `http://127.0.0.1:${APP_PORT}`;
// 金值命盤（與 data/bazi_records.json demo-001 同盤）：1984-03-25 巳時男
// 甲子年 丁卯月 戊午日 丁巳時，日主戊，屬鼠，火最旺、金最弱，大運 戊辰。
const CORRECT_ANSWER = '此命日主為戊，屬鼠。年柱甲子、月柱丁卯、日柱戊午、時柱丁巳。五行火最旺，金最弱。目前行戊辰大運，整體火土相生。';
const WRONG_ANSWER = '此命日主為甲，屬牛。年柱乙丑、月柱丁卯、日柱戊午、時柱丁巳。五行木最旺，水最弱。目前行壬寅大運。';
const SOFT_ANSWER = '整體而言，保持作息規律、順應節氣調整即可，重大決策宜多與信賴之人商量。';

function structured(answer) {
  return JSON.stringify({ status: 'answered', answer, claims: [{ text: answer, sourceIds: ['sql:demo-001'], confidence: 'high' }], limitations: [], nextQuestions: [] });
}
function footer(answer) {
  const words = answer.match(/身強|平衡/g) || ['命局'];
  return `\n\`\`\`json\n${JSON.stringify({ insight: words[0], terms: words, advice: ['保持平衡'] })}\n\`\`\``;
}

let failures = 0;
function assert(cond, label) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) failures += 1;
}

async function waitFor(url, tries = 120) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url);
      if (res.status >= 200) return;
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('server did not start');
}

const mockAgnes = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/v1/chat/completions') { res.writeHead(404).end(); return; }
  let body = '';
  req.setEncoding('utf8');
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    // 依問題決定注入：含錯 / 無可查事實 / 正確
    const answer = body.includes('故意錯誤') ? WRONG_ANSWER : body.includes('整體建議方向') ? SOFT_ANSWER : CORRECT_ANSWER;
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end(`data: ${JSON.stringify({ choices: [{ delta: { content: structured(answer) + footer(answer) } }] })}\n\ndata: [DONE]\n\n`);
  });
});

const appProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(APP_PORT),
    NODE_ENV: 'development',
    ENABLE_DEV_AUTH_BYPASS: 'true',
    ENABLE_ANONYMOUS_CHAT: 'true',
    ENABLE_DEV_FIXTURE: 'false',
    AGNES_API_KEY: 'eval-test-key',
    AGNES_BASE_URL: `http://127.0.0.1:${MOCK_PORT}/v1`,
    AGNES_MODEL: 'eval-test-model',
    BEZI_CHAT_API_KEY: '',
    BEZI_AUTH_CLIENT_SECRET: '',
  },
  stdio: ['ignore', 'pipe', 'ignore'],
});

function parseSse(text) {
  const content = [];
  let factCheck = null;
  let error = null;
  for (const line of text.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (!data || data === '[DONE]') continue;
    const parsed = JSON.parse(data);
    if (parsed.error) error = parsed.error;
    if (parsed.factCheck) factCheck = parsed.factCheck;
    if (typeof parsed.content === 'string') content.push(parsed.content);
  }
  return { text: content.join(''), factCheck, error };
}

function cleanup() {
  appProcess.kill();
  mockAgnes.close();
}

try {
  await new Promise(r => mockAgnes.listen(MOCK_PORT, '127.0.0.1', r));
  await waitFor(`${BASE}/`);

  const tokenRes = await fetch(`${BASE}/api/auth/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  const { token } = await tokenRes.json();
  if (!token) throw new Error('failed to obtain session token');

  const chat = async (question) => {
    const res = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: [{ role: 'user', content: question }], record_id: 'demo-001' }),
    });
    return { status: res.status, sse: parseSse(await res.text()) };
  };

  // 案例 1：正確回答 → 所有可查事實通過
  const ok = await chat('請完整分析此命盤。');
  assert(ok.status === 200, `案例1 HTTP 200（實際 ${ok.status}）`);
  assert(ok.sse.text.length > 0, '案例1 有回答內容');
  assert(!!ok.sse.factCheck, '案例1 SSE 含 factCheck');
  if (ok.sse.factCheck) {
    const fc = ok.sse.factCheck;
    assert(fc.checked >= 8, `案例1 抽出 ≥8 項事實（實際 ${fc.checked}）`);
    assert(fc.failed === 0, `案例1 無錯誤事實（實際 ${fc.failed}）`);
    assert(fc.accuracy === 1, `案例1 accuracy=1（實際 ${fc.accuracy}）`);
    assert(fc.verdict === 'all_correct', `案例1 verdict=all_correct（實際 ${fc.verdict}）`);
  }

  // 案例 2：含錯回答 → 管線抓到錯誤
  const bad = await chat('請分析，故意錯誤測試。');
  assert(bad.status === 200, `案例2 HTTP 200（實際 ${bad.status}）`);
  assert(!!bad.sse.factCheck, '案例2 SSE 含 factCheck');
  if (bad.sse.factCheck) {
    const fc = bad.sse.factCheck;
    const wrong = fc.facts.filter(f => f.verdict === 'wrong');
    assert(fc.failed >= 5, `案例2 抓到 ≥5 項錯誤（實際 ${fc.failed}）`);
    assert(fc.accuracy < 0.5, `案例2 accuracy<0.5（實際 ${fc.accuracy}）`);
    assert(fc.verdict === 'has_errors', `案例2 verdict=has_errors（實際 ${fc.verdict}）`);
    const types = wrong.map(f => f.type);
    assert(types.includes('day_master'), '案例2 抓到錯誤日主（甲≠戊）');
    assert(types.includes('zodiac'), '案例2 抓到錯誤生肖（牛≠鼠）');
    assert(types.includes('dayun'), '案例2 抓到捏造大運（壬寅不在 Evidence）');
    assert(types.includes('year_pillar'), '案例2 抓到錯誤年柱（乙丑≠甲子）');
    console.log('  錯誤明細:', wrong.map(f => `${f.type}: 稱 ${f.claimed} 實為 ${f.actual}`).join(' | '));
  }

  // 案例 3：無可查事實的回答 → no_facts，不惩罚
  const soft = await chat('整體建議方向為何？');
  assert(soft.status === 200, '案例3 HTTP 200');
  assert(!!soft.sse.factCheck, '案例3 SSE 含 factCheck');
  assert(soft.sse.factCheck?.verdict === 'no_facts', `案例3 verdict=no_facts 不惩罚（實際 ${soft.sse.factCheck?.verdict}）`);
} catch (err) {
  failures += 1;
  console.error('ERROR', err);
} finally {
  cleanup();
}

console.log(failures === 0 ? '\nEVAL PASSED：事實檢查管線端到端運作' : `\nEVAL FAILED：${failures} 項未通過`);
process.exit(failures === 0 ? 0 : 1);
