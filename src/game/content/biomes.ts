import type { Biome, Hextile } from './types';

/**
 * @file This file contains definitions and functions related to biomes.
 */

/**
 * A list of all possible biomes.
 */
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

/**
 * Represents the context for a movement calculation.
 * @property unitAbilities - The abilities of the unit.
 * @property unitDomain - The domain of the unit ('land' or 'naval').
 */
export type MovementContext = { unitAbilities?: string[]; unitDomain?: 'land' | 'naval' };

/**
 * The base movement cost for each biome.
 */
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

/**
 * Checks if a tile is passable for a given unit.
 * @param tile - The tile to check.
 * @param context - The movement context.
 * @returns True if the tile is passable, false otherwise.
 */
export function isPassable(tile: Hextile, context: MovementContext): boolean {
  const abilities = context.unitAbilities ?? [];
  const domain = context.unitDomain ?? 'land';
  if (tile.biome === 'mountain') {
    return abilities.includes('canTraverseMountains');
  }
  if (tile.biome === 'ocean') {
    return domain === 'naval' || abilities.includes('embarked');
  }
  return true;
}

/**
 * Calculates the movement cost for a given tile.
 * @param tile - The tile to calculate the cost for.
 * @param context - The movement context.
 * @returns The movement cost.
 */
export function movementCost(tile: Hextile, context: MovementContext): number {
  const domain = context.unitDomain ?? 'land';
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
