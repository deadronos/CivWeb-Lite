import { describe, it, expect } from 'vitest';
import { createEmptyState } from '../src/game/content/engine';
import type { Hextile, City, Unit } from '../src/game/content/types';
import { movementCost } from '../src/game/content/biomes';
import {
  moveUnit,
  getCityYield,
  tickCityProduction,
  beginResearch,
  endTurn,
  workerBuildImprovement,
} from '../src/game/content/rules';

function mkTile(over: Partial<Hextile>): Hextile {
  return {
    id: 'hex_0_0',
    q: 0,
    r: 0,
    biome: 'grassland',
    elevation: 0.1,
    features: [],
    improvements: [],
    occupantUnitId: null,
    occupantCityId: null,
    passable: true,
    ...over,
  };
}

describe('Spec: Biomes, Units, Cities, and Technologies', () => {
  it('Tile serialization: forest tile fields preserved', () => {
    const tile: Hextile = mkTile({
      id: 'hex_12_5',
      q: 12,
      r: 5,
      biome: 'forest',
      features: ['river'],
    });
    const json = JSON.stringify(tile);
    const parsed: Hextile = JSON.parse(json);
    expect(parsed.biome).toBe('forest');
    expect(parsed.features).toContain('river');
    expect(parsed.id).toBe('hex_12_5');
  });

  it('Movement cost: worker cannot move plains -> forest+hills in one turn if cost >2', () => {
    const state = createEmptyState();
    const plains = mkTile({ id: 'plains', biome: 'plains' });
    const forestHill = mkTile({
      id: 'forestHill',
      biome: 'hills',
      elevation: 0.7,
      features: [],
      improvements: [],
    });
    state.tiles[plains.id] = plains;
    state.tiles[forestHill.id] = forestHill;
    const unit: Unit = {
      id: 'u1',
      type: 'worker',
      ownerId: 'p1',
      location: plains.id,
      hp: 100,
      movement: 2,
      movementRemaining: 2,
      attack: 0,
      defense: 1,
      sight: 2,
      state: 'idle',
      abilities: [],
    };
    state.units[unit.id] = unit;
    const cost = movementCost(forestHill, { unitDomain: 'land', unitAbilities: [] });
    expect(cost).toBeGreaterThan(2); // forest+hills effectively 2.5 after elevation modifier
    const moved = moveUnit(state, unit.id, forestHill.id);
    expect(moved).toBe(false);
    expect(state.units[unit.id].location).toBe(plains.id);
  });

  it('Unit production: city with production 1 builds warrior with cost 2 in 2 turns', () => {
    const state = createEmptyState();
    const cityTile = mkTile({ id: 'hex_city', biome: 'grassland' });
    state.tiles[cityTile.id] = cityTile;
    const city: City = {
      id: 'city_1',
      name: 'New Hope',
      ownerId: 'player_1',
      location: cityTile.id,
      population: 3,
      productionQueue: [{ type: 'unit', item: 'warrior', turnsRemaining: 2 }],
      tilesWorked: [cityTile.id],
      garrisonUnitIds: [],
      happiness: 10,
    };
    state.cities[city.id] = city;

    // Make yield production exactly 1: city base 1 + tile grassland 1 => 2, so avoid double counting by clearing tilesWorked
    city.tilesWorked = [];
    // Now cityBaseYield() returns production 1

    tickCityProduction(state, city);
    expect(city.productionQueue[0].turnsRemaining).toBe(1);
    tickCityProduction(state, city);
    expect(city.productionQueue.length).toBe(0);
    // Unit should exist
    const spawned = Object.values(state.units).find(
      (u) => u.type === 'warrior' && u.location === cityTile.id
    );
    expect(spawned).toBeTruthy();
  });

  it('Tech unlock: researching agriculture unlocks farm improvement', () => {
    const state = createEmptyState();
    state.playerState.science = 1; // 1 per turn
    const ok = beginResearch(state, 'agriculture');
    expect(ok).toBe(true);
    for (let i = 0; i < 6; i++) endTurn(state);
    expect(state.playerState.researchedTechs).toContain('agriculture');
    expect(state.playerState.availableImprovements).toContain('farm');
  });

  it('Improvement yields: worker builds farm on grassland, city food increases', () => {
    const state = createEmptyState();
    const tile = mkTile({ id: 't1', biome: 'grassland' });
    state.tiles[tile.id] = tile;
    const city: City = {
      id: 'c1',
      name: 'C1',
      ownerId: 'p1',
      location: tile.id,
      population: 1,
      productionQueue: [],
      tilesWorked: [tile.id],
      garrisonUnitIds: [],
      happiness: 0,
    };
    state.cities[city.id] = city;
    const before = getCityYield(state, city).food;
    // simulate worker building
    const progress: Record<string, number> = {};
    workerBuildImprovement(state, 'u_missing', tile.id, 'farm', progress); // first tick (ignored unit id but tracks progress)
    workerBuildImprovement(state, 'u_missing', tile.id, 'farm', progress); // second tick completes
    const after = getCityYield(state, city).food;
    expect(after).toBeGreaterThan(before);
  });
});
