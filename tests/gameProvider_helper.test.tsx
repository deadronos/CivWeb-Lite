import { describe, it, expect } from 'vitest';
import { simulateAdvanceTurn, GAME_PROVIDER_MARKER } from "..\\src\\contexts\\game-provider";
import { GameState, PlayerState } from '../src/game/types';

function makeState(player?: PlayerState): GameState {
  return {
    schemaVersion: 1,
    seed: 's',
    turn: 0,
    map: { width: 1, height: 1, tiles: [] },
    players: player ? [player] : [],
    techCatalog: [],
    rngState: undefined,
    log: [],
    mode: 'standard',
    autoSim: false
  };
}

describe('simulateAdvanceTurn helper', () => {
  it('exists and is callable', () => {
    expect(GAME_PROVIDER_MARKER).toBe(true);
    const state = makeState();
    const dispatched: any[] = [];
    const dispatch = (a: any) => dispatched.push(a);
    simulateAdvanceTurn(state, dispatch as any);
    expect(dispatched.some((d) => d.type === 'END_TURN')).toBe(true);
  });
});