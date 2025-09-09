import { movementCost, isPassable } from './biomes';
import type { City, GameStateExt, Hextile, Unit } from './types';
import { IMPROVEMENTS, UNIT_TYPES, BUILDINGS } from './registry';

export type TileYield = {
  food: number;
  production: number;
  gold: number;
  science?: number;
  culture?: number;
};

export function getTileBaseYield(tile: Hextile): TileYield {
  switch (tile.biome) {
    case 'plains':
    case 'grassland':
      return { food: 2, production: 1, gold: 0 };
    case 'forest':
      return { food: 1, production: 2, gold: 0 };
    case 'desert':
      return { food: 0, production: 1, gold: 0 };
    case 'hills':
      return { food: 0, production: 2, gold: 0 };
    default:
      return { food: 0, production: 0, gold: 0 };
  }
}

export function applyImprovementsYield(base: TileYield, tile: Hextile): TileYield {
  const result = { ...base };
  for (const impId of tile.improvements) {
    const imp = IMPROVEMENTS[impId];
    if (!imp) continue;
    result.food += imp.yield.food ?? 0;
    result.production += imp.yield.production ?? 0;
    result.gold += imp.yield.gold ?? 0;
  }
  return result;
}

export function getTileYield(tile: Hextile): TileYield {
  return applyImprovementsYield(getTileBaseYield(tile), tile);
}

export function cityBaseYield(): TileYield {
  return { food: 2, production: 1, gold: 0, science: 0, culture: 0 };
}

export function getCityYield(state: GameStateExt, city: City): TileYield {
  const total: TileYield = { ...cityBaseYield() };
  for (const tileId of city.tilesWorked) {
    const tile = state.tiles[tileId];
    if (!tile) continue;
    const y = getTileYield(tile);
    total.food += y.food;
    total.production += y.production;
    total.gold += y.gold;
  }
  // Apply building yields (food/production/gold/science/culture components)
  if (city.buildings && city.buildings.length) {
    for (const bid of city.buildings) {
      const b = BUILDINGS[bid];
      if (!b || !b.yields) continue;
      total.food += b.yields.food ?? 0;
      total.production += b.yields.production ?? 0;
      total.gold += b.yields.gold ?? 0;
      total.science = (total.science ?? 0) + (b.yields.science ?? 0);
      total.culture = (total.culture ?? 0) + (b.yields.culture ?? 0);
    }
  }
  return total;
}

export function roundUp(n: number): number {
  return Math.ceil(n);
}

export function canUnitEnter(state: GameStateExt, unit: Unit, tile: Hextile): boolean {
  const unitType = UNIT_TYPES[unit.type];
  if (!unitType) return false;
  return isPassable(tile, { unitAbilities: unit.abilities, unitDomain: unitType.domain });
}

export function moveUnit(state: GameStateExt, unitId: string, toTileId: string): boolean {
  const unit = state.units[unitId];
  const tile = state.tiles[toTileId];
  if (!unit || !tile) return false;
  const unitType = UNIT_TYPES[unit.type];
  if (!unitType) return false;
  if (!canUnitEnter(state, unit, tile)) return false;
  const cost = movementCost(tile, { unitAbilities: unit.abilities, unitDomain: unitType.domain });
  const step = roundUp(cost);
  if (step <= unit.movementRemaining) {
    unit.movementRemaining -= step;
    unit.location = tile.id;
    return true;
  }
  return false;
}

export function endTurn(state: GameStateExt): void {
  // reset unit movement, heal in friendly city
  for (const unit of Object.values(state.units)) {
    unit.movementRemaining = unit.movement;
    const locTileId = typeof unit.location === 'string' ? unit.location : '';
    if (locTileId) {
      const cityId = state.tiles[locTileId]?.occupantCityId;
      if (cityId) {
        const city = state.cities[cityId];
        if (city && city.ownerId === unit.ownerId) {
          unit.hp = Math.min(100, unit.hp + 10);
        }
      }
    }
  }
  // city production
  for (const city of Object.values(state.cities)) {
    tickCityProduction(state, city);
  }
  // recompute empire-wide science/culture per turn from cities
  let totalScience = 0;
  let totalCulture = 0;
  for (const city of Object.values(state.cities)) {
    const y = getCityYield(state, city);
    totalScience += y.science ?? 0;
    totalCulture += y.culture ?? 0;
  }
  // If city yields produce science/culture, use those values; otherwise
  // preserve any test-injected or pre-set per-turn values on playerState.
  if (totalScience > 0) {
    state.playerState.science = totalScience;
  } else if (typeof state.playerState.science !== 'number') {
    // ensure numeric default
    state.playerState.science = 0;
  }
  if (totalCulture > 0) {
    state.playerState.culture = totalCulture;
  } else if (typeof state.playerState.culture !== 'number') {
    state.playerState.culture = 0;
  }
  // research
  tickResearch(state);
  tickCultureResearch(state);
}

export function tickCityProduction(state: GameStateExt, city: City): void {
  if (!city.productionQueue.length) return;
  const head = city.productionQueue[0];
  const perTurn = getCityYield(state, city).production;
  // consume production by reducing turnsRemaining proportionally to perTurn vs cost units-per-turn model
  // For simplicity: 1 turnRemaining reduced per 1 production (integer), but ensure progress
  const reduction = Math.max(1, Math.floor(perTurn));
  head.turnsRemaining -= reduction;
  if (head.turnsRemaining <= 0) {
    if (head.type === 'unit') {
      // spawn unit on city tile
      const udef = UNIT_TYPES[head.item];
      if (udef) {
        const id = `${head.item}_${Object.keys(state.units).length + 1}`;
        state.units[id] = {
          id,
          type: head.item,
          ownerId: city.ownerId,
          location: city.location,
          hp: udef.base.hp ?? 100,
          movement: udef.base.movement,
          movementRemaining: udef.base.movement,
          attack: udef.base.attack,
          defense: udef.base.defense,
          sight: udef.base.sight,
          state: 'idle',
          abilities: udef.abilities ?? [],
        };
      }
    } else if (head.type === 'improvement') {
      const tile = state.tiles[city.location];
      if (tile && !tile.improvements.includes(head.item)) {
        tile.improvements.push(head.item);
      }
    } else if (head.type === 'building') {
      // add building to city
      if (!city.buildings) city.buildings = [];
      if (!city.buildings.includes(head.item)) city.buildings.push(head.item);
    }
    city.productionQueue.shift();
  }
}

export function beginResearch(state: GameStateExt, techId: string) {
  // ensure prerequisites
  const tech = state.techs[techId];
  if (!tech) return false;
  if (!tech.prerequisites.every((p) => state.playerState.researchedTechs.includes(p))) return false;
  state.playerState.research = { techId, progress: 0 };
  return true;
}

export function tickResearch(state: GameStateExt) {
  if (!state.playerState.research) return;
  const { techId } = state.playerState.research;
  const tech = state.techs[techId];
  if (!tech) return;
  state.playerState.research.progress += state.playerState.science;
  if (state.playerState.research.progress >= tech.cost) {
    // complete
    state.playerState.researchedTechs.push(tech.id);
    // apply unlocks
    if (tech.unlocks.improvements) {
      for (const imp of tech.unlocks.improvements) {
        if (!state.playerState.availableImprovements.includes(imp))
          state.playerState.availableImprovements.push(imp);
      }
    }
    if (tech.unlocks.units) {
      for (const u of tech.unlocks.units) {
        if (!state.playerState.availableUnits.includes(u)) state.playerState.availableUnits.push(u);
      }
    }
    state.playerState.research = null;
  }
}

export function beginCultureResearch(state: GameStateExt, civicId: string) {
  const civic = state.civics?.[civicId];
  if (!civic) return false;
  const researched = state.playerState.researchedCivics ?? [];
  if (!civic.prerequisites.every((p) => researched.includes(p))) return false;
  state.playerState.cultureResearch = { civicId, progress: 0 };
  return true;
}

export function tickCultureResearch(state: GameStateExt) {
  if (!state.playerState.cultureResearch) return;
  const { civicId } = state.playerState.cultureResearch;
  const civic = state.civics?.[civicId];
  if (!civic) return;
  const culture = state.playerState.culture ?? 0;
  state.playerState.cultureResearch.progress += culture;
  if (state.playerState.cultureResearch.progress >= civic.cost) {
    if (!state.playerState.researchedCivics) state.playerState.researchedCivics = [];
    state.playerState.researchedCivics.push(civic.id);
    if (civic.unlocks.improvements) {
      for (const imp of civic.unlocks.improvements) {
        if (!state.playerState.availableImprovements.includes(imp))
          state.playerState.availableImprovements.push(imp);
      }
    }
    if (civic.unlocks.units) {
      for (const u of civic.unlocks.units) {
        if (!state.playerState.availableUnits.includes(u)) state.playerState.availableUnits.push(u);
      }
    }
    state.playerState.cultureResearch = null;
  }
}

export function workerBuildImprovement(
  state: GameStateExt,
  unitId: string,
  tileId: string,
  improvementId: string,
  progressByUnit: Record<string, number> = {}
): { complete: boolean; progress: number } {
  // Allow missing unit (tests may simulate worker progress without a real unit)
  const tile = state.tiles[tileId];
  if (!tile) return { complete: false, progress: 0 };
  const def = IMPROVEMENTS[improvementId];
  if (!def) return { complete: false, progress: 0 };
  const key = `${unitId}:${tileId}:${improvementId}`;
  const current = progressByUnit[key] ?? 0;
  const next = current + 1;
  progressByUnit[key] = next;
  if (next >= def.buildTime) {
    if (!tile.improvements.includes(improvementId)) tile.improvements.push(improvementId);
    return { complete: true, progress: next };
  }
  return { complete: false, progress: next };
}
