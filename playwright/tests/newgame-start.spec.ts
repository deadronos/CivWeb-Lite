import { test, expect } from '@playwright/test';

test('main menu new game flow starts game', async ({ page }) => {
  await page.goto('/');
  // Main menu visible
  await expect(page.getByRole('dialog', { name: 'Main Menu' })).toBeVisible();
  // Choose map size (default is fine), set players to 2
  const playersInput = page.getByLabel('Players (total)');
  await playersInput.fill('2');
  // Pick a specific leader for player 1 and assert known options exist
  await page.getByLabel('Leader for player 1').selectOption('pericles');
  // Start new game
  await page.getByRole('button', { name: 'Start New Game' }).click();
  // Menu should disappear
  await expect(page.getByRole('dialog', { name: 'Main Menu' })).toHaveCount(0);
  // HUD visible
  await expect(page.getByLabel('turn')).toBeVisible();
  // Summary banner shows selected leader name
  await expect(page.getByLabel('game summary')).toContainText('Pericles');
});
