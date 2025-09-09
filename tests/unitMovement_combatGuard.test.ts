import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialState } from "..\\src\\contexts\\game-provider";

describe('issueMove combat guard', () => {
  it('blocks entering enemy tile unless confirmCombat is true', () => {
    let s = initialState();
    s = applyAction(s, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'a', q: 0, r: 0, biome: 'grassland' } }
    });
    s = applyAction(s, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'b', q: 1, r: 0, biome: 'grassland' } }
    });
    s = applyAction(s, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'c', q: 2, r: 0, biome: 'grassland' } }
    });
    s = applyAction(s, {
      type: 'EXT_ADD_CITY',
      payload: { cityId: 'home', name: 'H', ownerId: 'P', tileId: 'a' }
    });
    s = applyAction(s, {
      type: 'EXT_ADD_UNIT',
      payload: { unitId: 'u1', type: 'warrior', ownerId: 'P', tileId: 'a' }
    });
    // enemy unit occupying c
    s = applyAction(s, {
      type: 'EXT_ADD_UNIT',
      payload: { unitId: 'e1', type: 'warrior', ownerId: 'E', tileId: 'c' }
    });

    s = applyAction(s, {
      type: 'EXT_ISSUE_MOVE_PATH',
      payload: { unitId: 'u1', path: ['b', 'c'] }
    });
    expect(s.contentExt!.units['u1'].location).not.toBe('c');

    s = applyAction(s, {
      type: 'EXT_ISSUE_MOVE_PATH',
      payload: { unitId: 'u1', path: ['b', 'c'], confirmCombat: true }
    });
    // With confirm, it may proceed to c if movement allows
    expect(['b', 'c']).toContain(s.contentExt!.units['u1'].location);
  });
});