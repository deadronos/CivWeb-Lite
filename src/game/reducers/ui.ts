import type { Draft } from 'immer';
import { GameAction } from '../actions';
import { GameState } from '../types';
import { computePath } from '../pathfinder';
import { moveUnit as extensionMoveUnit } from '../content/rules';
import { createEmptyState as createContentExtension } from '../content/engine';

export function uiReducer(draft: Draft<GameState>, action: GameAction): void {
  switch (action.type) {
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
      draft.ui.openPanels = { ...draft.ui.openPanels, cityPanel: cityId };
      break;
    }

    case 'CLOSE_CITY_PANEL': {
      if (!draft.ui) draft.ui = { openPanels: {} } as any;
      draft.ui.openPanels = { ...draft.ui.openPanels, cityPanel: undefined };
      break;
    }

    case 'OPEN_RESEARCH_PANEL': {
      if (!draft.ui) draft.ui = { openPanels: {} } as any;
      draft.ui.openPanels = { ...draft.ui.openPanels, researchPanel: true };
      break;
    }

    case 'CLOSE_RESEARCH_PANEL': {
      if (!draft.ui) draft.ui = { openPanels: {} } as any;
      // normalize close to explicit false for predictable assertions
      draft.ui.openPanels = { ...draft.ui.openPanels, researchPanel: false };
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
      } catch {
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
      for (let index = startIndex; index < path.length; index++) {
        const tid = path[index];
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
        } catch {
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
  }
}
