import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UIComponent } from '../src/App';

describe('UIComponent', () => {
  it('renders state values and buttons', () => {
    const state = { seed: 'x', map: { width: 2, height: 3 }, turn: 7 };
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    render(<UIComponent state={state} dispatch={dispatch} />);
    expect(screen.getByText(/Seed:/)).toBeTruthy();
    expect(screen.getByText(/Turn:/)).toBeTruthy();
    const btn = screen.getByText('End Turn');
    btn.click();
    expect(dispatched.some(d => d.type === 'END_TURN')).toBe(true);
  });
});
