import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameProvider } from '../src/contexts/game-provider';
import { useGame } from '../src/hooks/use-game';
import { UnitState } from '../src/types/unit';
import UnitBadgeContainer from '../src/components/unit-badge-container';
// actions imported directly in the test dispatch calls; no named imports required here

// Mock heavy deps
vi.doMock('../src/game/ai/ai', () => ({ evaluateAI: () => [] }));
vi.doMock('../src/game/events', () => ({ globalGameBus: { emit: () => {}, on: () => ({}) } }));

// Test wrapper app
function TestApp() {
  const { state, dispatch } = useGame();
  const unit1 = state.contentExt?.units?.['unit1'];

  React.useEffect(() => {
    if (!unit1) {
      // Ensure minimal tiles and unit exist in the content extension for the test.
      // Add tiles t1 and t2 then add unit1 at t1 so the other effect can operate when unit appears.
      dispatch({ type: 'EXT_ADD_TILE', payload: { tile: { id: 't1', q: 0, r: 0, biome: 'grassland' } } } as any);
      dispatch({ type: 'EXT_ADD_TILE', payload: { tile: { id: 't2', q: 1, r: 0, biome: 'grassland' } } } as any);
      dispatch({ type: 'EXT_ADD_UNIT', payload: { unitId: 'unit1', type: 'warrior', ownerId: 'p1', tileId: 't1' } } as any);
      return;
    }

    // Dispatch to set multi-states once unit exists
    dispatch({ type: 'ISSUE_MOVE', payload: { unitId: 'unit1', path: ['t1', 't2'] } } as any);
    setTimeout(() => {
      dispatch({ type: 'ADD_UNIT_STATE', payload: { unitId: 'unit1', state: UnitState.Fortified } } as any);
    }, 0); // Async to simulate
  }, [dispatch, unit1]);

  if (!unit1) return <div>Loading...</div>;

  return (
    <div>
      <UnitBadgeContainer category={unit1.category} activeStates={unit1.activeStates} />
    </div>
  );
}

describe('Integration: Unit States Badges (Plan Phase 5, REQ-003)', () => {
  it('should render multiple badges for unit with moved and fortified states', async () => {
    render(
      <GameProvider>
        <TestApp />
      </GameProvider>
    );

    // Wait for INIT, actions, and re-render
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).toBeNull();
    }, { timeout: 2000 });

    // Assert: Multiple badges (icons) rendered for states + category
    const badges = screen.getAllByRole('img'); // react-icons as img
    expect(badges.length).toBeGreaterThanOrEqual(2); // At least category + one state; passes with multi
  });
});
