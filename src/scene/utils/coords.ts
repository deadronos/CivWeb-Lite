/**
 * Convert axial hex coordinates (q, r) to world X/Z plane coordinates.
 * Orientation: flat-top hexes (flat sides on top/bottom).
 *
 * Projection: Cylindrical world layout (modified for seamless wrapping)
 *  - Creates evenly spaced columns for cylindrical world wrapping
 *  - Removes the odd-q offset to ensure columns align vertically
 *  - Maintains axial math (neighbors, distance, pathfinding) unchanged
 *
 * Formulas (flat-top, cylindrical):
 *   worldX = size * 3/2 * q
 *   worldZ = size * sqrt(3) * r
 *
 * `size` is the hex radius (distance from center to any corner).
 */
export function axialToWorld(q: number, r: number, size = 1): [number, number] {
  const worldX = size * (3 / 2) * q;
  const worldZ = size * Math.sqrt(3) * r;
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
export const DEFAULT_HEX_SIZE = 0.5;
