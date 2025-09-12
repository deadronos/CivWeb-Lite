import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests as initialState } from '../src/test-utils/game-provider';
import { computePath } from '../src/game/pathfinder';

describe('computePath combat preview', () => {
  it('returns combatPreview when goal is enemy-occupied', () => {
    let s = initialState();
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
      type: 'EXT_ADD_CITY',
      payload: { cityId: 'home', name: 'H', ownerId: 'P', tileId: 'a' },
    });
    s = applyAction(s, {
      type: 'EXT_ADD_UNIT',
      payload: { unitId: 'u1', type: 'warrior', ownerId: 'P', tileId: 'a' },
    });
    s = applyAction(s, {
      type: 'EXT_ADD_UNIT',
      payload: { unitId: 'e1', type: 'warrior', ownerId: 'E', tileId: 'c' },
    });

    const res: any = computePath(s.contentExt!, 'u1', 'c', s.map.width, s.map.height);
    expect(res.path).toBeTruthy();
    expect(res.totalCost).toBeGreaterThanOrEqual(2);
    expect(res.combatPreview).toBeTruthy();
    expect(res.combatPreview.requiresConfirm).toBe(true);
    expect(res.combatPreview.tileId).toBe('c');
  });
});
