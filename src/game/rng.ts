// Simple seedable RNG (xorshift64*) wrapper for deterministic behavior
export type RNGState = { s: bigint };

export function seedFrom(input: string | number): RNGState {
  let n = 0n;
  if (typeof input === 'number') {
    n = BigInt(Math.floor(input));
  } else {
    for (let i = 0; i < input.length; i++) {
      n = (n * 31n + BigInt(input.charCodeAt(i))) & ((1n << 64n) - 1n);
    }
    if (n === 0n) n = 88172645463325252n;
  }
  if (n === 0n) n = 88172645463325252n;
  return { s: n };
}

export function next(state: RNGState): { state: RNGState; value: number } {
  let x = state.s;
  x ^= x >> 12n;
  x ^= (x << 25n) & ((1n << 64n) - 1n);
  x ^= x >> 27n;
  state = { s: x };
  const result = Number((x * 2685821657736338717n) & ((1n << 64n) - 1n));
  const value = (result >>> 0) / 2 ** 32;
  return { state, value };
}

export function nextInt(state: RNGState, max: number): { state: RNGState; value: number } {
  const out = next(state);
  return { state: out.state, value: Math.floor(out.value * max) };
}
