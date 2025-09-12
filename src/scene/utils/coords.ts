/**
 * @file This file contains utility functions for converting between different coordinate systems.
 */

/**
 * Converts axial hex coordinates (q, r) to world X/Z plane coordinates.
 * Orientation: pointy-top hexes (pointy sides on top/bottom).
 *
 * Projection: standard pointy-top axial layout with horizontal staggering.
 *  - Rows wrap vertically for a cylindrical world.
 *
 * Formulas (pointy-top, cylindrical):
 *   worldX = size * sqrt(3) * (q + r / 2)
 *   worldZ = size * 3/2 * r
 *
 * @param q - The q coordinate.
 * @param r - The r coordinate.
 * @param size - The size of the hex (radius from center to any corner).
 * @returns An array containing the world X and Z coordinates.
 */
export function axialToWorld(q: number, r: number, size = 1): [number, number] {
  const worldX = size * Math.sqrt(3) * (q + r / 2);
  const worldZ = size * (3 / 2) * r;

  return [worldX, worldZ];
}

/**
 * Converts a tile ID to world coordinates using the game state extension.
 * @param extension - The game state extension.
 * @param tileId - The ID of the tile.
 * @param size - The size of the hex.
 * @returns An array containing the world X and Z coordinates, or undefined if the tile is not found.
 */
export function tileIdToWorldFromExt(
  extension: { tiles: Record<string, { q: number; r: number }> },
  tileId: string,
  size = 1
): [number, number] | undefined {
  const t = extension.tiles[tileId] as { q: number; r: number } | undefined;
  if (!t) return undefined;
  return axialToWorld(t.q, t.r, size);
}

/**
 * The default hex size (radius).
 */
export const DEFAULT_HEX_SIZE = 0.51;
