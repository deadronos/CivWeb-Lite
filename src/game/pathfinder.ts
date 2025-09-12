import type { GameStateExt as GameStateExtension, Hextile, Unit } from './content/types';
import { neighbors as hexNeighbors } from './world/hex';
import { movementCost, isPassable } from './content/biomes';
import { UNIT_TYPES } from './content/registry';

/**
 * @file This file contains functions for pathfinding and movement range calculation.
 */

/**
 * Represents a preview of a potential combat encounter.
 * @property tileId - The ID of the tile where the combat would occur.
 * @property attackerUnitId - The ID of the attacking unit.
 * @property defender - The defending unit or city, if any.
 * @property requiresConfirm - Whether the combat requires user confirmation.
 * @property expectedOutcome - The expected outcome of the combat.
 */
export type CombatPreview = {
  tileId: string;
  attackerUnitId: string;
  defender: { kind: 'unit' | 'city'; id: string; ownerId: string } | undefined;
  requiresConfirm: boolean;
  expectedOutcome: 'unknown';
};

// ...existing code...

function keyOf(tile: Hextile) {
  return `${tile.q},${tile.r}`;
}

function buildIndex(tiles: Record<string, Hextile>): Map<string, string> {
  const index = new Map<string, string>();
  for (const t of Object.values(tiles)) {
    index.set(keyOf(t), t.id);
  }
  return index;
}

function passableFor(state: GameStateExtension, unit: Unit, tile: Hextile): boolean {
  const unitDef = UNIT_TYPES[unit.type];
  if (!unitDef) return false;
  return isPassable(tile, { unitAbilities: unit.abilities, unitDomain: unitDef.domain });
}

/**
 * Computes the shortest path for a unit to a target tile.
 * @param state - The game state.
 * @param unitId - The ID of the unit to move.
 * @param targetTileId - The ID of the target tile.
 * @param width - The width of the world map.
 * @param height - The height of the world map.
 * @returns An object containing the path, total cost, and a combat preview if applicable.
 */
export function computePath(
  state: GameStateExtension,
  unitId: string,
  targetTileId: string,
  width?: number,
  height?: number
):
  | { path: string[]; totalCost: number; combatPreview?: CombatPreview }
  | { path: null; totalCost: number } {
  const unit = state.units[unitId];
  const start = unit ? state.tiles[unit.location] : undefined;
  const goal = state.tiles[targetTileId];
  if (!unit || !start || !goal) return { path: null, totalCost: Infinity };
  const unitDef = UNIT_TYPES[unit.type];
  if (!unitDef) return { path: null, totalCost: Infinity };
  const index = buildIndex(state.tiles);

  // Dijkstra with predecessor map and simple sorted queue
  const pred = new Map<string, string | undefined>();
  const distribution = new Map<string, number>();
  const pq: string[] = [];
  const push = (id: string) => {
    let index_ = 0;
    const d = distribution.get(id)!;
    while (index_ < pq.length && distribution.get(pq[index_])! <= d) index_++;
    pq.splice(index_, 0, id);
  };
  distribution.set(start.id, 0);
  pred.set(start.id, undefined);
  push(start.id);
  while (pq.length > 0) {
    const cid = pq.shift()!;
    if (cid === goal.id) break;
    const ct = state.tiles[cid];
    const neighCoords = hexNeighbors({ q: ct.q, r: ct.r }, width, height);
    for (const nc of neighCoords) {
      const nid = index.get(`${nc.q},${nc.r}`);
      if (!nid) continue;
      const nt = state.tiles[nid];
      if (!passableFor(state, unit, nt)) continue;
      const step = Math.ceil(
        movementCost(nt, { unitAbilities: unit.abilities, unitDomain: unitDef.domain })
      );
      const alt = (distribution.get(cid) ?? Infinity) + step;
      if (alt < (distribution.get(nid) ?? Infinity)) {
        distribution.set(nid, alt);
        pred.set(nid, cid);
        const existingIndex = pq.indexOf(nid);
        if (existingIndex !== -1) pq.splice(existingIndex, 1);
        push(nid);
      }
    }
  }
  if (!pred.has(goal.id)) return { path: null, totalCost: Infinity };
  const out: string[] = [];
  let current: string | undefined = goal.id;
  while (current) {
    out.push(current);
    current = pred.get(current);
  }
  out.reverse();
  // detect combat if path enters enemy tile
  let combat: CombatPreview | undefined;
  for (const tid of out.slice(1)) {
    const t = state.tiles[tid];
    if (!t) continue;
    let defender: CombatPreview['defender'] = undefined;
    if (t.occupantCityId) {
      const c = state.cities[t.occupantCityId];
      if (c && c.ownerId !== unit.ownerId) {
        defender = { kind: 'city', id: c.id, ownerId: c.ownerId };
      }
    }
    if (!defender) {
      for (const other of Object.values(state.units) as Unit[]) {
        if (other.id !== unit.id && other.location === tid && other.ownerId !== unit.ownerId) {
          defender = { kind: 'unit', id: other.id, ownerId: other.ownerId };
          break;
        }
      }
    }
    if (defender) {
      combat = {
        tileId: tid,
        attackerUnitId: unit.id,
        defender: defender,
        requiresConfirm: true,
        expectedOutcome: 'unknown',
      };
      break;
    }
  }
  return {
    path: out,
    totalCost: distribution.get(goal.id) ?? Infinity,
    ...(combat ? { combatPreview: combat } : {}),
  };
}

/**
 * Computes the movement range of a unit.
 * @param state - The game state.
 * @param unitId - The ID of the unit.
 * @param width - The width of the world map.
 * @param height - The height of the world map.
 * @returns An object containing the reachable tiles and the cost to reach them.
 */
export function computeMovementRange(
  state: GameStateExtension,
  unitId: string,
  width?: number,
  height?: number
): { reachable: string[]; cost: Record<string, number> } {
  const unit = state.units[unitId];
  const start = unit ? state.tiles[unit.location] : undefined;
  if (!unit || !start) return { reachable: [], cost: {} };
  const unitDef = UNIT_TYPES[unit.type];
  if (!unitDef) return { reachable: [], cost: {} };
  const index = buildIndex(state.tiles);
  const distribution = new Map<string, number>();
  const reachable: string[] = [];
  const pq: string[] = [];
  const push = (id: string) => {
    let index_ = 0;
    const d = distribution.get(id)!;
    while (index_ < pq.length && distribution.get(pq[index_])! <= d) index_++;
    pq.splice(index_, 0, id);
  };
  distribution.set(start.id, 0);
  push(start.id);
  while (pq.length > 0) {
    const cid = pq.shift()!;
    const ccost = distribution.get(cid)!;
    if (ccost <= unit.movementRemaining && cid !== start.id) reachable.push(cid);
    const ct = state.tiles[cid];
    const neighCoords = hexNeighbors({ q: ct.q, r: ct.r }, width, height);
    for (const nc of neighCoords) {
      const nid = index.get(`${nc.q},${nc.r}`);
      if (!nid) continue;
      const nt = state.tiles[nid];
      if (!passableFor(state, unit, nt)) continue;
      const step = Math.ceil(
        movementCost(nt, { unitAbilities: unit.abilities, unitDomain: unitDef.domain })
      );
      const alt = ccost + step;
      if (alt < (distribution.get(nid) ?? Infinity)) {
        distribution.set(nid, alt);
        const existingIndex = pq.indexOf(nid);
        if (existingIndex !== -1) pq.splice(existingIndex, 1);
        push(nid);
      }
    }
  }
  const cost: Record<string, number> = {};
  for (const [k, v] of distribution.entries()) cost[k] = v;
  return { reachable, cost };
}
