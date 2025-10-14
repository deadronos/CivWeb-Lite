import { seedFrom, next, nextInt } from '../rng';

function buildSeed(parts: Array<string | number>): string {
  return parts.map((part) => (typeof part === 'number' ? part.toString(10) : part)).join('|');
}

/**
 * Deterministic pseudo-random float generator based on seed parts.
 * Returns a value in the [0, 1) interval. Does not mutate any global RNG state.
 */
export function deterministicFloat(parts: Array<string | number>): number {
  const key = buildSeed(parts);
  const state = seedFrom(key);
  return next(state).value;
}

/**
 * Deterministic pseudo-random integer in [0, length) using the provided seed parts.
 * When length <= 0 the function always returns 0.
 */
export function deterministicIndex(length: number, parts: Array<string | number>): number {
  if (length <= 0) {
    return 0;
  }
  const key = buildSeed(parts);
  const rng = seedFrom(key);
  return nextInt(rng, length).value;
}

/**
 * Selects an element deterministically from the list using the seed parts.
 */
export function deterministicPick<T>(items: T[], parts: Array<string | number>): T | undefined {
  if (items.length === 0) {
    return undefined;
  }
  const index = deterministicIndex(items.length, parts);
  return items[index];
}
