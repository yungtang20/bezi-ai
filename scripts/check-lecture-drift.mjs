import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { LECTURE_DATA as frontend } from '../src/data/lecture/lectureData.ts';
import { LECTURE_DATA as core } from '../packages/core/src/data/lecture/lectureData.ts';

// 已知例外只准逐字匹配凍結 baseline；它不是老師講義的真值。
const DEFAULT_BASELINE = new URL('../docs/knowledge/known-lecture-drift.json', import.meta.url);
const baselinePath = process.env.BEZI_LECTURE_DRIFT_BASELINE
  ? resolve(process.env.BEZI_LECTURE_DRIFT_BASELINE)
  : fileURLToPath(DEFAULT_BASELINE);
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
if (!Array.isArray(baseline.known) || baseline.known.some(x => x.sourceStatus !== 'UNKNOWN')) {
  throw new Error('Known drift baseline 必須逐項標記 UNKNOWN，不能冒充已驗證教學口徑');
}

const differences = [];
function compare(left, right, path) {
  if (Object.is(left, right)) return;
  if (left !== null && right !== null && typeof left === 'object' && typeof right === 'object' && Array.isArray(left) === Array.isArray(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of keys) compare(left[key], right[key], `${path}.${key}`);
    return;
  }
  differences.push({ path, frontend: left, core: right });
}
compare(frontend, core, 'LECTURE_DATA');
const locked = new Map(baseline.known.map(({ path, frontend, core }) => [path, { frontend, core }]));
const unrecognized = differences.filter(d => {
  const old = locked.get(d.path);
  return !old || old.frontend !== d.frontend || old.core !== d.core;
});
const currentPaths = new Set(differences.map(d => d.path));
const missingBaseline = baseline.known.filter(d => !currentPaths.has(d.path)).map(d => d.path);
// 若已知差異意外消失，需要人工核對是否因一方資料被覆寫（不能靜默視為教材一致）。
console.log(JSON.stringify({ knownUnresolved: differences.length - unrecognized.length, unrecognized, missingBaseline, differences }, null, 2));
if (unrecognized.length || missingBaseline.length) process.exitCode = 1;
