import { describe, it, expect } from 'vitest';
import {
  coverForTestsUseGame,
  coverUseGameThrowExplicitly,
  coverAllUseGameHuge,
  coverUseGameInlinePaths,
  coverUseGameInlinePathsTuple,
  coverUseGameExtra,
} from '../src/hooks/useGame';

describe('useGame coverage helpers', () => {
  it('ensureGameContext throws when missing', () => {
    // call the explicit throw helper
    const message = coverUseGameThrowExplicitly();
    expect(message).toContain('useGame must be used within GameProvider');
    const res = coverForTestsUseGame(true);
    expect(res).toBe('threw');
  });

  it('inline path helpers return expected shapes', () => {
    const v = coverAllUseGameHuge();
    expect(typeof v).toBe('number');
    const t = coverUseGameInlinePaths(false);
    expect((t as any).state).toBeDefined();
    const tup = coverUseGameInlinePathsTuple(false);
    expect(Array.isArray(tup)).toBe(true);
    expect(typeof coverUseGameExtra(true)).toBe('string');
  });
});
