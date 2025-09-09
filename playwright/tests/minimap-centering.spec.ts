import { test, expect } from '@playwright/test';

test('minimap click updates camera position status', async ({ page }) => {
  await page.goto('/');
  // camera status is visible
  const cam = page.getByLabel('camera position');
  await expect(cam).toBeVisible();
  const before = await cam.textContent();
  // click near the center of the minimap
  const mini = page.getByLabel('minimap');
  const box = await mini.boundingBox();
  if (!box) throw new Error('minimap not visible');
  await mini.click({ position: { x: box.width / 2, y: box.height / 2 } });
  await expect(cam).not.toHaveText(before ?? '');
});

