import type { GameStateExtension, Technology, Civic } from './types';
import { TECHS } from './registry';
import { loadTechs, loadCivics } from '../../data/loader';

/**
 * @file This file contains functions for creating and initializing the game state extension.
 */

/**
 * Creates an empty game state extension.
 * @returns An empty game state extension.
 */
export function createEmptyState(): GameStateExtension {
  return {
    tiles: {},
    units: {},
    cities: {},
    techs: { ...TECHS },
    civics: {},
    playerState: {
      researchedTechs: [],
      researchedCivics: [],
      availableUnits: [],
      availableImprovements: [],
      science: 0,
      culture: 0,
      research: undefined,
      cultureResearch: undefined,
    },
  };
}

/**
 * Creates a game state extension with data loaded from JSON files.
 * @returns A promise that resolves to the new game state extension.
 */
export async function createStateWithLoadedData(): Promise<GameStateExtension> {
  const base = createEmptyState();
  try {
    const techList = await loadTechs();
    const techs: Record<string, Technology> = {} as any;
    for (const t of techList) {
      techs[t.id] = {
        id: t.id,
        name: t.name,
        description: '',
        cost: t.cost,
        prerequisites: t.prerequisites,
        unlocks: {
          units: t.unlocks?.units ?? [],
          improvements: t.unlocks?.improvements ?? [],
          abilities: [],
        },
      };
    }
    base.techs = techs;
  } catch {
    // Fallback already in base
  }
  try {
    const civicList = await loadCivics();
    const civics: Record<string, Civic> = {} as any;
    for (const c of civicList) {
      civics[c.id] = {
        id: c.id,
        name: c.name,
        description: '',
        cost: c.culture_cost,
        prerequisites: c.prereqs,
        unlocks: {
          units: c.unlocks?.units ?? [],
          improvements: c.unlocks?.improvements ?? [],
          abilities: [],
          buildings: c.unlocks?.buildings ?? [],
        },
      };
    }
    base.civics = civics;
  } catch {
    // optional
  }
  return base;
}
