import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameProvider } from '../src/contexts/GameProvider';
import { useGame } from '../src/hooks/useGame';

function Consumer() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <span data-testid="turn">{state.turn}</span>
      <button onClick={() => dispatch({ type: 'END_TURN' })}>end</button>
    </div>
  );
}

describe('useGame mount inside GameProvider', () => {
  it('mounts and provides state/dispatch to consumer', () => {
    render(
      <GameProvider>
        <Consumer />
      </GameProvider>
    );
    const turn = screen.getByTestId('turn');
    expect(turn).toBeDefined();
    expect(Number(turn.textContent)).toBeGreaterThanOrEqual(0);
  });
});
