import { describe, it, expect } from 'vitest';
import { decodeBigIntMarkers } from '../src/game/utils/replay';

describe('decodeBigIntMarkers', () => {
  it('converts textual BigInt markers back to BigInt recursively', () => {
    const object = {
      a: '123n',
      b: '-45n',
      c: ['1n', 'x', null],
      d: { nested: '9007199254740993n' },
    } as any;
    const decoded = decodeBigIntMarkers(object) as any;
    expect(typeof decoded.a).toBe('bigint');
    expect(decoded.a).toBe(123n);
    expect(typeof decoded.b).toBe('bigint');
    expect(decoded.b).toBe(-45n);
    expect(Array.isArray(decoded.c)).toBe(true);
    expect(decoded.c[0]).toBe(1n);
    expect(decoded.c[1]).toBe('x');
    expect(decoded.d.nested).toBe(9_007_199_254_740_993n);
  });
});
