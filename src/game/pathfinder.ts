
export type CombatPreview = {
  tileId: string;
  attackerUnitId: string;
  defender: { kind: 'unit'|'city'; id: string; ownerId: string } | null;
  requiresConfirm: boolean;
  expectedOutcome: 'unknown';
};import type { GameStateExt, Hextile, Unit } from './content/types';
import { neighbors as hexNeighbors } from './world/hex';
import { movementCost, isPassable } from './content/biomes';
import { UNIT_TYPES } from './content/registry';

type Node = { id: string; cost: number; prev?: string };

function keyOf(tile: Hextile) {
  return `${tile.q},${tile.r}`;
}

function buildIndex(tiles: Record<string, Hextile>): Map<string, string> {
  const idx = new Map<string, string>();
  for (const t of Object.values(tiles)) {
    idx.set(keyOf(t), t.id);
  }
  return idx;
}

function passableFor(state: GameStateExt, unit: Unit, tile: Hextile): boolean {
  const def = UNIT_TYPES[unit.type];
  if (!def) return false;
  return isPassable(tile, { unitAbilities: unit.abilities, unitDomain: def.domain });
}

export function computePath(
  state: GameStateExt,
  unitId: string,
  targetTileId: string
): { path: string[]; totalCost: number } | { path: null; totalCost: number } {
  const unit = state.units[unitId];
  const start = unit ? state.tiles[unit.location] : undefined;
  const goal = state.tiles[targetTileId];
  if (!unit || !start || !goal) return { path: null, totalCost: Infinity };
  const def = UNIT_TYPES[unit.type];
  if (!def) return { path: null, totalCost: Infinity };
  const idx = buildIndex(state.tiles);

  // Dijkstra with predecessor map and simple sorted queue
  const pred = new Map<string, string | undefined>();
  const dist = new Map<string, number>();
  const pq: string[] = [];
  const push = (id: string) => {
    let i = 0;
    const d = dist.get(id)!;
    while (i < pq.length && dist.get(pq[i])! <= d) i++;
    pq.splice(i, 0, id);
  };
  dist.set(start.id, 0);
  pred.set(start.id, undefined);
  push(start.id);
  while (pq.length) {
    const cid = pq.shift()!;
    if (cid === goal.id) break;
    const ct = state.tiles[cid];
    const neighCoords = hexNeighbors({ q: ct.q, r: ct.r });
    for (const nc of neighCoords) {
      const nid = idx.get(`${nc.q},${nc.r}`);
      if (!nid) continue;
      const nt = state.tiles[nid];
      if (!passableFor(state, unit, nt)) continue;
      const step = Math.ceil(
        movementCost(nt, { unitAbilities: unit.abilities, unitDomain: def.domain })
      );
      const alt = (dist.get(cid) ?? Infinity) + step;
      if (alt < (dist.get(nid) ?? Infinity)) {
        dist.set(nid, alt);
        pred.set(nid, cid);
        const existingIndex = pq.indexOf(nid);
        if (existingIndex >= 0) pq.splice(existingIndex, 1);
        push(nid);
      }
    }
  }
  if (!pred.has(goal.id)) return { path: null, totalCost: Infinity };
  const out: string[] = [];
  let cur: string | undefined = goal.id;
  while (cur) {
    out.push(cur);
    cur = pred.get(cur);
  }
  out.reverse();
  // detect combat if path enters enemy tile
  let combat: CombatPreview | undefined;
  for (const tid of out.slice(1)) {
    const t = state.tiles[tid];
    if (!t) continue;
    let def: CombatPreview['defender'] = null;
    if (t.occupantCityId) {
      const c = state.cities[t.occupantCityId];
      if (c && c.ownerId !== unit.ownerId) {
        def = { kind: 'city', id: c.id, ownerId: c.ownerId };
      }
    }
    if (!def) {
      for (const other of Object.values(state.units)) {
        if (other.id !== unit.id && other.location === tid && other.ownerId !== unit.ownerId) {
          def = { kind: 'unit', id: other.id, ownerId: other.ownerId };
          break;
        }
      }
    }
    if (def) {
      combat = { tileId: tid, attackerUnitId: unit.id, defender: def, requiresConfirm: true, expectedOutcome: 'unknown' };
      break;
    }
  }
  return { path: out, totalCost: dist.get(goal.id) ?? Infinity, ...(combat ? { combatPreview: combat } : {}) };
}
export function computeMovementRange(state: GameStateExt, unitId: string): { reachable: string[]; cost: Record<string, number> } {
  const unit = state.units[unitId];
  const start = unit ? state.tiles[unit.location] : undefined;
  if (!unit || !start) return { reachable: [], cost: {} };
  const def = UNIT_TYPES[unit.type];
  if (!def) return { reachable: [], cost: {} };
  const idx = buildIndex(state.tiles);
  const dist = new Map<string, number>();
  const reachable: string[] = [];
  const pq: string[] = [];
  const push = (id: string) => {
    let i = 0;
    const d = dist.get(id)!;
    while (i < pq.length && dist.get(pq[i])! <= d) i++;
    pq.splice(i, 0, id);
  };
  dist.set(start.id, 0);
  push(start.id);
  while (pq.length) {
    const cid = pq.shift()!;
    const ccost = dist.get(cid)!;
    if (ccost <= unit.movementRemaining && cid !== start.id) reachable.push(cid);
    const ct = state.tiles[cid];
    const neighCoords = hexNeighbors({ q: ct.q, r: ct.r });
    for (const nc of neighCoords) {
      const nid = idx.get(`${nc.q},${nc.r}`);
      if (!nid) continue;
      const nt = state.tiles[nid];
      if (!passableFor(state, unit, nt)) continue;
      const step = Math.ceil(movementCost(nt, { unitAbilities: unit.abilities, unitDomain: def.domain }));
      const alt = ccost + step;
      if (alt < (dist.get(nid) ?? Infinity)) {
        dist.set(nid, alt);
        const existingIndex = pq.indexOf(nid);
        if (existingIndex >= 0) pq.splice(existingIndex, 1);
        push(nid);
      }
    }
  }
  const cost: Record<string, number> = {};
  for (const [k, v] of dist.entries()) cost[k] = v;
  return { reachable, cost };
}