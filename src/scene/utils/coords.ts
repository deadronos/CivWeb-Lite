/**
 * Convert axial hex coordinates (q, r) to world X/Z plane coordinates.
 * Orientation: flat-top hexes (flat sides on top/bottom).
 *
 * Projection: standard flat-top axial layout with vertical staggering.
 *  - Columns wrap horizontally for a cylindrical world.
 *  - Vertical coordinate uses an odd-q offset (r + (q & 1) / 2).
 *
 * Formulas (flat-top, cylindrical):
 *   worldX = size * 3/2 * q
 *   worldZ = size * sqrt(3) * (r + (q & 1) / 2)
 *
 * `size` is the hex radius (distance from center to any corner).
 */
export function axialToWorld(q: number, r: number, size = 1): [number, number] {
  const worldX = size * (3 / 2) * q;
  const worldZ = size * Math.sqrt(3) * (r + ((q & 1) ? 0.5 : 0));

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
export const DEFAULT_HEX_SIZE = 0.5;
