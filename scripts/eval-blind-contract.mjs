import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONTRACT_PATH = 'docs/evaluation/fixtures/locked-cases-v1.json';
const SHA_PATH = 'docs/evaluation/fixtures/locked-cases-v1.sha256';
const TEMPLATE = 'docs/evaluation/fixtures/observations-template.json';
const DIRECTIONS = new Set(['positive', 'negative', 'neutral']);

export function evaluate(contract, observations) {
  if (contract.purpose !== 'SYNTHETIC_PROTOCOL_TEST_ONLY' || contract.sourceStatus !== 'SYNTHETIC_NOT_TEACHER_VERIFIED') {
    throw new Error('未經核實的命理示例不得偽稱為真實教材或預測真值');
  }
  const holdout = contract.splits?.holdout || [];
  const calibration = new Set(contract.splits?.calibration || []);
  if (holdout.some(id => calibration.has(id))) throw new Error('holdout 不得與 calibration 重複');
  if (holdout.length !== contract.cases.length) throw new Error('所有 synthetic cases 必須明確列入 holdout');
  if (new Set(holdout).size !== holdout.length) throw new Error('holdout IDs 不得重複');
  const observed = new Map();
  for (const o of observations.observations || []) {
    if (observed.has(o.id)) throw new Error('observation id 重複: ' + o.id);
    observed.set(o.id, o);
  }
  const closed = [];
  let missing = 0;
  for (const c of contract.cases) {
    if (!holdout.includes(c.id) || !DIRECTIONS.has(c.predictedDirection)) throw new Error('invalid locked prediction: ' + c.id);
    const o = observed.get(c.id);
    if (!o || o.observedDirection === null || o.observedDirection === undefined) {
      missing++;
      continue;
    }
    if (!DIRECTIONS.has(o.observedDirection)) throw new Error('invalid observedDirection: ' + c.id);
    if (typeof o.observedAt !== 'string' || !Number.isFinite(Date.parse(o.observedAt))) throw new Error('缺少有效 observedAt: ' + c.id);
    const windowClose = new Date(c.windowEnd + 'T23:59:59+08:00');
    if (Date.parse(o.observedAt) <= windowClose.getTime() || Date.parse(o.observedAt) <= Date.parse(contract.lockedAt)) {
      throw new Error('後驗資料早於預測鎖定或時間窗結束: ' + c.id);
    }
    if (!o.source || typeof o.source !== 'string') throw new Error('後驗觀察缺來源: ' + c.id);
    closed.push({ id: c.id, correct: c.predictedDirection === o.observedDirection });
  }
  const correct = closed.filter(x => x.correct).length;
  const eligible = closed.length;
  const accuracy = eligible > 0 ? correct / eligible : null;
  return {
    status: eligible === 0 ? 'INSUFFICIENT_DATA' : observations.kind === 'SYNTHETIC_DEMO' ? 'SYNTHETIC_DEMO_ONLY' : 'OBSERVED_NOT_CAUSAL',
    accuracy, correct, eligible, missing, total: contract.cases.length,
    disclaimer: '純工程計分契約；synthetic demo 和主觀回饋不證明命理預測效度。',
  };
}

export function run(args = process.argv.slice(2)) {
  const findArg = name => {
    const i = args.indexOf(name);
    return i < 0 ? null : args[i + 1];
  };
  const contractPath = resolve(findArg('--contract') || CONTRACT_PATH);
  const shaPath = resolve(findArg('--sha') || SHA_PATH);
  const observationsPath = resolve(findArg('--observations') || TEMPLATE);
  const raw = readFileSync(contractPath);
  const digest = createHash('sha256').update(raw).digest('hex');
  const expected = readFileSync(shaPath, 'utf8').trim();
  if (!/^[a-f0-9]{64}$/.test(expected) || digest !== expected) {
    throw new Error('LOCK_SHA256_MISMATCH expected=' + expected + ' actual=' + digest);
  }
  const contract = JSON.parse(raw.toString('utf8'));
  const observations = JSON.parse(readFileSync(observationsPath, 'utf8'));
  const result = evaluate(contract, observations);
  console.log(JSON.stringify({ contractSha256: digest, kind: observations.kind, ...result }, null, 2));
  return result;
}

if (process.argv[1] && process.argv[1].endsWith('eval-blind-contract.mjs')) {
  try { run(); } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
