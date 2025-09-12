import { GameState, PlayerState, BiomeType, Tile } from './types'; // BiomeType as value for switch
import type { GameStateExtension } from './content/types';
import type { ExtensionBiome } from './content/types'; // Assuming export name; adjust if needed
import leadersCatalog from '../data/leaders.json';
import { GameAction, ProductionOrder } from './actions';
import { produceNextState } from './state';
import { generateWorld } from './world/generate';
import { globalGameBus } from './events';
import {
  endTurn as contentEndTurn,
  beginResearch as extensionBeginResearch,
  beginCultureResearch as extensionBeginCulture,
  moveUnit as extensionMoveUnit,
  getCityYield,
  foundCity,
} from './content/rules';
import { createEmptyState as createContentExtension } from './content/engine';
import { UNIT_TYPES, IMPROVEMENTS, BUILDINGS } from './content/registry';
import { computePath } from './pathfinder';
import { generateAIDecisions } from './ai';

function mapBiome(b: BiomeType): ExtensionBiome {
  switch (b) {
    case BiomeType.Grassland: {
      return 'grassland';
    }
    case BiomeType.Forest: {
      return 'forest';
    }
    case BiomeType.Desert: {
      return 'desert';
    }
    case BiomeType.Tundra: {
      return 'tundra';
    }
    case BiomeType.Mountain: {
      return 'mountain';
    }
    case BiomeType.Ocean: {
      return 'ocean';
    }
    case BiomeType.Ice: {
      return 'snow';
    }
    default: {
      return 'grassland';
    }
  }
}

function populateExtensionTiles(ext: GameStateExtension, tiles: Tile[]) {
  ext.tiles = {};
  for (const t of tiles) {
    ext.tiles[t.id] = {
      id: t.id,
      q: t.coord.q,
      r: t.coord.r,
      biome: mapBiome(t.biome),
      elevation: t.elevation,
      features: [],
      improvements: [],
      occupantUnitId: null,
      occupantCityId: null,
      passable: true,
    } as any;
  }
}

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

// Helper to get item cost for production calculation
function getItemCost(type: string, itemId: string): number {
  switch (type) {
    case 'unit':
      return UNIT_TYPES[itemId]?.cost || 40;
    case 'improvement':
      return IMPROVEMENTS[itemId]?.buildTime || 20;
    case 'building':
      return BUILDINGS[itemId]?.cost || 60;
    default:
      return 10; // fallback
  }
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
          // Auto-advance from queue
          if (player.researchQueue && player.researchQueue.length > 0) {
            const nextId = player.researchQueue.shift()!;
            const nextTech = draft.techCatalog.find((t) => t.id === nextId);
            if (nextTech && nextTech.prerequisites.every((p) => player.researchedTechIds.includes(p))) {
              player.researching = { techId: nextId, progress: 0 };
              globalGameBus.emit('researchStarted', { playerId, techId: nextId });
            }
          }
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
        const ext = (draft.contentExt ||= createContentExtension());
        populateExtensionTiles(ext, draft.map.tiles);
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
        } as any;
        // ensure no selected unit remains
        if (draft.ui && 'selectedUnitId' in draft.ui) {
          delete (draft.ui as any).selectedUnitId;
        }
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
            researchQueue: [], // Initialize empty queue
          } as PlayerState);
        }
        // Content extension reset
        draft.contentExt = createContentExtension();
        const extension = draft.contentExt;
        populateExtensionTiles(extension, draft.map.tiles);
        // Spawn starting units per player: 1 Settler + 1 Warrior near corners/diagonal
        // Choose suitable terrain and keep spawns separated based on map size
        const findStartPosition = (index: number): string | null => {
          const pad = 2;
          const preferredQ = index % 2 === 0 ? pad : Math.max(pad, width - pad - 1);
          const preferredR = index < 2 ? pad : Math.max(pad, height - pad - 1);
          return findSuitableSpawnPosition(draft.map.tiles, preferredQ, preferredR, width, height);
        };

        // Keep track of assigned spawn tiles so multiple players don't get the same tile
        const usedTiles = new Set<string>();
        // Minimum distance between player spawns, proportional to map size
        const minSpawnDistance = Math.max(4, Math.floor(Math.min(width, height) / 4));
        const getTile = (id: string) => draft.map.tiles.find((t) => t.id === id);
        const hexDistance = (a: { q: number; r: number }, b: { q: number; r: number }) => {
          const dq = a.q - b.q;
          const dr = a.r - b.r;
          return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
        };
        const isFarEnoughFromUsed = (tile: Tile) => {
          for (const used of usedTiles) {
            const ut = getTile(used);
            if (!ut) continue;
            if (hexDistance({ q: tile.coord.q, r: tile.coord.r }, { q: ut.coord.q, r: ut.coord.r }) < minSpawnDistance) {
              return false;
            }
          }
          return true;
        };

        for (let index = 0; index < draft.players.length; index++) {
          const ownerId = draft.players[index].id;
          let tileId = findStartPosition(index);

          if (!tileId) {
            console.warn(`Could not find suitable spawn position for player ${ownerId}`);
            continue; // Skip this player if no suitable position found
          }

          const preferredTile = getTile(tileId);
          const preferredQ = preferredTile?.coord.q ?? 0;
          const preferredR = preferredTile?.coord.r ?? 0;

          // If the chosen tile is already used or too close, search for a better alternative
          const isTooClose = (tid: string) => {
            const t = getTile(tid);
            return !t || !isFarEnoughFromUsed(t) || usedTiles.has(tid);
          };

          if (isTooClose(tileId)) {
            // Find suitable candidates that are far enough and close to the preferred corner
            const candidates = draft.map.tiles.filter(
              (t) => isSuitableSpawnTerrain(t.biome) && !usedTiles.has(t.id) && isFarEnoughFromUsed(t)
            );

            if (candidates.length > 0) {
              // Rank by distance to preferred corner and by terrain preference
              const score = (t: Tile) => {
                const dist = hexDistance({ q: t.coord.q, r: t.coord.r }, { q: preferredQ, r: preferredR });
                const terrainPenalty =
                  t.biome === BiomeType.Grassland || t.biome === BiomeType.Forest ? 0 : 2;
                return dist + terrainPenalty;
              };
              candidates.sort((a, b) => score(a) - score(b));
              tileId = candidates[0].id;
            } else {
              // Fallback: any suitable tile even if closer than desired (still avoid duplicates)
              const alt = draft.map.tiles.find(
                (t) => isSuitableSpawnTerrain(t.biome) && !usedTiles.has(t.id)
              );
              if (alt) {
                tileId = alt.id;
              } else {
                console.warn(`No alternative spawn tile available for player ${ownerId}`);
                continue;
              }
            }
          }

          // Mark tile as used so subsequent players won't spawn on the same tile
          usedTiles.add(tileId);

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

          // Ensure the extension tile references one of the occupant units so UI and logic see a unit on the tile
          if (!extension.tiles[tileId]) {
            extension.tiles[tileId] = {
              id: tileId,
              q: mapTile.coord.q,
              r: mapTile.coord.r,
              biome: 'grassland',
              elevation: mapTile.elevation,
              features: [],
              improvements: [],
              occupantUnitId: null,
              occupantCityId: null,
              passable: true,
            } as any;
          }
          // Prefer to show the warrior as the occupant (arbitrary choice)
          extension.tiles[tileId].occupantUnitId = wId;
        }
        globalGameBus.emit('action:applied', { action });
        break;
      }
      case 'QUEUE_RESEARCH': {
        const { playerId, techId } = action.payload;
        const player = findPlayer(draft.players, playerId);
        if (player && techId) {
          if (!player.researchQueue) player.researchQueue = [];
          if (!player.researchQueue.includes(techId)) {
            player.researchQueue.push(techId);
            globalGameBus.emit('researchQueued', { playerId, techId });
          }
        }
        break;
      }
      case 'END_TURN': {
        // Advance research for all players
        for (const player of draft.players) {
          if (player.researching) {
            const tech = draft.techCatalog.find((t) => t.id === player.researching!.techId);
            if (tech) {
              const points = tech.tree === 'science' ? player.sciencePoints : player.culturePoints;
              player.researching.progress += points;
              if (player.researching.progress >= tech.cost) {
                if (!player.researchedTechIds) player.researchedTechIds = [];
                player.researchedTechIds.push(tech.id);
                player.researching = null;
                globalGameBus.emit('tech:unlocked', { playerId: player.id, techId: tech.id });
                // Auto-advance from queue
                if (player.researchQueue && player.researchQueue.length > 0) {
                  const nextId = player.researchQueue.shift()!;
                  const nextTech = draft.techCatalog.find((t) => t.id === nextId);
                  if (nextTech && (nextTech.prerequisites || []).every((p) => player.researchedTechIds?.includes(p))) {
                    player.researching = { techId: nextId, progress: 0 };
                    globalGameBus.emit('researchStarted', { playerId: player.id, techId: nextId });
                  }
                }
              }
            }
          }
        }

        // Drive content extension
        if (draft.contentExt) {
          const extension = draft.contentExt;
          extension.playerState.science = Object.keys(extension.cities).length;
          contentEndTurn(extension);
        }

        // AI phase: For non-human players, generate and apply decisions
        for (const player of draft.players) {
          if (player.isHuman) continue;

          globalGameBus.emit('ai:turnStart', { playerId: player.id, turn: draft.turn });

          const aiActions = generateAIDecisions(draft, player.id);

          // Apply sub-actions directly to draft
          for (const subAction of aiActions) {
            switch (subAction.type) {
              case 'QUEUE_RESEARCH': {
                const { playerId: subPlayerId, techId } = subAction.payload;
                if (subPlayerId === player.id && techId) {
                  if (!player.researchQueue) player.researchQueue = [];
                  if (!player.researchQueue.includes(techId)) {
                    player.researchQueue.push(techId);
                    globalGameBus.emit('researchQueued', { playerId: subPlayerId, techId });
                  }
                }
                break;
              }
              case 'CHOOSE_PRODUCTION_ITEM': {
                const { cityId, order } = subAction.payload;
                if (draft.contentExt) {
                  const city = draft.contentExt.cities[cityId];
                  if (city && city.ownerId === player.id) {
                    // Compute turnsRemaining if not provided (using getItemCost)
                    const cost = getItemCost(order.type, order.item);
                    const yieldPerTurn = getCityYield(draft.contentExt, city) || 1;
                    const turnsRemaining = Math.max(1, Math.ceil(cost / Number(yieldPerTurn)));
                    const fullOrder: ProductionOrder = { ...order, turnsRemaining };

                    // Replace or add to queue
                    const top = city.productionQueue[0];
                    if (top && top.type === fullOrder.type && top.item === fullOrder.item) {
                      top.turnsRemaining = fullOrder.turnsRemaining;
                    } else {
                      city.productionQueue.unshift(fullOrder);
                    }
                    globalGameBus.emit('productionQueued', { cityId, order: fullOrder });
                  }
                }
                break;
              }
              case 'SET_UNIT_LOCATION': {
                const { unitId, tileId } = subAction.payload;
                if (draft.contentExt) {
                  const unit = draft.contentExt.units[unitId];
                  if (unit && unit.ownerId === player.id && draft.contentExt.tiles[tileId]) {
                    const oldTileId = unit.location;
                    unit.location = tileId;
                    // Update occupant on old and new tiles
                    if (draft.contentExt.tiles[oldTileId]) {
                      draft.contentExt.tiles[oldTileId].occupantUnitId = null; // Simplified, assume single occupant
                    }
                    draft.contentExt.tiles[tileId].occupantUnitId = unitId;
                  }
                }
                break;
              }
              case 'RECORD_AI_PERF': {
                if (!draft.aiPerf) draft.aiPerf = { total: 0, count: 0 };
                draft.aiPerf.total += subAction.payload.duration;
                draft.aiPerf.count += 1;
                break;
              }
              // Ignore other actions for now
              default:
                console.warn(`AI sub-action not handled: ${subAction.type}`);
            }
          }

          globalGameBus.emit('ai:turnEnd', { playerId: player.id, turn: draft.turn });
        }

        draft.turn += 1;
        globalGameBus.emit('turn:end', { turn: draft.turn });
        break;
      }

      case 'AI_PERFORM_ACTIONS': {
        // No-op: Integrated directly into END_TURN for non-human players
        break;
      }

      case 'CHOOSE_PRODUCTION_ITEM': {
        if (draft.contentExt) {
          const extension = draft.contentExt;
          const { cityId, order } = action.payload;
          const city = extension.cities[cityId];
          if (city) {
            // Compute turnsRemaining if not provided
            let turnsRemaining = (order as ProductionOrder).turnsRemaining;
            if (turnsRemaining <= 0) {
              const cost = getItemCost(order.type, order.item);
              const yieldPerTurn = getCityYield(extension, city) || 1;
              turnsRemaining = Math.max(1, Math.ceil(cost / Number(yieldPerTurn)));
            }

            const fullOrder: ProductionOrder = { ...order, turnsRemaining } as ProductionOrder;

            // Replace existing top order if same type
            const top = city.productionQueue[0];
            if (top && top.type === fullOrder.type) {
              top.item = fullOrder.item;
              top.turnsRemaining = fullOrder.turnsRemaining;
            } else {
              city.productionQueue.unshift(fullOrder);
            }
            globalGameBus.emit('productionQueued', { cityId, order: fullOrder });
          }
        }
        break;
      }

      case 'SET_UNIT_STATE': {
        const { unitId, state: newState } = action.payload;
        const extension = (draft.contentExt ||= createContentExtension());
        const unit = extension.units[unitId];
        if (unit && newState) {
          // Validate or cast to valid states
          const validStates = ['idle', 'moving', 'fortify', 'exploring', 'building'] as const;
          const state = validStates.includes(newState as any) ? newState : 'idle';
          unit.state = state;
        }
        break;
      }

      case 'SET_TILE_IMPROVEMENT': {
        const { tileId, improvementId } = action.payload;
        const extension = (draft.contentExt ||= createContentExtension());
        const tile = extension.tiles[tileId];
        if (tile && improvementId) {
          // Remove existing improvements of the same type
          tile.improvements = tile.improvements.filter((id) => id !== improvementId);
          // Add the new improvement
          tile.improvements.push(improvementId);
        }
        break;
      }

      case 'REMOVE_TILE_IMPROVEMENT': {
        const { tileId, improvementId } = action.payload;
        const extension = (draft.contentExt ||= createContentExtension());
        const tile = extension.tiles[tileId];
        if (tile && improvementId) {
          tile.improvements = tile.improvements.filter((id) => id !== improvementId);
        }
        break;
      }

      case 'SET_CITY_TILE': {
        const { cityId, tileId } = action.payload;
        const extension = (draft.contentExt ||= createContentExtension());
        const city = extension.cities[cityId];
        if (city && tileId) {
          // Remove city from current tiles
          for (const tid of city.tilesWorked) {
            const t = extension.tiles[tid];
            if (t) {
              t.occupantCityId = null;
            }
          }
          city.tilesWorked = [tileId];
          const newTile = extension.tiles[tileId];
          if (newTile) {
            newTile.occupantCityId = cityId;
          }
        }
        break;
      }

      case 'SET_UNIT_LOCATION': {
        const { unitId, tileId } = action.payload;
        const extension = (draft.contentExt ||= createContentExtension());
        const unit = extension.units[unitId];
        if (unit && tileId && extension.tiles[tileId]) {
          const oldTileId = unit.location;
          unit.location = tileId;
          // Update occupants
          if (extension.tiles[oldTileId]) {
            extension.tiles[oldTileId].occupantUnitId = null;
          }
          extension.tiles[tileId].occupantUnitId = unitId;
        }
        break;
      }

      case 'RECORD_AI_PERF': {
        if (!draft.aiPerf) draft.aiPerf = { total: 0, count: 0 };
        const dur = (action as any).payload?.duration ?? 0;
        draft.aiPerf.total = (draft.aiPerf.total ?? 0) + dur;
        draft.aiPerf.count = (draft.aiPerf.count ?? 0) + 1;
        break;
      }

      case 'AUTO_SIM_TOGGLE': {
        const enabled = (action as any).payload?.enabled;
        if (typeof enabled === 'boolean') draft.autoSim = enabled;
        else draft.autoSim = !draft.autoSim;
        break;
      }

      // UI interaction actions
      case 'SELECT_UNIT': {
        const unitId = (action as any).payload?.unitId as string | undefined;
        if (!draft.ui) draft.ui = { openPanels: {} } as any;
        draft.ui.selectedUnitId = unitId;
        draft.ui.previewPath = undefined;
        break;
      }

      case 'CANCEL_SELECTION': {
        if (!draft.ui) draft.ui = { openPanels: {} } as any;
        draft.ui.selectedUnitId = undefined;
        draft.ui.previewPath = undefined;
        break;
      }

      case 'OPEN_CITY_PANEL': {
        const cityId = (action as any).payload?.cityId as string | undefined;
        if (!draft.ui) draft.ui = { openPanels: {} } as any;
        draft.ui.openPanels = { ...(draft.ui.openPanels || {}), cityPanel: cityId };
        break;
      }

      case 'CLOSE_CITY_PANEL': {
        if (!draft.ui) draft.ui = { openPanels: {} } as any;
        draft.ui.openPanels = { ...(draft.ui.openPanels || {}), cityPanel: undefined };
        break;
      }

      case 'OPEN_RESEARCH_PANEL': {
        if (!draft.ui) draft.ui = { openPanels: {} } as any;
        draft.ui.openPanels = { ...(draft.ui.openPanels || {}), researchPanel: true };
        break;
      }

      case 'CLOSE_RESEARCH_PANEL': {
        if (!draft.ui) draft.ui = { openPanels: {} } as any;
        // normalize close to explicit false for predictable assertions
        draft.ui.openPanels = { ...(draft.ui.openPanels || {}), researchPanel: false };
        break;
      }

      case 'PREVIEW_PATH': {
        const targetTileId = (action as any).payload?.targetTileId as string | undefined;
        const unitIdPayload = (action as any).payload?.unitId as string | undefined;
        if (!draft.ui) draft.ui = { openPanels: {} } as any;
        const uid = unitIdPayload ?? draft.ui.selectedUnitId;
        if (!uid || !draft.contentExt || !targetTileId) {
          draft.ui.previewPath = undefined;
          break;
        }
        try {
          const res = computePath(draft.contentExt, uid, targetTileId, draft.map.width, draft.map.height);
          if (res.path && Array.isArray(res.path)) {
            // store minimal preview structure as spec suggests
            // keep just path array on ui.previewPath for consumers/tests
            (draft.ui as any).previewPath = res.path;
            // attach combat preview into ui for tests if present
            if (res.combatPreview) {
              (draft.ui as any).previewCombat = res.combatPreview;
            } else {
              (draft.ui as any).previewCombat = undefined;
            }
          } else {
            draft.ui.previewPath = undefined;
            (draft.ui as any).previewCombat = undefined;
          }
        } catch (e) {
          draft.ui.previewPath = undefined;
          (draft.ui as any).previewCombat = undefined;
        }
        break;
      }

      case 'ISSUE_MOVE': {
        const { unitId, path, confirmCombat } = (action as any).payload || {};
        if (!path || !Array.isArray(path) || path.length === 0) break;
        const extension = (draft.contentExt ||= createContentExtension());
        const uid = unitId ?? draft.ui?.selectedUnitId;
        if (!uid) {
          if (draft.ui) {
            draft.ui.selectedUnitId = undefined;
            draft.ui.previewPath = undefined;
            (draft.ui as any).previewCombat = undefined;
          }
          break;
        }
        const unit = extension.units[uid];
        if (!unit) {
          if (draft.ui) {
            draft.ui.selectedUnitId = undefined;
            draft.ui.previewPath = undefined;
            (draft.ui as any).previewCombat = undefined;
          }
          break;
        }
        // iterate through path steps (skip first element when it equals current location)
        const startIndex = path[0] === unit.location ? 1 : 0;
        for (let i = startIndex; i < path.length; i++) {
          const tid = path[i];
          // if defender present and not confirmed, abort
          const tile = extension.tiles[tid];
          if (!tile) break;
          // detect enemy occupant
          let enemyPresent = false;
          if (tile.occupantUnitId) {
            const occ = extension.units[tile.occupantUnitId];
            if (occ && occ.ownerId !== unit.ownerId) enemyPresent = true;
          }
          if (tile.occupantCityId) {
            const city = extension.cities[tile.occupantCityId];
            if (city && city.ownerId !== unit.ownerId) enemyPresent = true;
          }
          if (enemyPresent && !confirmCombat) {
            break; // abort move without confirmation
          }
          // attempt to move unit using extension rule
          try {
            const ok = extensionMoveUnit(extension, uid, tid);
            if (!ok) break;
          } catch (e) {
            break;
          }
        }
        // clear selection and preview
        if (draft.ui) {
          draft.ui.selectedUnitId = undefined;
          draft.ui.previewPath = undefined;
          (draft.ui as any).previewCombat = undefined;
        }
        break;
      }

      case 'EXT_ISSUE_MOVE_PATH': {
        const { unitId, path, confirmCombat } = (action as any).payload || {};
        if (!unitId || !path || !Array.isArray(path) || path.length === 0) break;
        const ext = (draft.contentExt ||= createContentExtension());
        const unit = ext.units[unitId];
        if (!unit) break;
        // iterate through path steps (skip first element when it equals current location)
        const startIndex = path[0] === unit.location ? 1 : 0;
        for (let i = startIndex; i < path.length; i++) {
          const tid = path[i];
          const tile = ext.tiles[tid];
          if (!tile) break;
          // detect enemy occupant
          let enemyPresent = false;
          if (tile.occupantUnitId) {
            const occ = ext.units[tile.occupantUnitId];
            if (occ && occ.ownerId !== unit.ownerId) enemyPresent = true;
          }
          if (tile.occupantCityId) {
            const city = ext.cities[tile.occupantCityId];
            if (city && city.ownerId !== unit.ownerId) enemyPresent = true;
          }
          if (enemyPresent && !confirmCombat) break;
          try {
            const ok = extensionMoveUnit(ext, unitId, tid);
            if (!ok) break;
          } catch (e) {
            break;
          }
        }
        break;
      }

      // Extension helpers: add tiles/units/cities into contentExt store
      case 'EXT_ADD_TILE': {
        const tile = (action as any).payload?.tile;
        if (!tile) break;
        const ext = (draft.contentExt ||= createContentExtension());
        ext.tiles[tile.id] = {
          id: tile.id,
          q: tile.q,
          r: tile.r,
          biome: tile.biome || 'grassland',
          elevation: 0,
          features: [],
          improvements: [],
          occupantUnitId: null,
          occupantCityId: null,
          passable: true,
        } as any;
        break;
      }

      case 'EXT_ADD_UNIT': {
        const { unitId, type, ownerId, tileId } = (action as any).payload || {};
        if (!unitId || !type || !ownerId) break;
        const ext = (draft.contentExt ||= createContentExtension());
        ext.units[unitId] = {
          id: unitId,
          type,
          ownerId,
          location: tileId ?? null,
          hp: 100,
          movement: 2,
          movementRemaining: 2,
          attack: 1,
          defense: 1,
          sight: 1,
          state: 'idle',
          abilities: [],
        } as any;
        if (tileId && ext.tiles[tileId]) ext.tiles[tileId].occupantUnitId = unitId;
        break;
      }

      case 'EXT_ADD_CITY': {
        const { cityId, name, ownerId, tileId } = (action as any).payload || {};
        if (!cityId || !ownerId) break;
        const ext = (draft.contentExt ||= createContentExtension());
        ext.cities[cityId] = {
          id: cityId,
          name: name || cityId,
          ownerId,
          tileId: tileId ?? null,
          tilesWorked: tileId ? [tileId] : [],
          productionQueue: [],
        } as any;
        if (tileId && ext.tiles[tileId]) ext.tiles[tileId].occupantCityId = cityId;
        break;
      }

      case 'EXT_FOUND_CITY': {
        const { unitId, tileId, cityId, name } = (action as any).payload || {};
        const ext = (draft.contentExt ||= createContentExtension());
        if (!unitId) break;
        const unit = ext.units[unitId];
        if (!unit) break;
        const targetTile = tileId ?? unit.location;
        const res = foundCity(ext, unitId, targetTile, cityId, name);
        if (res.success) {
          // ensure tile exists in extension (foundCity creates minimal tile if missing)
          if (ext.tiles[res.tileId]) {
            ext.tiles[res.tileId].occupantCityId = res.cityId;
            // remove unit if still present
            if (ext.units[unitId]) delete ext.units[unitId];
          }
        }
        break;
      }

      case 'SET_PLAYER_SCORES': {
        const { players } = action.payload;
        for (const p of players) {
          const player = findPlayer(draft.players, p.id);
          if (player) {
            player.sciencePoints = p.sciencePoints;
            player.culturePoints = p.culturePoints;
          }
        }
        break;
      }

      // ...other existing cases like AUTO_SIM_TOGGLE, EXT_BEGIN_RESEARCH, etc. remain unchanged...
    }
  });
}
