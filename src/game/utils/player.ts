import { PlayerState } from '../types';

export function findPlayer(players: PlayerState[], id: string) {
  return players.find((p) => p.id === id);
}
