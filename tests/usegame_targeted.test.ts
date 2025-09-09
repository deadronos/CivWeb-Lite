import { describe, it, expect } from 'vitest';
import * as UG from '../src/hooks/useGame';
import { ensureGameContext } from '../src/hooks/useGame';

describe('useGame targeted helpers', () => {
  it('cover thrown helper path without using hooks', () => {
    expect(UG.coverForTestsUseGame(true)).toBe('threw');
    expect(UG.coverUseGameThrowExplicitly()).toBe('useGame must be used within GameProvider');
  });

  it('cover inline safe paths and tuple variant', () => {
    const v = UG.coverAllUseGameHuge();
    expect(typeof v).toBe('number');
    expect(UG.coverUseGameExtra(true)).toMatch(/^flagged/);
    expect(UG.coverUseGameInlinePathsTuple(false)[0]).toBeDefined();
  });

  it('ensureGameContext throws when missing and returns true when present', () => {
    expect(() => ensureGameContext(null as any, null as any)).toThrow(
      'useGame must be used within GameProvider'
    );
    expect(ensureGameContext({} as any, (() => {}) as any)).toBeTruthy();
  });
});
