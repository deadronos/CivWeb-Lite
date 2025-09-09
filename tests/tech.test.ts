import { describe, it, expect } from 'vitest';
import { validateTechCatalog, techCatalog } from '../src/game/tech/techCatalog';
import { applyAction } from '../src/game/reducer';
import { GameState, PlayerState } from '../src/game/types';
import { LEADER_PERSONALITIES } from '../src/game/ai/leaders';
import { globalGameBus } from '../src/game/events';

function baseState(player: PlayerState): GameState {
  return {
    schemaVersion: 1,
    seed: 's',
    turn: 0,
    map: { width: 1, height: 1, tiles: [] },
    players: [player],
    techCatalog,
    rngState: undefined,
    log: [],
    mode: 'standard',
    autoSim: false,
  };
}

describe('tech system', () => {
  it('detects cycles', () => {
    expect(() =>
      validateTechCatalog([
        { id: 'a', tree: 'science', name: 'A', cost: 1, prerequisites: ['b'], effects: [] },
        { id: 'b', tree: 'science', name: 'B', cost: 1, prerequisites: ['a'], effects: [] },
      ])
    ).toThrow();
  });

  it('enforces prerequisites and unlocks tech', () => {
    const player: PlayerState = {
      id: 'p1',
      isHuman: false,
      leader: LEADER_PERSONALITIES[3],
      sciencePoints: 40,
      culturePoints: 40,
      researchedTechIds: ['pottery'],
      researching: null,
    };
    let state = baseState(player);
    state = applyAction(state, {
      type: 'SET_RESEARCH',
      playerId: 'p1',
      payload: { techId: 'writing' },
    });
    expect(state.players[0].researching?.techId).toBe('writing');
    state = applyAction(state, { type: 'END_TURN' });
    expect(state.players[0].researchedTechIds).toContain('writing');
  });

  it('emits tech:unlocked when research completes', () => {
    const player: PlayerState = {
      id: 'p1',
      isHuman: false,
      leader: LEADER_PERSONALITIES[3],
      sciencePoints: 40,
      culturePoints: 40,
      researchedTechIds: ['pottery'],
      researching: null,
    };
    let event: { playerId: string; techId: string } | undefined;
    const off = globalGameBus.on('tech:unlocked', (e) => {
      event = e;
    });
    let state = baseState(player);
    state = applyAction(state, {
      type: 'SET_RESEARCH',
      playerId: 'p1',
      payload: { techId: 'writing' },
    });
    applyAction(state, { type: 'END_TURN' });
    off();
    expect(event).toEqual({ playerId: 'p1', techId: 'writing' });
  });

  it('prevents research without prerequisites', () => {
    const player: PlayerState = {
      id: 'p1',
      isHuman: false,
      leader: LEADER_PERSONALITIES[3],
      sciencePoints: 40,
      culturePoints: 40,
      researchedTechIds: [],
      researching: null,
    };
    let state = baseState(player);
    state = applyAction(state, {
      type: 'SET_RESEARCH',
      playerId: 'p1',
      payload: { techId: 'writing' },
    });
    expect(state.players[0].researching).toBeNull();
  });
});
