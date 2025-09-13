import { test, expect } from '@playwright/test';

test('hovering a tile shows movement preview ghost', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for the canvas and a proxy element used in E2E to appear
  const proxy = page.locator('.e2e-hex-proxy').first();
  await expect(proxy).toBeVisible();

  // Hover the proxy tile which in-app triggers a PREVIEW_PATH and renders the ghost
  await proxy.hover();

  // Movement preview ghost should appear with the test id
  const preview = page.locator('[data-testid="movement-preview"]');
  await expect(preview).toBeVisible();
});
