import { GameState, PlayerState } from './types';
import { GameAction } from './actions';
import { produceNextState } from './state';
import { generateWorld } from './world/generate';
import { globalGameBus } from './events';
import { appendLog } from './logging';

function findPlayer(players: PlayerState[], id: string) {
  return players.find(p => p.id === id);
}

export function applyAction(state: GameState, action: GameAction): GameState {
  if (action.type === 'LOAD_STATE') {
    globalGameBus.emit('action:applied', { action });
    return Object.freeze(action.payload);
  }
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
        for (const player of draft.players) {
          if (player.researching) {
            const tech = draft.techCatalog.find(t => t.id === player.researching!.techId);
            if (tech) {
              const points = tech.tree === 'science' ? player.sciencePoints : player.culturePoints;
              player.researching.progress += points;
              if (player.researching.progress >= tech.cost) {
                player.researchedTechIds.push(tech.id);
                player.researching = null;
                globalGameBus.emit('tech:unlocked', { playerId: player.id, techId: tech.id });
              }
            }
          }
        }
        draft.turn += 1;
        globalGameBus.emit('turn:end', { turn: draft.turn });
        break;
      }
      case 'SET_RESEARCH': {
        const player = findPlayer(draft.players, action.playerId);
        if (player) {
          const tech = draft.techCatalog.find(t => t.id === action.payload.techId);
          if (tech && tech.prerequisites.every(p => player.researchedTechIds.includes(p))) {
            player.researching = { techId: tech.id, progress: 0 };
          }
        }
        break;
      }
      case 'ADVANCE_RESEARCH': {
        const player = findPlayer(draft.players, action.playerId);
        if (player && player.researching) {
          const points = action.payload?.points ?? 1;
          player.researching.progress += points;
          const tech = draft.techCatalog.find(t => t.id === player.researching.techId);
          if (tech && player.researching.progress >= tech.cost) {
            player.researchedTechIds.push(tech.id);
            player.researching = null;
            globalGameBus.emit('tech:unlocked', { playerId: player.id, techId: tech.id });
          }
        }
        break;
      }
      case 'AUTO_SIM_TOGGLE': {
        draft.autoSim = action.payload?.enabled ?? !draft.autoSim;
        break;
      }
      case 'LOG_EVENT': {
        appendLog(draft as any as GameState, action.payload.entry);
        break;
      }
      case 'RECORD_AI_PERF': {
        if (!draft.aiPerf) draft.aiPerf = { total: 0, count: 0 };
        draft.aiPerf.total += action.payload.duration;
        draft.aiPerf.count += 1;
        break;
      }
      default:
        break;
    }
    globalGameBus.emit('action:applied', { action });
  });
}
