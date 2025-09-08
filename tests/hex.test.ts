import { describe, it, expect } from 'vitest';
import { add, neighbors, distance, HEX_DIRECTIONS } from '../src/game/world/hex';

describe('hex utilities', () => {
  it('adds coordinates', () => {
    const a = { q: 1, r: 2 };
    const b = { q: -1, r: 3 };
    expect(add(a, b)).toEqual({ q: 0, r: 5 });
  });

  it('neighbors returns 6 neighbors', () => {
    const c = { q: 0, r: 0 };
    const n = neighbors(c);
    expect(n).toHaveLength(HEX_DIRECTIONS.length);
  });

  it('distance is symmetric and correct for known pairs', () => {
    const a = { q: 0, r: 0 };
    const b = { q: 1, r: -1 };
    expect(distance(a, b)).toBe(1);
    expect(distance(b, a)).toBe(1);
    expect(distance(a, a)).toBe(0);
  });
});
