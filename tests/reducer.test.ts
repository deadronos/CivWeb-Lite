import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { GameState } from '../src/game/types';
import { GameAction } from '../src/game/actions';

function makeState(): GameState {
  return {
    schemaVersion: 1,
    seed: 's',
    turn: 0,
    map: { width: 1, height: 1, tiles: [] },
    players: [],
    techCatalog: [],
    rngState: undefined,
    log: [],
    mode: 'standard',
    autoSim: false,
  };
}

describe('applyAction', () => {
  it('increments turn immutably', () => {
    const state = makeState();
    const action: GameAction = { type: 'END_TURN' };
    const next = applyAction(state, action);
    expect(next.turn).toBe(1);
    expect(state.turn).toBe(0);
    expect(Object.isFrozen(next)).toBe(true);
  });
});
