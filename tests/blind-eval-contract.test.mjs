import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const run = (...args) => spawnSync(process.execPath, ['scripts/eval-blind-contract.mjs', ...args], { cwd: process.cwd(), encoding: 'utf8' });

test('locked predictions with no observations do not claim success or percentage (#49)', () => {
  const r = run();
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const v = JSON.parse(r.stdout);
  assert.equal(v.status, 'INSUFFICIENT_DATA');
  assert.equal(v.accuracy, null);
  assert.equal(v.missing, 5);
  assert.match(v.contractSha256, /^[a-f0-9]{64}$/);
});

test('synthetic observations exercise scoring but are explicitly non-empirical (#49)', () => {
  const r = run('--observations', 'tests/fixtures/blind-synthetic-observations.json');
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const v = JSON.parse(r.stdout);
  assert.equal(v.status, 'SYNTHETIC_DEMO_ONLY');
  assert.equal(v.correct, 2);
  assert.equal(v.eligible, 3);
  assert.equal(v.missing, 2);
  assert.equal(v.accuracy, 2/3);
});

test('a mismatched SHA lock is a hard failure (#49)', () => {
  const r = run('--sha', 'tests/fixtures/blind-wrong-hash.sha256');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /LOCK_SHA256_MISMATCH/);
});
