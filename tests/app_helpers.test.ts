import { describe, it, expect } from 'vitest';
import { uiSnapshot, APP_RUNTIME_MARKER } from '../src/App';

describe('App helpers', () => {
  it('uiSnapshot returns formatted texts', () => {
    expect(APP_RUNTIME_MARKER).toBe(true);
    const s = { seed: 'abc', map: { width: 3, height: 4 }, turn: 5 };
    const snap = uiSnapshot(s);
    expect(snap.seed).toBe('abc');
    expect(snap.mapText).toBe('3x4');
    expect(snap.turnText).toBe('5');
  });
});
