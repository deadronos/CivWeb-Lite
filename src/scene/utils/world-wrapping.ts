/**
 * World wrapping utilities for seamless cylindrical world experience.
 * Implements left/right wrapping with camera teleportation and edge rendering.
 */

import { DEFAULT_HEX_SIZE } from './coords';

export interface WrappingConfig {
  /** Width of the world in tiles */
  worldWidth: number;
  /** Height of the world in tiles */
  worldHeight: number;
  /** How many columns to render beyond edges for seamless wrapping */
  wrapBuffer: number;
  /** Camera teleport threshold (world units from edge) */
  teleportThreshold: number;
}

export const DEFAULT_WRAPPING_CONFIG: WrappingConfig = {
  worldWidth: 106, // Default medium map
  worldHeight: 66,
  wrapBuffer: 5, // Render 5 extra columns on each side
  teleportThreshold: 10, // Teleport when camera gets within 10 units of edge
};

/**
 * Calculate world boundaries for wrapping system
 */
export function getWorldBounds(config: WrappingConfig, hexSize = DEFAULT_HEX_SIZE) {
  const leftEdge = 0;
  const rightEdge = hexSize * (3 / 2) * (config.worldWidth - 1);
  const worldSpan = rightEdge - leftEdge;
  
  return {
    leftEdge,
    rightEdge,
    worldSpan,
    wrapBufferWidth: hexSize * (3 / 2) * config.wrapBuffer,
  };
}

/**
 * Generate wrapped tile positions - original tiles plus wrapped edge columns
 */
export function generateWrappedPositions(
  originalPositions: Array<[number, number, number]>,
  tiles: Array<{ coord: { q: number; r: number } }>,
  config: WrappingConfig,
  hexSize = DEFAULT_HEX_SIZE
): Array<[number, number, number]> {
  const { worldSpan, wrapBufferWidth } = getWorldBounds(config, hexSize);
  const wrappedPositions = [...originalPositions];

  // Add left wrap buffer - render rightmost columns on the left side
  for (let q = config.worldWidth - config.wrapBuffer; q < config.worldWidth; q++) {
    for (let r = 0; r < config.worldHeight; r++) {
      const tileIndex = tiles.findIndex(t => t.coord.q === q && t.coord.r === r);
      if (tileIndex >= 0) {
        const [origX, origY, origZ] = originalPositions[tileIndex];
        // Shift to left side
        wrappedPositions.push([origX - worldSpan - hexSize * (3 / 2), origY, origZ]);
      }
    }
  }

  // Add right wrap buffer - render leftmost columns on the right side  
  for (let q = 0; q < config.wrapBuffer; q++) {
    for (let r = 0; r < config.worldHeight; r++) {
      const tileIndex = tiles.findIndex(t => t.coord.q === q && t.coord.r === r);
      if (tileIndex >= 0) {
        const [origX, origY, origZ] = originalPositions[tileIndex];
        // Shift to right side
        wrappedPositions.push([origX + worldSpan + hexSize * (3 / 2), origY, origZ]);
      }
    }
  }

  return wrappedPositions;
}

/**
 * Generate wrapped biome groups with edge duplication
 */
export function generateWrappedBiomeGroups(
  originalBiomeGroups: Array<{
    positions: Array<[number, number, number]>;
    elevations: number[];
    color: string;
    colors?: string[];
    biome: string;
    variantIndex: number;
    hexCoords: Array<{ q: number; r: number }>;
  }>,
  tiles: Array<{ coord: { q: number; r: number }; biome: any }>,
  config: WrappingConfig,
  hexSize = DEFAULT_HEX_SIZE
) {
  const { worldSpan } = getWorldBounds(config, hexSize);
  const wrappedGroups = originalBiomeGroups.map(group => ({
    ...group,
    positions: [...group.positions],
    elevations: [...group.elevations],
    colors: group.colors ? [...group.colors] : undefined,
    hexCoords: [...group.hexCoords],
  }));

  // Create lookup for quick tile access
  const tileMap = new Map();
  tiles.forEach((tile, index) => {
    tileMap.set(`${tile.coord.q},${tile.coord.r}`, { tile, index });
  });

  // Add wrapped positions to existing biome groups
  originalBiomeGroups.forEach((group, groupIndex) => {
    // Left wrap buffer - add rightmost columns on left side
    for (let q = config.worldWidth - config.wrapBuffer; q < config.worldWidth; q++) {
      for (let r = 0; r < config.worldHeight; r++) {
        const tileKey = `${q},${r}`;
        const tileData = tileMap.get(tileKey);
        if (tileData && String(tileData.tile.biome).toLowerCase() === group.biome) {
          const origIndex = group.positions.findIndex(([x]) => 
            Math.abs(x - hexSize * (3 / 2) * q) < 0.1
          );
          if (origIndex >= 0) {
            const [origX, origY, origZ] = group.positions[origIndex];
            wrappedGroups[groupIndex].positions.push([
              origX - worldSpan - hexSize * (3 / 2), 
              origY, 
              origZ
            ]);
            wrappedGroups[groupIndex].elevations.push(group.elevations[origIndex]);
            wrappedGroups[groupIndex].hexCoords.push(group.hexCoords[origIndex]);
            if (group.colors) {
              wrappedGroups[groupIndex].colors!.push(group.colors[origIndex]);
            }
          }
        }
      }
    }

    // Right wrap buffer - add leftmost columns on right side
    for (let q = 0; q < config.wrapBuffer; q++) {
      for (let r = 0; r < config.worldHeight; r++) {
        const tileKey = `${q},${r}`;
        const tileData = tileMap.get(tileKey);
        if (tileData && String(tileData.tile.biome).toLowerCase() === group.biome) {
          const origIndex = group.positions.findIndex(([x]) => 
            Math.abs(x - hexSize * (3 / 2) * q) < 0.1
          );
          if (origIndex >= 0) {
            const [origX, origY, origZ] = group.positions[origIndex];
            wrappedGroups[groupIndex].positions.push([
              origX + worldSpan + hexSize * (3 / 2), 
              origY, 
              origZ
            ]);
            wrappedGroups[groupIndex].elevations.push(group.elevations[origIndex]);
            wrappedGroups[groupIndex].hexCoords.push(group.hexCoords[origIndex]);
            if (group.colors) {
              wrappedGroups[groupIndex].colors!.push(group.colors[origIndex]);
            }
          }
        }
      }
    }
  });

  return wrappedGroups;
}

/**
 * Check if camera needs to be teleported and return new position
 */
export function checkCameraTeleport(
  cameraX: number,
  config: WrappingConfig,
  hexSize = DEFAULT_HEX_SIZE
): number | null {
  const { leftEdge, rightEdge, worldSpan } = getWorldBounds(config, hexSize);

  // If camera is too far left, teleport to right side
  if (cameraX < leftEdge - config.teleportThreshold) {
    return cameraX + worldSpan + hexSize * (3 / 2);
  }

  // If camera is too far right, teleport to left side
  if (cameraX > rightEdge + config.teleportThreshold) {
    return cameraX - worldSpan - hexSize * (3 / 2);
  }

  return null; // No teleport needed
}

/**
 * Calculate wrapped camera position for smooth movement
 */
export function wrapCameraPosition(
  cameraX: number,
  config: WrappingConfig,
  hexSize = DEFAULT_HEX_SIZE
): number {
  const { worldSpan } = getWorldBounds(config, hexSize);
  
  // Normalize camera position to the main world bounds
  while (cameraX < 0) {
    cameraX += worldSpan;
  }
  while (cameraX > worldSpan) {
    cameraX -= worldSpan;
  }
  
  return cameraX;
}