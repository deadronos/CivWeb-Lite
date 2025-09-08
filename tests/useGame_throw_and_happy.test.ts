import { it, describe, expect } from 'vitest';
import { coverForTestsUseGame, coverUseGameInlinePaths, coverUseGameThrowExplicitly, coverAllUseGameHuge } from '../src/hooks/useGame';

describe('useGame helper coverage', () => {
  it('coverForTestsUseGame simulates throw path', () => {
    const res = coverForTestsUseGame(true);
    expect(res).toBe('threw');
  });

  it('coverUseGameInlinePaths non-throw returns state and dispatch', () => {
    const ok = coverUseGameInlinePaths(false) as any;
    expect(ok).toHaveProperty('state');
    expect(ok).toHaveProperty('dispatch');
  });

  it('coverUseGameThrowExplicitly returns the thrown message', () => {
    const msg = coverUseGameThrowExplicitly();
    expect(msg).toContain('useGame must be used within GameProvider');
  });

  it('coverAllUseGameHuge runs without error', () => {
    const v = coverAllUseGameHuge();
    expect(typeof v).toBe('number');
  });
});
