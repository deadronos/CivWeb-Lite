import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UIComponent } from '../src/App';

describe('UIComponent DOM interactions', () => {
  it('uses refs and dispatches INIT and END_TURN when buttons clicked', () => {
    const state = { seed: 'seed1', map: { width: 5, height: 6 }, turn: 2 };
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);

    const { container, getByText } = render(<UIComponent state={state} dispatch={dispatch} />);

    const inputs = container.querySelectorAll('input');
    // first input is seed, second width, third height
    const seedInput = inputs[0] as HTMLInputElement;
    const widthInput = inputs[1] as HTMLInputElement;
    const heightInput = inputs[2] as HTMLInputElement;

    // change values
    fireEvent.change(seedInput, { target: { value: 'new-seed' } });
    fireEvent.change(widthInput, { target: { value: '9' } });
    fireEvent.change(heightInput, { target: { value: '10' } });

    // click Regenerate
    const regen = getByText('Regenerate');
    fireEvent.click(regen);

    // click End Turn
    const end = getByText('End Turn');
    fireEvent.click(end);

    expect(dispatched.length).toBeGreaterThanOrEqual(2);
    // expect first dispatched INIT payload to include new values
    const init = dispatched.find(d => d.type === 'INIT');
    expect(init).toBeTruthy();
    expect(init.payload.seed).toBe('new-seed');
    expect(init.payload.width).toBe(9);
    expect(init.payload.height).toBe(10);
    // expect END_TURN dispatched
    expect(dispatched.some(d => d.type === 'END_TURN')).toBe(true);
  });
});
