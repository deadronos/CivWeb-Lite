import { describe, expect, it } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from '../src/test-utils/game-provider';

function withBasicCity() {
  let state = initialStateForTests();
  state = applyAction(state, {
    type: 'EXT_ADD_TILE',
    payload: { tile: { id: 't1', q: 0, r: 0, biome: 'grassland' } },
  } as any);
  state = applyAction(state, {
    type: 'EXT_ADD_CITY',
    payload: { cityId: 'c1', name: 'Capital', ownerId: 'P1', tileId: 't1' },
  } as any);
  return state;
}

describe('world extension actions', () => {
  it('queues production with computed turns remaining', () => {
    let state = withBasicCity();
    state = applyAction(state, {
      type: 'EXT_QUEUE_PRODUCTION',
      payload: { cityId: 'c1', order: { type: 'unit', item: 'warrior' } },
    } as any);

    const city = state.contentExt!.cities['c1'];
    expect(city.productionQueue.length).toBe(1);
    expect(city.productionQueue[0]).toMatchObject({
      type: 'unit',
      item: 'warrior',
    });
    expect(city.productionQueue[0].turnsRemaining).toBeGreaterThan(0);
  });

  it('begins technology research through extension action', () => {
    const state = applyAction(initialStateForTests(), {
      type: 'EXT_BEGIN_RESEARCH',
      payload: { techId: 'agriculture' },
    } as any);

    expect(state.contentExt!.playerState.research).toEqual({ techId: 'agriculture', progress: 0 });
  });

  it('begins civic research through extension action', () => {
    const base = initialStateForTests();
    base.contentExt!.civics = {
      tradition: {
        id: 'tradition',
        name: 'Tradition',
        description: '',
        cost: 5,
        prerequisites: [],
        unlocks: {},
      } as any,
    };

    const state = applyAction(base, {
      type: 'EXT_BEGIN_CULTURE_RESEARCH',
      payload: { civicId: 'tradition' },
    } as any);

    expect(state.contentExt!.playerState.cultureResearch).toEqual({
      civicId: 'tradition',
      progress: 0,
    });
  });

  it('moves units between tiles via extension action', () => {
    let state = initialStateForTests();
    state = applyAction(state, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'tile_a', q: 0, r: 0, biome: 'grassland' } },
    } as any);
    state = applyAction(state, {
      type: 'EXT_ADD_TILE',
      payload: { tile: { id: 'tile_b', q: 1, r: 0, biome: 'plains' } },
    } as any);
    state = applyAction(state, {
      type: 'EXT_ADD_UNIT',
      payload: { unitId: 'u1', type: 'warrior', ownerId: 'P1', tileId: 'tile_a' },
    } as any);

    const moved = applyAction(state, {
      type: 'EXT_MOVE_UNIT',
      payload: { unitId: 'u1', toTileId: 'tile_b' },
    } as any);

    expect(moved.contentExt!.units['u1'].location).toBe('tile_b');
    expect(moved.contentExt!.tiles['tile_b'].occupantUnitId).toBe('u1');
    expect(moved.contentExt!.tiles['tile_a'].occupantUnitId).toBeNull();
  });
});
