import { describe, it, expect } from 'vitest';
import { loadTechs, validateDAG, loadUnits, loadBuildings, loadLeaders } from '../src/data/loader';

describe('Data loader', () => {
  it('loads techs and validates DAG, with both trees present', async () => {
    const techs = await loadTechs();
    const trees = new Set(techs.map((t) => t.tree));
    expect(trees.has('science')).toBe(true);
    expect(trees.has('culture')).toBe(true);
    // at least 6 per tree
    const byTree: Record<string, number> = { science: 0, culture: 0 } as any;
    for (const t of techs) byTree[t.tree] = (byTree[t.tree] || 0) + 1;
    expect(byTree.science).toBeGreaterThanOrEqual(6);
    expect(byTree.culture).toBeGreaterThanOrEqual(6);
    expect(() => validateDAG(techs)).not.toThrow();
  });

  it('loads units, buildings, leaders', async () => {
    const units = await loadUnits();
    const buildings = await loadBuildings();
    const leaders = await loadLeaders();
    expect(units.length).toBeGreaterThanOrEqual(8);
    expect(buildings.length).toBeGreaterThanOrEqual(5);
    expect(leaders.length).toBeGreaterThanOrEqual(3);
  });
});
