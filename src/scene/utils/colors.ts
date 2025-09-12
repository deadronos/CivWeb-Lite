import type { GameState } from '../../game/types';

/**
 * @file This file contains utility functions for working with colors.
 */

const PALETTE = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

/**
 * Gets the color for a given player.
 * @param state - The game state.
 * @param playerId - The ID of the player.
 * @returns The hex color string for the player.
 */
export function playerColor(state: GameState, playerId: string): string {
  const index = state.players.findIndex((p) => p.id === playerId);
  if (index !== -1) return PALETTE[index % PALETTE.length]!;
  return '#95a5a6';
}
