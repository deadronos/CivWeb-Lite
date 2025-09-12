import { test, expect } from '@playwright/test';

test('unit badges render for multiple states', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const state: any = {
      schemaVersion: 1,
      seed: 's',
      turn: 0,
      map: {
        width: 1,
        height: 1,
        tiles: [
          { id: 't1', coord: { q: 0, r: 0 }, biome: 'grass', elevation: 0, moisture: 0, exploredBy: [] },
        ],
      },
      players: [],
      techCatalog: [],
      log: [],
      mode: 'standard',
      autoSim: false,
      ui: { openPanels: {}, selectedUnitId: 'u1' },
      contentExt: {
        tiles: {
          t1: {
            id: 't1',
            q: 0,
            r: 0,
            biome: 'grass',
            elevation: 0,
            features: [],
            improvements: [],
            occupantUnitId: 'u1',
            occupantCityId: null,
            passable: true,
          },
        },
        units: {
          u1: {
            id: 'u1',
            type: 'warrior',
            category: 'Melee',
            ownerId: 'p1',
            location: 't1',
            hp: 100,
            movement: 2,
            movementRemaining: 2,
            attack: 1,
            defense: 1,
            sight: 1,
            activeStates: new Set(['Moved', 'Fortified']),
          },
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
          research: undefined,
          cultureResearch: undefined,
        },
      },
    };
    globalThis.dispatchEvent(new CustomEvent('civweblite:loadState', { detail: state }));
  });
  const marker = page.getByTestId('unit-marker-u1');
  await expect(marker).toBeVisible();
  const container = marker.getByTestId('badge-container');
  await expect(container).toBeVisible();
  await expect(container.getByTestId('state-badge')).toHaveCount(2);
});
