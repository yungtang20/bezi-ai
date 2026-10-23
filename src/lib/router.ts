// src/lib/router.ts
// [AI MOD] Hash deep-link 路由：step ↔ URL（#/<slug>），支持 back 鍵與分享連結。
// 純函式庫（非 React），讓 deep-link 可被 golden test。
import type { Step } from '../App';

const STEP_TO_SLUG: Record<Step, string> = {
  1: 'new',
  2: 'generating',
  3: 'calibrate',
  4: 'today',
  5: 'today',
  6: 'flow',
  7: 'areas',
  8: 'daily',
  9: 'match',
  10: 'learn',
  11: 'explore',
  12: 'me',
};

const SLUG_TO_STEP: Record<string, Step> = {
  new: 1,
  generating: 2,
  calibrate: 3,
  today: 4,
  flow: 6,
  areas: 7,
  daily: 8,
  match: 9,
  learn: 10,
  explore: 11,
  me: 12,
};

/** 從 hash 解出 step；容錯 `#/slug`、`/slug`、`slug` 三種寫法；無法辨識時回 null。 */
export function parseStepFromHash(hash: string): Step | null {
  const slug = hash.replace(/^#?\/?/, '');
  if (!slug || slug === '/') return null;
  return SLUG_TO_STEP[slug] ?? null;
}

/** 把 step 轉成目標 hash。 */
export function stepToHash(step: Step): string {
  return `#/${STEP_TO_SLUG[step]}`;
}

/** 目前 hash（含 #）。 */
export function currentHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash;
}
