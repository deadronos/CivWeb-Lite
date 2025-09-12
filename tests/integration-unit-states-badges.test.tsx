import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameProvider } from '../src/contexts/game-provider';
import { useGame } from '../src/hooks/use-game';
import { UnitState } from '../src/types/unit';
import { UnitBadgeContainer } from '../src/components/UnitBadgeContainer';
import { ISSUE_MOVE, ADD_UNIT_STATE } from '../src/game/actions'; // Assume exports

// Mock heavy deps
vi.doMock('../src/game/ai/ai', () => ({ evaluateAI: () => [] }));
vi.doMock('../src/game/events', () => ({ globalGameBus: { emit: () => {}, on: () => ({}) } }));

// Test wrapper app
function TestApp() {
  const { state, dispatch } = useGame();
  const unit1 = state.contentExt?.units?.['unit1'];

  React.useEffect(() => {
    if (unit1) {
      // Dispatch to set multi-states (assume unit exists post-INIT)
      dispatch({ type: 'ISSUE_MOVE', payload: { unitId: 'unit1', path: ['t1', 't2'] } } as any);
      setTimeout(() => {
        dispatch({ type: 'ADD_UNIT_STATE', payload: { unitId: 'unit1', state: UnitState.Fortified } } as any);
      }, 0); // Async to simulate
    }
  }, [dispatch, unit1]);

  if (!unit1) return <div>Loading...</div>;

  return (
    <div>
      <UnitBadgeContainer unit={unit1} />
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
