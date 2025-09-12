/**
 * @file This file contains functions for a simple seedable random number generator (RNG).
 * This is used to ensure deterministic behavior in the game simulation.
 */

/**
 * Represents the state of the random number generator.
 * @property s - The seed value.
 */
export type RNGState = { s: bigint };

/**
 * Creates a new RNG state from a seed.
 * @param input - The seed, which can be a string or a number.
 * @returns The initial RNG state.
 */
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

/**
 * Generates the next random number in the sequence.
 * @param state - The current RNG state.
 * @returns An object containing the next RNG state and a random number between 0 and 1.
 */
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

/**
 * Generates the next random integer in the sequence up to a maximum value.
 * @param state - The current RNG state.
 * @param max - The exclusive maximum value of the random integer.
 * @returns An object containing the next RNG state and a random integer.
 */
export function nextInt(state: RNGState, max: number): { state: RNGState; value: number } {
  const out = next(state);
  return { state: out.state, value: Math.floor(out.value * max) };
}
