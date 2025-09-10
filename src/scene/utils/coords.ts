/**
 * Convert axial hex coordinates (q, r) to world X/Z plane coordinates.
 * Orientation: flat-top hexes (flat sides on top/bottom).
 *
 * Projection: odd-q offset layout (flat-top)
 *  - Makes the rendered map bounds visually rectangular (no shear),
 *    by offsetting every odd q column by +0.5 in the vertical (Z) axis.
 *  - Keeps axial math (neighbors, distance, pathfinding) unchanged.
 *
 * Formulas (flat-top, odd-q):
 *   worldX = size * 3/2 * q
 *   worldZ = size * sqrt(3) * (r + 0.5 * (q & 1))
 *
 * `size` is the hex radius (distance from center to any corner).
 */
export function axialToWorld(q: number, r: number, size = 1): [number, number] {
  const worldX = size * (3 / 2) * q;
  const worldZ = size * Math.sqrt(3) * (r + 0.5 * (q & 1));
  return [worldX, worldZ];
}

export function tileIdToWorldFromExt(
  extension: { tiles: Record<string, { q: number; r: number }> },
  tileId: string,
  size = 1
): [number, number] | null {
  const t = extension.tiles[tileId] as { q: number; r: number } | undefined;
  if (!t) return null;
  return axialToWorld(t.q, t.r, size);
}

// Default hex size (radius). Exported so rendering and layout can share the same scale.
export const DEFAULT_HEX_SIZE = 0.5;
