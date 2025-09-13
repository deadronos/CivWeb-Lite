import { test, expect } from '@playwright/test';

test.describe('Research Selection', () => {
  test('start research through UI', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start New Game' }).click();
    await page.getByLabel('topbar research').click();
    await page.getByRole('button', { name: 'Pottery' }).click();
    await expect(page.getByTestId('research-panel')).toContainText('Current: pottery');
  });
});
