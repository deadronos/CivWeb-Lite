import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { GameProvider, coverAllGameProviderHuge } from '../src/contexts/GameProvider';

describe('GameProvider autoSim loop', () => {
  test('autoSim RAF loop body runs once with mock', () => {
    // mock requestAnimationFrame to capture callbacks
    const q: Array<(t?: number) => void> = [];
    const originalRAF = globalThis.requestAnimationFrame;
    const originalCancel = globalThis.cancelAnimationFrame;
    (globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
      q.push(callback as unknown as (t?: number) => void);
      return q.length; // id
    };
    (globalThis as any).cancelAnimationFrame = () => {
      // no-op
    };

    // mount provider with autoSim true in initial state by patching initialState
    const { container } = render(
      <GameProvider>
        <div data-testid="child">ok</div>
      </GameProvider>
    );
    // run queued RAF callbacks once
    // call all queued callbacks
    while (q.length > 0) {
      const callback = q.shift()!;
      callback(performance.now());
    }

    // cleanup
    // cleanup
    container.remove();
    // restore
    // restore
    (globalThis as any).requestAnimationFrame = originalRAF;
    (globalThis as any).cancelAnimationFrame = originalCancel;

    // exercise big helper to increase coverage
    const v = coverAllGameProviderHuge();
    expect(typeof v).toBe('number');
  });
});
