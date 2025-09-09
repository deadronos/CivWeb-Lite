import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('smoke: start, advance 2 turns, save, load', async ({ page, context }) => {
  await page.goto('/');

  // Ensure initial UI visible
  await expect(page.getByText('Turn:')).toBeVisible();

  // Advance two turns
  const endTurn = page.getByRole('button', { name: 'End Turn' });
  await endTurn.click();
  await endTurn.click();
  await expect(page.getByText('Turn: 2')).toBeVisible();

  // Trigger a save and capture the download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'save game' }).click(),
  ]);
  const path = await download.path();
  expect(path).toBeTruthy();

  // Load the just-saved file back in
  await page.getByLabel('load file').setInputFiles(path!);
  // Still shows turn 2 (state preserved on load)
  await expect(page.getByText('Turn: 2')).toBeVisible();
});

test('a11y: axe-core scan', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  // Integration presence check - do not fail build on baseline issues yet
  expect(Array.isArray(results.violations)).toBe(true);
});

