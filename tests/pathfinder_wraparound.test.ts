import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialState } from '../src/contexts/game-provider';
import { computePath } from '../src/game/pathfinder';

describe('computePath wrap-around', () => {
  it('allows wrapping horizontally across edges', () => {
    let s = initialState();
    s.map.width = 3;
    s.map.height = 1;
    s = applyAction(s, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'a', q: 0, r: 0, biome: 'grassland' } },
    });
    s = applyAction(s, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'b', q: 1, r: 0, biome: 'grassland' } },
    });
    s = applyAction(s, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'c', q: 2, r: 0, biome: 'grassland' } },
    });
    s = applyAction(s, {
      type: 'EXT_ADD_UNIT',
      payload: { unitId: 'u1', type: 'warrior', ownerId: 'P', tileId: 'a' },
    });
    const res = computePath(s.contentExt!, 'u1', 'c', s.map.width, s.map.height);
    if ('path' in res && res.path) {
      expect(res.path).toEqual(['a', 'c']);
      expect(res.totalCost).toBe(1);
    } else {
      throw new Error('path not found');
    }
  });
});
