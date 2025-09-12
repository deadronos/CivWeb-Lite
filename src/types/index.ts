/**
 * @file This file re-exports all the types from the game directory.
 */

export * from '../game/types';

/**
 * A runtime marker exported to allow the test suite to import this module and exercise a tiny runtime path.
 */
export const RUNTIME_TYPES_MARKER = true;
