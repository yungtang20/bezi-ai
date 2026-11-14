import { LECTURE_DATA as frontend } from '../src/data/lecture/lectureData.ts';
import { LECTURE_DATA as core } from '../packages/core/src/data/lecture/lectureData.ts';

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
console.log(JSON.stringify({ differences }, null, 2));
if (differences.length) process.exitCode = 1;
