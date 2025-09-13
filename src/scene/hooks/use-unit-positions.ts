import React from 'react';
import { useGame } from '../../hooks/use-game';
import { axialToWorld, tileIdToWorldFromExt as tileIdToWorldFromExtension, DEFAULT_HEX_SIZE } from '../utils/coords';

export type UnitPosition = {
  id: string;
  type: string;
  position: [number, number, number];
};

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
        // Use the same hex size as the scene so labels align with tiles
        xz = tileIdToWorldFromExtension(extension as any, u.location, DEFAULT_HEX_SIZE);
      } else if (
        u.location &&
        typeof (u.location as any).q === 'number' &&
        typeof (u.location as any).r === 'number'
      ) {
        xz = axialToWorld((u.location as any).q, (u.location as any).r, DEFAULT_HEX_SIZE);
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
