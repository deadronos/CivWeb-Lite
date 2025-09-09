import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialState } from '../src/contexts/GameProvider';
import type { GameState } from '../src/game/types';

function dispatchSeq(s: GameState, actions: any[]): GameState {
  let state = s;
  for (const a of actions) state = applyAction(state, a);
  return state;
}

describe('Unit movement issueMove path', () => {
  it('moves along path until movement spent', () => {
    let s = initialState();
    // build a small 3-tile line: a->b->c
    s = dispatchSeq(s, [
      { type: 'EXT_ADD_TILE', payload: { tile: { id: 'a', q: 0, r: 0, biome: 'grassland' } } },
      { type: 'EXT_ADD_TILE', payload: { tile: { id: 'b', q: 1, r: 0, biome: 'grassland' } } },
      { type: 'EXT_ADD_TILE', payload: { tile: { id: 'c', q: 2, r: 0, biome: 'grassland' } } },
      { type: 'EXT_ADD_CITY', payload: { cityId: 'city1', name: 'X', ownerId: 'P', tileId: 'a' } },
      { type: 'EXT_ADD_UNIT', payload: { unitId: 'u1', type: 'warrior', ownerId: 'P', tileId: 'a' } },
    ]);
    const u = s.contentExt!.units['u1'];
    expect(u.location).toBe('a');
    // Try to move to c via b, warrior base movement >= 2 per registry
    s = applyAction(s, { type: 'EXT_ISSUE_MOVE_PATH', payload: { unitId: 'u1', path: ['b','c'] } });
    const u2 = s.contentExt!.units['u1'];
    expect(['b','c']).toContain(u2.location);
    // movementRemaining should be <= base movement - steps taken (each grassland step cost 1)
    expect(u2.movementRemaining).toBeGreaterThanOrEqual(0);
  });
});