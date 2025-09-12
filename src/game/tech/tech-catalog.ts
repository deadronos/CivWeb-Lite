import { TechNode } from '../types';

/**
 * @file This file contains the technology catalog for the game.
 */

/**
 * The technology catalog, containing all technologies in the game.
 */
export const techCatalog: TechNode[] = [
  // Science tree (Ancient)
  { id: 'pottery', tree: 'science', name: 'Pottery', cost: 20, prerequisites: [], effects: [] },
  { id: 'mining', tree: 'science', name: 'Mining', cost: 25, prerequisites: [], effects: [] },
  {
    id: 'animal-husbandry',
    tree: 'science',
    name: 'Animal Husbandry',
    cost: 25,
    prerequisites: [],
    effects: [],
  },
  {
    id: 'bronze-working',
    tree: 'science',
    name: 'Bronze Working',
    cost: 35,
    prerequisites: ['mining'],
    effects: [],
  },
  { id: 'sailing', tree: 'science', name: 'Sailing', cost: 30, prerequisites: [], effects: [] },
  {
    id: 'writing',
    tree: 'science',
    name: 'Writing',
    cost: 40,
    prerequisites: ['pottery'],
    effects: [],
  },

  // Culture tree (Civics-like)
  { id: 'folklore', tree: 'culture', name: 'Folklore', cost: 20, prerequisites: [], effects: [] },
  {
    id: 'code-of-laws',
    tree: 'culture',
    name: 'Code of Laws',
    cost: 25,
    prerequisites: ['folklore'],
    effects: [],
  },
  {
    id: 'craftsmanship',
    tree: 'culture',
    name: 'Craftsmanship',
    cost: 30,
    prerequisites: ['code-of-laws'],
    effects: [],
  },
  {
    id: 'foreign-trade',
    tree: 'culture',
    name: 'Foreign Trade',
    cost: 30,
    prerequisites: ['code-of-laws'],
    effects: [],
  },
  {
    id: 'state-workforce',
    tree: 'culture',
    name: 'State Workforce',
    cost: 35,
    prerequisites: ['craftsmanship'],
    effects: [],
  },
  {
    id: 'early-empire',
    tree: 'culture',
    name: 'Early Empire',
    cost: 35,
    prerequisites: ['foreign-trade'],
    effects: [],
  },
];

/**
 * Validates the technology catalog for cycles.
 * @param catalog - The technology catalog to validate.
 * @throws An error if a cycle is detected.
 */
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
