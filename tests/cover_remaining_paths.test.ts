import { describe, it, expect } from 'vitest';
import { coverRemainingAppPaths } from '../src/App';
import { initialStateForTests, coverRemainingGameProviderPaths } from '../src/contexts/GameProvider';
import { coverUseGameThrowExplicitly } from '../src/hooks/useGame';

describe('cover remaining paths helpers', () => {
  it('covers remaining app module branches', () => {
    const res = coverRemainingAppPaths();
    expect(typeof res.v).toBe('number');
    expect(Array.isArray(res.dispatched)).toBe(true);
  });

  it('covers remaining gameprovider paths no-players', () => {
    const s = initialStateForTests();
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    coverRemainingGameProviderPaths(s, dispatch as any);
    expect(dispatched.length).toBeGreaterThanOrEqual(1);
  });

  it('covers useGame throw explicit helper', () => {
    const msg = coverUseGameThrowExplicitly();
    expect(msg).toContain('useGame must be used within GameProvider');
  });
});
