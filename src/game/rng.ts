// Simple seedable RNG (xorshift64*) wrapper for deterministic behavior
export type RNGState = { s: bigint };

export function seedFrom(input: string | number): RNGState {
  let n = 0n;
  if (typeof input === 'number') {
    n = BigInt(Math.floor(input));
  } else {
    for (let index = 0; index < input.length; index++) {
      n = (n * 31n + BigInt(input.charCodeAt(index))) & ((1n << 64n) - 1n);
    }
    if (n === 0n) n = 88_172_645_463_325_252n;
  }
  if (n === 0n) n = 88_172_645_463_325_252n;
  return { s: n };
}

export function next(state: RNGState): { state: RNGState; value: number } {
  let x = state.s;
  x ^= x >> 12n;
  x ^= (x << 25n) & ((1n << 64n) - 1n);
  x ^= x >> 27n;
  state = { s: x };
  const result = Number((x * 2_685_821_657_736_338_717n) & ((1n << 64n) - 1n));
  const value = (result >>> 0) / 2 ** 32;
  return { state, value };
}

export function nextInt(state: RNGState, max: number): { state: RNGState; value: number } {
  const out = next(state);
  return { state: out.state, value: Math.floor(out.value * max) };
}
