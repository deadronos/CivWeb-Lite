import { describe, it, expect } from 'vitest';
import { GAME_ACTION_TYPES } from '../src/game/actions';

describe('actions runtime', () => {
  it('exports runtime helper', () => {
    expect(GAME_ACTION_TYPES).toContain('INIT');
  });
});
