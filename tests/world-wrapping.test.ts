import { describe, it, expect } from 'vitest';
import {
  getWorldBounds,
  generateWrappedPositions,
  checkCameraTeleport,
  DEFAULT_WRAPPING_CONFIG
} from '../src/scene/utils/world-wrapping';
import { axialToWorld } from '../src/scene/utils/coords';

describe('world wrapping', () => {
  const config = { ...DEFAULT_WRAPPING_CONFIG, worldWidth: 10, worldHeight: 8 };
  
  it('calculates world bounds correctly', () => {
    const bounds = getWorldBounds(config, 0.5);
    expect(bounds.leftEdge).toBe(0);
    // (width - 1) * √3 * size
    expect(bounds.rightEdge).toBeCloseTo(0.5 * Math.sqrt(3) * 9);
    expect(bounds.worldSpan).toBeGreaterThan(0);
  });

  it('generates wrapped positions', () => {
    const size = 0.5;
    const positions: Array<[number, number, number]> = [];
    const tiles = [] as Array<{ coord: { q: number; r: number } }>;

    for (let q = 0; q < 3; q++) {
      const [x, z] = axialToWorld(q, 0, size);
      positions.push([x, 0, z]);
      tiles.push({ coord: { q, r: 0 } });
    }

    const wrappedPositions = generateWrappedPositions(positions, tiles, config, size);

    // Should have original positions plus wrapped edge positions
    expect(wrappedPositions.length).toBeGreaterThan(positions.length);
  });

  it('detects when camera needs teleporting', () => {
    const bounds = getWorldBounds(config, 0.5);
    
    // Camera too far left should need teleporting
    const teleportX = checkCameraTeleport(bounds.leftEdge - 15, config, 0.5);
    expect(teleportX).not.toBeNull();
    
    // Camera too far right should need teleporting
    const teleportX2 = checkCameraTeleport(bounds.rightEdge + 15, config, 0.5);
    expect(teleportX2).not.toBeNull();
    
    // Camera in normal range should not teleport
    const teleportX3 = checkCameraTeleport(bounds.rightEdge / 2, config, 0.5);
    expect(teleportX3).toBeNull();
  });
});