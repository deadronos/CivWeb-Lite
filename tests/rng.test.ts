import { describe, it, expect } from 'vitest';
import { seedFrom, next } from '../src/game/rng';

describe('rng', () => {
  it('produces deterministic sequence for same seed', () => {
    let s1 = seedFrom('abc');
    let s2 = seedFrom('abc');
    const vals1: number[] = [];
    const vals2: number[] = [];
    for (let i = 0; i < 5; i++) {
      const out1 = next(s1);
      s1 = out1.state;
      vals1.push(out1.value);
      const out2 = next(s2);
      s2 = out2.state;
      vals2.push(out2.value);
    }
    expect(vals1).toEqual(vals2);
  });
});
