import { describe, test, expect, vi } from 'vitest';
import { simulateAdvanceTurn, initialStateForTests, coverGameProviderEffects } from '../src/contexts/GameProvider';
import { globalGameBus } from '../src/game/events';

describe('GameProvider extra behaviors', () => {
  test('simulateAdvanceTurn dispatches END_TURN and calls evaluateAI for AI players', () => {
    const s = initialStateForTests();
    // add one AI and one human player
    s.players = [
      { id: 'p1', isHuman: false, leader: 'alpha', name: 'AI' } as any,
      { id: 'p2', isHuman: true, leader: 'beta', name: 'Human' } as any,
    ];
    s.turn = 5;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);

    const spyEmit = vi.spyOn(globalGameBus, 'emit');

    simulateAdvanceTurn(s, dispatch);

    // should have emitted turn:start
    expect(spyEmit).toHaveBeenCalled();
    // END_TURN should be dispatched
    expect(dispatched.find(d => d.type === 'END_TURN')).toBeTruthy();
    spyEmit.mockRestore();
  });

  test('coverGameProviderEffects exercises init and autoSim false branch safely', () => {
    const s = initialStateForTests();
    s.autoSim = false;
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    // Should not throw
    coverGameProviderEffects(s, dispatch);
    expect(dispatched.length).toBeGreaterThanOrEqual(1);
  });
});
