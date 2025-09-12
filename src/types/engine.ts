/**
 * @file This file contains lightweight engine types.
 */

// Lightweight engine types - re-export canonical GameAction from game/actions
/**
 * Represents a universally unique identifier.
 */
export type UUID = string;

// Re-export GameAction from canonical source to keep a single truth
import type { GameAction } from '../game/actions';

/**
 * Represents a batch of actions for a player.
 * @property playerId - The ID of the player.
 * @property actions - An array of game actions.
 */
export interface ActionBatch {
  playerId: UUID;
  actions: GameAction[];
}

export default {};
