/**
 * Convert axial hex coordinates (q, r) to world X/Z plane coordinates.
 * Orientation: pointy-top hexes (pointy sides on top/bottom).
 *
 * Projection: standard pointy-top axial layout with horizontal staggering.
 *  - Rows wrap vertically for a cylindrical world.
 *
 * Formulas (pointy-top, cylindrical):
 *   worldX = size * sqrt(3) * (q + r / 2)
 *   worldZ = size * 3/2 * r
 *
 * `size` is the hex radius (distance from center to any corner).
 */
export function axialToWorld(q: number, r: number, size = 1): [number, number] {
  const worldX = size * Math.sqrt(3) * (q + r / 2);
  const worldZ = size * (3 / 2) * r;

  return [worldX, worldZ];
}

export function tileIdToWorldFromExt(
  extension: { tiles: Record<string, { q: number; r: number }> },
  tileId: string,
  size = 1
): [number, number] | undefined {
  const t = extension.tiles[tileId] as { q: number; r: number } | undefined;
  if (!t) return undefined;
  return axialToWorld(t.q, t.r, size);
}

// Default hex size (radius). Exported so rendering and layout can share the same scale.
// Matches the base radius of the tile geometry so edges meet without gaps
export const DEFAULT_HEX_SIZE = 0.51;
