import { describe, it, expect } from 'vitest';
import { stringifyState, parseState, hashState } from '../src/game/utils/replay';

describe('round-trip state persistence', () => {
  it('stringify -> parse -> hash produces identical hash', async () => {
    const state = {
      x: 1,
      big: 9_007_199_254_740_993n,
      nested: { arr: [1n, 'a', { n: 5n }] },
    } as any;

    const s = stringifyState(state);
    const parsed = parseState(s);
    const h1 = await hashState(state);
    const h2 = await hashState(parsed);
    expect(h1).toEqual(h2);
  });
});
