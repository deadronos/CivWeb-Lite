/**
 * @file This file contains the type definitions for the game content extension.
 */

/**
 * Represents the different types of biomes in the game.
 */
export type Biome =
  | 'ocean'
  | 'coast'
  | 'plains'
  | 'grassland'
  | 'desert'
  | 'tundra'
  | 'snow'
  | 'forest'
  | 'jungle'
  | 'hills'
  | 'mountain';

/**
 * Represents a single tile on the game map.
 * @property id - The unique ID of the tile.
 * @property q - The q coordinate of the tile.
 * @property r - The r coordinate of the tile.
 * @property biome - The biome of the tile.
 * @property elevation - The elevation of the tile.
 * @property features - An array of features on the tile.
 * @property improvements - An array of improvements on the tile.
 * @property occupantUnitId - The ID of the unit occupying the tile, or null if none.
 * @property occupantCityId - The ID of the city occupying the tile, or null if none.
 * @property passable - Whether the tile is passable.
 */
export interface Hextile {
  id: string;
  q: number;
  r: number;
  biome: Biome;
  elevation?: number;
  features: string[];
  improvements: string[];
  occupantUnitId: string | null;
  occupantCityId: string | null;
  passable: boolean;
}

/**
 * Represents a single unit in the game.
 * @property id - The unique ID of the unit.
 * @property type - The type of the unit.
 * @property ownerId - The ID of the player who owns the unit.
 * @property location - The location of the unit.
 * @property hp - The health of the unit.
 * @property movement - The movement points of the unit.
 * @property movementRemaining - The remaining movement points of the unit.
 * @property attack - The attack strength of the unit.
 * @property defense - The defense strength of the unit.
 * @property sight - The sight range of the unit.
 * @property state - The current state of the unit.
 * @property abilities - An array of abilities for the unit.
 */
export interface Unit {
  id: string;
  type: string;
  ownerId: string;
  location: string | { q: number; r: number };
  hp: number; // 0..100
  movement: number;
  movementRemaining: number;
  attack: number;
  defense: number;
  sight: number;
  state: 'idle' | 'moving' | 'fortify' | 'building' | 'exploring';
  abilities?: string[];
}

/**
 * Represents a production order in a city.
 * @property type - The type of item being produced.
 * @property item - The ID of the item being produced.
 * @property turnsRemaining - The number of turns remaining to produce the item.
 */
export interface CityProductionOrder {
  type: 'unit' | 'improvement' | 'building';
  item: string;
  turnsRemaining: number;
}

/**
 * Represents a single city in the game.
 * @property id - The unique ID of the city.
 * @property name - The name of the city.
 * @property ownerId - The ID of the player who owns the city.
 * @property location - The ID of the tile the city is on.
 * @property population - The population of the city.
 * @property productionQueue - The production queue of the city.
 * @property tilesWorked - An array of tile IDs that the city is working.
 * @property garrisonUnitIds - An array of unit IDs that are garrisoned in the city.
 * @property happiness - The happiness level of the city.
 * @property buildings - An array of building IDs that have been built in the city.
 */
export interface City {
  id: string;
  name: string;
  ownerId: string;
  location: string; // tile id
  population: number;
  productionQueue: CityProductionOrder[];
  tilesWorked: string[];
  garrisonUnitIds: string[];
  happiness: number;
  buildings?: string[];
}

/**
 * Represents a single technology in the game.
 * @property id - The unique ID of the technology.
 * @property name - The name of the technology.
 * @property description - The description of the technology.
 * @property cost - The research cost of the technology.
 * @property prerequisites - An array of technology IDs that are required to research this technology.
 * @property unlocks - An object describing what this technology unlocks.
 */
export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number; // research turns required
  prerequisites: string[];
  unlocks: { units?: string[]; improvements?: string[]; abilities?: string[] };
}

/**
 * Represents a single civic in the game.
 * @property id - The unique ID of the civic.
 * @property name - The name of the civic.
 * @property description - The description of the civic.
 * @property cost - The culture cost of the civic.
 * @property prerequisites - An array of civic IDs that are required to research this civic.
 * @property unlocks - An object describing what this civic unlocks.
 */
export interface Civic {
  id: string;
  name: string;
  description?: string;
  cost: number; // culture turns required
  prerequisites: string[];
  unlocks: {
    units?: string[];
    improvements?: string[];
    abilities?: string[];
    buildings?: string[];
  };
}

/**
 * Represents the game state extension.
 * @property tiles - A record of all tiles in the game.
 * @property units - A record of all units in the game.
 * @property cities - A record of all cities in the game.
 * @property techs - A record of all technologies in the game.
 * @property civics - A record of all civics in the game.
 * @property playerState - The state of the player.
 */
export interface GameStateExtension {
  tiles: Record<string, Hextile>;
  units: Record<string, Unit>;
  cities: Record<string, City>;
  techs: Record<string, Technology>;
  civics?: Record<string, Civic>;
  playerState: {
    researchedTechs: string[];
    researchedCivics?: string[];
    availableUnits: string[];
    availableImprovements: string[];
    science: number; // points per turn (computed from buildings/cities)
    culture?: number; // optional: culture per turn
    research?: { techId: string; progress: number } | null;
    cultureResearch?: { civicId: string; progress: number } | null;
  };
}

// Alias for backwards compatibility
export type GameStateExt = GameStateExtension;
