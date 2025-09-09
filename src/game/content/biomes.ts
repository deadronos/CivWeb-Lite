import type { Biome, Hextile } from './types';

export const BIOME_LIST: Biome[] = [
  'ocean',
  'coast',
  'plains',
  'grassland',
  'desert',
  'tundra',
  'snow',
  'forest',
  'jungle',
  'hills',
  'mountain',
];

export type MovementContext = { unitAbilities?: string[]; unitDomain?: 'land' | 'naval' };

export const BASE_MOVEMENT_COST: Record<Biome, number | 'INF'> = {
  ocean: 'INF',
  coast: 1,
  plains: 1,
  grassland: 1,
  desert: 1.5,
  tundra: 1.5,
  snow: 2,
  forest: 2,
  jungle: 2,
  hills: 2,
  mountain: 'INF',
};

export function isPassable(tile: Hextile, ctx: MovementContext): boolean {
  const abilities = ctx.unitAbilities ?? [];
  const domain = ctx.unitDomain ?? 'land';
  if (tile.biome === 'mountain') {
    return abilities.includes('canTraverseMountains');
  }
  if (tile.biome === 'ocean') {
    return domain === 'naval' || abilities.includes('embarked');
  }
  return true;
}

export function movementCost(tile: Hextile, ctx: MovementContext): number {
  const domain = ctx.unitDomain ?? 'land';
  // Domain-specific rules for ocean/coast
  if (tile.biome === 'ocean') return domain === 'naval' ? 1 : Infinity;
  if (tile.biome === 'coast') return 1;

  const base = BASE_MOVEMENT_COST[tile.biome];
  let cost = base === 'INF' ? Infinity : base;
  // Elevation modifier for hills or high elevation
  if (tile.biome === 'hills' || (tile.elevation ?? 0) > 0.6) {
    cost += 0.5;
  }
  return cost;
}
