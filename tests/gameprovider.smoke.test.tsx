import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameProvider } from "..\\src\\contexts\\game-provider";
import { useGame } from "..\\src\\hooks\\use-game";

function TestConsumer() {
  const { state } = useGame();
  return <div>Turn: {state.turn}</div>;
}

describe('GameProvider smoke', () => {
  it('provides initial state to consumers (Turn label)', () => {
    render(
      <GameProvider>
        <TestConsumer />
      </GameProvider>
    );
    expect(screen.getByText(/Turn:/)).toHaveTextContent('Turn: 0');
  });
});