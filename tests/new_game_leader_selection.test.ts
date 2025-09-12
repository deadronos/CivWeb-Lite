import { describe, it, expect } from 'vitest';
import { applyAction } from '../src/game/reducer';
import { initialStateForTests } from '../src/test-utils/game-provider';

describe('NEW_GAME leader selection', () => {
  it('applies specific leader id to players[0]', () => {
    const s0 = initialStateForTests();
    const s1 = applyAction(s0, {
      type: 'NEW_GAME',
      payload: {
        seed: 'X',
        width: 10,
        height: 10,
        totalPlayers: 2,
        humanPlayers: 1,
        selectedLeaders: ['pericles', 'random'],
      },
    } as any);
    expect(s1.players.length).toBeGreaterThan(0);
    expect(s1.players[0].leader.id).toBe('pericles');
  });
});
