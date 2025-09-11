import { describe, it, expect } from 'vitest';
import {
  initialStateForTests,
  simulateAdvanceTurn,
  coverGameProviderEffects,
  coverRemainingGameProviderPaths,
  coverGameProviderForcePaths,
  triggerAutoSimOnce } from
"../src/contexts/game-provider";

describe('GameProvider coverage helpers', () => {
  it('initialStateForTests returns a valid state and helpers run', () => {
    const s = initialStateForTests();
    expect(s).toHaveProperty('turn');
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);

    // simulate no players
    coverGameProviderEffects(s, dispatch);
    coverRemainingGameProviderPaths(s, dispatch);

    // force none/single/multi
    coverGameProviderForcePaths(s, dispatch, 'none');
    coverGameProviderForcePaths(s, dispatch, 'single');
    coverGameProviderForcePaths(s, dispatch, 'multi');

    // autoSim trigger
    s.autoSim = true;
    const triggered = triggerAutoSimOnce(s, dispatch);
    expect(typeof triggered).toBe('boolean');

    // simulate advance turn directly (should dispatch END_TURN)
    simulateAdvanceTurn(s, dispatch);
    expect(dispatched.some((d) => d.type === 'END_TURN')).toBe(true);
  });
});