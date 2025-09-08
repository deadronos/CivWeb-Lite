import { describe, it, expect } from 'vitest';
import { exerciseUIRuntime } from '../src/App';

describe('App runtime exercise', () => {
  it('exerciseUIRuntime dispatches actions and returns snapshot', () => {
    const state = { seed: 'a', map: { width: 1, height: 2 }, turn: 0 };
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const snap = exerciseUIRuntime(state, dispatch);
    expect(dispatched.length).toBeGreaterThanOrEqual(2);
    expect(snap.mapText).toBe('2x3');
  });
});
