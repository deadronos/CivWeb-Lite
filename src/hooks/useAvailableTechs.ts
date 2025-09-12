import { useMemo } from 'react';
import type { PlayerState, TechNode } from '../game/types';

interface AvailableTech {
  id: string;
  label: string;
  cost: number;
  prerequisites: string[];
}

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
