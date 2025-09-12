import { LeaderPersonality } from '../types';

/**
 * @file This file contains the definitions for the different leader personalities in the game.
 */

/**
 * An array of leader personalities.
 */
export const LEADER_PERSONALITIES: LeaderPersonality[] = [
  {
    id: 'scientist',
    name: 'Scientist',
    aggression: 0.2,
    scienceFocus: 0.8,
    cultureFocus: 0.2,
    expansionism: 0.3,
  },
  {
    id: 'culturalist',
    name: 'Culturalist',
    aggression: 0.2,
    scienceFocus: 0.2,
    cultureFocus: 0.8,
    expansionism: 0.3,
  },
  {
    id: 'expansionist',
    name: 'Expansionist',
    aggression: 0.6,
    scienceFocus: 0.3,
    cultureFocus: 0.3,
    expansionism: 0.8,
  },
  {
    id: 'balanced',
    name: 'Balanced',
    aggression: 0.4,
    scienceFocus: 0.5,
    cultureFocus: 0.5,
    expansionism: 0.5,
  },
];

/**
 * Gets a leader personality by its ID.
 * @param id - The ID of the leader to get.
 * @returns The leader personality.
 * @throws An error if the leader is not found.
 */
export function getLeader(id: string): LeaderPersonality {
  const found = LEADER_PERSONALITIES.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown leader ${id}`);
  return found;
}
