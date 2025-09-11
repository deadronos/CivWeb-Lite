import { GameState } from './types';
import { UnitMovePayload, ProductionOrder } from './types/ui';

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
  | { type: 'PREVIEW_PATH'; payload: { unitId: string; targetTileId: string } }
  | { type: 'ISSUE_MOVE'; payload: UnitMovePayload }
  | { type: 'CANCEL_SELECTION'; payload: { unitId: string } }
  | { type: 'OPEN_CITY_PANEL'; payload: { cityId: string } }
  | { type: 'CHOOSE_PRODUCTION_ITEM'; payload: { cityId: string; order: ProductionOrder } }
  | { type: 'REORDER_PRODUCTION_QUEUE'; payload: { cityId: string; newQueue: ProductionOrder[] } }
  | { type: 'CANCEL_ORDER'; payload: { cityId: string; orderIndex: number } }
  | { type: 'OPEN_RESEARCH_PANEL'; payload?: {} }
  | { type: 'CLOSE_RESEARCH_PANEL'; payload?: {} }
  | { type: 'CLOSE_CITY_PANEL'; payload?: {} }
  | { type: 'START_RESEARCH'; payload: { playerId: string; techId: string } }
  | { type: 'QUEUE_RESEARCH'; payload: { playerId: string; techId: string } }
  | { type: 'BEGIN_TURN'; payload: { playerId: string } }
  | { type: 'END_PLAYER_PHASE'; payload: { playerId: string } }
  // Extension actions (biomes/units/cities/tech)
  | { type: 'EXT_BEGIN_RESEARCH'; payload: { techId: string } }
  | { type: 'EXT_BEGIN_CULTURE_RESEARCH'; payload: { civicId: string } }
  | {
      type: 'EXT_QUEUE_PRODUCTION';
      payload: {
        cityId: string;
        order: { type: 'unit' | 'improvement' | 'building'; item: string; turns: number };
      };
    }
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
      type: 'EXT_ISSUE_MOVE_PATH';
      payload: { unitId: string; path: string[]; confirmCombat?: boolean };
    };
// Runtime helper used for lightweight runtime checks and to improve coverage in tests.
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
  'PREVIEW_PATH',
  'ISSUE_MOVE',
  'CANCEL_SELECTION',
  'OPEN_CITY_PANEL',
  'CHOOSE_PRODUCTION_ITEM',
  'REORDER_PRODUCTION_QUEUE',
  'CANCEL_ORDER',
  'OPEN_RESEARCH_PANEL',
  'CLOSE_RESEARCH_PANEL',
  'CLOSE_CITY_PANEL',
  'START_RESEARCH',
  'QUEUE_RESEARCH',
  'BEGIN_TURN',
  'END_PLAYER_PHASE',
  // Extension actions
  'EXT_BEGIN_RESEARCH',
  'EXT_BEGIN_CULTURE_RESEARCH',
  'EXT_QUEUE_PRODUCTION',
  'EXT_ADD_TILE',
  'EXT_ADD_CITY',
  'EXT_ADD_UNIT',
  'EXT_MOVE_UNIT',
] as const;
