import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialState } from '../src/contexts/game-provider'; // For base initial state
import type { GameState } from '../src/game/types'; // For type extension
import { createEmptyState as createContentExtension } from '../src/game/content/engine'; // For mock contentExt
import { UnitState, UnitCategory } from '../src/types/unit'; // Value import for enums

// Mock minimal initial state with contentExt and a unit (as per codebase structure)
const mockContentExtension = createContentExtension();
const unit = { 
  id: 'unit1', 
  type: 'warrior',
  ownerId: 'p1',
  location: { tileId: 't1' },
  health: 100,
  activeStates: new Set<UnitState>(),
  category: UnitCategory.Melee,
  x: 0, y: 0 // Extra for plan
  // Add other required Unit fields as needed
};
mockContentExtension.units['unit1'] = unit as any; // Cast for test

// Mock minimal Hextiles as any
const mockTile1 = { 
  id: 't1', 
  q: 0, r: 0, 
  biome: 'grassland' as const, // String assume
  features: [],
  improvements: undefined,
  occupantUnitId: 'unit1',
  occupantCityId: undefined,
  // Add other Hextile fields if needed
} as any;
const mockTile2 = { 
  id: 't2', 
  q: 1, r: 0, 
  biome: 'grassland' as const,
  features: [],
  improvements: undefined,
  occupantUnitId: undefined,
  occupantCityId: undefined,
  // Add other Hextile fields if needed
} as any;
mockContentExtension.tiles['t1'] = mockTile1;
mockContentExtension.tiles['t2'] = mockTile2;

const mockInitialState = {
  ...initialState(),
  contentExt: mockContentExtension,
  // Ensure other required fields are present if needed
} as GameState;

describe('GameProvider Unit States - Idle on Turn Start (Plan Phase 5, REQ-005)', () => {
  it('should add Idle state to all units activeStates on INIT action', () => {
    // Act: Apply INIT action to mock state (simulates turn start)
    const updatedState = applyAction(mockInitialState, { type: 'INIT' });

    // Assert: All units should have 'idle' in activeStates Set (in contentExt.units)
    const unit = updatedState.contentExt?.units['unit1'] as any;
    expect(unit).toBeDefined(); // Unit exists
    expect([...unit.activeStates]).toContain(UnitState.Idle); // Updated to enum; passes with implementation
  });

  it('should add Moved state to unit activeStates on ISSUE_MOVE action', () => {
    // Act: Apply ISSUE_MOVE action
    const updatedState = applyAction(mockInitialState, { 
      type: 'ISSUE_MOVE', 
      payload: { unitId: 'unit1', path: ['t1', 't2'] } 
    });

    // Assert: Unit should have 'moved' in activeStates Set
    const unit = updatedState.contentExt?.units['unit1'] as any;
    expect(unit).toBeDefined();
    expect([...unit.activeStates]).toContain(UnitState.Moved); // Fails if reducer doesn't add Moved (Red)
  });

  it('should support multiple states: add Moved then Fortified to unit activeStates', () => {
    // Use same mockInitialState as before (with unit1)

    // Act: Apply sequential actions - move then add fortified state (simulate fortify)
    let updatedState = applyAction(mockInitialState, { 
      type: 'ISSUE_MOVE', 
      payload: { unitId: 'unit1', path: ['t1', 't2'] } 
    } as any);
    updatedState = applyAction(updatedState, { 
      type: 'ADD_UNIT_STATE', 
      payload: { unitId: 'unit1', state: UnitState.Fortified } 
    } as any);

    // Assert: Unit should have both 'moved' and 'fortified' in activeStates Set
    const unit = updatedState.contentExt?.units['unit1'] as any;
    expect(unit).toBeDefined();
    const states = [...unit.activeStates];
    expect(states).toContain(UnitState.Moved);
    expect(states).toContain(UnitState.Fortified); // Fails if ADD_UNIT_STATE doesn't add or Set doesn't accumulate
    expect(states.length).toBe(2); // Multi-state support
  });

  it('should add Fortified state to unit activeStates on FORTIFY_UNIT action', () => {
    // Use same mockInitialState as before (with unit1)

    // Act: Apply FORTIFY_UNIT action
    const updatedState = applyAction(mockInitialState, { 
      type: 'FORTIFY_UNIT', 
      payload: { unitId: 'unit1' } 
    } as any);

    // Assert: Unit should have 'fortified' in activeStates Set
    const unit = updatedState.contentExt?.units['unit1'] as any;
    expect(unit).toBeDefined();
    expect([...unit.activeStates]).toContain(UnitState.Fortified); // Fails if reducer doesn't add Fortified
  });
});
