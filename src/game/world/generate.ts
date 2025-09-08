import { seedFrom, next, RNGState } from '../rng';
import { BiomeType, Tile } from '../types';
import { BIOME_RULES, DEFAULT_MAP_SIZE } from './config';

function pickBiome(elevation: number, moisture: number): BiomeType {
  for (const rule of BIOME_RULES) {
    if (
      elevation >= rule.elevation[0] &&
      elevation < rule.elevation[1] &&
      (!rule.moisture ||
        (moisture >= rule.moisture[0] && moisture < rule.moisture[1]))
    ) {
      return rule.type;
    }
  }
  return BiomeType.Grassland;
}

export function generateWorld(
  seed: string | RNGState,
  width = DEFAULT_MAP_SIZE.width,
  height = DEFAULT_MAP_SIZE.height,
): { tiles: Tile[]; state: RNGState } {
  let rng = typeof seed === 'string' ? seedFrom(seed) : seed;
  const tiles: Tile[] = [];
  for (let r = 0; r < height; r++) {
    for (let q = 0; q < width; q++) {
      const elevOut = next(rng);
      rng = elevOut.state;
      const elevation = elevOut.value;
      const moistOut = next(rng);
      rng = moistOut.state;
      const moisture = moistOut.value;
      const biome = pickBiome(elevation, moisture);
      tiles.push({
        id: `${q},${r}`,
        coord: { q, r },
        biome,
        elevation,
        moisture,
        exploredBy: [],
      });
    }
  }
  return { tiles, state: rng };
}
