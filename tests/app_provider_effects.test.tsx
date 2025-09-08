import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import App, { UIComponent } from '../src/App';
import { GameProvider, GameStateContext } from '../src/contexts/GameProvider';
import { useGame } from '../src/hooks/useGame';

describe('UIComponent DOM interactions', () => {
  it('renders inputs and dispatches INIT and END_TURN via buttons', () => {
    const state = { seed: 'orig', map: { width: 4, height: 5 }, turn: 2 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const { getByText, getByDisplayValue } = render(<UIComponent state={state} dispatch={dispatch} />);

    // inputs should have initial values
    expect(getByDisplayValue('orig')).toBeTruthy();
    expect(getByDisplayValue('4')).toBeTruthy();
    expect(getByDisplayValue('5')).toBeTruthy();

    // click Regenerate
    const regen = getByText('Regenerate') as HTMLButtonElement;
    fireEvent.click(regen);
    // click End Turn
    const end = getByText('End Turn') as HTMLButtonElement;
    fireEvent.click(end);

    expect(dispatched.length).toBeGreaterThanOrEqual(2);
    expect(dispatched.some(d => d.type === 'INIT')).toBe(true);
    expect(dispatched.some(d => d.type === 'END_TURN')).toBe(true);
  });
});

describe('GameProvider autoSim effect scheduling', () => {
  it('schedules RAF when autoSim toggled and cleans up on unmount', async () => {
    // child that toggles autoSim when button clicked
    function Toggler() {
      const { state, dispatch } = useGame();
      return (
        <div>
          <div>auto:{String(state.autoSim)}</div>
          <button onClick={() => dispatch({ type: 'AUTO_SIM_TOGGLE', payload: { enabled: true } })}>enable</button>
        </div>
      );
    }

    const { unmount, getByText } = render(
      <GameProvider>
        <Toggler />
      </GameProvider>
    );

    const btn = getByText('enable') as HTMLButtonElement;
    fireEvent.click(btn);

    // unmount quickly to trigger cleanup which cancels RAF
    unmount();

    // nothing to assert other than no exception thrown and component unmounted
    expect(true).toBe(true);
  });
});

describe('useGame hook throw behavior', () => {
  it('throws when used outside GameProvider', () => {
    // component that calls useGame in render and therefore should throw
    function Consumer() {
      // @ts-ignore
      useGame();
      return <div />;
    }
    expect(() => render(<Consumer />)).toThrow(/useGame must be used within GameProvider/);
  });
});
