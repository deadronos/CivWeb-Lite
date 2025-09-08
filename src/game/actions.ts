import { GameState } from './types';

export type GameAction =
  | { type: 'INIT'; payload?: { seed?: string; width?: number; height?: number } }
  | { type: 'END_TURN' }
  | { type: 'SET_RESEARCH'; playerId: string; payload: { techId: string } }
  | { type: 'ADVANCE_RESEARCH'; playerId: string; payload?: { points?: number } }
  | { type: 'AUTO_SIM_TOGGLE'; payload?: { enabled?: boolean } }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'LOG_EVENT'; payload: { entry: GameState['log'][number] } }
  | { type: 'RECORD_AI_PERF'; payload: { duration: number } };

// Runtime helper used for lightweight runtime checks and to improve coverage in tests.
export const GAME_ACTION_TYPES = ['INIT', 'END_TURN', 'SET_RESEARCH', 'ADVANCE_RESEARCH', 'AUTO_SIM_TOGGLE', 'LOAD_STATE', 'LOG_EVENT', 'RECORD_AI_PERF'] as const;
