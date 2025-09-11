import { describe, it, expect } from 'vitest';
import { evaluateAI } from '../src/game/ai/ai';
import { GameState, PlayerState } from '../src/game/types';
import { techCatalog } from "../src/game/tech/tech-catalog";
import { LEADER_PERSONALITIES } from '../src/game/ai/leaders';

function mockState(player: PlayerState): GameState {
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
    autoSim: false
  };
}

describe('AI evaluation', () => {
  it('selects a tech without mutating state', () => {
    const player: PlayerState = {
      id: 'p1',
      isHuman: false,
      leader: LEADER_PERSONALITIES[0],
      sciencePoints: 10,
      culturePoints: 10,
      researchedTechIds: [],
      researching: null
    };
    const state = mockState(player);
    const snapshot = structuredClone(state);
    const actions = evaluateAI(player, state);
    expect(state).toEqual(snapshot);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].type).toBe('SET_RESEARCH');
  });

  it('prefers tech tree based on leader focus', () => {
    const scientist: PlayerState = {
      id: 'p1',
      isHuman: false,
      leader: LEADER_PERSONALITIES[0],
      sciencePoints: 10,
      culturePoints: 10,
      researchedTechIds: [],
      researching: null
    };
    const scientistAction = evaluateAI(scientist, mockState(scientist))[0];
    expect(scientistAction.payload.techId).toBe('pottery');

    const culturalist: PlayerState = {
      id: 'p2',
      isHuman: false,
      leader: LEADER_PERSONALITIES[1],
      sciencePoints: 10,
      culturePoints: 10,
      researchedTechIds: [],
      researching: null
    };
    const culturalistAction = evaluateAI(culturalist, mockState(culturalist))[0];
    expect(culturalistAction.payload.techId).toBe('folklore');
  });
});