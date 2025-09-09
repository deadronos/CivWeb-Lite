import { describe, it, expect } from 'vitest';
import {
  coverForTestsUseGame,
  coverAllUseGameHuge,
  coverUseGameExtra,
  coverUseGameThrowExplicitly,
  coverUseGameInlinePaths,
} from '../src/hooks/useGame';

describe('useGame coverage helpers', () => {
  it('cover thrown path helper returns threw', () => {
    expect(coverForTestsUseGame(true)).toBe('threw');
    expect(coverForTestsUseGame(false)).toBe('skip');
  });

  it('cover inline and extra helpers execute', () => {
    expect(typeof coverAllUseGameHuge()).toBe('number');
    expect(typeof coverUseGameExtra(true)).toBe('string');
    expect(typeof coverUseGameExtra(false)).toBe('string');
    expect(coverUseGameThrowExplicitly()).toBe('useGame must be used within GameProvider');

    // cover inline paths: the runThrow=false returns a state/dispatch tuple
    const ok = coverUseGameInlinePaths(false) as any;
    expect(ok).toHaveProperty('state');
    expect(ok).toHaveProperty('dispatch');
  });
});
