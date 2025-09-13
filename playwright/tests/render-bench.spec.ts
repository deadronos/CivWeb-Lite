import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('render bench: measure RAF frame times with many badges', async ({ page }) => {
  // Navigate to app (playwright.config starts vite dev server)
  await page.goto('/');

  const mapWidth = 30;
  const mapHeight = 30;
  const numberUnits = 500; // number of unit overlays to render

  // Inject a synthetic game state with many units and load it into the app
  await page.evaluate(({ mapWidth, mapHeight, numberUnits }) => {
    const tiles: any[] = [];
    for (let r = 0; r < mapHeight; r++) {
      for (let q = 0; q < mapWidth; q++) {
        tiles.push({ id: `${q},${r}`, coord: { q, r }, biome: 'grassland', elevation: 0, moisture: 0, exploredBy: [] });
      }
    }

    const units: Record<string, any> = {};
    for (let index = 0; index < numberUnits; index++) {
      const tileIndex = index % tiles.length;
      const tileId = tiles[tileIndex].id;
      const unitId = `u${index}`;
      units[unitId] = {
        id: unitId,
        type: 'warrior',
        category: 'Melee',
        ownerId: 'p1',
        location: tileId,
        hp: 100,
        movement: 2,
        movementRemaining: 2,
        attack: 1,
        defense: 1,
        sight: 1,
        activeStates: ['Moved', 'Fortified'],
      };
    }

    const tileMap: Record<string, any> = {};
    for (const t of tiles) {
      tileMap[t.id] = { ...t, features: [], improvements: [], occupantUnitId: undefined, occupantCityId: undefined, passable: true };
    }

    const state: any = {
      schemaVersion: 1,
      seed: 'render-bench',
      turn: 0,
      map: { width: mapWidth, height: mapHeight, tiles },
      players: [{ id: 'p1', isHuman: true }],
      techCatalog: [],
      log: [],
      mode: 'standard',
      autoSim: false,
      ui: { openPanels: {}, selectedUnitId: undefined },
      contentExt: { tiles: tileMap, units },
    };

    // Dispatch a global event the app listens to for loading state
    globalThis.dispatchEvent(new CustomEvent('civweblite:loadState', { detail: state }));
  }, { mapWidth, mapHeight, numberUnits });

  // Wait for at least one unit marker to be attached to the DOM to ensure rendering pipeline mounted
  await page.locator('[data-testid="unit-marker-u0"]').waitFor({ state: 'attached', timeout: 15_000 });

  // Collect RAF frame intervals in the page context
  const framesToCollect = 300;
  const intervals: number[] = await page.evaluate(async (frames) => {
    return await new Promise<number[]>((resolve) => {
      const samples: number[] = [];
      let last = performance.now();
      let count = 0;
      function callback(now: number) {
        if (count > 0) samples.push(now - last);
        last = now;
        count++;
        if (samples.length >= frames) {
          resolve(samples);
          return;
        }
        requestAnimationFrame(callback);
      }
      requestAnimationFrame(callback);
    });
  }, framesToCollect);

  // Compute simple stats
  const sorted = intervals.toSorted((a, b) => a - b);
  const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  const p95 = sorted[Math.floor(intervals.length * 0.95)];

  const report = {
    generatedAt: new Date().toISOString(),
    mapWidth,
    mapHeight,
    numberUnits,
    framesCollected: intervals.length,
    stats: { mean, p95 },
  } as any;

  // Ensure output folder and write results (node context)
  const directory = path.resolve('test-results');
  await mkdir(directory, { recursive: true });
  const filePath = path.join(directory, `render-bench-${Date.now()}.json`);
  await writeFile(filePath, JSON.stringify({ report, intervals }, undefined, 2));
  console.log(`Render bench results written to ${filePath}`);

  // Sanity expectation: we collected the requested number of frames
  expect(intervals.length).toBeGreaterThanOrEqual(framesToCollect);
});
