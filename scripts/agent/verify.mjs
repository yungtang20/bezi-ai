// scripts/agent/verify.mjs — bezi agent 驗證 CLI（固定管線，避免 session 間腳本漂移）
// 用法：node scripts/agent/verify.mjs [logic|ui|ai|all]
// 靈感：poteto Control Glass — reproducible CLI 產生實證，不是 agent 現寫腳本。
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const mode = process.argv[2] || 'all';
const OUT_DIR = 'tests/e2e/reports/verify';
mkdirSync(OUT_DIR, { recursive: true });

const steps = {
  logic: [
    { name: 'lint', cmd: 'npx', args: ['tsc', '--noEmit'] },
    { name: 'unit', cmd: 'npx', args: ['vitest', 'run'] },
    { name: 'api', cmd: 'npm', args: ['run', 'test:api'] },
  ],
  ui: [
    { name: 'build', cmd: 'npm', args: ['run', 'build'] },
    { name: 'e2e-smoke', cmd: 'npx', args: ['playwright', 'test', 'tests/e2e/specs/prod-smoke.spec.ts'] },
    { name: 'e2e-stress', cmd: 'npx', args: ['playwright', 'test', 'tests/e2e/specs/stress.spec.ts'] },
  ],
  ai: [
    { name: 'api', cmd: 'npm', args: ['run', 'test:api'] },
  ],
};

const selected = mode === 'all' ? [...steps.logic, ...steps.ui] : (steps[mode] || []);
if (selected.length === 0) {
  console.error(`unknown mode: ${mode} (use logic|ui|ai|all)`);
  process.exit(2);
}

const report = { mode, startedAt: new Date().toISOString(), steps: [] };
let failed = false;

for (const s of selected) {
  process.stdout.write(`[verify] ${s.name} ... `);
  const t0 = Date.now();
  const r = spawnSync(s.cmd, s.args, { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024 });
  const dur = ((Date.now() - t0) / 1000).toFixed(1);
  const ok = r.status === 0;
  console.log(ok ? `ok (${dur}s)` : `FAIL (${dur}s)`);
  report.steps.push({
    name: s.name,
    ok,
    durationSec: Number(dur),
    exitCode: r.status,
    tail: (ok ? r.stdout : (r.stdout || '') + (r.stderr || '')).split('\n').slice(-40).join('\n'),
  });
  if (!ok) { failed = true; break; } // fail fast — 修好再來
}

report.finishedAt = new Date().toISOString();
report.passed = !failed;
writeFileSync(`${OUT_DIR}/verify-${Date.now()}.json`, JSON.stringify(report, null, 2));
console.log(failed ? `[verify] FAILED → 證據在 ${OUT_DIR}/` : `[verify] ALL GREEN → 證據在 ${OUT_DIR}/`);
process.exit(failed ? 1 : 0);
