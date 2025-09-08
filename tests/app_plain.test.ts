import { describe, it, expect } from 'vitest';
import { UIPlain } from '../src/App';

describe('UIPlain helper', () => {
  it('runs without React and returns snapshot', () => {
    const state = { seed: 's', map: { width: 3, height: 4 }, turn: 1 };
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const snap = UIPlain(state, dispatch);
    expect(dispatched.length).toBeGreaterThanOrEqual(2);
    expect(snap.mapText).toBe('5x6');
  });
});
