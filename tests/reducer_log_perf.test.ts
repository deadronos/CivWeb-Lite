import { applyAction } from '../src/game/reducer';
import { GameState } from '../src/game/types';
import { GameAction } from '../src/game/actions';

describe('reducer log and perf', () => {
  function base(): GameState {
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
      aiPerf: { total: 0, count: 0 },
    };
  }

  test('records log events with cap', () => {
    let state = base();
    for (let index = 0; index < 55; index++) {
      const action: GameAction = {
        type: 'LOG_EVENT',
        payload: { entry: { timestamp: index, turn: 0, type: 't' } },
      };
      state = applyAction(state, action);
    }
    expect(state.log.length).toBe(50);
  });

  test('records ai performance duration', () => {
    let state = base();
    const action: GameAction = { type: 'RECORD_AI_PERF', payload: { duration: 5 } };
    state = applyAction(state, action);
    expect(state.aiPerf?.total).toBe(5);
    expect(state.aiPerf?.count).toBe(1);
  });
});
