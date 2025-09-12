import { UnitState, UnitActiveStates } from '../../types/unit';
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
  activeStates: UnitActiveStates;
  abilities?: string[];
}

export interface CityProductionOrder {
  type: 'unit' | 'improvement' | 'building';
  item: string;
  turnsRemaining: number;
}

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

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number; // research turns required
  prerequisites: string[];
  unlocks: { units?: string[]; improvements?: string[]; abilities?: string[] };
}

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
// Alias for backwards compatibility
export type GameStateExtensionAlias = GameStateExtension;
