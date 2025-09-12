import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from '../src/contexts/game-provider';

describe('UI Interaction Actions', () => {
  it('should handle SELECT_UNIT action', () => {
    const initialState = initialStateForTests();
    const action = { type: 'SELECT_UNIT' as const, payload: { unitId: 'test-unit-1' } };
    
    const newState = applyAction(initialState, action);
    
    expect(newState.ui.selectedUnitId).toBe('test-unit-1');
    expect(newState.ui.previewPath).toBeUndefined();
  });

  it('should handle CANCEL_SELECTION action', () => {
    const initialState = initialStateForTests();
    // First select a unit
    const selectState = applyAction(initialState, { 
      type: 'SELECT_UNIT' as const, 
      payload: { unitId: 'test-unit-1' } 
    });
    
    // Then cancel selection
    const action = { type: 'CANCEL_SELECTION' as const, payload: { unitId: 'test-unit-1' } };
    const newState = applyAction(selectState, action);
    
    expect(newState.ui.selectedUnitId).toBeUndefined();
    expect(newState.ui.previewPath).toBeUndefined();
  });

  it('should handle OPEN_CITY_PANEL action', () => {
    const initialState = initialStateForTests();
    const action = { type: 'OPEN_CITY_PANEL' as const, payload: { cityId: 'test-city-1' } };
    
    const newState = applyAction(initialState, action);
    
    expect(newState.ui.openPanels.cityPanel).toBe('test-city-1');
  });

  it('should handle OPEN_RESEARCH_PANEL action', () => {
    const initialState = initialStateForTests();
    const action = { type: 'OPEN_RESEARCH_PANEL' as const, payload: {} };
    
    const newState = applyAction(initialState, action);
    
    expect(newState.ui.openPanels.researchPanel).toBe(true);
  });

  it('should handle START_RESEARCH action when contentExt exists', () => {
    const initialState = initialStateForTests();
    // Ensure contentExt exists
    const stateWithExt = applyAction(initialState, { type: 'INIT' as const });
    
    const action = { 
      type: 'START_RESEARCH' as const, 
      payload: { playerId: 'player1', techId: 'agriculture' } 
    };
    
    const newState = applyAction(stateWithExt, action);
    
    // The action should complete without error
    expect(newState).toBeDefined();
    expect(newState.contentExt).toBeDefined();
  });

  it('should maintain UI state immutability', () => {
    const initialState = initialStateForTests();
    const action = { type: 'SELECT_UNIT' as const, payload: { unitId: 'test-unit-1' } };
    
    const newState = applyAction(initialState, action);
    
    // States should be different objects
    expect(newState).not.toBe(initialState);
    expect(newState.ui).not.toBe(initialState.ui);
    
    // Original state should be unchanged
    expect(initialState.ui.selectedUnitId).toBeUndefined();
    expect(newState.ui.selectedUnitId).toBe('test-unit-1');
  });
});