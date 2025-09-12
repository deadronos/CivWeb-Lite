import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from '../src/test-utils/game-provider';

// Hex axial distance helper, mirrors game logic
function hexDistance(a: { q: number; r: number }, b: { q: number; r: number }) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

describe('Starting spawn separation', () => {
  it('ensures players start at least N hexes apart', () => {
    const width = 24;
    const height = 24;
    const totalPlayers = 4;

    const state = initialStateForTests();
    const newState = applyAction(state, {
      type: 'NEW_GAME' as const,
      payload: {
        seed: 'spawn-distance',
        width,
        height,
        totalPlayers,
        humanPlayers: 1,
      },
    });

    const extension = newState.contentExt!;

    // Collect one representative spawn tile per player (first unit location)
    const spawnByPlayer: Record<string, string> = {};
    for (const u of Object.values(extension.units)) {
      if (!spawnByPlayer[u.ownerId]) {
        spawnByPlayer[u.ownerId] = String(u.location);
      }
    }

    // Expect an entry for each player
    expect(Object.keys(spawnByPlayer).length).toBe(totalPlayers);

    const minDistance = Math.max(4, Math.floor(Math.min(width, height) / 4));

    const entries = Object.entries(spawnByPlayer);
    for (let index = 0; index < entries.length; index++) {
      const [, aId] = entries[index];
      const aTile = newState.map.tiles.find((t) => t.id === aId)!;
      for (let index_ = index + 1; index_ < entries.length; index_++) {
        const [, bId] = entries[index_];
        const bTile = newState.map.tiles.find((t) => t.id === bId)!;
        const distribution = hexDistance({ q: aTile.coord.q, r: aTile.coord.r }, {
          q: bTile.coord.q,
          r: bTile.coord.r,
        });
        expect(distribution).toBeGreaterThanOrEqual(minDistance);
      }
    }
  });
});

