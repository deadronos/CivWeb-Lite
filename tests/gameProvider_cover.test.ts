import { describe, it, expect } from 'vitest';
import { coverGameProviderEffects } from '../src/test-utils/game-provider';
import { initialStateForTests as initialState } from '../src/test-utils/game-provider';

describe('GameProvider coverage helper', () => {
  it('runs coverGameProviderEffects without throwing', () => {
    const s = initialState();
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    coverGameProviderEffects(s, dispatch as any);
    expect(dispatched.length).toBeGreaterThanOrEqual(1);
  });
});
