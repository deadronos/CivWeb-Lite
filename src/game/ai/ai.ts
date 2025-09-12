import { GameAction } from '../actions';
import { GameState, PlayerState, TechNode } from '../types';

/**
 * @file This file contains the core AI logic for choosing the next technology to research.
 */

/**
 * Chooses the next technology for an AI player to research.
 * @param player - The player state.
 * @param state - The current game state.
 * @returns The technology node to research, or undefined if no valid technology is found.
 */
function chooseNextTech(player: PlayerState, state: GameState): TechNode | undefined {
  // be defensive: tests may provide partial player shapes
  const leader = (player.leader as any) || { scienceFocus: 0, cultureFocus: 0 };
  const researched: string[] = Array.isArray((player as any).researchedTechIds)
    ? (player as any).researchedTechIds
    : [];
  const prefTree = leader.scienceFocus >= leader.cultureFocus ? 'science' : 'culture';
  const candidate = state.techCatalog.find((t) => {
    const prereqs: string[] = Array.isArray((t as any).prerequisites)
      ? (t as any).prerequisites
      : [];
    return (
      t.tree === prefTree &&
      !researched.includes(t.id) &&
      prereqs.every((p) => researched.includes(p))
    );
  });
  return candidate;
}

/**
 * Evaluates the current game state for an AI player and returns a list of actions to perform.
 * @param player - The player state.
 * @param state - The current game state.
 * @returns An array of game actions.
 */
export function evaluateAI(player: PlayerState, state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  if (!player.researching) {
    const tech = chooseNextTech(player, state);
    if (tech) {
      actions.push({ type: 'SET_RESEARCH', playerId: player.id, payload: { techId: tech.id } });
    }
  }
  return actions;
}
