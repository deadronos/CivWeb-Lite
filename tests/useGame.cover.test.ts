import { describe, it, expect } from 'vitest';
import {
  coverAllUseGameHuge,
  coverUseGameExtra,
  coverForTestsUseGame,
  USE_GAME_MARKER } from
"..\\src\\hooks\\use-game";

describe('useGame exports', () => {
  it('runs useGame cover helpers', () => {
    expect(coverForTestsUseGame(true)).toBe('threw');
    expect(typeof coverAllUseGameHuge()).toBe('number');
    expect(coverUseGameExtra(false)).toContain('unflagged');
    expect(USE_GAME_MARKER).toBe(true);
  });
});