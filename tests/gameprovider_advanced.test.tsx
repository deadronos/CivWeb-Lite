import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  GameProvider,
  simulateAdvanceTurn,
  initialStateForTests } from
"..\\src\\contexts\\game-provider";
// GameStateContext intentionally removed; not used in this test
import { useGame } from "..\\src\\hooks\\use-game";

function ConsumerShow() {
  const { state, dispatch } = useGame();
  // show some values to assert via render
  return (
    <div>
      <span data-testid="turn">{state.turn}</span>
      <button onClick={() => dispatch({ type: 'END_TURN' })}>end</button>
    </div>);

}

describe('GameProvider advanced', () => {
  it('simulateAdvanceTurn triggers END_TURN and AI actions when AI present', () => {
    const s = initialStateForTests();
    // add one AI player with a leader defined so evaluateAI returns something predictable
    s.players = [
    {
      id: 'p1',
      isHuman: false,
      researchedTechIds: [],
      researching: null,
      leader: { scienceFocus: 10, cultureFocus: 1 }
    } as any];

    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    simulateAdvanceTurn(s as any, dispatch as any);
    expect(dispatched.some((d) => d.type === 'END_TURN')).toBe(true);
  });

  it('useGame works inside provider when rendering Consumer', () => {
    const { getByTestId } = render(
      <GameProvider>
        <ConsumerShow />
      </GameProvider>
    );
    const t = getByTestId('turn');
    expect(t.textContent).toBe('0');
  });
});