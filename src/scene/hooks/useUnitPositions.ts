import React from 'react';
import { useGame } from '../../hooks/useGame';
import { axialToWorld, tileIdToWorldFromExt } from '../utils/coords';

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
  if (!v) return null;
  return new Set(Array.isArray(v) ? v : [v]);
}

export function useUnitPositions(opts: UseUnitPositionsOptions = {}): UnitPosition[] {
  const y = opts.y ?? 0;
  const { state } = useGame();
  const ext = state.contentExt;
  const ownerSet = toSet(opts.ownerId);
  const typeSet = toSet(opts.unitType);
  return React.useMemo(() => {
    if (!ext) return [] as UnitPosition[];
    const out: UnitPosition[] = [];
    for (const u of Object.values(ext.units)) {
      if (ownerSet && !ownerSet.has((u as any).ownerId)) continue;
      if (typeSet && !typeSet.has((u as any).type)) continue;
      if (opts.predicate && !opts.predicate(u)) continue;
      let xz: [number, number] | null = null;
      if (typeof u.location === 'string') {
        xz = tileIdToWorldFromExt(ext as any, u.location);
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
    ext,
    y,
    ownerSet && [...ownerSet].join(','),
    typeSet && [...typeSet].join(','),
    opts.predicate,
  ]);
}

export function useUnitPositionMap(
  opts: UseUnitPositionsOptions = {}
): Record<string, UnitPosition> {
  const list = useUnitPositions(opts);
  return React.useMemo(() => {
    const map: Record<string, UnitPosition> = {};
    for (const u of list) map[u.id] = u;
    return map;
  }, [list]);
}
