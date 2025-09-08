import React, { createContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';
import { seedFrom, RNGState } from '../game/rng';
import { globalGameBus } from '../game/events';
import { GameState, GameAction, Tile, PlayerState, TechNode } from '../game/types';
import { produceNextState } from '../game/state';

export type Dispatch = (action: GameAction) => void;

export const GameStateContext = createContext<GameState | null>(null);
export const GameDispatchContext = createContext<Dispatch | null>(null);

const initialState = (): GameState => ({
  schemaVersion: 1,
  seed: 'default',
  turn: 0,
  map: { width: 0, height: 0, tiles: [] as Tile[] },
  players: [] as PlayerState[],
  techCatalog: [] as TechNode[],
  rngState: undefined as RNGState | undefined,
  log: [],
  mode: 'standard',
});

function reducer(state: GameState, action: GameAction): GameState {
  return produceNextState(state, draft => {
    switch (action.type) {
      case 'INIT': {
        const seed = action.payload?.seed ?? draft.seed;
        draft.seed = seed;
        draft.rngState = seedFrom(seed);
        globalGameBus.emit('action:applied', { action });
        globalGameBus.emit('turn:start', { turn: draft.turn });
        break;
      }
      case 'END_TURN': {
        draft.turn += 1;
        globalGameBus.emit('action:applied', { action });
        globalGameBus.emit('turn:end', { turn: draft.turn });
        break;
      }
      default:
        break;
    }
  });
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const frozen = useMemo(() => Object.freeze(state), [state]);
  return (
    <GameStateContext.Provider value={frozen}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}
