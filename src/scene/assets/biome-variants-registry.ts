// Simple registry for biome mesh variants. When Blender assets are available,
// populate BIOME_VARIANTS[biome] with entries providing geometry/material.
// Keeping this separate lets the scene detect variants without changing code.

/**
 * @file This file contains a simple registry for biome mesh variants.
 */

/**
 * Represents a biome variant definition.
 * @property name - The name of the variant.
 * @property geometry - The geometry of the variant.
 * @property material - The material of the variant.
 */
export type BiomeVariantDef = {
  name: string;
  // geometry/material are optional for now; when present the scene can switch
  // from cylinder to the provided BufferGeometry/Material.
  geometry?: any; // THREE.BufferGeometry
  material?: any; // THREE.Material
};

/**
 * A record of biome variants, indexed by biome name.
 */
export const BIOME_VARIANTS: Record<string, BiomeVariantDef[]> = {
  // Use game biome keys from BiomeType (see src/game/types.ts) e.g., 'grass', 'forest', ...
  grass: [{ name: 'v0' }, { name: 'v1' }, { name: 'v2' }],
};

/**
 * Gets the number of variants for a given biome.
 * @param biome - The name of the biome.
 * @returns The number of variants.
 */
export function getVariantCount(biome: string): number {
  const list = BIOME_VARIANTS[biome];
  return Array.isArray(list) ? list.length : 0;
}

/**
 * Sets the assets for a biome variant.
 * @param biome - The name of the biome.
 * @param index - The index of the variant.
 * @param geometry - The geometry of the variant.
 * @param material - The material of the variant.
 */
export function setVariantAssets(biome: string, index: number, geometry: any, material: any) {
  const list = BIOME_VARIANTS[biome] || (BIOME_VARIANTS[biome] = []);
  if (!list[index]) list[index] = { name: `v${index}` } as BiomeVariantDef;
  list[index].geometry = geometry;
  list[index].material = material;
}

/**
 * Gets the assets for a biome variant.
 * @param biome - The name of the biome.
 * @param index - The index of the variant.
 * @returns An object containing the geometry and material, or null if not found.
 */
export function getVariantAssets(
  biome: string,
  index: number
): { geometry: any; material: any } | null {
  const v = BIOME_VARIANTS[biome]?.[index];
  if (v && v.geometry && v.material) return { geometry: v.geometry, material: v.material };
  return null;
}
