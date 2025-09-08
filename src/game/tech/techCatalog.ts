import { TechNode } from '../types';

export const techCatalog: TechNode[] = [
  { id: 'pottery', tree: 'science', name: 'Pottery', cost: 20, prerequisites: [], effects: [] },
  { id: 'writing', tree: 'science', name: 'Writing', cost: 40, prerequisites: ['pottery'], effects: [] },
  { id: 'folklore', tree: 'culture', name: 'Folklore', cost: 20, prerequisites: [], effects: [] },
  { id: 'mysticism', tree: 'culture', name: 'Mysticism', cost: 40, prerequisites: ['folklore'], effects: [] },
];

export function validateTechCatalog(catalog: TechNode[]): void {
  const graph: Record<string, string[]> = {};
  for (const node of catalog) {
    graph[node.id] = node.prerequisites;
  }
  const visited = new Set<string>();
  const stack = new Set<string>();
  function dfs(id: string) {
    if (stack.has(id)) throw new Error(`Tech cycle detected at ${id}`);
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    for (const dep of graph[id] || []) dfs(dep);
    stack.delete(id);
  }
  for (const id of Object.keys(graph)) dfs(id);
}

validateTechCatalog(techCatalog);
