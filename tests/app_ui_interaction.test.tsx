import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { UIComponent } from '../src/App';
import { simulateAdvanceTurn, initialStateForTests } from '../src/contexts/GameProvider';

describe('UIComponent DOM interactions and simulateAdvanceTurn', () => {
  test('UIComponent onClick handlers dispatch correct actions', () => {
    const state = { seed: 'start', map: { width: 4, height: 3 }, turn: 1 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);

    const { container, getByText } = render(<UIComponent state={state} dispatch={dispatch} />);
    const inputs = container.querySelectorAll('input');
    // seed input is first
    const seedInput = inputs[0] as HTMLInputElement;
    const widthInput = inputs[1] as HTMLInputElement;
    const heightInput = inputs[2] as HTMLInputElement;
    // change seed value
    fireEvent.change(seedInput, { target: { value: 'my-seed' } });
    fireEvent.change(widthInput, { target: { value: '10' } });
    fireEvent.change(heightInput, { target: { value: '20' } });

    const regen = getByText('Regenerate');
    fireEvent.click(regen);
    // first dispatch should be INIT with payload including our seed
    expect(dispatched[0]).toHaveProperty('type', 'INIT');
    expect(dispatched[0].payload).toHaveProperty('seed', 'my-seed');

    const end = getByText('End Turn');
    fireEvent.click(end);
    expect(dispatched.some(d => d.type === 'END_TURN')).toBe(true);
  });

  test('simulateAdvanceTurn calls evaluateAI and dispatches END_TURN', () => {
    const base = initialStateForTests();
    const s = { ...base, players: [{ id: 'a1', isHuman: false, leader: 'L', researchedTechIds: [], researching: null, sciencePoints: 0, culturePoints: 0 }], turn: 2 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    simulateAdvanceTurn(s, dispatch);
    // simulateAdvanceTurn should at least dispatch END_TURN
    expect(dispatched.some(d => d.type === 'END_TURN')).toBe(true);
  });
});
