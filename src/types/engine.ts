// Lightweight engine types - re-export canonical GameAction from game/actions
export type UUID = string;

// Re-export GameAction from canonical source to keep a single truth
import type { GameAction } from '../game/actions';

// Minimal helper types used by tests and tooling
export interface ActionBatch {
  playerId: UUID;
  actions: GameAction[];
}

export default {};
