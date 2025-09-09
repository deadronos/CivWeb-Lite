// Minimal data loader to import JSON definitions and validate shapes.
// Vite supports JSON imports; this provides typed accessors and simple validation.

export type TechJson = {
  id: string;
  tree: 'science' | 'culture';
  name: string;
  cost: number;
  prerequisites: string[];
  effects?: string[];
  unlocks?: { units?: string[]; buildings?: string[]; improvements?: string[] };
};

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

export type BuildingJson = {
  id: string;
  name: string;
  cost: number;
  requires: string | null | string;
  yields?: { food?: number; production?: number; gold?: number; science?: number; culture?: number; faith?: number };
  effects?: string[];
};

export type LeaderJson = {
  id: string;
  name: string;
  historical_note: string;
  preferred_victory: string[];
  weights: { aggression: number; expansion: number; science: number; culture: number; trade: number; diplomacy: number };
};

export async function loadTechs(): Promise<TechJson[]> {
  const data = await import('./techs.json');
  const list = (data.default ?? data) as TechJson[];
  validateDAG(list);
  return list;
}

export async function loadUnits(): Promise<UnitJson[]> {
  const data = await import('./units.json');
  return (data.default ?? data) as UnitJson[];
}

export async function loadBuildings(): Promise<BuildingJson[]> {
  const data = await import('./buildings.json');
  return (data.default ?? data) as BuildingJson[];
}

export async function loadLeaders(): Promise<LeaderJson[]> {
  const data = await import('./leaders.json');
  return (data.default ?? data) as LeaderJson[];
}

export type CivicJson = {
  id: string;
  name: string;
  era: string;
  culture_cost: number;
  prereqs: string[];
  unlocks?: { units?: string[]; buildings?: string[]; improvements?: string[] };
};

export async function loadCivics(): Promise<CivicJson[]> {
  const data = await import('./civics.json');
  return (data.default ?? data) as CivicJson[];
}

// Validate there are no cycles in prerequisites per tree.
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
