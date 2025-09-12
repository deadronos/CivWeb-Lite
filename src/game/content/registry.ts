import type { Technology } from './types';
import unitsData from '../../data/units.json';
import improvementsData from '../../data/improvements.json';
import buildingsData from '../../data/buildings.json';

/**
 * @file This file contains the registry for all game content, such as units, improvements, and buildings.
 */

/**
 * Represents the visual definition of a unit.
 * @property model - The model to use for the unit.
 * @property scale - The scale of the model.
 * @property offsetY - The vertical offset of the model.
 * @property anim - Animation properties for the model.
 * @property gltf - The GLTF label or path for the model.
 */
export interface UnitVisualDef {
  model: string;
  scale?: number | [number, number, number];
  offsetY?: number;
  anim?: { bobAmp?: number; bobSpeed?: number };
  gltf?: string; // optional GLTF label or path
}

/**
 * Represents the definition of a unit type.
 * @property id - The unique ID of the unit type.
 * @property domain - The domain of the unit ('land' or 'naval').
 * @property base - The base stats of the unit.
 * @property abilities - An array of abilities for the unit.
 * @property cost - The production cost of the unit.
 * @property model - The model to use for the unit (deprecated).
 * @property visual - The visual definition of the unit.
 */
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
  model?: string; // deprecated: use visual.model; kept for compatibility
  visual?: UnitVisualDef; // label-driven visuals and animation hints
}

/**
 * Represents the definition of a tile improvement.
 * @property id - The unique ID of the improvement.
 * @property yield - The yields provided by the improvement.
 * @property buildTime - The time it takes to build the improvement.
 */
export interface ImprovementDef {
  id: string;
  yield: { food?: number; production?: number; gold?: number };
  buildTime: number; // turns with worker
}

/**
 * Represents the definition of a building.
 * @property id - The unique ID of the building.
 * @property name - The name of the building.
 * @property cost - The production cost of the building.
 * @property requires - The technology required to build the building.
 * @property yields - The yields provided by the building.
 * @property effects - An array of effects provided by the building.
 */
export interface BuildingDef {
  id: string;
  name: string;
  cost: number;
  requires: string | null;
  yields?: {
    food?: number;
    production?: number;
    gold?: number;
    science?: number;
    culture?: number;
    faith?: number;
  };
  effects?: string[];
}

/**
 * A record of all unit types, indexed by their ID.
 */
export const UNIT_TYPES: Record<string, UnitTypeDef> = Object.fromEntries(
  (unitsData as any[]).map((u) => {
    const domain: 'land' | 'naval' = u.category === 'naval' ? 'naval' : 'land';
    const attack = typeof u.strength === 'number' ? u.strength : 0;
    const defense = Math.max(0, Math.round((u.strength ?? 0) * 0.7));
    const sight = 2;
    const hp = 100;
    const visual: UnitTypeDef['visual'] | undefined = (u as any).visual
      ? {
          model: (u as any).visual.model ?? (u as any).model ?? u.id,
          scale: (u as any).visual.scale,
          offsetY: (u as any).visual.offsetY,
          anim: (u as any).visual.anim,
          gltf: (u as any).visual.gltf,
        }
      : (u as any).model
        ? { model: (u as any).model }
        : undefined;

    return [
      u.id,
      {
        id: u.id,
        domain,
        base: { movement: u.movement ?? 2, attack, defense, sight, hp },
        abilities: u.abilities ?? [],
        cost: Math.max(1, Math.round((u.cost ?? 40) / 40)), // rough turn estimate at prod=1
        model: (u as any).model || undefined,
        visual,
      } as UnitTypeDef,
    ];
  })
);

/**
 * A record of all tile improvements, indexed by their ID.
 */
export const IMPROVEMENTS: Record<string, ImprovementDef> = Object.fromEntries(
  (improvementsData as any[]).map((imp) => [imp.id, imp as ImprovementDef])
);

/**
 * A record of all buildings, indexed by their ID.
 */
export const BUILDINGS: Record<string, BuildingDef> = Object.fromEntries(
  (buildingsData as any[]).map((b) => [b.id, b as BuildingDef])
);

/**
 * A record of all technologies, indexed by their ID.
 */
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
