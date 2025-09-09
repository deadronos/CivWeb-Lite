export function axialToWorld(q: number, r: number): [number, number] {
  const x = q + (r % 2) * 0.5;
  const z = r * 0.8660254037844386; // sqrt(3)/2
  return [x, z];
}

export function tileIdToWorldFromExt(ext: { tiles: Record<string, { q: number; r: number }> }, tileId: string): [number, number] | null {
  const t = ext.tiles[tileId] as { q: number; r: number } | undefined;
  if (!t) return null;
  return axialToWorld(t.q, t.r);
}
