import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests as initialState } from '../src/test-utils/game-provider';

function setupCity() {
  let state = initialState();
  state = applyAction(state, {
    type: 'EXT_ADD_TILE',
    payload: { tile: { id: 't1', q: 0, r: 0, biome: 'grassland' } },
  });
  state = applyAction(state, {
    type: 'EXT_ADD_CITY',
    payload: { cityId: 'c1', name: 'C1', ownerId: 'P1', tileId: 't1' },
  });
  return state;
}

describe('player production queue actions', () => {
  it('reorders and cancels production orders', () => {
    let s = setupCity();
    s = applyAction(s, { type: 'CHOOSE_PRODUCTION_ITEM', payload: { cityId: 'c1', order: { type: 'unit', item: 'warrior' } } });
    s = applyAction(s, { type: 'CHOOSE_PRODUCTION_ITEM', payload: { cityId: 'c1', order: { type: 'building', item: 'granary' } } });
    const city = s.contentExt!.cities['c1'];
    expect(city.productionQueue.length).toBe(2);
    // reorder
    s = applyAction(s, {
      type: 'REORDER_PRODUCTION_QUEUE',
      payload: {
        cityId: 'c1',
        reorderedQueue: [
          { type: 'unit', item: 'warrior' },
          { type: 'building', item: 'granary' },
        ],
      },
    });
    expect(s.contentExt!.cities['c1'].productionQueue[0].item).toBe('warrior');
    // cancel
    s = applyAction(s, { type: 'CANCEL_PRODUCTION_ORDER', payload: { cityId: 'c1', orderIndex: 0 } });
    expect(s.contentExt!.cities['c1'].productionQueue[0].item).toBe('granary');
  });
});
