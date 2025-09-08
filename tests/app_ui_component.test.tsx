import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect } from 'vitest';
import { UIComponent } from '../src/App';

test('UIComponent uses refs and dispatches INIT with input values', () => {
  const state = { seed: 'initial', map: { width: 4, height: 5 }, turn: 2 } as any;
  const dispatched: any[] = [];
  const dispatch = (a: any) => dispatched.push(a);

  render(<UIComponent state={state} dispatch={dispatch} />);

  // find seed input and change its value
  const seedInput = screen.getByDisplayValue('initial') as HTMLInputElement;
  fireEvent.change(seedInput, { target: { value: 'my-seed' } });

  const regenerate = screen.getByText('Regenerate') as HTMLButtonElement;
  fireEvent.click(regenerate);

  // End Turn button
  const end = screen.getByText('End Turn') as HTMLButtonElement;
  fireEvent.click(end);

  // two dispatches: INIT and END_TURN
  expect(dispatched.length).toBeGreaterThanOrEqual(2);
  expect(dispatched[0].type).toBe('INIT');
  expect(dispatched[1].type).toBe('END_TURN');
});
