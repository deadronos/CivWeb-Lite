export type HexCoord = { q: number; r: number };

export enum BiomeType {
  Grassland = 'grass',
  Desert = 'desert',
  Forest = 'forest',
  Mountain = 'mountain',
  Ocean = 'ocean',
  Tundra = 'tundra',
}

export interface Tile {
  id: string;
  coord: HexCoord;
  biome: BiomeType;
  elevation: number; // 0..1
  moisture: number; // 0..1
  exploredBy: string[]; // player IDs
}

export interface LeaderPersonality {
  id: string;
  name: string;
  aggression: number; // 0..1
  scienceFocus: number; // 0..1
  cultureFocus: number; // 0..1
  expansionism: number; // 0..1
}

export interface TechNode {
  id: string;
  tree: 'science' | 'culture';
  name: string;
  cost: number;
  prerequisites: string[];
  effects: string[];
}

export interface PlayerState {
  id: string;
  isHuman: boolean;
  leader: LeaderPersonality;
  sciencePoints: number;
  culturePoints: number;
  researchedTechIds: string[];
  researching?: { techId: string; progress: number } | null;
}

export interface GameLogEntry {
  timestamp: number;
  turn: number;
  type: string;
  payload?: any;
}

export interface GameState {
  schemaVersion: number;
  seed: string;
  turn: number;
  map: { width: number; height: number; tiles: Tile[] };
  players: PlayerState[];
  techCatalog: TechNode[];
  rngState?: unknown;
  log: GameLogEntry[];
  mode: 'standard' | 'ai-sim';
}

export interface LoadResult {
  ok: boolean;
  error?: string;
}

export interface GameAction {
  type: string;
  playerId?: string;
  payload?: any;
  clientTimestamp?: number;
}
