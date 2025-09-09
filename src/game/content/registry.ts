import type { Technology } from './types';
import unitsData from '../../data/units.json';
import improvementsData from '../../data/improvements.json';
import buildingsData from '../../data/buildings.json';

export interface UnitVisualDef {
  model: string;
  scale?: number | [number, number, number];
  offsetY?: number;
  anim?: { bobAmp?: number; bobSpeed?: number };
  gltf?: string; // optional GLTF label or path
}

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

export interface ImprovementDef {
  id: string;
  yield: { food?: number; production?: number; gold?: number };
  buildTime: number; // turns with worker
}

export interface BuildingDef {
  id: string;
  name: string;
  cost: number;
  requires: string | null;
  yields?: { food?: number; production?: number; gold?: number; science?: number; culture?: number; faith?: number };
  effects?: string[];
}

// Build registries from JSON data at module load time to keep synchronous APIs
export const UNIT_TYPES: Record<string, UnitTypeDef> = Object.fromEntries(
  (unitsData as any[]).map(u => {
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
      : ((u as any).model
          ? { model: (u as any).model }
          : undefined);

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

export const IMPROVEMENTS: Record<string, ImprovementDef> = Object.fromEntries(
  (improvementsData as any[]).map((imp) => [imp.id, imp as ImprovementDef])
);

export const BUILDINGS: Record<string, BuildingDef> = Object.fromEntries(
  (buildingsData as any[]).map((b) => [b.id, b as BuildingDef])
);

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
