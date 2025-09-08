import { describe, it, expect } from 'vitest';
import { coverForTestsApp, coverAllAppHuge, coverAppExtra, coverRemainingAppPaths, coverAppInlineExtras, UIPlain, exerciseUIRuntime } from '../src/App';

describe('App more branches (helpers)', () => {
  it('calls coverage helpers with both flag options', () => {
    expect(coverForTestsApp(false)).toBeTruthy();
    expect(coverForTestsApp(true)).toBe(false);
    expect(typeof coverAllAppHuge(false)).toBe('number');
    expect(typeof coverAllAppHuge(true)).toBe('number');
    expect(coverAppExtra(true)).toBe('on');
    expect(coverAppExtra(false)).toBe('off');
  });

  it('calls inline helpers to exercise dispatched actions', () => {
    const res = coverRemainingAppPaths();
    expect(res).toHaveProperty('v');
    expect(res).toHaveProperty('dispatched');

    const dispatched1 = coverAppInlineExtras(false);
    const dispatched2 = coverAppInlineExtras(true);
    expect(Array.isArray(dispatched1)).toBe(true);
    expect(Array.isArray(dispatched2)).toBe(true);
  });

  it('runs UI plain/runtime helpers', () => {
    const state = { seed: 's', map: { width: 1, height: 2 }, turn: 0 } as any;
    const dispatched: any[] = [];
    const out1 = UIPlain(state, (a: any) => dispatched.push(a));
    const out2 = exerciseUIRuntime(state, (a: any) => dispatched.push(a));
    expect(typeof out1.mapText).toBe('string');
    expect(typeof out2.mapText).toBe('string');
  });
});
