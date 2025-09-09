import type { Technology } from './types';

export interface UnitTypeDef {
  id: string;
  domain: 'land' | 'naval';
  base: {
    movement: number;
    attack: number;
    defense: number;
    sight: number;
    hp?: number;
  };
  abilities?: string[];
  cost?: number; // turns at production 1
}

export interface ImprovementDef {
  id: string;
  yield: { food?: number; production?: number; gold?: number };
  buildTime: number; // turns with worker
}

export const UNIT_TYPES: Record<string, UnitTypeDef> = {
  worker: {
    id: 'worker',
    domain: 'land',
    base: { movement: 2, attack: 0, defense: 1, sight: 2, hp: 100 },
    abilities: [],
    cost: 2,
  },
  warrior: {
    id: 'warrior',
    domain: 'land',
    base: { movement: 2, attack: 6, defense: 4, sight: 2, hp: 100 },
    abilities: [],
    cost: 2,
  },
  settler: {
    id: 'settler',
    domain: 'land',
    base: { movement: 2, attack: 0, defense: 0, sight: 2, hp: 100 },
    abilities: [],
    cost: 3,
  },
  scout: {
    id: 'scout',
    domain: 'land',
    base: { movement: 3, attack: 2, defense: 1, sight: 3, hp: 100 },
    abilities: [],
    cost: 2,
  },
};

export const IMPROVEMENTS: Record<string, ImprovementDef> = {
  farm: { id: 'farm', yield: { food: 1 }, buildTime: 2 },
  mine: { id: 'mine', yield: { production: 2 }, buildTime: 3 },
  road: { id: 'road', yield: { gold: 0.1 }, buildTime: 1 },
};

export const TECHS: Record<string, Technology> = {
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Enables farms and improves food yields.',
    cost: 6,
    prerequisites: [],
    unlocks: { improvements: ['farm'] },
  },
};

