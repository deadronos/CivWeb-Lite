export type HexCoord = { q: number; r: number };

export enum BiomeType {
  Grassland = 'grass',
  Desert = 'desert',
  Forest = 'forest',
  Mountain = 'mountain',
  Ocean = 'ocean',
  Tundra = 'tundra',
  Ice = 'ice',
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
  historicalNote?: string;
  preferredVictory?: string[];
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
  researchQueue?: string[]; // Queue of tech IDs to research after current completes
}

export interface GameLogEntry {
  timestamp: number;
  turn: number;
  type: string;
  payload?: any;
}

export interface UIState {
  selectedUnitId?: string;
  selectedTileId?: string;
  selectedCityId?: string;
  previewPath?: string[];
  // Optional combat preview computed during path preview
  previewCombat?: {
    attackerStrength: number;
    defenderStrength: number;
    outcome: string;
  };
  openPanels: {
    cityPanel?: string; // cityId if open
    researchPanel?: boolean;
    // Dev / spec helper panels
    specPanel?: boolean;
    // Developer mode toggle (guards dev UI)
    devPanel?: boolean;
  };
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
  aiPerf?: { total: number; count: number };
  mode: 'standard' | 'ai-sim';
  autoSim: boolean;
  // UI state for selections and interactions
  ui: UIState;
  // Optional extension for spec-driven content (biomes/units/cities/tech system)
  // This keeps the main GameState backward compatible while allowing incremental rollout.
  contentExt?: import('./content/types').GameStateExtensionAlias;
}

export interface LoadResult {
  ok: boolean;
  error?: string;
}
