// src/types/game.ts

export type UnitCategory = 'infantry' | 'cavalry' | 'artillery'; // example categories
export type UnitState = 'moved' | 'fortified' | 'attacked'; // example states
export type UnitActiveStates = Set<UnitState>;

export interface Unit {
  // ...existing Unit props (e.g., id: string, position: { x: number; y: number }, etc.)
  category: UnitCategory; // From src/types/unit.ts (REQ-001)
  activeStates: UnitActiveStates; // Set<UnitState> for multi-states (e.g., Moved + Fortified, REQ-002)
}

export interface GameState {
  // ...existing GameState props (e.g., turn: number, units: Unit[], etc.)
  units: Unit[]; // Now extended with category/activeStates per unit
}