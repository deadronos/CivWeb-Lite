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
  const moveDispatched = React.useRef(false);
  const stateDispatched = React.useRef(false);

  React.useLayoutEffect(() => {
    if (!unit1) {
      // NOTE: We create minimal extension fixtures here (EXT_ADD_TILE / EXT_ADD_UNIT)
      // to keep the test deterministic. Relying on implicit provider-side setup
      // caused timing races and flakiness in CI; creating the tiles/units inside
      // the test guarantees the scenario is present and easier for future
      // maintainers to reason about.
      // Add tiles t1 and t2 then add unit1 at t1 so the other effect can operate when unit appears.
      dispatch({ type: 'EXT_ADD_TILE', payload: { tile: { id: 't1', q: 0, r: 0, biome: 'grassland' } } } as any);
      dispatch({ type: 'EXT_ADD_TILE', payload: { tile: { id: 't2', q: 1, r: 0, biome: 'grassland' } } } as any);
      dispatch({ type: 'EXT_ADD_UNIT', payload: { unitId: 'unit1', type: 'warrior', ownerId: 'p1', tileId: 't1' } } as any);
      return;
    }

    // Dispatch to set multi-states once unit exists — only once
    if (!moveDispatched.current) {
      dispatch({ type: 'ISSUE_MOVE', payload: { unitId: 'unit1', path: ['t1', 't2'] } } as any);
      moveDispatched.current = true;
    }
    if (!stateDispatched.current) {
      // Async to simulate
      setTimeout(() => {
        dispatch({ type: 'ADD_UNIT_STATE', payload: { unitId: 'unit1', state: UnitState.Fortified } } as any);
        stateDispatched.current = true;
      }, 0);
    }
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

    // Wait for category svg and at least two state svgs (Idle + Fortified/Moved)
    await waitFor(() => {
      expect(screen.queryByTestId('category-icon')).toBeTruthy();
      const states = screen.queryAllByTestId('state-icon');
      expect(states.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 3000 });
  });
});
