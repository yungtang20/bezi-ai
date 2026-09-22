import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload();
});

test('rejects an impossible calendar date on the real landing page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /生命伏筆/ })).toBeVisible();

  const startButton = page.getByRole('button', { name: '進入觀測' });
  await expect(startButton).toBeDisabled();
  await page.getByRole('button', { name: '男' }).click();
  await page.getByLabel('日期 (年/月/日)').fill('20260231');
  await expect(startButton).toBeEnabled();
  await startButton.click();

  await expect(page.getByText('出生日期不存在')).toBeVisible();
});

test('removes API keys persisted by older releases', async ({ page }) => {
  await page.evaluate(() => {
    window.localStorage.setItem('bazi_api_key', 'legacy-plaintext-secret');
  });

  await page.reload();

  await expect.poll(
    () => page.evaluate(() => window.localStorage.getItem('bazi_api_key')),
  ).toBeNull();
});

test('completes chart creation and calibration without an API key', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-08-14T10:00:00+08:00'));
  await page.reload();

  await page.getByLabel('您的稱呼').fill('E2E 測試');
  await page.getByRole('button', { name: '男' }).click();
  await page.getByLabel('日期 (年/月/日)').fill('19900101');
  await page.getByRole('button', { name: '進入觀測' }).click();

  await expect(page.getByText('初步推算完成')).toBeVisible({ timeout: 20_000 });
  const favorableChoices = page.getByRole('button', { name: '順利' });
  await expect(favorableChoices).toHaveCount(2);
  await favorableChoices.nth(0).click();
  await favorableChoices.nth(1).click();

  await expect(
    page.getByRole('heading', { name: 'E2E 測試 的命盤' }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('八字格局 · 五行能量 · 人生藍圖')).toBeVisible();

  await page.getByRole('button', { name: '設定' }).click();
  await expect(page.getByText('API 金鑰不會儲存在瀏覽器或送入前端')).toBeVisible();
  await expect.poll(
    () => page.evaluate(() => window.localStorage.getItem('bazi_api_key')),
  ).toBeNull();

  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'E2E 測試 的命盤' }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('八字格局 · 五行能量 · 人生藍圖')).toBeVisible();

  await page.getByRole('button', { name: '設定' }).click();
  await expect(page.getByText('AI 服務由後端 Agnes AI 設定提供')).toBeVisible();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '流月流日' }).click();
  await expect(page.getByRole('heading', { name: '10秒心流紀錄' })).toBeVisible();
  await expect(page.getByText('紀錄將在今晚20:00開放')).toBeHidden();
  await expect(page.getByText(/回顧今天，各領域的感受是？/)).toBeVisible();

  await page.getByRole('button', { name: '▶', exact: true }).click();
  await expect(page.getByText('未來日期尚未開放紀錄')).toBeVisible();
});
