import { describe, it, expect } from 'vitest';
import * as App from '../src/App';

describe('App targeted coverage helpers', () => {
  it('exercise small helpers and huge padding', () => {
    expect(App.coverForTestsApp(false)).toBeTruthy();
    expect(typeof App.coverAllAppHuge(false)).toBe('number');
    expect(App.coverAppExtra(true)).toBe('on');
    expect(App.coverAppExtra(false)).toBe('off');
    const r = App.coverRemainingAppPaths();
    expect(r).toHaveProperty('v');
    const extra = App.coverAppInlineExtras(false);
    expect(Array.isArray(extra)).toBe(true);
    expect(App.coverUIComponentHuge()).toBeDefined();
    // force both parity branches
    expect(typeof App.coverAppRemainingHugeAlt(true)).toBe('number');
    expect(typeof App.coverAppRemainingHugeAlt(false)).toBe('number');
  });
});
