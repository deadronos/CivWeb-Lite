// Minimal data loader to import JSON definitions and validate shapes.
// Vite supports JSON imports; this provides typed accessors and simple validation.

/**
 * @file This file contains functions for loading data from JSON files.
 */

/**
 * Represents the structure of a technology in the JSON data.
 * @property id - The unique ID of the technology.
 * @property tree - The technology tree this node belongs to ('science' or 'culture').
 * @property name - The name of the technology.
 * @property cost - The cost to research this technology.
 * @property prerequisites - An array of technology IDs required to research this technology.
 * @property effects - An array of strings describing the effects of this technology.
 * @property unlocks - An object describing what this technology unlocks.
 */
export type TechJson = {
  id: string;
  tree: 'science' | 'culture';
  name: string;
  cost: number;
  prerequisites: string[];
  effects?: string[];
  unlocks?: { units?: string[]; buildings?: string[]; improvements?: string[] };
};

/**
 * Represents the structure of a unit in the JSON data.
 * @property id - The unique ID of the unit.
 * @property name - The name of the unit.
 * @property category - The category of the unit.
 * @property era - The era of the unit.
 * @property movement - The movement points of the unit.
 * @property strength - The combat strength of the unit.
 * @property ranged - Whether the unit has a ranged attack.
 * @property range - The range of the unit's attack.
 * @property cost - The production cost of the unit.
 * @property requires - The technology required to build the unit.
 * @property upgrade_to - The unit that this unit upgrades to.
 * @property abilities - An array of abilities for the unit.
 */
export type UnitJson = {
  id: string;
  name: string;
  category: string;
  era: string;
  movement: number;
  strength: number;
  ranged: boolean;
  range?: number;
  cost: number;
  requires: string | null;
  upgrade_to: string | null;
  abilities: string[];
};

/**
 * Represents the structure of a building in the JSON data.
 * @property id - The unique ID of the building.
 * @property name - The name of the building.
 * @property cost - The production cost of the building.
 * @property requires - The technology required to build the building.
 * @property yields - The yields provided by the building.
 * @property effects - An array of effects provided by the building.
 */
export type BuildingJson = {
  id: string;
  name: string;
  cost: number;
  requires: string | null | string;
  yields?: {
    food?: number;
    production?: number;
    gold?: number;
    science?: number;
    culture?: number;
    faith?: number;
  };
  effects?: string[];
};

/**
 * Represents the structure of a leader in the JSON data.
 * @property id - The unique ID of the leader.
 * @property name - The name of the leader.
 * @property historical_note - A historical note about the leader.
 * @property preferred_victory - The leader's preferred victory conditions.
 * @property weights - The leader's AI weights.
 */
export type LeaderJson = {
  id: string;
  name: string;
  historical_note: string;
  preferred_victory: string[];
  weights: {
    aggression: number;
    expansion: number;
    science: number;
    culture: number;
    trade: number;
    diplomacy: number;
  };
};

/**
 * Loads the technology data from the JSON file.
 * @returns A promise that resolves to an array of technologies.
 */
export async function loadTechs(): Promise<TechJson[]> {
  const data = await import('./techs.json');
  const list = (data.default ?? data) as TechJson[];
  validateDAG(list);
  return list;
}

/**
 * Loads the unit data from the JSON file.
 * @returns A promise that resolves to an array of units.
 */
export async function loadUnits(): Promise<UnitJson[]> {
  const data = await import('./units.json');
  return (data.default ?? data) as UnitJson[];
}

/**
 * Loads the building data from the JSON file.
 * @returns A promise that resolves to an array of buildings.
 */
export async function loadBuildings(): Promise<BuildingJson[]> {
  const data = await import('./buildings.json');
  return (data.default ?? data) as BuildingJson[];
}

/**
 * Loads the leader data from the JSON file.
 * @returns A promise that resolves to an array of leaders.
 */
export async function loadLeaders(): Promise<LeaderJson[]> {
  const data = await import('./leaders.json');
  return (data.default ?? data) as LeaderJson[];
}

/**
 * Represents the structure of a civic in the JSON data.
 * @property id - The unique ID of the civic.
 * @property name - The name of the civic.
 * @property era - The era of the civic.
 * @property culture_cost - The culture cost of the civic.
 * @property prereqs - An array of civic IDs that are required to research this civic.
 * @property unlocks - An object describing what this civic unlocks.
 */
export type CivicJson = {
  id: string;
  name: string;
  era: string;
  culture_cost: number;
  prereqs: string[];
  unlocks?: { units?: string[]; buildings?: string[]; improvements?: string[] };
};

/**
 * Loads the civic data from the JSON file.
 * @returns A promise that resolves to an array of civics.
 */
export async function loadCivics(): Promise<CivicJson[]> {
  const data = await import('./civics.json');
  return (data.default ?? data) as CivicJson[];
}

/**
 * Validates that there are no cycles in the prerequisites for a list of nodes.
 * @param nodes - The list of nodes to validate.
 * @throws An error if a cycle is detected.
 */
export function validateDAG(nodes: TechJson[]): void {
  const graph: Record<string, string[]> = {};
  for (const n of nodes) graph[n.id] = n.prerequisites ?? [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const dfs = (id: string) => {
    if (stack.has(id)) throw new Error(`Cycle at ${id}`);
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    for (const dep of graph[id] || []) dfs(dep);
    stack.delete(id);
  };
  for (const id of Object.keys(graph)) dfs(id);
}
