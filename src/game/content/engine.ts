import type { GameStateExt } from './types';
import { TECHS } from './registry';

export function createEmptyState(): GameStateExt {
  return {
    tiles: {},
    units: {},
    cities: {},
    techs: { ...TECHS },
    playerState: {
      researchedTechs: [],
      availableUnits: [],
      availableImprovements: [],
      science: 0,
      research: null,
    },
  };
}

