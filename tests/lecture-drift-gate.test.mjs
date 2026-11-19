import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function check(baseline) {
  const env = { ...process.env };
  if (baseline) env.BEZI_LECTURE_DRIFT_BASELINE = baseline;
  else delete env.BEZI_LECTURE_DRIFT_BASELINE;
  return spawnSync(process.execPath, ['scripts/check-lecture-drift.mjs'], {
    cwd: process.cwd(), env, encoding: 'utf8',
  });
}

test('prelocked two unresolved source differences remain visible but pass gate (#45)', () => {
  const r = check();
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const report = JSON.parse(r.stdout);
  assert.equal(report.knownUnresolved, 2);
  assert.deepEqual(report.unrecognized, []);
  assert.deepEqual(report.missingBaseline, []);
});

test('gate rejects any unapproved expanded or changed drift (#45)', () => {
  const r = check('tests/fixtures/lecture-drift-empty.json');
  assert.equal(r.status, 1, r.stderr || r.stdout);
  const report = JSON.parse(r.stdout);
  assert.ok(report.unrecognized.length >= 2, 'unapproved differences must block CI');
});
