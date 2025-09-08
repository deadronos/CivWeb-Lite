import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { GameProvider } from '../src/contexts/GameProvider';
import { useGame } from '../src/hooks/useGame';
import { UIComponent } from '../src/App';

describe('Happy path coverage tests', () => {
  test('useGame works inside GameProvider and dispatch END_TURN', () => {
    function Consumer() {
      const { state, dispatch } = useGame();
      return (
        <div>
          <div data-testid="turn">{state.turn}</div>
          <button onClick={() => dispatch({ type: 'END_TURN' })}>end</button>
        </div>
      );
    }

    const { getByText, getByTestId } = render(
      <GameProvider>
        <Consumer />
      </GameProvider>,
    );

    expect(getByTestId('turn').textContent).toBe('0');
    const btn = getByText('end');
    fireEvent.click(btn);
    // after click, turn should have advanced (re-render occurs)
    expect(getByTestId('turn').textContent).not.toBe('0');
  });

  test('UIComponent reads seedRef.current when input is changed and Regenerate clicked', () => {
    const state = { seed: 'orig', map: { width: 4, height: 5 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const { getByDisplayValue, getByText } = render(<UIComponent state={state} dispatch={dispatch} />);
    // change seed input value
    const seedInput = getByDisplayValue('orig') as HTMLInputElement;
    fireEvent.change(seedInput, { target: { value: 'newseed' } });
    const regen = getByText('Regenerate');
    fireEvent.click(regen);
    expect(dispatched.find(d => d.type === 'INIT')).toBeTruthy();
  });
});
