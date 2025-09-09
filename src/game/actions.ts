import { GameState } from './types';

export type GameAction =
  | { type: 'INIT'; payload?: { seed?: string; width?: number; height?: number } }
  | { type: 'END_TURN' }
  | { type: 'SET_RESEARCH'; playerId: string; payload: { techId: string } }
  | { type: 'ADVANCE_RESEARCH'; playerId: string; payload?: { points?: number } }
  | { type: 'AUTO_SIM_TOGGLE'; payload?: { enabled?: boolean } }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'LOG_EVENT'; payload: { entry: GameState['log'][number] } }
  | { type: 'RECORD_AI_PERF'; payload: { duration: number } }
  // Extension actions (biomes/units/cities/tech)
  | { type: 'EXT_BEGIN_RESEARCH'; payload: { techId: string } }
  | { type: 'EXT_QUEUE_PRODUCTION'; payload: { cityId: string; order: { type: 'unit' | 'improvement'; item: string; turns: number } } }
  | { type: 'EXT_ADD_TILE'; payload: { tile: { id: string; q: number; r: number; biome: string } } }
  | { type: 'EXT_ADD_CITY'; payload: { cityId: string; name: string; ownerId: string; tileId: string } }
  | { type: 'EXT_ADD_UNIT'; payload: { unitId: string; type: string; ownerId: string; tileId: string } }
  | { type: 'EXT_MOVE_UNIT'; payload: { unitId: string; toTileId: string } };

// Runtime helper used for lightweight runtime checks and to improve coverage in tests.
export const GAME_ACTION_TYPES = [
  'INIT',
  'END_TURN',
  'SET_RESEARCH',
  'ADVANCE_RESEARCH',
  'AUTO_SIM_TOGGLE',
  'LOAD_STATE',
  'LOG_EVENT',
  'RECORD_AI_PERF',
  'EXT_BEGIN_RESEARCH',
  'EXT_QUEUE_PRODUCTION',
  'EXT_ADD_TILE',
  'EXT_ADD_CITY',
  'EXT_ADD_UNIT',
  'EXT_MOVE_UNIT',
] as const;
