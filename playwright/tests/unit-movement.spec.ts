import { test, expect } from '@playwright/test';

test.describe('Unit Movement', () => {
  test('select unit and move', async ({ page }) => {
    await page.goto('http://localhost:5173'); // assume dev server
    // Click on a unit
    await page.locator('[data-testid="unit"]').first().click();
    // Expect range overlay
    await expect(page.locator('[data-testid="movement-range-overlay"]')).toBeVisible();
    // Click on a tile in range
    await page.locator('[data-testid="hex-bucket"]').first().click();
    // Expect unit moved, overlay gone
    await expect(page.locator('[data-testid="movement-range-overlay"]')).not.toBeVisible();
  });

  test('preview path and combat', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Select unit near enemy
    // Hover over enemy tile
    await page.hover('[data-testid="enemy-tile"]');
    // Expect path and combat preview
    await expect(page.locator('[data-testid="path-preview-overlay"]')).toBeVisible();
    await expect(page.locator('[data-testid="combat-preview-overlay"]')).toBeVisible();
    // Click confirm
    await page.click('button:has-text("Confirm Attack")');
    // Expect move executed
  });
});
