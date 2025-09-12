import type { Draft } from 'immer';
import { GameAction } from '../actions';
import { GameState } from '../types';
import { createEmptyState as createContentExtension } from '../content/engine';
import { foundCity, moveUnit as extensionMoveUnit } from '../content/rules';
import { UnitState } from '../../types/unit';

export function worldReducer(draft: Draft<GameState>, action: GameAction): void {
  switch (action.type) {
    case 'ADD_UNIT_STATE': {
      const { unitId, state } = action.payload;
      const extension = (draft.contentExt ||= createContentExtension());
      const unit = extension.units[unitId];
      if (unit) {
        (unit.activeStates ||= new Set<UnitState>()).add(state);
      }
      break;
    }

    case 'REMOVE_UNIT_STATE': {
      const { unitId, state } = action.payload;
      const extension = (draft.contentExt ||= createContentExtension());
      const unit = extension.units[unitId];
      if (unit && unit.activeStates) {
        unit.activeStates.delete(state);
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

    case 'EXT_ISSUE_MOVE_PATH': {
      const { unitId, path, confirmCombat } = (action as any).payload || {};
      if (!unitId || !path || !Array.isArray(path) || path.length === 0) break;
      const extension = (draft.contentExt ||= createContentExtension());
      const unit = extension.units[unitId];
      if (!unit) break;
      // iterate through path steps (skip first element when it equals current location)
      const startIndex = path[0] === unit.location ? 1 : 0;
      for (let index = startIndex; index < path.length; index++) {
        const tid = path[index];
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
        if (enemyPresent && !confirmCombat) break;
        try {
          const ok = extensionMoveUnit(extension, unitId, tid);
          if (!ok) break;
        } catch {
          break;
        }
      }
      break;
    }

    // Extension helpers: add tiles/units/cities into contentExt store
    case 'EXT_ADD_TILE': {
      const tile = (action as any).payload?.tile;
      if (!tile) break;
      const extension = (draft.contentExt ||= createContentExtension());
      extension.tiles[tile.id] = {
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
      const extension = (draft.contentExt ||= createContentExtension());
      extension.units[unitId] = {
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
        activeStates: new Set<UnitState>(),
        abilities: [],
      } as any;
      if (tileId && extension.tiles[tileId]) extension.tiles[tileId].occupantUnitId = unitId;
      break;
    }

    case 'EXT_ADD_CITY': {
      const { cityId, name, ownerId, tileId } = (action as any).payload || {};
      if (!cityId || !ownerId) break;
      const extension = (draft.contentExt ||= createContentExtension());
      extension.cities[cityId] = {
        id: cityId,
        name: name || cityId,
        ownerId,
        tileId: tileId ?? null,
        tilesWorked: tileId ? [tileId] : [],
        productionQueue: [],
      } as any;
      if (tileId && extension.tiles[tileId]) extension.tiles[tileId].occupantCityId = cityId;
      break;
    }

    case 'EXT_FOUND_CITY': {
      const { unitId, tileId, cityId, name } = (action as any).payload || {};
      const extension = (draft.contentExt ||= createContentExtension());
      if (!unitId) break;
      const unit = extension.units[unitId];
      if (!unit) break;
      const targetTile = tileId ?? unit.location;
      const res = foundCity(extension, unitId, targetTile, cityId, name);
      if (res.success && // ensure tile exists in extension (foundCity creates minimal tile if missing)
        extension.tiles[res.tileId]) {
          extension.tiles[res.tileId].occupantCityId = res.cityId;
          // remove unit if still present
          if (extension.units[unitId]) delete extension.units[unitId];
        }
      break;
    }
  }
}
