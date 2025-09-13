import type { Draft } from 'immer';
import { UnitState } from '../../types/unit';
import { GameAction } from '../actions';
import { GameState, PlayerState, Tile, BiomeType } from '../types';
import { globalGameBus } from '../events';
import { generateWorld } from '../world/generate';
import { createEmptyState as createContentExtension } from '../content/engine';
import { populateExtensionTiles, isSuitableSpawnTerrain, findSuitableSpawnPosition } from '../utils/map';
import leadersCatalog from '../../data/leaders.json';

function spawnInitialUnits(draft: Draft<GameState>) {
  const { players, map, contentExt } = draft;
  const { width, height, tiles } = map;
  const extension = contentExt!;

  const findStartPosition = (index: number): string | null => {
    const pad = 2;
    const preferredQ = index % 2 === 0 ? pad : Math.max(pad, width - pad - 1);
    const preferredR = index < 2 ? pad : Math.max(pad, height - pad - 1);
    return findSuitableSpawnPosition(tiles, preferredQ, preferredR, width, height);
  };

  const usedTiles = new Set<string>();
  const minSpawnDistance = Math.max(4, Math.floor(Math.min(width, height) / 4));
  const getTile = (id: string) => tiles.find((t) => t.id === id);
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

  for (const [index, player] of players.entries()) {
    const ownerId = player.id;
    let tileId = findStartPosition(index);

    if (!tileId) {
      console.warn(`Could not find suitable spawn position for player ${ownerId}`);
      continue;
    }

    const preferredTile = getTile(tileId);
    const preferredQ = preferredTile?.coord.q ?? 0;
    const preferredR = preferredTile?.coord.r ?? 0;

    const isTooClose = (tid: string) => {
      const t = getTile(tid);
      return !t || !isFarEnoughFromUsed(t) || usedTiles.has(tid);
    };

    if (isTooClose(tileId)) {
      const candidates = tiles.filter(
        (t) => isSuitableSpawnTerrain(t.biome) && !usedTiles.has(t.id) && isFarEnoughFromUsed(t)
      );

      if (candidates.length > 0) {
        const score = (t: Tile) => {
          const distribution = hexDistance({ q: t.coord.q, r: t.coord.r }, { q: preferredQ, r: preferredR });
          const terrainPenalty =
            t.biome === BiomeType.Grassland || t.biome === BiomeType.Forest ? 0 : 2;
          return distribution + terrainPenalty;
        };
        candidates.sort((a, b) => score(a) - score(b));
        tileId = candidates[0].id;
      } else {
        const alt = tiles.find(
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

    usedTiles.add(tileId);

    const mapTile = tiles.find((t) => t.id === tileId);
    if (!mapTile) {
      console.warn(`Map tile ${tileId} not found for player ${ownerId}`);
      continue;
    }

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
    extension.tiles[tileId].occupantUnitId = wId;
  }
}

export function lifecycleReducer(draft: Draft<GameState>, action: GameAction): void {
  switch (action.type) {
    case 'INIT': {
      const seed = action.payload?.seed ?? draft.seed;
      const width = action.payload?.width ?? draft.map.width;
      const height = action.payload?.height ?? draft.map.height;
      draft.seed = seed;
      const world = generateWorld(seed, width, height);
      draft.map = { width, height, tiles: world.tiles };
      draft.rngState = world.state;
      const extension = (draft.contentExt ||= createContentExtension());
      populateExtensionTiles(extension, draft.map.tiles);
      spawnInitialUnits(draft);

      // Add Idle state to all units on init (including spawned ones)
      if (draft.contentExt && draft.contentExt.units) {
        // Use the UnitState enum values so tests and consumers receive the canonical type
        Object.values(draft.contentExt.units).forEach((unit: any) => {
          if (unit.activeStates) {
            unit.activeStates.add(UnitState.Idle as any);
          } else {
            unit.activeStates = new Set([UnitState.Idle as any]);
          }
        });
      }

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
      if (draft.ui && 'selectedUnitId' in draft.ui) {
        delete (draft.ui as any).selectedUnitId;
      }
      // Players
      const total = Math.max(1, Math.min(6, action.payload.totalPlayers));
      const humans = Math.max(0, Math.min(total, action.payload.humanPlayers ?? 1));
      draft.players = [] as PlayerState[];
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
          researchQueue: [],
        } as PlayerState);
      }
      // Content extension reset
      draft.contentExt = createContentExtension();
      populateExtensionTiles(draft.contentExt, draft.map.tiles);

      spawnInitialUnits(draft);

      globalGameBus.emit('action:applied', { action });
      break;
    }
    case 'AUTO_SIM_TOGGLE': {
      const enabled = (action as any).payload?.enabled;
      draft.autoSim = typeof enabled === 'boolean' ? enabled : !draft.autoSim;
      break;
    }
    case 'LOG_EVENT': {
      // append log entry with cap (50)
      const entry = (action.payload as any)?.entry;
      if (entry) {
        draft.log.push(entry);
        if (draft.log.length > 50) draft.log.splice(0, draft.log.length - 50);
      }
      break;
    }
  }
}
