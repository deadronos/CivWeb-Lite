import { Draft } from 'immer';
import { GameState } from './types';
import { GameAction } from './actions';
import { produceNextState } from './state';
import { globalGameBus } from './events';
import { uiReducer } from './reducers/ui';
import { playerReducer } from './reducers/player';
import { turnReducer } from './reducers/turn';
import { worldReducer } from './reducers/world';
import { lifecycleReducer } from './reducers/lifecycle';

const actionReducerMap: { [key: string]: (draft: Draft<GameState>, action: GameAction) => void } = {
  // UI actions
  SELECT_UNIT: uiReducer,
  CANCEL_SELECTION: uiReducer,
  OPEN_CITY_PANEL: uiReducer,
  CLOSE_CITY_PANEL: uiReducer,
  OPEN_RESEARCH_PANEL: uiReducer,
  CLOSE_RESEARCH_PANEL: uiReducer,
  PREVIEW_PATH: uiReducer,
  ISSUE_MOVE: uiReducer,

  // Player actions
  SET_RESEARCH: playerReducer,
  ADVANCE_RESEARCH: playerReducer,
  QUEUE_RESEARCH: playerReducer,
  CHOOSE_PRODUCTION_ITEM: playerReducer,
  SET_PLAYER_SCORES: playerReducer,

  // Turn actions
  END_TURN: turnReducer,
  AI_PERFORM_ACTIONS: turnReducer,
  RECORD_AI_PERF: turnReducer,

  // World actions
  SET_TILE_IMPROVEMENT: worldReducer,
  REMOVE_TILE_IMPROVEMENT: worldReducer,
  SET_CITY_TILE: worldReducer,
  ADD_UNIT_STATE: worldReducer,
  REMOVE_UNIT_STATE: worldReducer,
  SET_UNIT_LOCATION: worldReducer,
  EXT_ADD_TILE: worldReducer,
  EXT_ADD_UNIT: worldReducer,
  EXT_ADD_CITY: worldReducer,
  EXT_FOUND_CITY: worldReducer,
  EXT_ISSUE_MOVE_PATH: worldReducer,
  FORTIFY_UNIT: worldReducer, // Route FORTIFY_UNIT to worldReducer for state addition

  // Lifecycle actions
  INIT: lifecycleReducer,
  NEW_GAME: lifecycleReducer,
  AUTO_SIM_TOGGLE: lifecycleReducer,
  LOG_EVENT: lifecycleReducer,
};

export function applyAction(state: GameState, action: GameAction): GameState {
  if (action.type === 'LOAD_STATE') {
    globalGameBus.emit('action:applied', { action });
    return Object.freeze(action.payload);
  }

  return produceNextState(state, (draft) => {
    const reducer = actionReducerMap[action.type];
    if (reducer) {
      reducer(draft, action);
    }
  });
}

switch (action.type) {
  // ...existing cases...

  case 'INIT': {
    // Add Idle state to all units on init/turn start
    const updatedUnits = state.units ? state.units.map(unit => ({
      ...unit,
      activeStates: new Set([...(unit.activeStates || new Set()), 'idle'])
    })) : state.units;

    return {
      ...state,
      units: updatedUnits,
      // ...other INIT logic if any...
    };
  }

  // ...existing cases...
}
