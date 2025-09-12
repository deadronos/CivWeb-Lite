import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests as initialState } from '../src/test-utils/game-provider';
import { UnitState } from '../src/types/unit';

function dispatchSeq(s, actions) {
  let state = s;
  for (const a of actions) state = applyAction(state, a);
  return state;
}

describe('unit state actions', () => {
  it('adds and removes states on units', () => {
    let state = initialState();
    state = dispatchSeq(state, [
      { type: 'EXT_ADD_TILE', payload: { tile: { id: 't1', q: 0, r: 0, biome: 'grassland' } } },
      { type: 'EXT_ADD_UNIT', payload: { unitId: 'u1', type: 'warrior', ownerId: 'p1', tileId: 't1' } },
    ]);
    state = applyAction(state, { type: 'ADD_UNIT_STATE', payload: { unitId: 'u1', state: UnitState.Moved } });
    let unit = state.contentExt!.units['u1'];
    expect(unit.activeStates.has(UnitState.Moved)).toBe(true);
    state = applyAction(state, { type: 'ADD_UNIT_STATE', payload: { unitId: 'u1', state: UnitState.Fortified } });
    unit = state.contentExt!.units['u1'];
    expect(unit.activeStates.has(UnitState.Moved)).toBe(true);
    expect(unit.activeStates.has(UnitState.Fortified)).toBe(true);
    state = applyAction(state, { type: 'REMOVE_UNIT_STATE', payload: { unitId: 'u1', state: UnitState.Moved } });
    unit = state.contentExt!.units['u1'];
    expect(unit.activeStates.has(UnitState.Moved)).toBe(false);
    expect(unit.activeStates.has(UnitState.Fortified)).toBe(true);
  });
});
