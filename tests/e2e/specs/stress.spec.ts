// tests/e2e/specs/stress.spec.ts
// [Stress test] 全功能高強度壓力測試，跑在「正式產物」dist/server.cjs（port 3212）+ mock Agnes（4213）。
// 覆蓋：
//   A. 5 種格局種子走真實 onboarding 表單（身強/身弱/從強/從弱 + 舊日期 DST + 23:00 晚子時）
//   B. 全頁面走查：今日/探索/六大專項/大運/近期日子/合盤/學習/我的命盤
//   C. 快速跨頁切換壓力（4 輪 × 多頁，無崩潰）
//   D. Reload 持久化（dashboard / step 8 / deep-link #/match）
//   E. 三日連續打卡（streak + 近期紀錄吻合度）
//   F. 合盤：新增夥伴 + 分析 + 分享圖下載
//   G. AI 問答：匿名授權 + SSE + term tooltip
//   H. 分享今日運勢 PNG 下載
//   J. 手機導覽列（375px）
//   K. 錯誤輸入驗證（時辰 00-23 / 分鐘 00-59 / 日期合法性）
// 每個 test 皆收集 pageerror，結尾斷言為 0（外部裁判 = Playwright 真實瀏覽器）。
// 執行前須 npm run build（缺 dist 自動 skip）。
import { createServer, type Server } from 'node:http';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const DIST_BUILT = existsSync('dist/server.cjs');
const PORT = 3212;
const AGNES_PORT = 4213;
const BASE = `http://127.0.0.1:${PORT}`;

let appProcess: ChildProcess;
let mockAgnes: Server;

async function waitForApp(): Promise<void> {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('dist/server.cjs did not start on ' + PORT);
}

test.beforeAll(async () => {
  test.skip(!DIST_BUILT, '需先 npm run build');
  // mock Agnes：SSE，含 structured JSON + footer（與 chat-flow 相同形狀）
  mockAgnes = createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/v1/chat/completions') {
      res.writeHead(404).end();
      return;
    }
    req.resume();
    // footer-only 形狀：server 的 validateAttempt 會從 metadata.insight 自動補 claims
    // （sourceIds 取自 evidenceBundle），比硬編 sql:demo-001 更貼近真實契約。
    const content =
      '## 核心洞察\n\n目前命局呈現<term>大運</term>傾向。\n' +
      '\n```json\n{"insight":"命局呈現身強傾向","terms":["大運"],"advice":["保持平衡"]}\n```';
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.end(
      `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`
    );
  });
  await new Promise<void>((resolve) =>
    mockAgnes.listen(AGNES_PORT, '127.0.0.1', resolve)
  );
  appProcess = spawn(process.execPath, ['dist/server.cjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      AGNES_API_KEY: 'stress-test-key',
      AGNES_BASE_URL: `http://127.0.0.1:${AGNES_PORT}/v1`,
      AGNES_MODEL: 'stress-test-model',
      BEZI_CHAT_API_KEY: '',
      BEZI_AUTH_CLIENT_SECRET: '',
      ENABLE_ANONYMOUS_CHAT: 'true',
      ALLOWED_ORIGINS: '',
    },
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  await waitForApp();
});

test.afterAll(async () => {
  appProcess?.kill();
  await new Promise<void>((resolve) => mockAgnes?.close(() => resolve()));
});

// ---- helpers ----

function trackErrors(page: Page): string[] {
  const errs: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  return errs;
}

interface Seed {
  name: string;
  gender: 'male' | 'female';
  date: string;
  time: string;
}

// 格局多樣種子（八字結構由 golden 測試保證；此處只求 UI 路徑多樣）
const SEEDS: Record<string, Seed> = {
  strong: { name: '壓力強', gender: 'male', date: '1980-05-05', time: '10' },
  weak: { name: '壓力弱', gender: 'male', date: '1966-09-09', time: '9' },
  followStrong: {
    name: '壓力從強',
    gender: 'male',
    date: '1982-04-04',
    time: '5',
  },
  followWeak: {
    name: '壓力從弱',
    gender: 'male',
    date: '1998-04-04',
    time: '3',
  },
  lateHour: {
    name: '壓力晚子',
    gender: 'female',
    date: '1998-12-31',
    time: '23',
  },
};

// 注入 localStorage + IndexedDB patternScores（version 5，鏡像 storage.ts 的 upgrade）後 reload
async function seedChart(page: Page, seed: Seed): Promise<void> {
  await page.goto(BASE);
  await page.evaluate(
    (s: { name: string; gender: string; date: string; time: string }) => {
      localStorage.setItem('bazi_name', s.name);
      localStorage.setItem('bazi_gender', s.gender);
      localStorage.setItem('bazi_date', s.date);
      localStorage.setItem('bazi_time', s.time);
      sessionStorage.setItem('bazi_current_step', '4');
      // 丟掉 #/new：hash 對 step 1 的解析權高於 sessionStorage，會把還原打回表單。
      history.replaceState(null, '', location.pathname);
    },
    seed
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('BaziJournalDB', 5);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('dailyLogs')) {
            const s = db.createObjectStore('dailyLogs', {
              keyPath: 'id',
              autoIncrement: true,
            });
            s.createIndex('date', 'date', { unique: true });
          }
          if (!db.objectStoreNames.contains('patternScores'))
            db.createObjectStore('patternScores', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('notifications')) {
            const ns = db.createObjectStore('notifications', {
              keyPath: 'id',
              autoIncrement: true,
            });
            ns.createIndex('read', 'read', { unique: false });
          }
          if (!db.objectStoreNames.contains('partners'))
            db.createObjectStore('partners', { keyPath: 'id' });
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['patternScores'], 'readwrite');
          tx.objectStore('patternScores').put({
            id: 'current',
            scores: { strong: 1, weak: 2, followStrong: 0, followWeak: 0 },
          });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
        req.onerror = () => reject(req.error);
      })
  );
  await page.reload();
}

/** 表單建盤 → 校準 → dashboard（走真實使用者路徑） */
async function onboard(page: Page, seed: Seed): Promise<void> {
  await expect(page.locator('#start-calculation-btn')).toBeVisible();
  await page.locator('input').first().fill(seed.name);
  await page
    .getByRole('button', {
      name: seed.gender === 'male' ? '男' : '女',
      exact: true,
    })
    .click();
  await page.locator('input').nth(1).fill(seed.date.replace(/-/g, ''));
  await page.locator('#birth-time').fill(seed.time);
  await page.click('#start-calculation-btn');
  await page.waitForURL(/#\/calibrate$/, { timeout: 20000 });
  await page.getByRole('button', { name: /先略過，直接查看完整結果/ }).click();
  await page.waitForURL(/#\/today$/, { timeout: 20000 });
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });
}

// ---- A. 格局種子 × 5（真實表單路徑） ----
const onboardingCases: [string, Seed][] = [
  ['身強 1980-05-05 10時 男', SEEDS.strong],
  ['身弱 舊日期DST 1966-09-09 9時 男', SEEDS.weak],
  ['從強 1982-04-04 5時 男', SEEDS.followStrong],
  ['從弱 1998-04-04 3時 男', SEEDS.followWeak],
  ['晚子時 1998-12-31 23時 女', SEEDS.lateHour],
];

for (const [label, seed] of onboardingCases) {
  test(`A. ${label}：onboarding → dashboard 無崩潰`, async ({ page }) => {
    const errs = trackErrors(page);
    await page.goto(BASE);
    await onboard(page, seed);
    expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
  });
}

// ---- B. 全頁面走查 ----
test(
  'B. 全頁面走查：四大區 + 六大專項 + 大運/流日/合盤/學習/命盤，零錯誤',
  { timeout: 120000 },
  async ({ page }) => {
    const errs = trackErrors(page);
    await seedChart(page, SEEDS.strong);
    await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });

    const navToExplore = async () => {
      await page
        .getByRole('button', { name: '探索', exact: true })
        .first()
        .click();
      await expect(
        page.getByRole('heading', { name: '你現在想理解什麼？' })
      ).toBeVisible({ timeout: 15000 });
    };

    // 今日（dashboard）
    await expect(
      page.getByRole('button', { name: '分享今日運勢' })
    ).toBeVisible({ timeout: 20000 });
    // 探索
    await navToExplore();
    // 六大專項逐一開啟並切換頁籤
    const topics: [RegExp, string][] = [
      [/工作與方向/, '事業深度解析'],
      [/財富與選擇/, '財富深度解析'],
      [/感情與姻緣/, '姻緣深度解析'],
      [/身心與作息/, '健康深度解析'],
      [/家人與家庭/, '家人深度解析'],
      [/人際與合作/, '人際深度解析'],
    ];
    for (const [topic, anchor] of topics) {
      await navToExplore();
      await page.getByRole('button', { name: topic }).click();
      await expect(page.getByRole('heading', { name: anchor })).toBeVisible({
        timeout: 15000,
      });
    }
    // 大運流年（step 6）
    await navToExplore();
    await page.getByRole('button', { name: /人生趨勢/ }).click();
    await expect(page.getByText('大運流年推演')).toBeVisible({
      timeout: 15000,
    });
    // 近期日子（step 8）
    await navToExplore();
    await page.getByRole('button', { name: /近期日子/ }).click();
    await expect(page.getByText('本月流日預報')).toBeVisible({
      timeout: 15000,
    });
    // 關係合盤（step 9）
    await navToExplore();
    await page.getByRole('button', { name: /關係合盤/ }).click();
    await expect(
      page.getByRole('heading', { name: '夥伴合盤觀測' })
    ).toBeVisible({ timeout: 15000 });
    // 學習（step 10）
    await page
      .getByRole('button', { name: '學習', exact: true })
      .first()
      .click();
    await expect(page.getByRole('button', { name: '八字基礎' })).toBeVisible({
      timeout: 15000,
    });
    // 我的命盤（step 12）
    await page.getByRole('button', { name: '我的命盤' }).first().click();
    await expect(page.getByRole('heading', { name: '四柱命盤' })).toBeVisible({
      timeout: 15000,
    });
    // 回到今日
    await page
      .getByRole('button', { name: '今日', exact: true })
      .first()
      .click();
    await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 15000 });
    expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
  }
);

// ---- C. 快速跨頁切換壓力 ----
test(
  'C. 快速跨頁切換壓力：4 輪 × 多頁面無崩潰',
  { timeout: 120000 },
  async ({ page }) => {
    const errs = trackErrors(page);
    await seedChart(page, SEEDS.strong);
    await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });
    for (let round = 0; round < 4; round++) {
      await page
        .getByRole('button', { name: '探索', exact: true })
        .first()
        .click();
      await expect(
        page.getByRole('heading', { name: '你現在想理解什麼？' })
      ).toBeVisible({ timeout: 15000 });
      await page
        .getByRole('button', { name: '學習', exact: true })
        .first()
        .click();
      await expect(page.getByRole('button', { name: '八字基礎' })).toBeVisible({
        timeout: 15000,
      });
      await page.getByRole('button', { name: '我的命盤' }).first().click();
      await expect(page.getByRole('heading', { name: '四柱命盤' })).toBeVisible(
        { timeout: 15000 }
      );
      await page
        .getByRole('button', { name: '探索', exact: true })
        .first()
        .click();
      await page.getByRole('button', { name: /近期日子/ }).click();
      await expect(page.getByText('本月流日預報')).toBeVisible({
        timeout: 15000,
      });
      await page
        .getByRole('button', { name: '今日', exact: true })
        .first()
        .click();
      await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 15000 });
    }
    expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
  }
);

// ---- D. Reload 持久化 ----
test('D. Reload 持久化：dashboard 還原、step8 還原、deep-link #/match', async ({
  page,
}) => {
  const errs = trackErrors(page);
  await seedChart(page, SEEDS.strong);
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });

  // reload → 回 dashboard
  await page.reload();
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });

  // 進 step 8 → reload → 保持 step 8
  await page.getByRole('button', { name: '探索', exact: true }).first().click();
  await page.getByRole('button', { name: /近期日子/ }).click();
  await expect(page.getByText('本月流日預報')).toBeVisible({ timeout: 15000 });
  await page.reload();
  await expect(page.getByText('本月流日預報')).toBeVisible({ timeout: 20000 });

  // deep-link：注入資料後把 hash 指到 #/match 再 reload
  await page.evaluate(() => {
    location.hash = '#/match';
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: '夥伴合盤觀測' })).toBeVisible(
    { timeout: 20000 }
  );
  expect(page.url()).toContain('#/match');
  expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
});

// ---- E. 三日連續打卡 ----
test('E. 三日連續打卡：streak 3 天 + 吻合度報告 + 修改記錄', async ({
  page,
}) => {
  const errs = trackErrors(page);
  await seedChart(page, SEEDS.strong);
  await page.getByRole('button', { name: '探索', exact: true }).first().click();
  await page.getByRole('button', { name: /近期日子/ }).click();
  await expect(page.getByText('本月流日預報')).toBeVisible({ timeout: 20000 });

  for (let day = 0; day < 3; day++) {
    if (day > 0) {
      await page.getByRole('button', { name: '前一天' }).click();
      await page.waitForTimeout(400);
    }
    await page.getByRole('button', { name: '😊 順利' }).first().click();
    await page.getByRole('button', { name: /記錄(今天|這天)的能量/ }).click();
    await expect(page.getByText(/已記錄/)).toBeVisible({ timeout: 10000 });
  }

  // 連續打卡統計 + 吻合度報告
  await expect(page.getByText(/已連續打卡 3 天/)).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole('heading', { name: '近期紀錄吻合度' })
  ).toBeVisible();

  // 修改記錄（在已打卡的日子改答案）
  await page.getByRole('button', { name: '修改記錄' }).click();
  await page.getByRole('button', { name: '😞 不順' }).first().click();
  await page.getByRole('button', { name: /記錄(今天|這天)的能量/ }).click();
  await expect(page.getByText(/已記錄/)).toBeVisible({ timeout: 10000 });
  expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
});

// ---- F. 合盤：新增夥伴 + 分析 + 分享圖 ----
test('F. 合盤：新增夥伴 → 分析 → 分享圖下載', async ({ page }) => {
  const errs = trackErrors(page);
  await seedChart(page, SEEDS.strong);
  await page.getByRole('button', { name: '探索', exact: true }).first().click();
  await page.getByRole('button', { name: /關係合盤/ }).click();
  await expect(page.getByRole('heading', { name: '夥伴合盤觀測' })).toBeVisible(
    { timeout: 20000 }
  );
  expect(errs, `載入後 page errors: ${errs.join(' | ')}`).toHaveLength(0);

  // 新增夥伴（＋按鈕 = 夥伴列表標題列的圖示鈕）
  await page
    .locator('h3', { hasText: '夥伴列表' })
    .locator('xpath=..')
    .locator('button')
    .first()
    .click();
  await page.getByPlaceholder('姓名').fill('壓力夥伴');
  await page.getByRole('button', { name: '男', exact: true }).first().click();
  await page.getByPlaceholder(/19900101/).fill('19900101');
  await page.getByPlaceholder(/1430/).fill('1430');
  await page.getByRole('button', { name: '新增', exact: true }).click();
  await expect(page.getByText('壓力夥伴')).toBeVisible({ timeout: 10000 });

  // 選中夥伴 → 分析區塊出現
  await page.getByText('壓力夥伴').first().click();
  await expect(page.getByRole('button', { name: '分享合盤結果' })).toBeVisible({
    timeout: 15000,
  });

  // 分享：預覽 dialog → 產生分享圖 → PNG 下載
  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: '分享合盤結果' }).click();
  await expect(
    page.getByRole('dialog', { name: '合盤分享前預覽' })
  ).toBeVisible();
  await page.getByRole('button', { name: '產生分享圖' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bezi-synastry-.*\.png$/);
  await expect(page.getByRole('button', { name: /分享到 LINE/ })).toBeVisible({
    timeout: 20000,
  });
  expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
});

// ---- G. AI 問答（正式產物 + 匿名授權） ----
test('G. AI 問答：匿名授權 → SSE 回答 → term tooltip', async ({ page }) => {
  const errs = trackErrors(page);
  await seedChart(page, SEEDS.strong);
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name: 'AI 問答' }).click();
  await expect(page.getByText('已授權', { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText('已連結目前命盤 Evidence')).toBeVisible({
    timeout: 15000,
  });
  const input = page.getByPlaceholder('向命理師提問...');
  await expect(input).toBeEnabled({ timeout: 15000 });
  await input.fill('請分析五行');
  const chatResponse = page.waitForResponse(
    (r) => new URL(r.url()).pathname === '/api/chat'
  );
  await page.getByRole('button', { name: '送出問題' }).click();
  expect((await chatResponse).status()).toBe(200);
  await expect(page.locator('span.cursor-help').first()).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByText('大運').first()).toBeVisible();
  expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
});

// ---- H. 分享今日運勢 PNG ----
test('H. 分享今日運勢：預覽 → PNG 下載 → LINE 按鈕', async ({ page }) => {
  const errs = trackErrors(page);
  await seedChart(page, SEEDS.strong);
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });
  const shareButton = page.getByRole('button', { name: '分享今日運勢' });
  await expect(shareButton).toBeVisible({ timeout: 15000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await shareButton.click();
  await expect(page.getByRole('dialog', { name: '分享前預覽' })).toBeVisible();
  await page.getByRole('button', { name: '產生分享圖' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bezi-daily-.*\.png$/);
  await expect(page.getByRole('button', { name: /分享到 LINE/ })).toBeVisible({
    timeout: 20000,
  });
  expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
});

// ---- J. 手機導覽列（375px） ----
test('J. 手機 375px：底部導覽列四區切換無崩潰', async ({ page }) => {
  const errs = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await seedChart(page, SEEDS.strong);
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 20000 });
  // NavigationBar 在 DOM 尾端 → .last() 是手機列
  await page.getByRole('button', { name: '探索', exact: true }).last().click();
  await expect(
    page.getByRole('heading', { name: '你現在想理解什麼？' })
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: '學習', exact: true }).last().click();
  await expect(page.getByRole('button', { name: '八字基礎' })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole('button', { name: '我的', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: '四柱命盤' })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole('button', { name: '今日', exact: true }).last().click();
  await expect(page.getByLabel('今日能量')).toBeVisible({ timeout: 15000 });
  expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
});

// ---- K. 錯誤輸入驗證 ----
test('K. 錯誤輸入：時辰/分鐘/日期驗證 + 按鈕狀態', async ({ page }) => {
  const errs = trackErrors(page);
  await page.goto(BASE);
  await expect(page.locator('#start-calculation-btn')).toBeVisible();
  await page.locator('input').first().fill('壓力驗證');
  await page.getByRole('button', { name: '男', exact: true }).click();

  // 小時 > 23
  await page.locator('#birth-time').fill('2400');
  await expect(page.getByText('請輸入有效的小時')).toBeVisible();
  // 分鐘 > 59
  await page.locator('#birth-time').fill('1075');
  await expect(page.getByText('請輸入有效的分鐘')).toBeVisible();
  // 修正後錯誤消失
  await page.locator('#birth-time').fill('1430');
  await expect(page.getByText('請輸入有效的小時')).toHaveCount(0);
  await expect(page.getByText('請輸入有效的分鐘')).toHaveCount(0);

  // 日期不完整 → 送出鈕 disabled
  await page.locator('input').nth(1).fill('');
  await expect(page.locator('#start-calculation-btn')).toBeDisabled();
  await page.locator('input').nth(1).fill('19901340');
  await expect(page.locator('#start-calculation-btn')).toBeDisabled();
  // 合法日期 → 恢復可按
  await page.locator('input').nth(1).fill('19900101');
  await expect(page.locator('#start-calculation-btn')).toBeEnabled();
  expect(errs, `page errors: ${errs.join(' | ')}`).toHaveLength(0);
});
