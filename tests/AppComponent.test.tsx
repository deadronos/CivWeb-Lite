import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UIComponent } from '../src/App';

describe('UIComponent', () => {
  it('updates inputs and dispatches actions on buttons', () => {
    const mockDispatch = vi.fn();
    const state = { seed: 'seed1', map: { width: 8, height: 6 }, turn: 2 };
    const { getByDisplayValue, getByText } = render(<UIComponent state={state} dispatch={mockDispatch} />);

    // change seed
    const seedInput = getByDisplayValue('seed1') as HTMLInputElement;
    fireEvent.change(seedInput, { target: { value: 'new-seed' } });

    // change width and height
    const widthInput = getByDisplayValue('8') as HTMLInputElement;
    const heightInput = getByDisplayValue('6') as HTMLInputElement;
    fireEvent.change(widthInput, { target: { value: '10' } });
    fireEvent.change(heightInput, { target: { value: '12' } });

    // click regenerate -> should dispatch INIT with payload
    const regen = getByText('Regenerate');
    fireEvent.click(regen);
    expect(mockDispatch).toHaveBeenCalled();
  const initCall = mockDispatch.mock.calls.find(c => c[0] && c[0].type === 'INIT');
  expect(initCall).toBeTruthy();
  if (!initCall) throw new Error('expected INIT call');
  expect(initCall[0].payload).toEqual({ seed: 'new-seed', width: 10, height: 12 });

    // click end turn -> dispatch END_TURN
    const end = getByText('End Turn');
    fireEvent.click(end);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'END_TURN' });
  });
});
