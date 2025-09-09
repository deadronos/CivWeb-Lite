import { GameState, PlayerState } from './types';
import leadersCatalog from '../data/leaders.json';
import { GameAction } from './actions';
import { produceNextState } from './state';
import { generateWorld } from './world/generate';
import { globalGameBus } from './events';
import {
  endTurn as contentEndTurn,
  beginResearch as extensionBeginResearch,
  beginCultureResearch as extensionBeginCulture,
  moveUnit as extensionMoveUnit,
} from './content/rules';
import { createEmptyState as createContentExtension } from './content/engine';
import { UNIT_TYPES } from './content/registry';

function findPlayer(players: PlayerState[], id: string) {
  return players.find((p) => p.id === id);
}

export function applyAction(state: GameState, action: GameAction): GameState {
  if (action.type === 'LOAD_STATE') {
    globalGameBus.emit('action:applied', { action });
    return Object.freeze(action.payload);
  }
  return produceNextState(state, (draft) => {
    switch (action.type) {
      case 'LOG_EVENT': {
        // append log entry with cap (50)
        const entry = (action.payload as any)?.entry;
        if (entry) {
          draft.log.push(entry);
          if (draft.log.length > 50) draft.log.splice(0, draft.log.length - 50);
        }
        break;
      }
      case 'SET_RESEARCH': {
        const playerId = (action as any).playerId as string;
        const techId = (action as any).payload?.techId as string | undefined;
        if (!playerId || !techId) break;
        const player = findPlayer(draft.players, playerId);
        const tech = draft.techCatalog.find((t) => t.id === techId);
        if (!player || !tech) break;
        const hasPrereqs = (tech.prerequisites || []).every((p: string) =>
          player.researchedTechIds?.includes(p)
        );
        if (!hasPrereqs) break;
        player.researching = { techId, progress: 0 } as any;
        break;
      }
      case 'ADVANCE_RESEARCH': {
        const playerId = (action as any).playerId as string;
        const pts = (action as any).payload?.points as number | undefined;
        if (!playerId) break;
        const player = findPlayer(draft.players, playerId);
        if (!player || !player.researching) break;
        const tech = draft.techCatalog.find((t) => t.id === player.researching!.techId);
        if (!tech) break;
        const add = typeof pts === 'number' ? pts : (player.sciencePoints ?? 0);
        player.researching.progress = (player.researching.progress ?? 0) + add;
        if (player.researching.progress >= tech.cost) {
          if (!player.researchedTechIds) player.researchedTechIds = [] as any;
          player.researchedTechIds.push(tech.id);
          player.researching = null as any;
          globalGameBus.emit('tech:unlocked', { playerId: player.id, techId: tech.id });
        }
        break;
      }
      case 'INIT': {
        const seed = action.payload?.seed ?? draft.seed;
        const width = action.payload?.width ?? draft.map.width;
        const height = action.payload?.height ?? draft.map.height;
        draft.seed = seed;
        const world = generateWorld(seed, width, height);
        draft.map = { width, height, tiles: world.tiles };
        draft.rngState = world.state;
        // ensure extension state exists
        if (!draft.contentExt) draft.contentExt = createContentExtension();
        globalGameBus.emit('turn:start', { turn: draft.turn });
        break;
      }
      case 'NEW_GAME': {
        const seed = action.payload.seed ?? draft.seed ?? 'default';
        const width = action.payload.width ?? draft.map.width;
        const height = action.payload.height ?? draft.map.height;
        // Reset core state
        draft.turn = 0;
        draft.seed = seed;
        const world = generateWorld(seed, width, height);
        draft.map = { width, height, tiles: world.tiles };
        draft.rngState = world.state;
        // Players
        const total = Math.max(1, Math.min(6, action.payload.totalPlayers));
        const humans = Math.max(0, Math.min(total, action.payload.humanPlayers ?? 1));
        draft.players = [] as PlayerState[];
        // small deterministic hash from seed for leader randomization fallback
        const hash = (string_: string) =>
          [...string_].reduce((a, c) => (a + c.charCodeAt(0)) >>> 0, 0);
        const chosen = action.payload.selectedLeaders ?? [];
        for (let index = 0; index < total; index++) {
          const isHuman = index < humans;
          const pickId = chosen[index];
          let leaderDef: any | undefined;
          if (pickId && pickId !== 'random') {
            leaderDef = (leadersCatalog as any[]).find((l) => l.id === pickId);
          }
          if (!leaderDef) {
            const index_ = (hash(seed) + index) % (leadersCatalog as any[]).length >>> 0;
            leaderDef = (leadersCatalog as any[])[index_];
          }
          const mappedLeader = {
            id: leaderDef.id,
            name: leaderDef.name,
            aggression: leaderDef.weights?.aggression ?? 0.5,
            scienceFocus: leaderDef.weights?.science ?? 0.5,
            cultureFocus: leaderDef.weights?.culture ?? 0.5,
            expansionism: leaderDef.weights?.expansion ?? 0.5,
            historicalNote: leaderDef.historical_note,
            preferredVictory: leaderDef.preferred_victory,
          } as PlayerState['leader'];
          draft.players.push({
            id: `P${index + 1}`,
            isHuman,
            leader: mappedLeader,
            researchedTechIds: [],
            researching: null as any,
            sciencePoints: 0,
            culturePoints: 0,
          } as PlayerState);
        }
        // Content extension reset
        draft.contentExt = createContentExtension();
        const extension = draft.contentExt;
        // Spawn starting units per player: 1 Settler + 1 Warrior near corners/diagonal
        const startPositions = (index: number): string => {
          const pad = 2;
          const q = index % 2 === 0 ? pad : Math.max(pad, width - pad - 1);
          const r = index < 2 ? pad : Math.max(pad, height - pad - 1);
          return `${q},${r}`;
        };
        for (let index = 0; index < draft.players.length; index++) {
          const ownerId = draft.players[index].id;
          const tileId = startPositions(index);
          // ensure tile exists in ext store and mark passable
          if (!extension.tiles[tileId]) {
            extension.tiles[tileId] = {
              id: tileId,
              q: Number.parseInt(tileId.split(',')[0]!, 10),
              r: Number.parseInt(tileId.split(',')[1]!, 10),
              biome: 'grassland',
              elevation: 0.1,
              features: [],
              improvements: [],
              occupantUnitId: null,
              occupantCityId: null,
              passable: true,
            } as any;
          }
          // add warrior
          const wId = `u_${ownerId}_warrior`;
          extension.units[wId] = {
            id: wId,
            type: 'warrior',
            ownerId,
            location: tileId,
            hp: 100,
            movement: 2,
            movementRemaining: 2,
            attack: 6,
            defense: 4,
            sight: 2,
            state: 'idle',
            abilities: [],
          } as any;
          // add settler
          const sId = `u_${ownerId}_settler`;
          extension.units[sId] = {
            id: sId,
            type: 'settler',
            ownerId,
            location: tileId,
            hp: 100,
            movement: 2,
            movementRemaining: 2,
            attack: 0,
            defense: 0,
            sight: 2,
            state: 'idle',
            abilities: [],
          } as any;
        }
        globalGameBus.emit('action:applied', { action });
        break;
      }
      case 'END_TURN': {
        for (const player of draft.players) {
          if (player.researching) {
            const tech = draft.techCatalog.find((t) => t.id === player.researching!.techId);
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
          const extension = draft.contentExt;
          extension.playerState.science = Object.keys(extension.cities).length;
          contentEndTurn(extension);
        }
        draft.turn += 1;
        globalGameBus.emit('turn:end', { turn: draft.turn });
        break;
      }
      case 'AUTO_SIM_TOGGLE': {
        // payload may be { enabled?: boolean } or absent -> toggle
        const enabled =
          action.payload && typeof (action.payload as any).enabled === 'boolean'
            ? (action.payload as any).enabled
            : undefined;
        draft.autoSim = typeof enabled === 'boolean' ? enabled : !draft.autoSim;
        break;
      }
      case 'EXT_BEGIN_RESEARCH': {
        if (!draft.contentExt) draft.contentExt = createContentExtension();
        extensionBeginResearch(draft.contentExt, action.payload.techId);
        break;
      }
      case 'EXT_BEGIN_CULTURE_RESEARCH': {
        if (!draft.contentExt) draft.contentExt = createContentExtension();
        extensionBeginCulture(draft.contentExt, action.payload.civicId);
        break;
      }
      case 'EXT_QUEUE_PRODUCTION': {
        const extension = (draft.contentExt ||= createContentExtension());
        const city = extension.cities[action.payload.cityId];
        if (city) {
          city.productionQueue.push({
            type: action.payload.order.type,
            item: action.payload.order.item,
            turnsRemaining: action.payload.order.turns,
          });
        }
        break;
      }
      case 'EXT_ADD_TILE': {
        const extension = (draft.contentExt ||= createContentExtension());
        const { id, q, r, biome } = action.payload.tile as any;
        extension.tiles[id] = {
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
        const extension = (draft.contentExt ||= createContentExtension());
        const { cityId, name, ownerId, tileId } = action.payload;
        if (!extension.tiles[tileId]) {
          extension.tiles[tileId] = {
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
        extension.cities[cityId] = {
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
        extension.tiles[tileId].occupantCityId = cityId;
        break;
      }
      case 'EXT_ADD_UNIT': {
        const extension = (draft.contentExt ||= createContentExtension());
        const { unitId, type, ownerId, tileId } = action.payload;
        const def = UNIT_TYPES[type];
        if (def) {
          extension.units[unitId] = {
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
          if (!extension.tiles[tileId]) {
            extension.tiles[tileId] = {
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
      case 'EXT_ISSUE_MOVE_PATH': {
        const extension = (draft.contentExt ||= createContentExtension());
        const u = extension.units[action.payload.unitId];
  if (u && action.payload.path && action.payload.path.length > 0) {
          const enemyAt = (tileId: string): boolean => {
            const t = extension.tiles[tileId];
            if (!t) return false;
            if (t.occupantCityId) {
              const c = extension.cities[t.occupantCityId];
              if (c && c.ownerId !== u.ownerId) return true;
            }
            for (const other of Object.values(extension.units)) {
              if (other.id !== u.id && other.location === tileId && other.ownerId !== u.ownerId)
                return true;
            }
            return false;
          };
          for (const tid of action.payload.path) {
            if (enemyAt(tid) && !action.payload.confirmCombat) {
              break; // require confirmCombat to proceed into enemy tile
            }
            const before = u.location;
            const ok = extensionMoveUnit(extension, u.id, tid);
            if (!ok) break;
            if (u.location === before) break; // no progress safeguard
          }
        }
        break;
      }
      case 'RECORD_AI_PERF': {
        if (!draft.aiPerf) draft.aiPerf = { total: 0, count: 0 };
        draft.aiPerf.total += action.payload.duration;
        draft.aiPerf.count += 1;
        break;
      }
      default: {
        break;
      }
    }
    globalGameBus.emit('action:applied', { action });
  });
}
