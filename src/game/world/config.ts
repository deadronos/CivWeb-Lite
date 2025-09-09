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

export const DEFAULT_MAP_SIZE = { width: 30, height: 30 };
