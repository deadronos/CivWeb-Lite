import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UIComponent } from '../src/App';

describe('UIComponent DOM interactions', () => {
  it('reads inputs and dispatches INIT and END_TURN', () => {
    const state = { seed: 'base', map: { width: 4, height: 5 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    render(<UIComponent state={state} dispatch={dispatch} />);

    // ensure inputs exist
    const seedInput = screen.getByDisplayValue('base') as HTMLInputElement;
    expect(seedInput).toBeDefined();
    // change seed
    fireEvent.change(seedInput, { target: { value: 'newseed' } });

    // click regenerate button
    const regen = screen.getByText('Regenerate');
    fireEvent.click(regen);

    // click end turn
    const end = screen.getByText('End Turn');
    fireEvent.click(end);

    // dispatched should contain INIT and END_TURN
    expect(dispatched.some(d => d.type === 'INIT')).toBe(true);
    expect(dispatched.some(d => d.type === 'END_TURN')).toBe(true);
  });
});
