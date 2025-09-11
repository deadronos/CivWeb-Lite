import { describe, it, expect } from 'vitest';
import { createRingLogger, appendLog } from '../src/game/logging';
import { initialStateForTests } from '../src/contexts/game-provider';

describe('logging helpers', () => {
  it('ring logger evicts oldest beyond capacity', () => {
    const ring = createRingLogger(3);
    ring.record({ timestamp: 1, turn: 0, type: 'a' });
    ring.record({ timestamp: 2, turn: 0, type: 'b' });
    ring.record({ timestamp: 3, turn: 0, type: 'c' });
    ring.record({ timestamp: 4, turn: 0, type: 'd' });
    const buf = ring.read();
    expect(buf.length).toBe(3);
    expect(buf[0].type).toBe('b');
    expect(buf[2].type).toBe('d');
  });

  it('appendLog respects capacity', () => {
    const s = initialStateForTests();
    for (let index = 0; index < 55; index++) {
      appendLog(s as any, { timestamp: index, turn: 0, type: `e${index}` }, 5);
    }
    expect(s.log.length).toBe(5);
    expect(s.log[0].type).toBe('e50');
    expect(s.log[4].type).toBe('e54');
  });
});
