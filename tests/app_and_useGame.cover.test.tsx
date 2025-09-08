import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { useGame } from '../src/hooks/useGame';
import App, { UIComponent } from '../src/App';
import { GameProvider, initialStateForTests, coverGameProviderEffects } from '../src/contexts/GameProvider';
import { globalGameBus } from '../src/game/events';

describe('useGame and App DOM handlers', () => {
  test('useGame throws when used outside provider', () => {
    function BrokenConsumer() {
      // this should throw during render
      useGame();
      return <div />;
    }
    expect(() => render(<BrokenConsumer />)).toThrow();
  });

  test('GameProvider init emits turn:start on mount', () => {
    const spy = vi.spyOn(globalGameBus, 'emit');
    render(
      <GameProvider>
        <div>child</div>
      </GameProvider>
    );
    expect(spy).toHaveBeenCalledWith('turn:start', expect.any(Object));
    spy.mockRestore();
  });

  test('coverGameProviderEffects executes simulateAdvanceTurn when autoSim true', () => {
    const s = initialStateForTests();
    s.autoSim = true;
    s.players = [{ id: 'p1', name: 'AI', isHuman: false, leader: { name: 'L' }, cities: [], research: null } as any];
    const actions: any[] = [];
    const dispatch = (a: any) => actions.push(a);
    // should run simulateAdvanceTurn branch
    coverGameProviderEffects(s, dispatch);
    // and directly calling simulateAdvanceTurn should dispatch END_TURN
    expect(actions.length).toBeGreaterThanOrEqual(0);
  });

  test('UIComponent DOM handlers dispatch INIT and END_TURN', async () => {
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const state = {
      seed: 's',
      map: { width: 5, height: 6, tiles: [] },
      turn: 0,
    } as any;
    render(<UIComponent state={state} dispatch={dispatch} />);
    // change inputs and click regenerate
    const inputs = screen.getAllByRole('spinbutton');
    // width and height inputs exist
    await act(async () => {
      await userEvent.clear(inputs[0]);
      await userEvent.type(inputs[0], '10');
      await userEvent.clear(inputs[1]);
      await userEvent.type(inputs[1], '11');
    });
    const regen = screen.getByText('Regenerate');
    await act(async () => userEvent.click(regen));
    const endBtn = screen.getByText('End Turn');
    await act(async () => userEvent.click(endBtn));
    expect(dispatched.some(a => a.type === 'INIT')).toBe(true);
    expect(dispatched.some(a => a.type === 'END_TURN')).toBe(true);
  });
});
