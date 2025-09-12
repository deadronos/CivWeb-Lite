/**
 * @file This file contains the core type definitions for the game state.
 */

/**
 * Represents a hexagonal coordinate.
 * @property q - The q coordinate.
 * @property r - The r coordinate.
 */
export type HexCoord = { q: number; r: number };

/**
 * Represents the different types of biomes in the game.
 */
export enum BiomeType {
  Grassland = 'grass',
  Desert = 'desert',
  Forest = 'forest',
  Mountain = 'mountain',
  Ocean = 'ocean',
  Tundra = 'tundra',
  Ice = 'ice',
}

/**
 * Represents a single tile on the game map.
 * @property id - The unique ID of the tile.
 * @property coord - The hexagonal coordinates of the tile.
 * @property biome - The biome type of the tile.
 * @property elevation - The elevation of the tile (0-1).
 * @property moisture - The moisture level of the tile (0-1).
 * @property exploredBy - An array of player IDs that have explored this tile.
 */
export interface Tile {
  id: string;
  coord: HexCoord;
  biome: BiomeType;
  elevation: number; // 0..1
  moisture: number; // 0..1
  exploredBy: string[]; // player IDs
}

/**
 * Represents the personality of a leader.
 * @property id - The unique ID of the leader.
 * @property name - The name of the leader.
 * @property aggression - The leader's aggression level (0-1).
 * @property scienceFocus - The leader's focus on science (0-1).
 * @property cultureFocus - The leader's focus on culture (0-1).
 * @property expansionism - The leader's tendency to expand (0-1).
 * @property historicalNote - A historical note about the leader.
 * @property preferredVictory - The leader's preferred victory conditions.
 */
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

/**
 * Represents a node in the technology tree.
 * @property id - The unique ID of the technology.
 * @property tree - The technology tree this node belongs to ('science' or 'culture').
 * @property name - The name of the technology.
 * @property cost - The cost to research this technology.
 * @property prerequisites - An array of technology IDs required to research this technology.
 * @property effects - An array of strings describing the effects of this technology.
 */
export interface TechNode {
  id: string;
  tree: 'science' | 'culture';
  name: string;
  cost: number;
  prerequisites: string[];
  effects: string[];
}

/**
 * Represents the state of a single player.
 * @property id - The unique ID of the player.
 * @property isHuman - Whether the player is human or AI.
 * @property leader - The leader of the player's civilization.
 * @property sciencePoints - The player's science points.
 * @property culturePoints - The player's culture points.
 * @property researchedTechIds - An array of technology IDs that the player has researched.
 * @property researching - The technology the player is currently researching, or null if none.
 * @property researchQueue - An array of technology IDs to research after the current one is complete.
 */
export interface PlayerState {
  id:string;
  isHuman: boolean;
  leader: LeaderPersonality;
  sciencePoints: number;
  culturePoints: number;
  researchedTechIds: string[];
  researching?: { techId: string; progress: number } | null;
  researchQueue?: string[]; // Queue of tech IDs to research after current completes
}

/**
 * Represents a single entry in the game log.
 * @property timestamp - The timestamp of the log entry.
 * @property turn - The turn number of the log entry.
 * @property type - The type of the log entry.
 * @property payload - The payload of the log entry.
 */
export interface GameLogEntry {
  timestamp: number;
  turn: number;
  type: string;
  payload?: any;
}

/**
 * Represents the state of the user interface.
 * @property selectedUnitId - The ID of the currently selected unit.
 * @property selectedCityId - The ID of the currently selected city.
 * @property previewPath - An array of tile IDs representing the path preview for a unit.
 * @property openPanels - An object indicating which UI panels are open.
 */
export interface UIState {
  selectedUnitId?: string;
  selectedCityId?: string;
  previewPath?: string[];
  openPanels: {
    cityPanel?: string; // cityId if open
    researchPanel?: boolean;
  };
}

/**
 * Represents the entire state of the game.
 * @property schemaVersion - The version of the game state schema.
 * @property seed - The seed for the random number generator.
 * @property turn - The current turn number.
 * @property map - The game map.
 * @property players - An array of player states.
 * @property techCatalog - The technology tree.
 * @property rngState - The state of the random number generator.
 * @property log - The game log.
 * @property aiPerf - Performance metrics for the AI.
 * @property mode - The game mode.
 * @property autoSim - Whether the game is in auto-simulation mode.
 * @property ui - The UI state.
 * @property contentExt - The game state extension for spec-driven content.
 */
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
  contentExt?: import('./content/types').GameStateExt;
}

/**
 * Represents the result of loading a game state.
 * @property ok - Whether the load was successful.
 * @property error - An error message if the load failed.
 */
export interface LoadResult {
  ok: boolean;
  error?: string;
}
