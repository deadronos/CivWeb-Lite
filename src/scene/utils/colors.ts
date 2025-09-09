import type { GameState } from '../../game/types';

const PALETTE = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

export function playerColor(state: GameState, playerId: string): string {
  const idx = state.players.findIndex(p => p.id === playerId);
  if (idx >= 0) return PALETTE[idx % PALETTE.length]!;
  return '#95a5a6';
}

