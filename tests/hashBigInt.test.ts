import { it, expect, describe } from 'vitest';
import { hashState } from '../src/game/utils/replay';

describe('hashState BigInt handling', () => {
  it('serializes and hashes states containing BigInt without throwing and deterministically', async () => {
    const state = {
      id: 1,
      counters: {
        large: 123456789012345678901234567890n,
        negative: -9007199254740991n,
      },
      list: [1n, 2n, 3n, null],
      nested: {
        arr: [{ v: 10n }, { v: 'text' }],
      },
    } as any;

    // Should not throw and returns a SHA-256 hex string
    const h1 = await hashState(state as any);
    expect(typeof h1).toBe('string');
    expect(/^[0-9a-f]{64}$/.test(h1)).toBe(true);

    // Re-hash to ensure determinism
    const h2 = await hashState(state as any);
    expect(h1).toEqual(h2);

    // Replacing BigInt with its textual '...n' representation should produce the same canonical serialization
    const stateAsText = JSON.parse(
      JSON.stringify(state, (_k, v) => (typeof v === 'bigint' ? v.toString() + 'n' : v))
    );
    const h3 = await hashState(stateAsText as any);
    expect(h3).toEqual(h1);

    // Changing the BigInt value should change the hash
    const stateChanged = {
      ...state,
      counters: { ...state.counters, large: 9999999999999999999999n },
    } as any;
    const h4 = await hashState(stateChanged);
    expect(h4).not.toEqual(h1);
  });
});
