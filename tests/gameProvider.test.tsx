import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GameProvider } from '../src/contexts/GameProvider';
import { useGame } from '../src/hooks/useGame';

function Consumer() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <div data-testid="turn">{state.turn}</div>
      <button onClick={() => dispatch({ type: 'END_TURN' })}>end</button>
    </div>
  );
}

describe('GameProvider', () => {
  it('provides state and dispatch to children', async () => {
    render(
      <GameProvider>
        <Consumer />
      </GameProvider>
    );

    // initial effect will dispatch INIT; wait a tick
    await act(async () => Promise.resolve());

    const turn = screen.getByTestId('turn');
    expect(turn).toBeDefined();
    // dispatch END_TURN should increment turn
    const button = screen.getByText('end');
    await act(async () => {
      button.click();
    });
    expect(Number(turn.textContent)).toBeGreaterThanOrEqual(1);
  });
});
