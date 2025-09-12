import React from 'react';
import { useGame } from '../../hooks/use-game';
import { axialToWorld, tileIdToWorldFromExt as tileIdToWorldFromExtension } from '../utils/coords';

/**
 * @file This file contains hooks for getting the positions of units.
 */

/**
 * Represents the position of a unit.
 * @property id - The unique ID of the unit.
 * @property type - The type of the unit.
 * @property position - The position of the unit in world coordinates.
 */
export type UnitPosition = {
  id: string;
  type: string;
  position: [number, number, number];
};

/**
 * Represents the options for the useUnitPositions hook.
 * @property y - The y-coordinate to use for the unit positions.
 * @property ownerId - The ID or IDs of the owner of the units to get.
 * @property unitType - The type or types of the units to get.
 * @property predicate - A function to filter the units.
 */
export type UseUnitPositionsOptions = {
  y?: number;
  ownerId?: string | string[];
  unitType?: string | string[];
  predicate?: (u: any) => boolean;
};

function toSet(v?: string | string[]) {
  if (!v) return;
  return new Set(Array.isArray(v) ? v : [v]);
}

/**
 * A hook that returns the positions of units.
 * @param options - The options for the hook.
 * @returns An array of unit positions.
 */
export function useUnitPositions(options: UseUnitPositionsOptions = {}): UnitPosition[] {
  const y = options.y ?? 0;
  const { state } = useGame();
  const extension = state.contentExt;
  const ownerSet = toSet(options.ownerId);
  const typeSet = toSet(options.unitType);
  return React.useMemo(() => {
    if (!extension) return [] as UnitPosition[];
    const out: UnitPosition[] = [];
    for (const u of Object.values(extension.units) as any[]) {
      if (ownerSet && !ownerSet.has((u as any).ownerId)) continue;
      if (typeSet && !typeSet.has((u as any).type)) continue;
      if (options.predicate && !options.predicate(u)) continue;
      let xz: [number, number] | undefined;
      if (typeof u.location === 'string') {
        xz = tileIdToWorldFromExtension(extension as any, u.location);
      } else if (
        u.location &&
        typeof (u.location as any).q === 'number' &&
        typeof (u.location as any).r === 'number'
      ) {
        xz = axialToWorld((u.location as any).q, (u.location as any).r);
      }
      const [x, z] = (xz ?? [0, 0]) as [number, number];
      out.push({ id: u.id, type: (u as any).type, position: [x, y, z] });
    }
    return out;
  }, [
    extension,
    y,
    ownerSet && [...ownerSet].join(','),
    typeSet && [...typeSet].join(','),
    options.predicate,
  ]);
}

/**
 * A hook that returns a map of unit positions, indexed by unit ID.
 * @param options - The options for the hook.
 * @returns A map of unit positions.
 */
export function useUnitPositionMap(
  options: UseUnitPositionsOptions = {}
): Record<string, UnitPosition> {
  const list = useUnitPositions(options);
  return React.useMemo(() => {
    const map: Record<string, UnitPosition> = {};
    for (const u of list) map[u.id] = u;
    return map;
  }, [list]);
}
