import { test, expect } from '@playwright/test';

test('hovering a tile shows movement preview ghost', async ({ page }) => {
  // Use baseURL from playwright.config.ts so tests follow the configured dev server
  await page.goto('/');

  // Attach console and error listeners to surface page errors in the test logs
  page.on('console', (message) => {
    console.log('PAGE LOG:', message.text());
  });
  page.on('pageerror', (error) => {
    console.log('PAGE ERROR:', error.message);
  });

  // Inject a minimal game state so unit markers and movement-range proxies are rendered.
  // Wait for the 3D canvas to be attached so the app has mounted its listeners
  await page.locator('canvas').waitFor({ state: 'attached', timeout: 15_000 });
  // Retry dispatch in case the app hasn't yet wired the global event listener.
  const injectState = async () => {
    await page.evaluate(() => {
      const state: any = {
        schemaVersion: 1,
        seed: 's',
        turn: 0,
        map: {
          width: 3,
          height: 3,
          tiles: [
            { id: 't1', coord: { q: 0, r: 0 }, biome: 'grass', elevation: 0, moisture: 0, exploredBy: [] },
            { id: 't2', coord: { q: 1, r: 0 }, biome: 'grass', elevation: 0, moisture: 0, exploredBy: [] },
          ],
        },
        players: [],
        techCatalog: [],
        log: [],
        mode: 'standard',
        autoSim: false,
  ui: { openPanels: {}, selectedUnitId: undefined },
        contentExt: {
          tiles: {
            t1: { id: 't1', q: 0, r: 0, biome: 'grass', elevation: 0, features: [], improvements: [], occupantUnitId: 'u1', occupantCityId: undefined, passable: true },
            t2: { id: 't2', q: 1, r: 0, biome: 'grass', elevation: 0, features: [], improvements: [], occupantUnitId: undefined, occupantCityId: undefined, passable: true },
          },
          units: {
            // Use a Set for activeStates to match the app's expectations
            u1: { id: 'u1', type: 'warrior', category: 'Melee', ownerId: 'p1', location: 't1', hp: 100, movement: 2, movementRemaining: 2, attack: 1, defense: 1, sight: 1, activeStates: new Set() },
          },
          cities: {},
          techs: {},
          playerState: {
            researchedTechs: [],
            researchedCivics: [],
            availableUnits: [],
            availableImprovements: [],
            science: 0,
            culture: 0,
          },
        },
      };
      globalThis.dispatchEvent(new CustomEvent('civweblite:loadState', { detail: state }));
    });
  };

  // Retry injection until the page DOM shows the unit-marker element (listener may not be wired yet)
  let markerAttached = false;
  for (let attempt = 0; attempt < 8; attempt++) {
    await injectState();
    try {
      // waitForFunction executes in the page context and checks for the presence of the test id
      await page.waitForFunction(() => !!document.querySelector('[data-testid="unit-marker-u1"]'), { timeout: 1500 });
      markerAttached = true;
      break;
    } catch {
      await page.waitForTimeout(300);
    }
  }
  if (!markerAttached) throw new Error('unit marker did not attach after repeated state injections');

  // Programmatically select the unit using a test-only helper so we don't rely on
  // fragile DOM interactions in headless browsers. This helper is provided by
  // the app when running in test/development builds.
  await page.evaluate(() => {
    // @ts-ignore - test helper exists in test/dev only
    if ((globalThis as any).__civweblite_test_helpers && (globalThis as any).__civweblite_test_helpers.selectUnit) {
      (globalThis as any).__civweblite_test_helpers.selectUnit('u1');
    } else {
      // fallback: click the marker if helper not available
      const button = document.querySelector('[data-testid="unit-marker-u1"] [data-testid="unit"]') as HTMLElement | null;
      if (button) button.click();
    }
  });

  // Wait for the proxy element used in E2E to appear (movement-range-overlay should render proxies)
  const proxy = page.locator('.e2e-hex-proxy').first();
  await proxy.waitFor({ state: 'visible', timeout: 10_000 });

  // Hover the proxy tile which in-app triggers a PREVIEW_PATH and renders the ghost
  await proxy.hover();

  // Movement preview ghost should appear with the test id
  const preview = page.locator('[data-testid="movement-preview"]');
  await expect(preview).toBeVisible();
});
