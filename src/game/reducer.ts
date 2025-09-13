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
  OPEN_DEV_PANEL: uiReducer,
  CLOSE_DEV_PANEL: uiReducer,
  PREVIEW_PATH: uiReducer,
  ISSUE_MOVE: uiReducer,

  // Player actions
  SET_RESEARCH: playerReducer,
  ADVANCE_RESEARCH: playerReducer,
  QUEUE_RESEARCH: playerReducer,
  SWITCH_RESEARCH_POLICY: playerReducer,
  CHOOSE_PRODUCTION_ITEM: playerReducer,
  REORDER_PRODUCTION_QUEUE: playerReducer,
  CANCEL_PRODUCTION_ORDER: playerReducer,
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
  // Test-only: allow external tests to set previewPath directly
  EXT_SET_PREVIEW: (draft: Draft<GameState>, action: GameAction) => {
    const p = (action as any).payload?.path as string[] | undefined;
    if (!draft.ui) draft.ui = { openPanels: {} } as any;
    draft.ui.previewPath = p && Array.isArray(p) ? p : undefined;
  },
  FORTIFY_UNIT: worldReducer, // Route FORTIFY_UNIT to worldReducer for state addition
  MOVE_UNIT: worldReducer,

  // Lifecycle actions
  INIT: lifecycleReducer,
  NEW_GAME: lifecycleReducer,
  AUTO_SIM_TOGGLE: lifecycleReducer,
  LOG_EVENT: lifecycleReducer,
};

export function applyAction(state: GameState, action: GameAction): GameState {
  if (action.type === 'LOAD_STATE') {
    globalGameBus.emit('action:applied', { action });
    return Object.freeze(action.payload as GameState);
  }

  return produceNextState(state, (draft) => {
    const reducer = actionReducerMap[action.type];
    if (reducer) {
      reducer(draft, action);
    }
  });
}
