// tests/e2e/specs/onboarding.spec.ts
// Onboarding 回歸：0dc1106 重構曾弄丟三條主流程（建盤後不推進、reload 不還原、
// step 3 校準題為空）。本 spec 在「正式產物」上實走：
//   A. 範例建盤 → step 3 有兩題定盤年 → 答題回閉環 → step 4 dashboard
//   B. reload → 自動還原回 dashboard（deep-link 與 sessionStorage 尊重）
//   C. 自建命盤路徑 + 真太陽時城市快選
// 執行模式：
//   - 有 dist/（npm run build 後）：自動 spawn dist/server.cjs 於 3211 測正式產物
//   - 無 dist/：回退到 E2E_BASE_URL / :3000（dev）
import { createServer, type Server } from 'node:http';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const DIST_BUILT = existsSync('dist/server.cjs');
const PROD_PORT = 3211;
const BASE = DIST_BUILT
  ? `http://127.0.0.1:${PROD_PORT}`
  : process.env.E2E_BASE_URL || 'http://localhost:3000';

let appProcess: ChildProcess | undefined;
let mockAgnes: Server | undefined;

async function waitForApp(): Promise<void> {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/`);
      if (response.status >= 200) return;
    } catch {
      /* server is still starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('App server did not start');
}

test.beforeAll(async () => {
  if (!DIST_BUILT) return; // dev 模式：由使用者先 npm run dev
  mockAgnes = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end('data: [DONE]\n\n');
  });
  await new Promise<void>((resolve) =>
    mockAgnes!.listen(4212, '127.0.0.1', resolve)
  );

  appProcess = spawn(process.execPath, ['dist/server.cjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PROD_PORT),
      NODE_ENV: 'production',
      AGNES_API_KEY: 'onboarding-test-key',
      AGNES_BASE_URL: 'http://127.0.0.1:4212/v1',
      ENABLE_ANONYMOUS_CHAT: 'true',
    },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  await waitForApp();
});

test.afterAll(async () => {
  appProcess?.kill();
  await new Promise<void>((resolve) => mockAgnes?.close(() => resolve()));
});

test.beforeEach(async ({ page }) => {
  // 每個 case 從乾淨 storage 開始（onboarding 路徑互不污染）。
  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('A. 範例建盤 → step3 兩題校準 → 答題回閉環 → step4 dashboard', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(BASE);
  await expect(page.locator('#start-calculation-btn')).toBeVisible();

  // 點範例 → 排盤（含 800ms 建立中）→ 進 step 3（#/calibrate）
  await page.getByRole('button', { name: /先看範例命盤/ }).click();
  await page.waitForURL(/#\/calibrate$/, { timeout: 15000 });

  // step 3 定盤年題目（範例：甲子年戊土日主 → getCheckYears 回傳定盤年）
  const questionCards = page.locator('.grid.grid-cols-3');
  await expect(questionCards.first()).toBeVisible({ timeout: 10000 });
  expect(await questionCards.count()).toBeGreaterThanOrEqual(2);

  // 喜用神/最弱五行顯示（T2 還原項）
  await expect(page.getByText('喜用神：')).toBeVisible();
  await expect(page.getByText('最弱五行：')).toBeVisible();

  // 答第一題「順利」→ 該題卡片出現已答指示點
  const firstCard = questionCards.first().locator('..');
  await firstCard.getByRole('button', { name: '順利', exact: true }).click();
  await expect(
    firstCard.locator('.bg-zen-sage.rounded-full').first()
  ).toBeVisible();
  // 答第二題（觸發 2 題完成 → 自動回 dashboard #/today）
  await questionCards
    .nth(1)
    .getByRole('button', { name: '平穩', exact: true })
    .click();
  await page.waitForURL(/#\/today$/, { timeout: 15000 });

  // step 4 dashboard：側邊欄「今日」+ 首屏標題含範例姓名（證明命盤與姓名到位）
  await expect(
    page.getByRole('button', { name: '今日', exact: true })
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole('heading', { name: /範例命盤，今天好/ })
  ).toBeVisible();

  expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
});

test('B. reload 自動還原回 dashboard（localStorage 持久）', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(BASE);
  await page.getByRole('button', { name: /先看範例命盤/ }).click();
  await page.waitForURL(/#\/calibrate$/, { timeout: 15000 });
  await page.getByRole('button', { name: /先略過，直接查看完整結果/ }).click();
  await page.waitForURL(/#\/today$/, { timeout: 15000 });
  await expect(
    page.getByRole('heading', { name: /範例命盤，今天好/ })
  ).toBeVisible();

  // reload：必須還原回 dashboard（不是空白 step 4 崩潰、也不是回表單）
  await page.reload();
  await expect(
    page.getByRole('heading', { name: /範例命盤，今天好/ })
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole('button', { name: '今日', exact: true })
  ).toBeVisible();

  expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
});

test('C. 自建命盤路徑 + 真太陽時城市快選', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.goto(BASE);
  await expect(page.locator('#start-calculation-btn')).toBeVisible();

  // 表單 input 順序：姓名(0) / 日期(1) / 時辰(2)
  await page.locator('input').first().fill('測試用名');
  await page.getByRole('button', { name: '男', exact: true }).click();
  await page.locator('input').nth(1).fill('19950815');
  await page.locator('#birth-time').fill('1430');

  // 城市快選（T4 還原項）：出生時間填了才出現
  await expect(
    page.getByText('出生城市（選填，用於真太陽時校正）')
  ).toBeVisible();
  await page.getByRole('button', { name: '台北', exact: true }).click();
  await expect(page.getByText(/已依「台北」的真太陽時校正時辰/)).toBeVisible();
  // localStorage 持久化
  const savedCity = await page.evaluate(() =>
    localStorage.getItem('bezi_longitude')
  );
  expect(savedCity).toBe('台北');

  // 自建提交 → step 3（#/calibrate）
  await page.click('#start-calculation-btn');
  await page.waitForURL(/#\/calibrate$/, { timeout: 15000 });
  await expect(page.locator('.grid.grid-cols-3').first()).toBeVisible();

  expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
});
