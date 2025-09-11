import { GameState, PlayerState, BiomeType, Tile } from './types';
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
import { computePath } from './pathfinder';

function findPlayer(players: PlayerState[], id: string) {
  return players.find((p) => p.id === id);
}

// Helper function to check if a biome is suitable for unit spawning
function isSuitableSpawnTerrain(biome: BiomeType): boolean {
  switch (biome) {
    case BiomeType.Grassland:
    case BiomeType.Forest:
    case BiomeType.Desert:
    case BiomeType.Tundra:
      return true;
    case BiomeType.Ocean:
    case BiomeType.Ice:
    case BiomeType.Mountain:
      return false;
    default:
      return false;
  }
}

// Helper function to find a suitable spawn position near a preferred location
function findSuitableSpawnPosition(
  tiles: Tile[],
  preferredQ: number,
  preferredR: number,
  width: number,
  height: number,
  searchRadius: number = 5
): string | null {
  // First try the preferred position
  const preferredTile = tiles.find((t) => t.coord.q === preferredQ && t.coord.r === preferredR);
  if (preferredTile && isSuitableSpawnTerrain(preferredTile.biome)) {
    return preferredTile.id;
  }

  // Search in expanding circles around the preferred position
  for (let radius = 1; radius <= searchRadius; radius++) {
    const candidates: Tile[] = [];

    // Find all tiles at this radius that are suitable
    for (const tile of tiles) {
      const dq = tile.coord.q - preferredQ;
      const dr = tile.coord.r - preferredR;
      const distance = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));

      if (distance === radius && isSuitableSpawnTerrain(tile.biome)) {
        candidates.push(tile);
      }
    }

    if (candidates.length > 0) {
      // Prefer grassland and forest over other suitable terrain
      const preferred = candidates.filter(
        (t) => t.biome === BiomeType.Grassland || t.biome === BiomeType.Forest
      );

      if (preferred.length > 0) {
        return preferred[0].id;
      }

      // Return any suitable terrain if no preferred terrain found
      return candidates[0].id;
    }
  }

  // Fallback: return any suitable tile if nothing found in search radius
  const fallback = tiles.find((t) => isSuitableSpawnTerrain(t.biome));
  return fallback ? fallback.id : null;
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
        // Reset UI state to clear any stale selections
        draft.ui = {
          openPanels: {},
        };
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
        // Spawn starting units per player: 1 Settler + 1 Warrior near corners/diagonal on suitable terrain
        const findStartPosition = (index: number): string | null => {
          const pad = 2;
          const preferredQ = index % 2 === 0 ? pad : Math.max(pad, width - pad - 1);
          const preferredR = index < 2 ? pad : Math.max(pad, height - pad - 1);
          return findSuitableSpawnPosition(draft.map.tiles, preferredQ, preferredR, width, height);
        };

        for (let index = 0; index < draft.players.length; index++) {
          const ownerId = draft.players[index].id;
          const tileId = findStartPosition(index);

          if (!tileId) {
            console.warn(`Could not find suitable spawn position for player ${ownerId}`);
            continue; // Skip this player if no suitable position found
          }

          // Find the actual tile from the map to get its real biome
          const mapTile = draft.map.tiles.find((t) => t.id === tileId);
          if (!mapTile) {
            console.warn(`Map tile ${tileId} not found for player ${ownerId}`);
            continue;
          }

          // Create or update tile in extension store based on the real map tile
          if (!extension.tiles[tileId]) {
            extension.tiles[tileId] = {
              id: tileId,
              q: mapTile.coord.q,
              r: mapTile.coord.r,
              biome:
                mapTile.biome === BiomeType.Grassland
                  ? 'grassland'
                  : mapTile.biome === BiomeType.Forest
                    ? 'forest'
                    : mapTile.biome === BiomeType.Desert
                      ? 'desert'
                      : mapTile.biome === BiomeType.Tundra
                        ? 'tundra'
                        : 'grassland',
              elevation: mapTile.elevation,
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
      // UI Interaction Actions
      case 'SELECT_UNIT': {
        draft.ui.selectedUnitId = action.payload.unitId;
        draft.ui.previewPath = undefined;
        // Emit event for UI components to listen to
        globalGameBus.emit('unit:selected', { unitId: action.payload.unitId });
        break;
      }
      case 'PREVIEW_PATH': {
        if (draft.contentExt && draft.ui.selectedUnitId) {
          const result = computePath(
            draft.contentExt, 
            draft.ui.selectedUnitId, 
            action.payload.targetTileId,
            draft.map.width,
            draft.map.height
          );
          draft.ui.previewPath = result.path || undefined;
        }
        break;
      }
      case 'ISSUE_MOVE': {
        if (draft.contentExt) {
          const { unitId, path, confirmCombat } = action.payload;
          const unit = draft.contentExt.units[unitId];
          if (unit && path.length > 0) {
            const extension = draft.contentExt;
            
            // Helper to check for enemies at a tile
            const enemyAt = (tileId: string): boolean => {
              const t = extension.tiles[tileId];
              if (!t) return false;
              if (t.occupantCityId) {
                const c = extension.cities[t.occupantCityId];
                if (c && c.ownerId !== unit.ownerId) return true;
              }
              for (const other of Object.values(extension.units)) {
                if (other.id !== unit.id && other.location === tileId && other.ownerId !== unit.ownerId)
                  return true;
              }
              return false;
            };
            
            // Move through the path step by step with proper validation
            let moved = false;
            for (const tileId of path) {
              if (enemyAt(tileId) && !confirmCombat) {
                break; // require confirmCombat to proceed into enemy tile
              }
              const before = unit.location;
              const ok = extensionMoveUnit(extension, unit.id, tileId);
              if (!ok) break;
              if (unit.location === before) break; // no progress safeguard
              moved = true;
            }
            
            if (moved) {
              globalGameBus.emit('actionAccepted', { 
                requestId: `move_${unitId}_${Date.now()}`, 
                appliedAtTick: draft.turn 
              });
              globalGameBus.emit('actionsResolved', { 
                tick: draft.turn, 
                results: [{ unitId, action: 'move', location: unit.location }] 
              });
            } else {
              globalGameBus.emit('actionRejected', { 
                requestId: `move_${unitId}_${Date.now()}`, 
                reason: 'Invalid move target or path blocked' 
              });
            }
          }
        }
        draft.ui.selectedUnitId = undefined;
        draft.ui.previewPath = undefined;
        break;
      }
      case 'CANCEL_SELECTION': {
        draft.ui.selectedUnitId = undefined;
        draft.ui.previewPath = undefined;
        break;
      }
      case 'OPEN_CITY_PANEL': {
        draft.ui.openPanels.cityPanel = action.payload.cityId;
        break;
      }
      case 'CHOOSE_PRODUCTION_ITEM': {
        if (draft.contentExt) {
          const { cityId, order } = action.payload;
          const city = draft.contentExt.cities[cityId];
          if (city) {
            city.productionQueue.push({
              type: order.type,
              item: order.itemId,
              turnsRemaining: 5, // TODO: Calculate based on cost and production
            });
            globalGameBus.emit('productionQueued', { cityId, order });
          }
        }
        break;
      }
      case 'REORDER_PRODUCTION_QUEUE': {
        if (draft.contentExt) {
          const { cityId, newQueue } = action.payload;
          const city = draft.contentExt.cities[cityId];
          if (city) {
            // Convert UI ProductionOrder to internal CityProductionOrder
            city.productionQueue = newQueue.map(order => ({
              type: order.type,
              item: order.itemId,
              turnsRemaining: 5, // TODO: Calculate based on cost and production
            }));
          }
        }
        break;
      }
      case 'CANCEL_ORDER': {
        if (draft.contentExt) {
          const { cityId, orderIndex } = action.payload;
          const city = draft.contentExt.cities[cityId];
          if (city && orderIndex >= 0 && orderIndex < city.productionQueue.length) {
            city.productionQueue.splice(orderIndex, 1);
          }
        }
        break;
      }
      case 'OPEN_RESEARCH_PANEL': {
        draft.ui.openPanels.researchPanel = true;
        break;
      }
      case 'CLOSE_RESEARCH_PANEL': {
        draft.ui.openPanels.researchPanel = false;
        break;
      }
      case 'CLOSE_CITY_PANEL': {
        draft.ui.openPanels.cityPanel = undefined;
        break;
      }
      case 'START_RESEARCH': {
        if (draft.contentExt) {
          extensionBeginResearch(draft.contentExt, action.payload.techId);
          globalGameBus.emit('researchStarted', { 
            playerId: action.payload.playerId, 
            techId: action.payload.techId 
          });
        }
        break;
      }
      case 'QUEUE_RESEARCH': {
        // TODO: Implement research queue when multiple techs can be queued
        globalGameBus.emit('researchQueued', { 
          playerId: action.payload.playerId, 
          techId: action.payload.techId 
        });
        break;
      }
      case 'BEGIN_TURN': {
        globalGameBus.emit('turn:playerStart', { playerId: action.payload.playerId, turn: draft.turn });
        break;
      }
      case 'END_PLAYER_PHASE': {
        globalGameBus.emit('turn:playerEnd', { playerId: action.payload.playerId, turn: draft.turn });
        break;
      }
      default: {
        break;
      }
    }
    globalGameBus.emit('action:applied', { action });
  });
}
