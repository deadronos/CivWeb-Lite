/**
 * @file This file contains a utility function for producing the next state in an immutable way.
 */

/**
 * Produces the next state by applying a mutator function to a draft of the current state.
 * This is a simplified implementation of the Immer library's `produce` function.
 * @template T - The type of the state.
 * @param state - The current state.
 * @param mutator - A function that mutates a draft of the state.
 * @returns The new, frozen state.
 */
export function produceNextState<T>(state: T, mutator: (draft: T) => void): T {
  const draft = structuredClone(state);
  mutator(draft);
  return Object.freeze(draft);
}
