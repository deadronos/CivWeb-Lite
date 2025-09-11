import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameProvider } from '../src/contexts/game-provider';
import { useGame } from '../src/hooks/use-game';

function TestConsumer() {
  const { state, dispatch } = useGame();
  return (
    <div>
      <span data-testid="turn">{state.turn}</span>
      <span data-testid="map">
        {state.map.width}x{state.map.height}
      </span>
      <button
        data-testid="init"
        onClick={() => dispatch({ type: 'INIT', payload: { seed: 'x', width: 5, height: 6 } })}
      >
        init
      </button>
      <button
        data-testid="autosim"
        onClick={() => dispatch({ type: 'AUTO_SIM_TOGGLE', payload: { enabled: true } })}
      >
        autosim
      </button>
    </div>
  );
}

describe('GameProvider INIT and autoSim', () => {
  it('handles INIT payload and runs one autoSim loop', async () => {
    // mock requestAnimationFrame to only execute the callback once to avoid infinite loops
    let calls = 0;
    const raf = vi.fn((callback: FrameRequestCallback) => {
      calls += 1;
      if (calls === 1) {
        // call synchronously once
        callback(0);
      }
      return calls;
    });
    const caf = vi.fn(() => {});
    // @ts-expect-error assign to global for test environment
    globalThis.requestAnimationFrame = raf as any;
    // @ts-expect-error assign to global for test environment
    globalThis.cancelAnimationFrame = caf as any;

    render(
      <GameProvider>
        <TestConsumer />
      </GameProvider>
    );

    const init = screen.getByTestId('init');
    fireEvent.click(init);
    await waitFor(() => expect(screen.getByTestId('map').textContent).toBe('5x6'));

    const autosim = screen.getByTestId('autosim');
    fireEvent.click(autosim);

    // after autoSim toggled on, the mocked RAF should have executed once and advanced the turn
    await waitFor(() =>
      expect(Number(screen.getByTestId('turn').textContent)).toBeGreaterThanOrEqual(1)
    );

    // cleanup
    // @ts-expect-error cleanup global test assignments
    delete globalThis.requestAnimationFrame;
    // @ts-expect-error cleanup global test assignments
    delete globalThis.cancelAnimationFrame;
  });
});
