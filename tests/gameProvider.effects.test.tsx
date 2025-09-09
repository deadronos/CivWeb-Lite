import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GameProvider,
  GameStateContext,
  GameDispatchContext,
  initialStateForTests,
  coverGameProviderEffects,
  simulateAdvanceTurn } from
"..\\src\\contexts\\game-provider";
import { globalGameBus } from '../src/game/events';
import { useGame } from "..\\src\\hooks\\use-game";

// Simple TestConsumer to read state and provide a button to toggle autoSim
function TestConsumer() {
  const state = React.useContext(GameStateContext);
  const dispatch = React.useContext(GameDispatchContext);
  if (!state || !dispatch) return <div>no provider</div>;
  return (
    <div>
      <div data-testid="turn">{state.turn}</div>
      <button onClick={() => dispatch({ type: 'AUTO_SIM_TOGGLE', payload: { enabled: true } })}>
        toggle
      </button>
      <button onClick={() => dispatch({ type: 'END_TURN' })}>end</button>
    </div>);

}

describe('GameProvider effects', () => {
  beforeEach(() => {
    // deterministic RAF mock that runs callbacks once when id assigned
    let queued: FrameRequestCallback | null = null;
    (globalThis as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
      queued = callback;
      // return an id
      return 1;
    };
    (globalThis as any).cancelAnimationFrame = () => {
      queued = null;
    };
    // When asked, run queued callback synchronously
    (globalThis as any).__runQueuedRAF = () => {
      if (queued) {
        const callback = queued;
        queued = null;
        callback(0);
      }
    };
  });

  afterEach(() => {
    // cleanup any test hooks
    delete (globalThis as any).__runQueuedRAF;
  });

  test('mounting provider dispatches INIT and consumer sees turn 0', () => {
    render(
      <GameProvider>
        <TestConsumer />
      </GameProvider>
    );
    // initial turn should be 0 (INIT ran)
    expect(screen.getByTestId('turn').textContent).toBe('0');
  });

  test('autoSim RAF loop body runs advanceTurn once', async () => {
    const busSpy = vi.spyOn(globalGameBus, 'emit');
    render(
      <GameProvider>
        <TestConsumer />
      </GameProvider>
    );
    const toggle = screen.getByText('toggle');
    // toggle autoSim on
    await act(async () => {
      userEvent.click(toggle);
    });
    // run queued RAF once to trigger loop body
    act(() => {
      (globalThis as any).__runQueuedRAF();
    });
    // bus should have emitted a turn:start
    expect(busSpy).toHaveBeenCalledWith('turn:start', expect.any(Object));
    busSpy.mockRestore();
  });

  test('coverGameProviderEffects covers non-RAF branch and simulateAdvanceTurn dispatches END_TURN', () => {
    const s = initialStateForTests();
    // add a fake AI player with a leader so evaluateAI can run without crashing
    s.players = [
    {
      id: 'p1',
      name: 'AI',
      isHuman: false,
      leader: { name: 'AI-Leader' },
      cities: [],
      research: null
    } as any];

    // spy a dispatch
    const actions: any[] = [];
    const dispatch = (a: any) => actions.push(a);
    // cover helper
    coverGameProviderEffects(s, dispatch);
    // simulateAdvanceTurn should emit and then dispatch END_TURN
    simulateAdvanceTurn(s, dispatch);
    expect(actions.some((a) => a.type === 'END_TURN')).toBe(true);
  });

  test('useGame hook works inside provider and END_TURN updates turn', async () => {
    function UseGameConsumer() {
      const { state, dispatch } = useGame();
      return (
        <div>
          <div data-testid="uh-turn">{state.turn}</div>
          <button onClick={() => dispatch({ type: 'END_TURN' })}>end</button>
        </div>);

    }
    const { getByText } = render(
      <GameProvider>
        <UseGameConsumer />
      </GameProvider>
    );
    const button = getByText('end');
    await act(async () => userEvent.click(button));
    expect(screen.getByTestId('uh-turn').textContent).toBe('1');
  });

  test('autoSim cleanup calls cancelAnimationFrame on unmount', async () => {
    const cancelSpy = vi.spyOn(globalThis as any, 'cancelAnimationFrame');
    const { unmount } = render(
      <GameProvider>
        <TestConsumer />
      </GameProvider>
    );
    const toggle = screen.getByText('toggle');
    await act(async () => userEvent.click(toggle));
    // run queued RAF once to ensure there's an id scheduled
    act(() => {
      (globalThis as any).__runQueuedRAF();
    });
    // unmount provider to trigger cleanup
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });
});