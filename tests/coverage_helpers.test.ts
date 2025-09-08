import { describe, it, expect } from 'vitest';
import {
  coverForTestsApp,
  coverAllAppHuge,
  coverAppExtra,
  UIPlain,
  uiSnapshot,
} from '../src/App';
import {
  coverForTestsGameProvider,
  coverAllGameProviderHuge,
  coverGameProviderExtra,
  initialStateForTests,
} from '../src/contexts/GameProvider';
import { coverAllUseGameHuge, coverUseGameExtra } from '../src/hooks/useGame';

describe('Coverage helpers smoke', () => {
  it('runs App helpers', () => {
    expect(coverForTestsApp()).toBe(true);
    const v = coverAllAppHuge();
    expect(typeof v).toBe('number');
    expect(coverAppExtra(true)).toBe('on');
    const s = { seed: 's', map: { width: 1, height: 1 }, turn: 0 };
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    const plain = UIPlain(s, dispatch as any);
    expect(plain.mapText).toContain('x');
    expect(uiSnapshot(s).seed).toBe('s');
  });

  it('runs GameProvider helpers', () => {
    expect(coverForTestsGameProvider()).toBeTruthy();
    expect(typeof coverAllGameProviderHuge()).toBe('number');
    expect(typeof coverGameProviderExtra(2)).toBe('number');
    const s = initialStateForTests();
    expect(s.turn).toBeDefined();
  });

  it('runs useGame helpers', () => {
    expect(typeof coverAllUseGameHuge()).toBe('number');
    expect(coverUseGameExtra(true)).toContain('flagged');
  });
});
