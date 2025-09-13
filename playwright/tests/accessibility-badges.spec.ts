import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as axe from 'axe-core';
import { fileURLToPath } from 'node:url';

test('accessibility: unit badges have accessible names and roles', async ({ page }) => {
  await page.goto('/');

  // Small map with a few units that have multiple states
  await page.evaluate(() => {
    const tiles = [ { id: 't0', coord: { q: 0, r: 0 }, biome: 'grassland', elevation: 0, moisture: 0, exploredBy: [] } ];
    const units: Record<string, any> = {
      u1: { id: 'u1', type: 'warrior', category: 'Melee', ownerId: 'p1', location: 't0', activeStates: ['Moved', 'Fortified'] },
      u2: { id: 'u2', type: 'settler', category: 'Civilian', ownerId: 'p1', location: 't0', activeStates: ['Idle'] },
    };
    const state: any = {
      schemaVersion: 1,
      seed: 'a11y-bench',
      turn: 0,
      map: { width: 1, height: 1, tiles },
      players: [{ id: 'p1', isHuman: true }],
      techCatalog: [],
      log: [],
      mode: 'standard',
      autoSim: false,
      ui: { openPanels: {}, selectedUnitId: 'u1' },
      contentExt: { tiles: { t0: { id: 't0' } }, units },
    };
    globalThis.dispatchEvent(new CustomEvent('civweblite:loadState', { detail: state }));
  });

  // Wait for badge elements to be attached
  await page.locator('[data-testid^="unit-marker-"]').first().waitFor({ state: 'attached', timeout: 10_000 });

  // Collect badge elements for unit u1
  const labels = await page.$$eval('[data-testid^="unit-marker-u1"] [role="img"], [data-testid^="unit-marker-u1"] [aria-label]', elements =>
    elements.map(element => ({ tag: element.tagName.toLowerCase(), role: element.getAttribute('role'), aria: element.getAttribute('aria-label'), text: (element.textContent || '').trim() }))
  );

  // Basic expectations: at least two badges and each has either aria-label or meaningful text
  expect(labels.length).toBeGreaterThanOrEqual(2);
  for (const l of labels) {
    expect(l.aria || l.text.length > 0).toBeTruthy();
  }

  // Create a compact accessibility report and write to test-results
  const report = {
    generatedAt: new Date().toISOString(),
    unitId: 'u1',
    badges: labels,
  };

  const directory = path.resolve('test-results');
  await mkdir(directory, { recursive: true });
  const filePath = path.join(directory, `a11y-badges-${Date.now()}.json`);
  await writeFile(filePath, JSON.stringify(report, undefined, 2));
  console.log(`A11y badges report written to ${filePath}`);

  // Inject axe-core into the page and run it
  // Resolve the axe minified bundle path from the installed package
    const axeScriptPath = path.resolve(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js');
    await page.addScriptTag({ path: axeScriptPath });
  const axeResults = await page.evaluate(async () => {
    // Run WCAG 2.1 AA checks by default
    // @ts-ignore - axe is injected into globalThis
    return await (globalThis as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2aa'] } });
  });

  const axePath = path.join(directory, `a11y-axe-${Date.now()}.json`);
    const axeOutputPath = path.join(directory, `a11y-axe-${Date.now()}.json`);
    await writeFile(axeOutputPath, JSON.stringify(axeResults, undefined, 2));
    console.log(`Axe results written to ${axeOutputPath}`);

  // Fail the test if there are accessibility violations
  expect(axeResults.violations.length).toBe(0);
});
