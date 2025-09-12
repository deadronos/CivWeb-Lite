/**
 * @file This file contains world wrapping utilities for a seamless cylindrical world experience.
 */

import { DEFAULT_HEX_SIZE } from './coords';

/**
 * Represents the configuration for world wrapping.
 * @property worldWidth - The width of the world in tiles.
 * @property worldHeight - The height of the world in tiles.
 * @property wrapBuffer - The number of columns to render beyond the edges for seamless wrapping.
 * @property teleportThreshold - The camera teleport threshold in world units from the edge.
 */
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

/**
 * The default configuration for world wrapping.
 */
export const DEFAULT_WRAPPING_CONFIG: WrappingConfig = {
  worldWidth: 106, // Default medium map
  worldHeight: 66,
  wrapBuffer: 50, // Render a couple of extra columns for edge stitching
  teleportThreshold: 10, // Teleport when camera gets within 10 units of edge
};

/**
 * Calculates the world boundaries for the wrapping system.
 * @param config - The wrapping configuration.
 * @param hexSize - The size of the hexes.
 * @returns An object containing the world boundaries.
 */
export function getWorldBounds(config: WrappingConfig, hexSize = DEFAULT_HEX_SIZE) {
  const leftEdge = 0;
  // Horizontal spacing between axial columns in pointy-top layout is √3 * size
  const rightEdge = Math.sqrt(3) * hexSize * (config.worldWidth - 1);
  const worldSpan = rightEdge - leftEdge;

  return {
    leftEdge,
    rightEdge,
    worldSpan,
    // Width spanned by the buffer columns on either side
    wrapBufferWidth: Math.sqrt(3) * hexSize * config.wrapBuffer,
  };
}

/**
 * Gets the exact horizontal wrap delta for pointy-top axial layout.
 * @param config - The wrapping configuration.
 * @param hexSize - The size of the hexes.
 * @returns The horizontal wrap delta.
 */
export function getHorizontalWrapDelta(config: WrappingConfig, hexSize = DEFAULT_HEX_SIZE) {
  return Math.sqrt(3) * hexSize * config.worldWidth;
}

/**
 * Generates wrapped tile positions, including the original tiles and the wrapped edge columns.
 * @param originalPositions - The original tile positions.
 * @param tiles - The array of tiles.
 * @param config - The wrapping configuration.
 * @param hexSize - The size of the hexes.
 * @returns An array of wrapped tile positions.
 */
export function generateWrappedPositions(
  originalPositions: Array<[number, number, number]>,
  tiles: Array<{ coord: { q: number; r: number } }>,
  config: WrappingConfig,
  hexSize = DEFAULT_HEX_SIZE
): Array<[number, number, number]> {
  // Precompute wrap distance for duplicating edge columns
  const wrapDelta = getHorizontalWrapDelta(config, hexSize);
  const wrappedPositions = [...originalPositions];

  // Add left wrap buffer - render rightmost columns on the left side
  for (let q = config.worldWidth - config.wrapBuffer; q < config.worldWidth; q++) {
    for (let r = 0; r < config.worldHeight; r++) {
      const tileIndex = tiles.findIndex((t) => t.coord.q === q && t.coord.r === r);
      if (tileIndex >= 0) {
        const [origX, origY, origZ] = originalPositions[tileIndex];
        // Shift to left side by exact wrap delta
        wrappedPositions.push([origX - wrapDelta, origY, origZ]);
      }
    }
  }

  // Add right wrap buffer - render leftmost columns on the right side
  for (let q = 0; q < config.wrapBuffer; q++) {
    for (let r = 0; r < config.worldHeight; r++) {
      const tileIndex = tiles.findIndex((t) => t.coord.q === q && t.coord.r === r);
      if (tileIndex >= 0) {
        const [origX, origY, origZ] = originalPositions[tileIndex];
        // Shift to right side by exact wrap delta
        wrappedPositions.push([origX + wrapDelta, origY, origZ]);
      }
    }
  }

  return wrappedPositions;
}

/**
 * Generates wrapped biome groups with edge duplication.
 * @param originalBiomeGroups - The original biome groups.
 * @param tiles - The array of tiles.
 * @param config - The wrapping configuration.
 * @param hexSize - The size of the hexes.
 * @returns An array of wrapped biome groups.
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
  const wrapDelta = getHorizontalWrapDelta(config, hexSize);
  const wrappedGroups = originalBiomeGroups.map((group) => ({
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
          // Find the exact original index by (q,r) match instead of approximate X
          const origIndex = group.hexCoords.findIndex((h) => h.q === q && h.r === r);
          if (origIndex >= 0) {
            const [origX, origY, origZ] = group.positions[origIndex];
            wrappedGroups[groupIndex].positions.push([origX - wrapDelta, origY, origZ]);
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
          const origIndex = group.hexCoords.findIndex((h) => h.q === q && h.r === r);
          if (origIndex >= 0) {
            const [origX, origY, origZ] = group.positions[origIndex];
            wrappedGroups[groupIndex].positions.push([origX + wrapDelta, origY, origZ]);
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
 * Checks if the camera needs to be teleported and returns the new position.
 * @param cameraX - The current x-coordinate of the camera.
 * @param config - The wrapping configuration.
 * @param hexSize - The size of the hexes.
 * @returns The new x-coordinate of the camera, or null if no teleport is needed.
 */
export function checkCameraTeleport(
  cameraX: number,
  config: WrappingConfig,
  hexSize = DEFAULT_HEX_SIZE
): number | null {
  const { leftEdge, rightEdge } = getWorldBounds(config, hexSize);
  const wrapDelta = getHorizontalWrapDelta(config, hexSize);

  // If camera is too far left, teleport to right side
  if (cameraX < leftEdge - config.teleportThreshold) {
    return cameraX + wrapDelta;
  }

  // If camera is too far right, teleport to left side
  if (cameraX > rightEdge + config.teleportThreshold) {
    return cameraX - wrapDelta;
  }

  return null; // No teleport needed
}

/**
 * Calculates the wrapped camera position for smooth movement.
 * @param cameraX - The current x-coordinate of the camera.
 * @param config - The wrapping configuration.
 * @param hexSize - The size of the hexes.
 * @returns The wrapped x-coordinate of the camera.
 */
export function wrapCameraPosition(
  cameraX: number,
  config: WrappingConfig,
  hexSize = DEFAULT_HEX_SIZE
): number {
  const wrapDelta = getHorizontalWrapDelta(config, hexSize);

  // Normalize camera position to the main world bounds
  while (cameraX < 0) {
    cameraX += wrapDelta;
  }
  while (cameraX > wrapDelta) {
    cameraX -= wrapDelta;
  }

  return cameraX;
}
