import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameProvider } from "..\\src\\contexts\\game-provider";
import { useGame } from "..\\src\\hooks\\use-game";

function Consumer() {
  const { state, dispatch } = useGame();
  // render minimal output
  return (
    <div>
      <span data-testid="turn">{state.turn}</span>
      <button onClick={() => dispatch({ type: 'END_TURN' })}>end</button>
    </div>);

}

describe('useGame happy path', () => {
  it('works inside GameProvider', () => {
    const { getByTestId } = render(
      <GameProvider>
        <Consumer />
      </GameProvider>
    );
    expect(getByTestId('turn').textContent).toBe('0');
  });
});