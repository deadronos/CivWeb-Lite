import { describe, it, expect } from 'vitest';
import { GameEventBus, GameEvents } from '../src/game/events';

describe('GameEventBus', () => {
  it('registers and emits events', () => {
    const bus = new GameEventBus<GameEvents>();
    let received = 0;
    bus.on('turn:end', (p) => {
      received = p.turn;
    });
    bus.emit('turn:end', { turn: 42 });
    expect(received).toBe(42);
  });
});
