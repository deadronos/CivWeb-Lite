import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { GameProvider } from '../src/contexts/GameProvider';
import { useGame } from '../src/hooks/useGame';

describe('GameProvider autoSim scheduling and cleanup', () => {
  test('schedules RAF when autoSim toggled and cancels on unmount', () => {
    const raf = vi.fn((cb: FrameRequestCallback) => {
      // call callback once to simulate a single frame then return id
      cb(1);
      return 42;
    });
    const caf = vi.fn(() => {});
  const origRaf = (globalThis as any).requestAnimationFrame;
  const origCaf = (globalThis as any).cancelAnimationFrame;
  (globalThis as any).requestAnimationFrame = raf;
  (globalThis as any).cancelAnimationFrame = caf;

    function Toggler() {
      const { dispatch } = useGame();
      useEffect(() => {
        // toggle autoSim on
        dispatch({ type: 'AUTO_SIM_TOGGLE', payload: true } as any);
      }, [dispatch]);
      return null;
    }

    const { unmount } = render(
      <GameProvider>
        <Toggler />
      </GameProvider>
    );

    // ensure RAF was scheduled at least once
    expect(raf).toHaveBeenCalled();

    // unmount provider to trigger cleanup
    unmount();
    expect(caf).toHaveBeenCalled();

  // restore
  (globalThis as any).requestAnimationFrame = origRaf;
  (globalThis as any).cancelAnimationFrame = origCaf;
  });
});
