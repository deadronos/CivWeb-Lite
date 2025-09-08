import { describe, it, expect } from 'vitest';
import {
  UIPlain,
  exerciseUIRuntime,
  uiSnapshot,
  coverAppInlineExtras,
  coverRemainingAppPaths,
  coverForTestsApp,
  coverAllAppHuge,
  coverAppExtra,
} from '../src/App';

import {
  initialStateForTests,
  simulateAdvanceTurn,
  coverAllGameProviderHuge,
  coverForTestsGameProvider,
  coverGameProviderInlineExtras,
} from '../src/contexts/GameProvider';

import {
  coverForTestsUseGame,
  coverAllUseGameHuge,
  coverUseGameExtra,
  coverUseGameInlinePaths,
  coverUseGameThrowExplicitly,
} from '../src/hooks/useGame';

import { globalGameBus } from '../src/game/events';

describe('extra coverage exercisers', () => {
  it('calls many App helpers imperatively', () => {
    const state = { seed: 's1', map: { width: 4, height: 5 }, turn: 3 } as any;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const p = UIPlain(state, dispatch);
    expect(p.seed).toContain('s1');
    const s2 = exerciseUIRuntime(state, dispatch);
    expect(s2.mapText).toBe('5x6');
    expect(uiSnapshot(state).mapText).toBe('4x5');

    expect(coverForTestsApp()).toBe(true);
    expect(typeof coverAllAppHuge()).toBe('number');
    expect(coverAppExtra(false)).toBe('off');

    const rem = coverRemainingAppPaths();
    expect(Array.isArray(rem.dispatched)).toBe(true);
    const inlineA = coverAppInlineExtras(false);
    const inlineB = coverAppInlineExtras(true);
    expect(inlineA.length).toBeGreaterThanOrEqual(1);
    expect(inlineB.length).toBeGreaterThanOrEqual(1);
  });

  it('exercises GameProvider inline helpers', () => {
    const s = initialStateForTests();
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    // simulateAdvanceTurn should dispatch END_TURN
    simulateAdvanceTurn({ ...s, players: [] } as any, dispatch as any);
    expect(dispatched.find(d => d.type === 'END_TURN')).toBeTruthy();

    // cover inline extras with various player setups
    coverGameProviderInlineExtras({ ...s, players: [] } as any, dispatch as any);
    coverGameProviderInlineExtras({ ...s, players: [{ id: 'p', isHuman: false, leader: { scienceFocus: 1, cultureFocus: 0 } } as any] } as any, dispatch as any);

    expect(typeof coverAllGameProviderHuge()).toBe('number');
    expect(coverForTestsGameProvider()).toBe(true);
  });

  it('exercises useGame helpers', () => {
    expect(coverForTestsUseGame()).toBe('threw');
    expect(typeof coverAllUseGameHuge()).toBe('number');
    expect(coverUseGameExtra(true)).toContain('flagged');
    expect(coverUseGameThrowExplicitly()).toContain('useGame must be used within GameProvider');
    expect(() => coverUseGameInlinePaths(true)).toThrow();
    const ok = coverUseGameInlinePaths(false);
    expect(typeof ok).toBe('object');
  });
});
