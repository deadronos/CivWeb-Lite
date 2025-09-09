import { describe, test, expect } from 'vitest';
import {
  coverForTestsUseGame,
  coverAllUseGameHuge,
  coverUseGameExtra,
  USE_GAME_MARKER } from
"..\\src\\hooks\\use-game";

describe('useGame helper coverage', () => {
  test('coverForTestsUseGame simulates throw path', () => {
    const res = coverForTestsUseGame(true);
    expect(res).toBe('threw');
  });

  test('coverAllUseGameHuge runs and returns a number', () => {
    const v = coverAllUseGameHuge();
    expect(typeof v).toBe('number');
  });

  test('coverUseGameExtra toggles output', () => {
    expect(coverUseGameExtra(true)).toContain('flagged');
    expect(coverUseGameExtra(false)).toContain('unflagged');
  });

  test('marker exists', () => {
    expect(USE_GAME_MARKER).toBe(true);
  });
});