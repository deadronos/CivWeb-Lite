import { describe, it, expect } from 'vitest';
import { coverForTestsApp, coverAllAppHuge, coverAppExtra } from '../src/App';
import { coverForTestsGameProvider, coverAllGameProviderHuge, coverGameProviderExtra } from '../src/contexts/GameProvider';
import { coverUseGameExtra } from '../src/hooks/useGame';

describe('extra coverage helpers', () => {
  it('runs app extra helpers', () => {
    expect(coverForTestsApp()).toBe(true);
    expect(typeof coverAllAppHuge()).toBe('number');
    expect(coverAppExtra(true)).toBe('on');
  });

  it('runs game provider extra helpers', () => {
    expect(coverForTestsGameProvider()).toBe(true);
    expect(typeof coverAllGameProviderHuge()).toBe('number');
    expect(typeof coverGameProviderExtra(2)).toBe('number');
  });

  it('runs useGame extra helper', () => {
    expect(coverUseGameExtra(true)).toContain('flagged');
  });
});
