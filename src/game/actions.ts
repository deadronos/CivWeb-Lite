import { GameState } from './types';
import { UnitState } from '../types/unit';
import type { ProductionOrder } from './types/production';
// Re-export ProductionOrder for modules that import it from ../actions
export type { ProductionOrder } from './types/production';

export type UnitMovePayload = {
  unitId: string;
  path: string[];
  confirmCombat?: boolean;
};

export type GameAction =
  | { type: 'INIT'; payload?: { seed?: string; width?: number; height?: number } }
  | {
      type: 'NEW_GAME';
      payload: {
        seed?: string;
        width?: number;
        height?: number;
        totalPlayers: number;
        humanPlayers?: number;
        selectedLeaders?: Array<string | 'random' | undefined>;
      };
    }
  | { type: 'END_TURN' }
  | { type: 'SET_RESEARCH'; playerId: string; payload: { techId: string } }
  | { type: 'ADVANCE_RESEARCH'; playerId: string; payload?: { points?: number } }
  | { type: 'AUTO_SIM_TOGGLE'; payload?: { enabled?: boolean } }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'LOG_EVENT'; payload: { entry: GameState['log'][number] } }
  | { type: 'RECORD_AI_PERF'; payload: { duration: number } }
  // UI Interaction Actions (from spec)
  | { type: 'SELECT_UNIT'; payload: { unitId: string } }
  | { type: 'SELECT_TILE'; payload: { tileId?: string } }
  | { type: 'SELECT_CITY'; payload: { cityId?: string } }
  | { type: 'PREVIEW_PATH'; payload: { targetTileId: string; unitId?: string } } // unitId from ui.selectedUnitId
  | { type: 'ISSUE_MOVE'; payload: UnitMovePayload }
  | { type: 'CANCEL_SELECTION'; payload?: { unitId?: string } }
  | { type: 'OPEN_CITY_PANEL'; payload: { cityId: string } }
  | { type: 'CLOSE_CITY_PANEL'; payload?: { cityId?: string } }
  | { type: 'OPEN_RESEARCH_PANEL'; payload?: {} }
  | { type: 'CLOSE_RESEARCH_PANEL'; payload?: {} }
  | { type: 'OPEN_SPEC_PANEL' }
  | { type: 'CLOSE_SPEC_PANEL' }
  | { type: 'OPEN_DEV_PANEL' }
  | { type: 'CLOSE_DEV_PANEL' }
  | { type: 'CHOOSE_PRODUCTION_ITEM'; payload: { cityId: string; order: ProductionOrder } }
  | { type: 'REORDER_PRODUCTION_QUEUE'; payload: { cityId: string; reorderedQueue: ProductionOrder[] } }
  | { type: 'CANCEL_PRODUCTION_ORDER'; payload: { cityId: string; orderIndex: number } }
  | { type: 'START_RESEARCH'; payload: { playerId: string; techId: string } }
  | { type: 'QUEUE_RESEARCH'; payload: { playerId: string; techId: string } }
  | {
      type: 'SWITCH_RESEARCH_POLICY';
      payload: { playerId: string; policy: 'preserveProgress' | 'discardProgress' };
    }
  | { type: 'BEGIN_TURN'; payload: { playerId: string } }
  | { type: 'END_PLAYER_PHASE'; payload: { playerId: string } }
  // Extension actions (biomes/units/cities/tech)
  | { type: 'EXT_BEGIN_RESEARCH'; payload: { techId: string } }
  | { type: 'EXT_BEGIN_CULTURE_RESEARCH'; payload: { civicId: string } }
  | {
      type: 'EXT_QUEUE_PRODUCTION';
      payload: {
        cityId: string;
        order: ProductionOrder;
      };
    }
  | { type: 'EXT_MOVE_UNIT'; payload: { unitId: string; toTileId: string } }
  | { type: 'EXT_ADD_TILE'; payload: { tile: { id: string; q: number; r: number; biome: string } } }
  | {
      type: 'EXT_ADD_CITY';
      payload: { cityId: string; name: string; ownerId: string; tileId: string };
    }
  | {
      type: 'EXT_ADD_UNIT';
      payload: { unitId: string; type: string; ownerId: string; tileId: string };
    }
  | {
      type: 'EXT_FOUND_CITY';
      payload: { unitId: string; tileId?: string; cityId?: string; name?: string; requestId?: string };
    }
  | {
      type: 'EXT_ISSUE_MOVE_PATH';
      payload: UnitMovePayload;
    }
  | { type: 'MOVE_UNIT'; payload: { unitId: string; toTileId: string } }
  | { type: 'FORTIFY_UNIT'; payload: { unitId: string } }
  // Additional actions from reducer
  | { type: 'AI_PERFORM_ACTIONS'; payload: { playerId: string } }
  | { type: 'SET_TILE_IMPROVEMENT'; payload: { tileId: string; improvementId: string } }
  | { type: 'REMOVE_TILE_IMPROVEMENT'; payload: { tileId: string; improvementId: string } }
  | { type: 'SET_CITY_TILE'; payload: { cityId: string; tileId: string } }
  | { type: 'ADD_UNIT_STATE'; payload: { unitId: string; state: UnitState } }
  | { type: 'REMOVE_UNIT_STATE'; payload: { unitId: string; state: UnitState } }
  | { type: 'SET_UNIT_LOCATION'; payload: { unitId: string; tileId: string } }
  | { type: 'SET_PLAYER_SCORES'; payload: { players: Array<{ id: string; sciencePoints: number; culturePoints: number }> } };

// Update GAME_ACTION_TYPES to include new ones
export const GAME_ACTION_TYPES = [
  'INIT',
  'NEW_GAME',
  'END_TURN',
  'SET_RESEARCH',
  'ADVANCE_RESEARCH',
  'AUTO_SIM_TOGGLE',
  'LOAD_STATE',
  'LOG_EVENT',
  'RECORD_AI_PERF',
  // UI Actions
  'SELECT_UNIT',
  'SELECT_TILE',
  'SELECT_CITY',
  'PREVIEW_PATH',
  'ISSUE_MOVE',
  'CANCEL_SELECTION',
  'OPEN_CITY_PANEL',
  'CHOOSE_PRODUCTION_ITEM',
  'REORDER_PRODUCTION_QUEUE',
  'CANCEL_PRODUCTION_ORDER',
  'OPEN_RESEARCH_PANEL',
  'CLOSE_RESEARCH_PANEL',
  'OPEN_SPEC_PANEL',
  'CLOSE_SPEC_PANEL',
  'OPEN_DEV_PANEL',
  'CLOSE_DEV_PANEL',
  'CLOSE_CITY_PANEL',
  'START_RESEARCH',
  'QUEUE_RESEARCH',
  'SWITCH_RESEARCH_POLICY',
  'BEGIN_TURN',
  'END_PLAYER_PHASE',
  // Extension actions
  'EXT_BEGIN_RESEARCH',
  'EXT_BEGIN_CULTURE_RESEARCH',
  'EXT_QUEUE_PRODUCTION',
  'EXT_MOVE_UNIT',
  'EXT_ADD_TILE',
  'EXT_ADD_CITY',
  'EXT_ADD_UNIT',
  'EXT_FOUND_CITY',
  'EXT_ISSUE_MOVE_PATH',
  'MOVE_UNIT',
  'FORTIFY_UNIT',
  // New actions
  'AI_PERFORM_ACTIONS',
  'SET_TILE_IMPROVEMENT',
  'REMOVE_TILE_IMPROVEMENT',
  'SET_CITY_TILE',
  'ADD_UNIT_STATE',
  'REMOVE_UNIT_STATE',
  'SET_UNIT_LOCATION',
  'SET_PLAYER_SCORES',
] as const;
