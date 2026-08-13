import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.goto('/');
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

test('completes chart creation and calibration without an API key', async ({ page }) => {
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
});
