// tests/e2e/prod-smoke.spec.ts
// [AI MOD] Production bundle 煙霧測試（防火牆）
// 背景：dev 模式與 production bundle 的模組圖/分包結果不同，
// 曾發生「dev 全綠、正式版直接崩潰（undefined.exports）」的案例（manualChunks 跨 chunk 循環）。
// 本測試直接跑「建置後的 dist/server.cjs」，確保交付到使用者的產物能正常掛載 React。
import { createServer, type Server } from 'node:http';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const PORT = 3210;
const BASE = `http://127.0.0.1:${PORT}`;

// [AI MOD] 需先 npm run build（CI 流程：build → prod smoke）
const DIST_BUILT = existsSync('dist/server.cjs');

let appProcess: ChildProcess;
let mockAgnes: Server;

async function waitForApp(): Promise<void> {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/`);
      if (response.status >= 200) return;
    } catch { /* server is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Production server did not start');
}

test.beforeAll(async () => {
  test.skip(!DIST_BUILT, '需先執行 npm run build 才能測 production 產物');
  // mock Agnes（僅為讓 /api/auth/token 等請求不外連）
  mockAgnes = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end('data: [DONE]\n\n');
  });
  await new Promise<void>(resolve => mockAgnes.listen(4211, '127.0.0.1', resolve));

  // 以「建置後的正式產物」啟動（不是 tsx 原始碼）
  appProcess = spawn(process.execPath, ['dist/server.cjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      AGNES_API_KEY: 'prod-smoke-key',
      AGNES_BASE_URL: 'http://127.0.0.1:4211/v1',
      ENABLE_ANONYMOUS_CHAT: 'true',
      ALLOWED_ORIGINS: 'https://allowed.example.com',
    },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  await waitForApp();
});

test.afterAll(async () => {
  appProcess?.kill();
  await new Promise<void>(resolve => mockAgnes?.close(() => resolve()));
});

test('production bundle 能正常掛載 React（無 runtime 錯誤）', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // React 確實掛載（#root 有內容）
  const rootLength = (await page.locator('#root').innerHTML()).length;
  expect(rootLength).toBeGreaterThan(500);

  // 首屏主要元素存在
  await expect(page.getByRole('button', { name: /先看範例命盤/ })).toBeVisible();
  await expect(page.locator('#start-calculation-btn')).toBeVisible();

  // 不得有 runtime 錯誤（分包循環會在此炸出）
  expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
});

test('production bundle 的同源資源不會被 CORS 403', async ({ page }) => {
  const forbidden: string[] = [];
  page.on('response', response => {
    if (response.status() === 403) forbidden.push(response.url());
  });

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  expect(forbidden, `403 resources: ${forbidden.join(' | ')}`).toHaveLength(0);
});
