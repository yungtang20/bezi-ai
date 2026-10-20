import { createServer, type Server } from 'node:http';
import { spawn, type ChildProcess } from 'node:child_process';
import { test, expect, type BrowserContext, type Page } from '@playwright/test';

let mockAgnes: Server;
let appProcess: ChildProcess;

async function waitForApp(): Promise<void> {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:3000/');
      if (response.status >= 200) return;
    } catch { /* server is still starting */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('E2E app server did not start');
}

async function openChat(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'AI 問答' }).first().click();
}

test.beforeAll(async () => {
  mockAgnes = createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
      res.writeHead(404).end();
      return;
    }
    req.resume();
    const answer = '## 核心洞察\n\n目前命局呈現<term>身強</term>傾向。';
    const structured = JSON.stringify({ status: 'answered', answer, claims: [{ text: answer, sourceIds: ['sql:demo-001'], confidence: 'high' }], limitations: [], nextQuestions: [] });
    const footer = '\n```json\n{"insight":"命局呈現身強傾向","terms":["身強"],"advice":["保持平衡"]}\n```';
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end(`data: ${JSON.stringify({ choices: [{ delta: { content: structured + footer } }] })}\n\ndata: [DONE]\n\n`);
  });
  await new Promise<void>(resolve => mockAgnes.listen(4011, '127.0.0.1', resolve));

  appProcess = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ENABLE_DEV_AUTH_BYPASS: 'true',
      ENABLE_ANONYMOUS_CHAT: 'true',
      ENABLE_DEV_FIXTURE: 'false',
      AGNES_API_KEY: 'e2e-test-key',
      AGNES_BASE_URL: 'http://127.0.0.1:4011/v1',
      AGNES_MODEL: 'e2e-test-model',
      BEZI_CHAT_API_KEY: '',
      BEZI_AUTH_CLIENT_SECRET: '',
    },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  await waitForApp();
});

test.afterAll(async () => {
  appProcess?.kill();
  await new Promise<void>(resolve => mockAgnes?.close(() => resolve()));
});

// [AI MOD] 需要既有命盤的測試才注入預設資料（addInitScript 會在每次導頁重跑，
// 全域注入會讓「首次使用／試玩」測試永遠進不了表單頁）
async function seedChart(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    localStorage.setItem('bazi_name', 'E2E');
    localStorage.setItem('bazi_gender', 'male');
    localStorage.setItem('bazi_date', '1990-01-01');
    localStorage.setItem('bazi_time', '12');
    sessionStorage.setItem('bazi_current_step', '4');
  });
}

test('開啟 AI 問答即自動匿名授權並載入命盤清單', async ({ page, context }) => {
  await seedChart(context);
  await openChat(page);
  // [AI MOD] 匿名模式：免按「取得權限」，掛載即自動授權
  await expect(page.getByText('已授權', { exact: true })).toBeVisible();
  await expect(page.getByLabel('命盤記錄').locator('option')).toContainText(['demo-001', 'demo-002']);
});

test('選擇命盤後取得 SSE 並渲染 term Tooltip', async ({ page, context }) => {
  await seedChart(context);
  await openChat(page);
  await expect(page.getByText('已授權', { exact: true })).toBeVisible();
  await page.getByLabel('命盤記錄').selectOption('demo-001');
  await page.getByPlaceholder('向命理師提問...').fill('請分析五行');
  const chatResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/chat');
  await page.locator('button').last().click();
  expect((await chatResponse).status()).toBe(200);
  await expect(page.getByText('身強', { exact: true }).last()).toBeVisible({ timeout: 30000 });
  await expect(page.locator('[title]').filter({ hasText: '身強' }).first()).toBeVisible();
});

test('分享今日運勢可產出 PNG 圖檔並提供 LINE 分享', async ({ page, context }) => {
  await seedChart(context);
  await page.goto('/');
  await page.waitForTimeout(1500);

  // 今日能量卡上的分享按鈕
  const shareButton = page.getByRole('button', { name: '分享今日運勢' });
  await expect(shareButton).toBeVisible();

  // html2canvas 擷取 → 桌機降級為下載
  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await shareButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bezi-daily-.*\.png$/);

  // 下載後提供 LINE 分享按鈕
  await expect(page.getByRole('button', { name: '分享到 LINE' })).toBeVisible({ timeout: 20000 });
});

test('未授權直接呼叫 chat 回傳 401', async ({ request }) => {
  const response = await request.post('/api/chat', { data: { messages: [{ role: 'user', content: '測試' }] } });
  expect(response.status()).toBe(401);
});

test('一鍵範例命盤：免輸入 → 校準 → 今日能量首屏', async ({ page }) => {
  // 首次使用狀態（不注入任何 localStorage）
  await page.goto('/');
  await page.waitForTimeout(1500);

  // 時辰安心提示（未填時辰時可見）
  await expect(page.getByText('不知道出生時辰也沒關係')).toBeVisible();

  // 一鍵範例命盤（不需輸入任何資料）
  await page.getByRole('button', { name: /先看範例命盤/ }).click();

  // 校準頁
  await expect(page.getByText('初步推算完成')).toBeVisible({ timeout: 20000 });
  const smooth = page.getByRole('button', { name: '順利' });
  await smooth.nth(0).click();
  await smooth.nth(1).click();

  // Dashboard 首屏今日能量卡
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });
  // 範例命盤資料已正確寫入（1984-03-25 10:00 男 → 戊午日）
  const demo = await page.evaluate(() => ({
    date: localStorage.getItem('bazi_date'),
    time: localStorage.getItem('bazi_time'),
    name: localStorage.getItem('bazi_name'),
  }));
  expect(demo.date).toBe('1984-03-25');
  expect(demo.time).toBe('10');
  expect(demo.name).toBe('範例命盤');
});

test('未授權呼叫分流端點 synastry 與 dayun 回傳 401', async ({ request }) => {
  const synastryResponse = await request.post('/api/chat/synastry', { data: { messages: [{ role: 'user', content: '合盤測試' }] } });
  expect(synastryResponse.status()).toBe(401);
  const dayunResponse = await request.post('/api/chat/dayun', { data: { messages: [{ role: 'user', content: '大運測試' }] } });
  expect(dayunResponse.status()).toBe(401);
});

test('授權後呼叫分流端點取得 SSE 回應並通過 grounding 驗證', async ({ request }) => {
  const tokenResponse = await request.post('/api/auth/token', { data: {} });
  expect(tokenResponse.status()).toBe(200);
  const { token } = (await tokenResponse.json()) as { token: string };

  for (const endpoint of ['/api/chat/synastry', '/api/chat/dayun']) {
    const response = await request.post(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      data: { messages: [{ role: 'user', content: endpoint.includes('synastry') ? '請分析兩人合盤' : '請分析未來大運' }], record_id: 'demo-001' },
    });
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('身強');
    expect(body).toContain('[DONE]');
  }
});
