import { describe, it, expect, vi } from 'vitest';
import { simulateAdvanceTurn, GAME_PROVIDER_MARKER, initialState } from '../src/contexts/GameProvider';
import { globalGameBus } from '../src/game/events';

describe('GameProvider simulateAdvanceTurn helper', () => {
  it('is exported and can be called to dispatch END_TURN and call AI', () => {
    expect(GAME_PROVIDER_MARKER).toBeTruthy();
    const state = initialState();
    // add a fake AI player
    state.players = [{
      id: 'ai1',
      isHuman: false,
      sciencePoints: 1,
      culturePoints: 0,
      researching: null,
      researchedTechIds: [],
      leader: { scienceFocus: 1, cultureFocus: 0 },
    } as any];
    const dispatched: any[] = [];
    const dispatch = vi.fn((a: any) => dispatched.push(a));
    const events: any[] = [];
    globalGameBus.on('turn:start', (p) => events.push(['start', p]));
    globalGameBus.on('turn:end', (p) => events.push(['end', p]));

    simulateAdvanceTurn(state, dispatch as any);

    // should have dispatched END_TURN
    expect(dispatched.some(d => d.type === 'END_TURN')).toBeTruthy();
    // cleanup
    globalGameBus.off('turn:start', () => {});
    globalGameBus.off('turn:end', () => {});
  });
});
