import { describe, it, expect } from 'vitest';
import { coverGameProviderEffects, initialState } from '../src/contexts/game-provider';

describe('GameProvider coverage helper', () => {
  it('runs coverGameProviderEffects without throwing', () => {
    const s = initialState();
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    coverGameProviderEffects(s, dispatch as any);
    expect(dispatched.length).toBeGreaterThanOrEqual(1);
  });
});
