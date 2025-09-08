import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { UIComponent, UIPlain } from '../src/App';

describe('App UI extra tests', () => {
  test('UIComponent Regenerate uses fallback when refs are not present', () => {
    const state = { seed: 's', map: { width: 10, height: 20 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const { getByText } = render(<UIComponent state={state} dispatch={dispatch} />);
    // click Regenerate without touching inputs
    const btn = getByText('Regenerate');
    btn.click();
    expect(dispatched.find(d => d.type === 'INIT')).toBeTruthy();
  });

  test('UIPlain mirrors UI behavior and returns snapshot', () => {
    const state = { seed: 'plain', map: { width: 3, height: 4 }, turn: 2 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const snap = UIPlain(state, dispatch);
    expect(snap.mapText).toBe('5x6');
    expect(dispatched.length).toBeGreaterThanOrEqual(2);
  });
});
