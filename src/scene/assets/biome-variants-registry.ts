// Simple registry for biome mesh variants. When Blender assets are available,
// populate BIOME_VARIANTS[biome] with entries providing geometry/material.
// Keeping this separate lets the scene detect variants without changing code.

export type BiomeVariantDef = {
  name: string;
  // geometry/material are optional for now; when present the scene can switch
  // from cylinder to the provided BufferGeometry/Material.
  geometry?: any; // THREE.BufferGeometry
  material?: any; // THREE.Material
};

export const BIOME_VARIANTS: Record<string, BiomeVariantDef[]> = {
  // Predeclare grass variants; geometry/material can be attached later by loader.
  grass: [{ name: 'v1' }, { name: 'v2' }, { name: 'v3' }],
};

export function getVariantCount(biome: string): number {
  const list = BIOME_VARIANTS[biome];
  return Array.isArray(list) ? list.length : 0;
}
