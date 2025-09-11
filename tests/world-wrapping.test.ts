import { describe, it, expect } from 'vitest';
import { 
  getWorldBounds, 
  generateWrappedPositions, 
  checkCameraTeleport,
  DEFAULT_WRAPPING_CONFIG 
} from '../src/scene/utils/world-wrapping';

describe('world wrapping', () => {
  const config = { ...DEFAULT_WRAPPING_CONFIG, worldWidth: 10, worldHeight: 8 };
  
  it('calculates world bounds correctly', () => {
    const bounds = getWorldBounds(config, 0.5);
    expect(bounds.leftEdge).toBe(0);
    expect(bounds.rightEdge).toBe(0.5 * (3 / 2) * 9); // (width - 1) * spacing
    expect(bounds.worldSpan).toBeGreaterThan(0);
  });

  it('generates wrapped positions', () => {
    const originalPositions: Array<[number, number, number]> = [
      [0, 0, 0],    // q=0, r=0
      [0.75, 0, 0], // q=1, r=0  
      [1.5, 0, 0],  // q=2, r=0
    ];
    
    const tiles = [
      { coord: { q: 0, r: 0 } },
      { coord: { q: 1, r: 0 } },
      { coord: { q: 2, r: 0 } },
    ];

    const wrappedPositions = generateWrappedPositions(originalPositions, tiles, config, 0.5);
    
    // Should have original positions plus wrapped edge positions
    expect(wrappedPositions.length).toBeGreaterThan(originalPositions.length);
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