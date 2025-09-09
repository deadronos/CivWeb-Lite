import { GameState, PlayerState } from './types';
import { GameAction } from './actions';
import { produceNextState } from './state';
import { generateWorld } from './world/generate';
import { globalGameBus } from './events';
import { appendLog } from './logging';
import { endTurn as contentEndTurn, beginResearch as extBeginResearch, moveUnit as extMoveUnit } from './content/rules';
import { createEmptyState as createContentExt } from './content/engine';
import { UNIT_TYPES } from './content/registry';

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
        // ensure extension state exists
        if (!draft.contentExt) draft.contentExt = createContentExt();
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
        // Drive spec content extension per-turn: science equals number of cities
        if (draft.contentExt) {
          const ext = draft.contentExt;
          ext.playerState.science = Object.keys(ext.cities).length;
          contentEndTurn(ext);
        }
        draft.turn += 1;
        globalGameBus.emit('turn:end', { turn: draft.turn });
        break;
      }
      case 'EXT_BEGIN_RESEARCH': {
        if (!draft.contentExt) draft.contentExt = createContentExt();
        extBeginResearch(draft.contentExt, action.payload.techId);
        break;
      }
      case 'EXT_QUEUE_PRODUCTION': {
        const ext = (draft.contentExt ||= createContentExt());
        const city = ext.cities[action.payload.cityId];
        if (city) {
          city.productionQueue.push({ type: action.payload.order.type, item: action.payload.order.item, turnsRemaining: action.payload.order.turns });
        }
        break;
      }
      case 'EXT_ADD_TILE': {
        const ext = (draft.contentExt ||= createContentExt());
        const { id, q, r, biome } = action.payload.tile as any;
        ext.tiles[id] = {
          id,
          q,
          r,
          biome,
          elevation: 0.1,
          features: [],
          improvements: [],
          occupantUnitId: null,
          occupantCityId: null,
          passable: true,
        };
        break;
      }
      case 'EXT_ADD_CITY': {
        const ext = (draft.contentExt ||= createContentExt());
        const { cityId, name, ownerId, tileId } = action.payload;
        if (!ext.tiles[tileId]) {
          ext.tiles[tileId] = {
            id: tileId,
            q: 0,
            r: 0,
            biome: 'grassland',
            elevation: 0.1,
            features: [],
            improvements: [],
            occupantUnitId: null,
            occupantCityId: null,
            passable: true,
          };
        }
        ext.cities[cityId] = {
          id: cityId,
          name,
          ownerId,
          location: tileId,
          population: 1,
          productionQueue: [],
          tilesWorked: [tileId],
          garrisonUnitIds: [],
          happiness: 0,
        };
        ext.tiles[tileId].occupantCityId = cityId;
        break;
      }
      case 'EXT_ADD_UNIT': {
        const ext = (draft.contentExt ||= createContentExt());
        const { unitId, type, ownerId, tileId } = action.payload;
        const def = UNIT_TYPES[type];
        if (def) {
          ext.units[unitId] = {
            id: unitId,
            type,
            ownerId,
            location: tileId,
            hp: def.base.hp ?? 100,
            movement: def.base.movement,
            movementRemaining: def.base.movement,
            attack: def.base.attack,
            defense: def.base.defense,
            sight: def.base.sight,
            state: 'idle',
            abilities: def.abilities ?? [],
          };
          if (!ext.tiles[tileId]) {
            ext.tiles[tileId] = {
              id: tileId,
              q: 0,
              r: 0,
              biome: 'grassland',
              elevation: 0.1,
              features: [],
              improvements: [],
              occupantUnitId: null,
              occupantCityId: null,
              passable: true,
            };
          }
        }
        break;
      }
      case 'EXT_MOVE_UNIT': {
        const ext = (draft.contentExt ||= createContentExt());
        extMoveUnit(ext, action.payload.unitId, action.payload.toTileId);
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
