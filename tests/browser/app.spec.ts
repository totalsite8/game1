import { test, expect } from '@playwright/test';
test('desktop 3D, full story, journal and persistence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Дальше — только вместе.' })).toBeVisible();
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Начать путешествие' }).click();
  await page.getByRole('button', { name: 'Понятно. Отправляемся' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'test-results/game-desktop.png', fullPage: true });
  for (let i = 0; i < 12; i++) {
    await page.getByRole('button', { name: 'Поговорить', exact: true }).click();
    await page.locator('.choice-list button').first().click();
    await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  }
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Честный маршрут' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Мой дневник' }).click();
  await expect(page.locator('.journal-entry')).toHaveCount(6);
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await expect(page.getByText('Сохранено на этом устройстве', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Продолжить историю' }).click();
  await page.getByRole('button', { name: 'Понятно. Отправляемся' }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Честный маршрут' })
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('mobile text mode, locale, import/export and reset', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await page.getByLabel('Текстовый режим · без 3D').check();
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await page.getByRole('button', { name: 'RU', exact: true }).click();
  await page.getByRole('button', { name: 'Start the journey' }).click();
  await page.getByRole('button', { name: 'Understood. Let’s go' }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Talk', exact: true }).click();
  await page.locator('.choice-list button').first().click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const download = await downloadPromise;
  const file = await download.path();
  await page.getByRole('button', { name: 'Delete progress and restart' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start the journey' })).toBeVisible();
  await page.locator('input[type=file]').setInputFiles(file!);
  await expect(page.getByRole('button', { name: 'Continue your story' })).toBeVisible();
  await page.screenshot({ path: 'test-results/home-mobile-en.png', fullPage: true });
});
test('API readiness and failure closed', async ({ request }) => {
  expect((await request.get('/api/health')).status()).toBe(200);
  expect((await request.post('/api/saves/sync', { data: {} })).status()).toBe(503);
  expect(
    (
      await request.post('/api/telegram/verify', { data: { initData: 'hash=fake&auth_date=1' } })
    ).status()
  ).toBe(503);
});

test('offline production reload retains progress and supports the next choice', async ({
  page,
  context,
}) => {
  test.skip(!process.env.TEST_URL?.includes('4173'), 'Production service worker only');
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await page.getByLabel('Текстовый режим · без 3D').check();
  await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
  await page.getByRole('button', { name: 'Начать путешествие' }).click();
  await page.getByRole('button', { name: 'Понятно. Отправляемся' }).click();
  await page.getByRole('button', { name: 'Поговорить', exact: true }).click();
  await page.locator('.choice-list button').first().click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.getByText('Сохранено на этом устройстве', { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Продолжить историю' }).click();
  await page.getByRole('button', { name: 'Понятно. Отправляемся' }).click();
  await expect(page.getByRole('heading', { name: 'Время на разговор' })).toBeVisible();
  await page.getByRole('button', { name: 'Поговорить', exact: true }).click();
  await page.locator('.choice-list button').first().click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Приглашение без адреса' })).toBeVisible();
  await context.setOffline(false);
});

test('narrow and tablet layouts do not overflow; unavailable WebGL has an accessible fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: any, ...args: any[]) {
      if (String(type).includes('webgl')) return null;
      return original.apply(this, [type, ...args] as any);
    } as any;
  });
  await page.goto('/');
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await page.getByRole('button', { name: 'Начать путешествие' }).click();
  await page.getByRole('button', { name: 'Понятно. Отправляемся' }).click();
  await expect(page.getByText('3D недоступно на этом устройстве.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Поговорить', exact: true }).click();
  await expect(page.locator('.choice-list button')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
