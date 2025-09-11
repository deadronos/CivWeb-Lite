import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from '../src/contexts/game-provider';
import { BiomeType } from '../src/game/types';

describe('Unit Spawn Terrain Detailed Testing', () => {
  it('should spawn units on different suitable terrain types (demonstrates fix)', () => {
    // Test with multiple seeds to get different terrain patterns
    const seeds = ['ice-test-1', 'ocean-test-2', 'mountain-test-3', 'mixed-terrain-4'];
    
    for (const seed of seeds) {
      const state = initialStateForTests();
      
      const newGameAction = {
        type: 'NEW_GAME' as const,
        payload: {
          seed,
          width: 24,
          height: 24,
          totalPlayers: 4,
          humanPlayers: 1,
        }
      };
      
      const newState = applyAction(state, newGameAction);
      const extension = newState.contentExt!;
      const units = Object.values(extension.units);
      
      // Verify we have units
      expect(units.length).toBeGreaterThan(0);
      
      // Check each unit's spawn terrain
      for (const unit of units) {
        const location = typeof unit.location === 'string' ? unit.location : `${unit.location.q},${unit.location.r}`;
        const tile = extension.tiles[location];
        
        expect(tile).toBeDefined();
        
        // This is the key test: verify units are NOT spawned on problematic terrain
        expect(tile.biome).not.toBe('ocean');
        expect(tile.biome).not.toBe('ice');
        expect(tile.biome).not.toBe('mountain');
        
        // Verify they ARE on valid terrain
        expect(['grassland', 'forest', 'desert', 'tundra']).toContain(tile.biome);
        
        console.log(`Seed ${seed}: Unit ${unit.id} spawned on ${tile.biome} at ${location}`);
      }
    }
  });

  it('should find appropriate spawn positions even when preferred corners have bad terrain', () => {
    // Use a specific seed that's likely to have ice/ocean at corners
    const state = initialStateForTests();
    
    const newGameAction = {
      type: 'NEW_GAME' as const,
      payload: {
        seed: 'polar-world-test',
        width: 20,
        height: 20,
        totalPlayers: 2,
        humanPlayers: 1,
      }
    };
    
    const newState = applyAction(state, newGameAction);
    
    // Verify the world was created
    expect(newState.map.tiles.length).toBeGreaterThan(0);
    
    // Check what terrain types exist in the world
    const biomeCount: Record<string, number> = {};
    for (const tile of newState.map.tiles) {
      biomeCount[tile.biome] = (biomeCount[tile.biome] || 0) + 1;
    }
    
    console.log('Biome distribution:', biomeCount);
    
    // Verify units were spawned despite potentially challenging terrain
    const extension = newState.contentExt!;
    const units = Object.values(extension.units);
    
    expect(units.length).toBeGreaterThan(0);
    
    // All units should be on valid terrain
    for (const unit of units) {
      const location = typeof unit.location === 'string' ? unit.location : `${unit.location.q},${unit.location.r}`;
      const tile = extension.tiles[location];
      
      expect(['grassland', 'forest', 'desert', 'tundra']).toContain(tile.biome);
    }
  });
});