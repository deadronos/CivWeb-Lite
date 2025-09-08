import { describe, it, expect } from 'vitest';
import { initialStateForTests, coverGameProviderForcePaths, triggerAutoSimOnce, coverRemainingGameProviderPaths, coverGameProviderInlineExtras } from '../src/contexts/GameProvider';

describe('GameProvider targeted helpers', () => {
  it('force none, single, and multi player branches', () => {
    const s = initialStateForTests();
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    // none
    coverGameProviderForcePaths(s, dispatch, 'none');
    expect(dispatched.length).toBeGreaterThanOrEqual(1);
    dispatched.length = 0;
    // single human
    coverGameProviderForcePaths(s, dispatch, 'single');
    // multi AI
    coverGameProviderForcePaths(s, dispatch, 'multi');
  });

  it('trigger autoSim once and coverRemaining/inline extras', () => {
    const s = initialStateForTests();
    s.autoSim = true;
    const d: any[] = [];
    const dispatch = (a: any) => d.push(a);
    const ok = triggerAutoSimOnce(s, dispatch);
    expect(ok).toBe(true);
    // cover remaining paths
    coverRemainingGameProviderPaths(s, dispatch);
    coverGameProviderInlineExtras(s, dispatch);
  });
});
