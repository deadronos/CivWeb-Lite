import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from '../src/test-utils/game-provider';
import { BiomeType } from '../src/game/types';

describe('Unit Spawn Terrain Validation', () => {
  it('should spawn units on suitable terrain (not ice/ocean)', () => {
    const state = initialStateForTests();

    // Create a NEW_GAME action to trigger unit spawning
    const newGameAction = {
      type: 'NEW_GAME' as const,
      payload: {
        seed: 'test-spawn',
        width: 20,
        height: 20,
        totalPlayers: 2,
        humanPlayers: 1,
        selectedLeaders: ['random', 'random'],
      },
    };

    const newState = applyAction(state, newGameAction);

    // Check that players were created
    expect(newState.players).toHaveLength(2);

    // Check that units were spawned
    const extension = newState.contentExt;
    expect(extension).toBeDefined();

    const units = Object.values(extension!.units);
    expect(units.length).toBeGreaterThan(0);

    // Verify that all units are spawned on suitable terrain
    for (const unit of units) {
      const location =
        typeof unit.location === 'string' ? unit.location : `${unit.location.q},${unit.location.r}`;
      const tile = extension!.tiles[location];

      expect(tile).toBeDefined();

      // Check that unit is not spawned on ice, ocean, or mountain
      expect(tile.biome).not.toBe('ocean');
      expect(tile.biome).not.toBe('ice');
      expect(tile.biome).not.toBe('mountain');

      // Verify it's on valid terrain
      expect(['grassland', 'forest', 'desert', 'tundra']).toContain(tile.biome);
    }
  });

  it('should spawn units near intended corners when suitable terrain is available', () => {
    const state = initialStateForTests();

    const newGameAction = {
      type: 'NEW_GAME' as const,
      payload: {
        seed: 'test-corners',
        width: 16,
        height: 16,
        totalPlayers: 4,
        humanPlayers: 1,
      },
    };

    const newState = applyAction(state, newGameAction);
    const extension = newState.contentExt!;
    const units = Object.values(extension.units);

    // Should have units for all players
    expect(units.length).toBeGreaterThan(0);

    // Group units by owner
    const unitsByOwner: Record<string, any[]> = {};
    for (const unit of units) {
      if (!unitsByOwner[unit.ownerId]) {
        unitsByOwner[unit.ownerId] = [];
      }
      unitsByOwner[unit.ownerId].push(unit);
    }

    // Each player should have units
    expect(Object.keys(unitsByOwner).length).toBe(4);

    // Verify units are reasonably spread out (not all in the same location)
    const locations = new Set();
    for (const unit of units) {
      const location =
        typeof unit.location === 'string' ? unit.location : `${unit.location.q},${unit.location.r}`;
      locations.add(location);
    }

    // Should have at least as many locations as players (could be more if units spawn separately)
    expect(locations.size).toBeGreaterThanOrEqual(4);
  });
});
