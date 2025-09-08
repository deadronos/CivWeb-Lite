import { GameState, PlayerState } from './types';
import { GameAction } from './actions';
import { produceNextState } from './state';
import { generateWorld } from './world/generate';
import { globalGameBus } from './events';

function findPlayer(players: PlayerState[], id: string) {
  return players.find(p => p.id === id);
}

export function applyAction(state: GameState, action: GameAction): GameState {
  return produceNextState(state, draft => {
    switch (action.type) {
      case 'INIT': {
        const seed = action.payload?.seed ?? draft.seed;
        const width = action.payload?.width ?? draft.map.width;
        const height = action.payload?.height ?? draft.map.height;
        draft.seed = seed;
        const world = generateWorld(seed, width, height);
        draft.map = { width, height, tiles: world.tiles };
        draft.rngState = world.state;
        globalGameBus.emit('turn:start', { turn: draft.turn });
        break;
      }
      case 'END_TURN': {
        draft.turn += 1;
        globalGameBus.emit('turn:end', { turn: draft.turn });
        break;
      }
      case 'SET_RESEARCH': {
        const player = findPlayer(draft.players, action.playerId);
        if (player) {
          player.researching = { techId: action.payload.techId, progress: 0 };
        }
        break;
      }
      case 'ADVANCE_RESEARCH': {
        const player = findPlayer(draft.players, action.playerId);
        if (player && player.researching) {
          const points = action.payload?.points ?? 1;
          player.researching.progress += points;
        }
        break;
      }
      case 'AUTO_SIM_TOGGLE': {
        draft.autoSim = action.payload?.enabled ?? !draft.autoSim;
        break;
      }
      default:
        break;
    }
    globalGameBus.emit('action:applied', { action });
  });
}
