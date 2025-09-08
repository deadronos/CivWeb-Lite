import { describe, it, expect } from 'vitest';
import { LEADER_PERSONALITIES, getLeader } from '../src/game/ai/leaders';

describe('leaders module', () => {
  it('provides personalities and can lookup', () => {
    expect(LEADER_PERSONALITIES.length).toBeGreaterThan(0);
    const l = getLeader('scientist');
    expect(l.name).toBe('Scientist');
  });

  it('throws for unknown leader', () => {
    expect(() => getLeader('nope')).toThrow();
  });
});
