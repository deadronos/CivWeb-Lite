import { BiomeType } from '../types';

export interface BiomeRule {
  type: BiomeType;
  elevation: [number, number];
  moisture?: [number, number];
}

export const BIOME_RULES: BiomeRule[] = [
  { type: BiomeType.Ocean, elevation: [0, 0.3] },
  { type: BiomeType.Desert, elevation: [0.3, 0.6], moisture: [0, 0.4] },
  { type: BiomeType.Grassland, elevation: [0.3, 0.6], moisture: [0.4, 1] },
  { type: BiomeType.Tundra, elevation: [0.6, 0.8], moisture: [0, 0.4] },
  { type: BiomeType.Forest, elevation: [0.6, 0.8], moisture: [0.4, 1] },
  { type: BiomeType.Mountain, elevation: [0.8, 1] },
  // Polar cap helper (not used by the simple rule-based generator but kept for compatibility)
  { type: BiomeType.Ice, elevation: [0, 1] },
];

// Recommended rectangular sizes for a cylindrical world with polar caps.
// Due to flat-top axial projection, map bounding height grows with width
// (stagger term r + q/2). These presets keep the world wide while practical.
// Adjusted presets to feel less "thin" vertically and to align
// roughly with well-known Civ V/VI sizes (in tile counts), keeping
// a ~1.6 width:height ratio in tiles (not world units).
export const MAP_PRESETS = {
  small: { width: 80, height: 50 }, // ~4000 tiles
  medium: { width: 106, height: 66 }, // Civ VI-ish large (≈6996 tiles)
  large: { width: 128, height: 80 }, // Civ V huge (≈10240 tiles)
  xlarge: { width: 160, height: 100 }, // headroom for very large games
} as const;

export const DEFAULT_MAP_SIZE = MAP_PRESETS.medium;
