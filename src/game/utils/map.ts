import { BiomeType, Tile } from '../types';
import { GameStateExtension } from '../content/types';

export function mapBiome(b: BiomeType): string {
  switch (b) {
    case BiomeType.Grassland: {
      return 'grassland';
    }
    case BiomeType.Forest: {
      return 'forest';
    }
    case BiomeType.Desert: {
      return 'desert';
    }
    case BiomeType.Tundra: {
      return 'tundra';
    }
    case BiomeType.Mountain: {
      return 'mountain';
    }
    case BiomeType.Ocean: {
      return 'ocean';
    }
    case BiomeType.Ice: {
  return 'snow';
    }
    default: {
      return 'grassland';
    }
  }
}

export function populateExtensionTiles(extension: GameStateExtension, tiles: Tile[]) {
  extension.tiles = {};
  for (const t of tiles) {
    extension.tiles[t.id] = {
      id: t.id,
      q: t.coord.q,
      r: t.coord.r,
      biome: mapBiome(t.biome),
      elevation: t.elevation,
      features: [],
      improvements: [],
      occupantUnitId: null,
      occupantCityId: null,
      passable: true,
    } as any;
  }
}

// Helper function to check if a biome is suitable for unit spawning
export function isSuitableSpawnTerrain(biome: BiomeType): boolean {
  switch (biome) {
    case BiomeType.Grassland:
    case BiomeType.Forest:
    case BiomeType.Desert:
    case BiomeType.Tundra: {
      return true;
    }
    case BiomeType.Ocean:
    case BiomeType.Ice:
    case BiomeType.Mountain: {
      return false;
    }
    default: {
      return false;
    }
  }
}

// Helper function to find a suitable spawn position near a preferred location
export function findSuitableSpawnPosition(
  tiles: Tile[],
  preferredQ: number,
  preferredR: number,
  width: number,
  height: number,
  searchRadius: number = 5
): string | null {
  // First try the preferred position
  const preferredTile = tiles.find((t) => t.coord.q === preferredQ && t.coord.r === preferredR);
  if (preferredTile && isSuitableSpawnTerrain(preferredTile.biome)) {
    return preferredTile.id;
  }

  // Search in expanding circles around the preferred position
  for (let radius = 1; radius <= searchRadius; radius++) {
    const candidates: Tile[] = [];

    // Find all tiles at this radius that are suitable
    for (const tile of tiles) {
      const dq = tile.coord.q - preferredQ;
      const dr = tile.coord.r - preferredR;
      const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));

      if (distance === radius && isSuitableSpawnTerrain(tile.biome)) {
        candidates.push(tile);
      }
    }

    if (candidates.length > 0) {
      // Prefer grassland and forest over other suitable terrain
      const preferred = candidates.filter(
        (t) => t.biome === BiomeType.Grassland || t.biome === BiomeType.Forest
      );

      if (preferred.length > 0) {
        return preferred[0].id;
      }

      // Return any suitable terrain if no preferred terrain found
      return candidates[0].id;
    }
  }

  // Fallback: return any suitable tile if nothing found in search radius
  const fallback = tiles.find((t) => isSuitableSpawnTerrain(t.biome));  
  return fallback ? fallback.id : null;
}
