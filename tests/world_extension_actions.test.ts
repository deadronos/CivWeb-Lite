import { describe, expect, it } from 'vitest';
import type { GameAction } from '../src/game/actions';
import { applyAction } from '../src/game/reducer';
import type { Civic } from '../src/game/content/types';
import type { ProductionOrder } from '../src/game/types/production';
import { initialStateForTests } from '../src/test-utils/game-provider';

type ActionOfType<T extends GameAction['type']> = Extract<GameAction, { type: T }>;

const addTile = (tile: {
  id: string;
  q: number;
  r: number;
  biome: string;
}): ActionOfType<'EXT_ADD_TILE'> => ({
  type: 'EXT_ADD_TILE',
  payload: { tile },
});

const addCity = (city: {
  cityId: string;
  name: string;
  ownerId: string;
  tileId: string;
}): ActionOfType<'EXT_ADD_CITY'> => ({
  type: 'EXT_ADD_CITY',
  payload: city,
});

const queueProduction = (input: {
  cityId: string;
  order: ProductionOrder;
}): ActionOfType<'EXT_QUEUE_PRODUCTION'> => ({
  type: 'EXT_QUEUE_PRODUCTION',
  payload: input,
});

const beginResearch = (techId: string): ActionOfType<'EXT_BEGIN_RESEARCH'> => ({
  type: 'EXT_BEGIN_RESEARCH',
  payload: { techId },
});

const beginCivicResearch = (civicId: string): ActionOfType<'EXT_BEGIN_CULTURE_RESEARCH'> => ({
  type: 'EXT_BEGIN_CULTURE_RESEARCH',
  payload: { civicId },
});

const addUnit = (unit: {
  unitId: string;
  type: string;
  ownerId: string;
  tileId: string;
}): ActionOfType<'EXT_ADD_UNIT'> => ({
  type: 'EXT_ADD_UNIT',
  payload: unit,
});

const moveUnit = (unitId: string, toTileId: string): ActionOfType<'EXT_MOVE_UNIT'> => ({
  type: 'EXT_MOVE_UNIT',
  payload: { unitId, toTileId },
});

function withBasicCity() {
  let state = initialStateForTests();
  state = applyAction(state, addTile({ id: 't1', q: 0, r: 0, biome: 'grassland' }));
  state = applyAction(
    state,
    addCity({ cityId: 'c1', name: 'Capital', ownerId: 'P1', tileId: 't1' })
  );
  return state;
}

describe('world extension actions', () => {
  it('queues production with computed turns remaining', () => {
    let state = withBasicCity();
    state = applyAction(
      state,
      queueProduction({ cityId: 'c1', order: { type: 'unit', item: 'warrior' } })
    );

    const city = state.contentExt!.cities['c1'];
    expect(city.productionQueue.length).toBe(1);
    expect(city.productionQueue[0]).toMatchObject({
      type: 'unit',
      item: 'warrior',
    });
    expect(city.productionQueue[0].turnsRemaining).toBeGreaterThan(0);
  });

  it('begins technology research through extension action', () => {
    const state = applyAction(initialStateForTests(), beginResearch('agriculture'));

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
      } satisfies Civic,
    };

    const state = applyAction(base, beginCivicResearch('tradition'));

    expect(state.contentExt!.playerState.cultureResearch).toEqual({
      civicId: 'tradition',
      progress: 0,
    });
  });

  it('moves units between tiles via extension action', () => {
    let state = initialStateForTests();
    state = applyAction(state, addTile({ id: 'tile_a', q: 0, r: 0, biome: 'grassland' }));
    state = applyAction(state, addTile({ id: 'tile_b', q: 1, r: 0, biome: 'plains' }));
    state = applyAction(
      state,
      addUnit({ unitId: 'u1', type: 'warrior', ownerId: 'P1', tileId: 'tile_a' })
    );

    const moved = applyAction(state, moveUnit('u1', 'tile_b'));

    expect(moved.contentExt!.units['u1'].location).toBe('tile_b');
    expect(moved.contentExt!.tiles['tile_b'].occupantUnitId).toBe('u1');
    expect(moved.contentExt!.tiles['tile_a'].occupantUnitId).toBeNull();
  });
});
