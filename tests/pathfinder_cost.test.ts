import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialState } from "../src/contexts/game-provider";
import { computePath } from '../src/game/pathfinder';

describe('computePath totalCost', () => {
  it('computes cost across grassland chain', () => {
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
    const res = computePath(s.contentExt!, 'u1', 'c', s.map.width, s.map.height);
    if ('path' in res && res.path) {
      expect(res.path[0]).toBe('a');
      expect(res.path.at(-1)).toBe('c');
      expect(res.totalCost).toBe(2);
    } else {
      throw new Error('path not found');
    }
  });
});