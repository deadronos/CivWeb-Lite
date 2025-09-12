import { useMemo } from 'react';
import type { PlayerState, TechNode } from '../game/types';

/**
 * @file This file contains the useAvailableTechs hook, which returns a list of available technologies for a player.
 */

/**
 * Represents an available technology.
 * @property id - The unique ID of the technology.
 * @property label - The name of the technology.
 * @property cost - The cost of the technology.
 * @property prerequisites - An array of technology IDs that are required to research this technology.
 */
interface AvailableTech {
  id: string;
  label: string;
  cost: number;
  prerequisites: string[];
}

/**
 * A hook that returns a list of available technologies for a player.
 * @param techCatalog - The technology catalog.
 * @param player - The player state.
 * @returns An array of available technologies.
 */
export function useAvailableTechs(
  techCatalog: TechNode[],
  player: PlayerState
): AvailableTech[] {
  return useMemo(() => {
    const { researchedTechIds, researching } = player;
    const currentTechId = researching?.techId;
    const queue = player.researchQueue || [];

    return techCatalog
      .filter(tech => 
        !researchedTechIds.includes(tech.id) &&
        currentTechId !== tech.id &&
        !queue.includes(tech.id) &&
        tech.prerequisites.every(pr => researchedTechIds.includes(pr))
      )
      .map(tech => ({
        id: tech.id,
        label: tech.name,
        cost: tech.cost,
        prerequisites: tech.prerequisites,
      }));
  }, [
    techCatalog.length, // Stable if catalog doesn't change often
    player.researchedTechIds.length,
    player.researching?.techId,
    (player.researchQueue || []).length
  ]);
}
