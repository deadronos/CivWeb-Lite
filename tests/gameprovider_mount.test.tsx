import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock heavy or external side-effect modules used by GameProvider
vi.doMock('../src/game/ai/ai', () => ({ evaluateAI: () => [] }));
vi.doMock('../src/game/events', () => ({ globalGameBus: { emit: () => {} } }));

import { GameProvider, GAME_PROVIDER_MARKER } from '../src/contexts/GameProvider';
import { useGame } from '../src/hooks/useGame';

describe('GameProvider mount and context', () => {
  it('mounts provider and exposes context to children', async () => {
    function Consumer() {
      const { state, dispatch } = useGame();
      useEffect(() => {
        // dispatch a no-op to ensure dispatch function is callable
        dispatch({ type: 'LOG', payload: 'mounted' } as any);
      }, [dispatch]);
      return <div data-testid="turn">{state.turn}</div>;
    }

    const { findByTestId } = render(
      <GameProvider>
        <Consumer />
      </GameProvider>
    );

    const el = await findByTestId('turn');
    expect(el).toBeTruthy();
    // provider marker should be true
    expect(GAME_PROVIDER_MARKER).toBe(true);
  });
});
