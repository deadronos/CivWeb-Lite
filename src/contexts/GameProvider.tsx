import React, { createContext, useReducer, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { RNGState } from '../game/rng';
import { globalGameBus } from '../game/events';
import { GameState, GameAction, Tile, PlayerState, TechNode } from '../game/types';
import { produceNextState } from '../game/state';
import { generateWorld } from '../game/world/generate';
import { DEFAULT_MAP_SIZE } from '../game/world/config';

export type Dispatch = (action: GameAction) => void;

export const GameStateContext = createContext<GameState | null>(null);
export const GameDispatchContext = createContext<Dispatch | null>(null);

const initialState = (): GameState => ({
  schemaVersion: 1,
  seed: 'default',
  turn: 0,
  map: { width: DEFAULT_MAP_SIZE.width, height: DEFAULT_MAP_SIZE.height, tiles: [] as Tile[] },
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
        const width = action.payload?.width ?? draft.map.width;
        const height = action.payload?.height ?? draft.map.height;
        draft.seed = seed;
        const world = generateWorld(seed, width, height);
        draft.map = { width, height, tiles: world.tiles };
        draft.rngState = world.state;
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
  useEffect(() => {
    dispatch({ type: 'INIT' });
  }, [dispatch]);
  const frozen = useMemo(() => Object.freeze(state), [state]);
  return (
    <GameStateContext.Provider value={frozen}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}
