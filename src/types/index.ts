export * from '../game/types';

// Runtime marker exported to allow test-suite to import this module and exercise
// a tiny runtime path (the main types are compile-time only).
export const RUNTIME_TYPES_MARKER = true;
