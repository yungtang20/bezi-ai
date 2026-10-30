import { createServer, type Server } from 'node:http';
import { spawn, type ChildProcess } from 'node:child_process';
import { test, expect, type BrowserContext, type Page } from '@playwright/test';

let mockAgnes: Server;
let appProcess: ChildProcess;
const APP_PORT = Number(process.env.E2E_APP_PORT || 3000);
const APP_BASE_URL = process.env.E2E_BASE_URL || `http://127.0.0.1:${APP_PORT}`;

async function waitForApp(): Promise<void> {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    try {
      const response = await fetch(`${APP_BASE_URL}/`);
      if (response.status >= 200) return;
    } catch {
      /* server is still starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
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
    const structured = JSON.stringify({
      status: 'answered',
      answer,
      claims: [
        { text: answer, sourceIds: ['sql:demo-001'], confidence: 'high' },
      ],
      limitations: [],
      nextQuestions: [],
    });
    const footer =
      '\n```json\n{"insight":"命局呈現身強傾向","terms":["身強"],"advice":["保持平衡"]}\n```';
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end(
      `data: ${JSON.stringify({ choices: [{ delta: { content: structured + footer } }] })}\n\ndata: [DONE]\n\n`
    );
  });
  await new Promise<void>((resolve) =>
    mockAgnes.listen(4011, '127.0.0.1', resolve)
  );

  appProcess = spawn(
    process.execPath,
    ['node_modules/tsx/dist/cli.mjs', 'server.ts'],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(APP_PORT),
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
    }
  );
  await waitForApp();
});

test.afterAll(async () => {
  appProcess?.kill();
  await new Promise<void>((resolve) => mockAgnes?.close(() => resolve()));
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
  const evidenceRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/evidence/current')
      evidenceRequests.push(request.url());
  });
  await page.goto('/');
  await page.waitForTimeout(1500);
  expect(evidenceRequests).toHaveLength(0);
  await page.getByRole('button', { name: 'AI 問答' }).first().click();
  // [AI MOD] 匿名模式：免按「取得權限」，掛載即自動授權
  await expect(page.getByText('已授權', { exact: true })).toBeVisible();
  await expect(page.getByLabel('命盤記錄').locator('option')).toContainText([
    '目前命盤（本次工作階段）',
    '範例',
  ]);
  await expect(page.getByText('已連結目前命盤 Evidence')).toBeVisible();
});

test('current Evidence 僅限建立它的 session token 使用', async ({
  request,
}) => {
  const firstTokenResponse = await request.post('/api/auth/token', {
    data: {},
  });
  const secondTokenResponse = await request.post('/api/auth/token', {
    data: {},
  });
  const { token: firstToken } = (await firstTokenResponse.json()) as {
    token: string;
  };
  const { token: secondToken } = (await secondTokenResponse.json()) as {
    token: string;
  };
  const evidenceResponse = await request.post('/api/evidence/current', {
    headers: { Authorization: `Bearer ${firstToken}` },
    data: { birthDate: '1990-01-01', birthTime: '', gender: 'male' },
  });
  expect(evidenceResponse.status()).toBe(201);
  const evidence = (await evidenceResponse.json()) as {
    record_id: string;
    time_known: boolean;
  };
  expect(evidence.time_known).toBe(false);

  const denied = await request.post('/api/chat', {
    headers: { Authorization: `Bearer ${secondToken}` },
    data: {
      messages: [{ role: 'user', content: '請分析' }],
      record_id: evidence.record_id,
    },
  });
  const deniedBody = await denied.text();
  expect(deniedBody).toContain('目前資料不足');
  expect(deniedBody).not.toContain('身強');
});

test('選擇命盤後取得 SSE 並渲染 term Tooltip', async ({ page, context }) => {
  await seedChart(context);
  await openChat(page);
  await expect(page.getByText('已授權', { exact: true })).toBeVisible();
  await page.getByLabel('命盤記錄').selectOption('demo-001');
  await page.getByPlaceholder('向命理師提問...').fill('請分析五行');
  const chatResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/chat'
  );
  await page.locator('button').last().click();
  expect((await chatResponse).status()).toBe(200);
  await expect(page.getByText('身強', { exact: true }).last()).toBeVisible({
    timeout: 30000,
  });
  await expect(
    page.locator('[title]').filter({ hasText: '身強' }).first()
  ).toBeVisible();
});

test('分享今日運勢可產出 PNG 圖檔並提供 LINE 分享', async ({
  page,
  context,
}) => {
  await seedChart(context);
  await page.goto('/');
  await page.waitForTimeout(1500);

  // 今日能量卡上的分享按鈕
  const shareButton = page.getByRole('button', { name: '分享今日運勢' });
  await expect(shareButton).toBeVisible();

  // html2canvas 擷取 → 桌機降級為下載
  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await shareButton.click();
  await expect(page.getByRole('dialog', { name: '分享前預覽' })).toBeVisible();
  await page.getByRole('button', { name: '產生分享圖' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bezi-daily-.*\.png$/);

  // 下載後提供 LINE 分享按鈕
  await expect(page.getByRole('button', { name: '分享到 LINE' })).toBeVisible({
    timeout: 20000,
  });
});

test('打卡後出現連續天數與 AI 吻合度報告', async ({ page, context }) => {
  await seedChart(context);
  await page.goto('/');
  await page.waitForTimeout(1500);

  // 從「探索」進入近期日子（step 8）
  await page.getByRole('button', { name: '探索' }).first().click();
  await page.getByRole('button', { name: /近期日子/ }).click();
  await expect(page.getByText('本月流日預報')).toBeVisible({ timeout: 20000 });

  // 尚未打卡 → 報告顯示引導文案
  await expect(
    page.getByRole('heading', { name: '近期紀錄吻合度' })
  ).toBeVisible();
  await expect(
    page.getByText(/比較實際感受與命理規則|感受就能開始計算吻合度/)
  ).toBeVisible();

  // 打卡：依當日十神日型選「順利」。
  // 理論方向可評估的日期，banner 會列出計入吻合度的領域（banner 與表單卡片
  // 同用 calibration 的 CATEGORY_LABELS，名稱一致），點 banner 點名的第一個
  // 領域對應的卡片「😊 順利」，該領域才會計入樣本；
  // 平穩日沒有領域可評估（calibration.ts 設計上二元感受不計入）。
  const banner = page.getByText(/會以「[^」]+」計入近期紀錄吻合度/);
  let evaluableDay = false;
  try {
    await expect(banner).toBeVisible({ timeout: 3000 });
    evaluableDay = true;
    const bannerText = (await banner.textContent()) ?? '';
    const firstField = /會以「([^、」]+)/.exec(bannerText)?.[1] ?? '';
    expect(firstField, 'banner 未解析出可評估領域').toBeTruthy();
    // 表單卡片固定為 grid 內的 6 個 div，依名稱筛出該領域卡片再點其「順利」
    const cards = page.locator('.grid.grid-cols-2 > div');
    await cards
      .filter({ hasText: firstField })
      .first()
      .getByRole('button', { name: '😊 順利', exact: true })
      .click();
  } catch {
    await page.getByRole('button', { name: '😊 順利' }).first().click();
  }
  await page
    .getByRole('button', { name: /記錄今天的能量|記錄這天的能量/ })
    .click();

  // 打卡成功 → 出現連續天數
  await expect(page.getByText(/已連續打卡 1 天/)).toBeVisible({
    timeout: 20000,
  });
  await expect(
    page.getByRole('heading', { name: '近期紀錄吻合度' })
  ).toBeVisible();
  if (evaluableDay) {
    // 單筆樣本只顯示累積狀態，不把 1 筆資料包裝成百分比結論
    await expect(page.getByText(/1\/3 筆/)).toBeVisible();
  } else {
    // 平穩日：二元感受不計入 → 顯示該日型應記錄領域的引導文案
    await expect(page.getByText(/感受就能開始計算吻合度/)).toBeVisible();
  }
});

test('未授權直接呼叫 chat 回傳 401', async ({ request }) => {
  const response = await request.post('/api/chat', {
    data: { messages: [{ role: 'user', content: '測試' }] },
  });
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

test('四區導覽保留探索、學習與命盤功能', async ({ page, context }) => {
  await seedChart(context);
  await page.goto('/');
  await page.waitForTimeout(1500);

  await expect(page.getByLabel('今日能量')).toBeVisible();

  await page.getByRole('button', { name: '探索' }).first().click();
  await expect(
    page.getByRole('heading', { name: '你現在想理解什麼？' })
  ).toBeVisible();
  await page.getByRole('button', { name: /工作與方向/ }).click();
  await expect(page.getByText('事業深度解析')).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name: '返回探索' }).click();
  await expect(
    page.getByRole('heading', { name: '你現在想理解什麼？' })
  ).toBeVisible();

  await page.getByRole('button', { name: '學習' }).first().click();
  await expect(page.getByRole('heading', { name: '學習' })).toBeVisible();
  await expect(page.getByRole('button', { name: /八字基礎/ })).toBeVisible();

  await page.getByRole('button', { name: '我的' }).first().click();
  await expect(page.getByRole('heading', { name: 'E2E 的命盤' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '四柱命盤' })).toBeVisible();
});

test('四區導覽在手機、平板與桌機皆可重排', async ({
  page,
  context,
}, testInfo) => {
  await seedChart(context);
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto('/');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: '探索' }).first().click();
    await expect(
      page.getByRole('heading', { name: '你現在想理解什麼？' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '探索' }).first()
    ).toHaveAttribute('aria-current', 'page');
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1
    );
    expect(overflow, `${viewport.name} 不應出現水平溢位`).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(`four-areas-${viewport.name}.png`),
      fullPage: false,
    });
  }
});

test('未授權呼叫分流端點 synastry 與 dayun 回傳 401', async ({ request }) => {
  const synastryResponse = await request.post('/api/chat/synastry', {
    data: { messages: [{ role: 'user', content: '合盤測試' }] },
  });
  expect(synastryResponse.status()).toBe(401);
  const dayunResponse = await request.post('/api/chat/dayun', {
    data: { messages: [{ role: 'user', content: '大運測試' }] },
  });
  expect(dayunResponse.status()).toBe(401);
});

test('授權後呼叫分流端點取得 SSE 回應並通過 grounding 驗證', async ({
  request,
}) => {
  const tokenResponse = await request.post('/api/auth/token', { data: {} });
  expect(tokenResponse.status()).toBe(200);
  const { token } = (await tokenResponse.json()) as { token: string };

  for (const endpoint of ['/api/chat/synastry', '/api/chat/dayun']) {
    const response = await request.post(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        messages: [
          {
            role: 'user',
            content: endpoint.includes('synastry')
              ? '請分析兩人合盤'
              : '請分析未來大運',
          },
        ],
        record_id: 'demo-001',
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('身強');
    expect(body).toContain('[DONE]');
  }
});
