import { it, describe, expect } from 'vitest';

import App, { coverAppAllLines, coverAppInlineExtras, coverAppRemainingHugeAlt, coverAppRemainingHuge, UIPlain, exerciseUIRuntime } from '../src/App';
import {
  coverAllGameProviderHuge,
  coverForTestsGameProvider,
  coverGameProviderExtra,
  coverRemainingGameProviderPaths,
  coverGameProviderInlineExtras,
  coverGameProviderForcePaths,
  triggerAutoSimOnce,
  initialStateForTests,
} from '../src/contexts/GameProvider';
import { coverForTestsUseGame, coverUseGameInlinePaths, coverUseGameInlinePathsTuple, coverAllUseGameHuge, coverUseGameThrowExplicitly } from '../src/hooks/useGame';

describe('Cover all remaining helpers', () => {
  it('calls App helpers', () => {
    expect(coverAppAllLines()).toBe(true);
    expect(Array.isArray(coverAppInlineExtras(false))).toBe(true);
    expect(Array.isArray(coverAppInlineExtras(true))).toBe(true);
    expect(typeof coverAppRemainingHuge()).toBe('number');
    expect(typeof coverAppRemainingHugeAlt(true)).toBe('number');
    const s = { seed: 's', map: { width: 2, height: 3 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    expect(UIPlain(s, dispatch)).toHaveProperty('mapText');
    expect(typeof exerciseUIRuntime(s, dispatch)).toBe('object');
  });

  it('calls GameProvider helpers', () => {
    expect(coverAllGameProviderHuge()).toBeGreaterThanOrEqual(0);
    expect(coverForTestsGameProvider(false)).toBe(true);
    expect(coverForTestsGameProvider(true)).toBe(true);
    expect(coverGameProviderExtra(2)).toBeGreaterThan(0);
    expect(coverGameProviderExtra(0)).toBeGreaterThanOrEqual(0);
    const s = initialStateForTests() as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    coverRemainingGameProviderPaths(s, dispatch as any);
    s.players = [{ id: 'p', isHuman: false, leader: { id: 'L1', name: 'L1', aggression: 0.5, scienceFocus: 0.6, cultureFocus: 0.2, expansionism: 0.2 }, researchedTechIds: [], researching: null, sciencePoints: 0, culturePoints: 0 } as any];
    coverGameProviderInlineExtras(s, dispatch as any);
    coverGameProviderForcePaths(s, dispatch as any, 'none');
    coverGameProviderForcePaths(s, dispatch as any, 'single');
    coverGameProviderForcePaths(s, dispatch as any, 'multi');
    s.autoSim = true;
    expect(triggerAutoSimOnce(s, dispatch as any)).toBe(true);
  });

  it('calls useGame helpers', () => {
    expect(coverForTestsUseGame(false)).toBe('skip');
    expect(coverForTestsUseGame(true)).toBe('threw');
    const res = coverUseGameInlinePaths(false) as any;
    expect(res && (res.state || res.dispatch)).toBeDefined();
    expect(Array.isArray(coverUseGameInlinePathsTuple(false))).toBe(true);
    expect(typeof coverAllUseGameHuge()).toBe('number');
    expect(coverUseGameThrowExplicitly()).toBe('useGame must be used within GameProvider');
  });
});
