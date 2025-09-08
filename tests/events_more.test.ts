import { describe, it, expect } from 'vitest';
import { GameEventBus } from '../src/game/events';

describe('GameEventBus additional', () => {
  it('off removes listener', () => {
    const bus = new GameEventBus<any>();
    let called = 0;
    const fn = () => { called++; };
  const off = bus.on('turn:end', fn);
    bus.emit('turn:end', { turn: 1 } as any);
    expect(called).toBe(1);
    off();
    bus.emit('turn:end', { turn: 2 } as any);
    expect(called).toBe(1);
  });

  it('does not throw when listener throws', () => {
    const bus = new GameEventBus<any>();
  bus.on('turn:end', () => { throw new Error('boom'); });
    expect(() => bus.emit('turn:end', { turn: 3 } as any)).not.toThrow();
  });
});
