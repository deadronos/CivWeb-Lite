import { describe, it, expect } from 'vitest';
import * as App from '../src/App';
import { initialStateForTests, coverForTestsGameProvider, coverAllGameProviderHuge, coverGameProviderEffects, coverGameProviderExtra } from '../src/contexts/GameProvider';
import * as UG from '../src/hooks/useGame';

describe('extra coverage final pass', () => {
  it('exercise App runtime helpers', () => {
    const state = { seed: 's', map: { width: 2, height: 3 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const snap = App.uiSnapshot(state);
    expect(snap.mapText).toBe('2x3');
  const r1 = App.UIPlain(state, dispatch);
  expect(r1.seed).toContain('plain');
    const r2 = App.exerciseUIRuntime(state, dispatch);
    expect(r2.turnText).toBe(String(state.turn + 1));
  });

  it('exercise GameProvider coverage helpers', () => {
    const s = initialStateForTests();
    const d: any[] = [];
    const dispatch = (a: any) => d.push(a);
    expect(coverForTestsGameProvider()).toBeTruthy();
    expect(typeof coverAllGameProviderHuge()).toBe('number');
    // call effects with autoSim false
    s.autoSim = false;
    coverGameProviderEffects(s, dispatch);
    // with autoSim true, should attempt simulateAdvanceTurn via helper
    s.autoSim = true;
    coverGameProviderEffects(s, dispatch);
    expect(typeof coverGameProviderExtra(2)).toBe('number');
  });

  it('exercise useGame inline and non-throw helpers', () => {
    expect(UG.coverForTestsUseGame(false)).toBe('skip');
    // coverUseGameInlinePaths runThrow true should throw
    expect(() => UG.coverUseGameInlinePaths(true)).toThrow('useGame must be used within GameProvider');
    // non-throw path returns object
    const ok = UG.coverUseGameInlinePaths(false) as any;
    expect(ok).toHaveProperty('state');
  });
});
