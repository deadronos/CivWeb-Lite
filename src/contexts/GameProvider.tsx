import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';
import { seedFrom } from '../game-logic/utils/rng';
import { globalGameBus } from '../game-logic/utils/events';
import type { GameState, GameAction, Tile, PlayerState, TechNode } from '../types';

const initialState = (): GameState => ({
  schemaVersion: 1,
  seed: 'default',
  turn: 0,
  map: { width: 0, height: 0, tiles: [] as Tile[] },
  players: [] as PlayerState[],
  techCatalog: [] as TechNode[],
  rngState: undefined,
  log: [],
  mode: 'standard',
});

type Dispatch = (action: GameAction) => void;

const GameStateContext = createContext<GameState | null>(null);
const GameDispatchContext = createContext<Dispatch | null>(null);

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT': {
      const seed = action.payload?.seed ?? state.seed;
      const width = action.payload?.width ?? 20;
      const height = action.payload?.height ?? 10;
      const tiles: Tile[] = [];
      for (let r = 0; r < height; r++) {
        for (let q = 0; q < width; q++) {
          tiles.push({ id: `t${q}_${r}`, coord: { q, r }, biome: 'grass' as any, elevation: 0, moisture: 0, exploredBy: [] });
        }
      }
      globalGameBus.emit('turn:init', { seed, width, height });
      return { ...state, seed, map: { width, height, tiles }, rngState: seedFrom(seed), turn: 0 };
    }
    case 'END_TURN': {
      const nextTurn = state.turn + 1;
      globalGameBus.emit('turn:end', { turn: nextTurn });
      return { ...state, turn: nextTurn };
    }
    default:
      return state;
  }
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

export function useGameContext(): { state: GameState; dispatch: Dispatch } {
  const state = useContext(GameStateContext);
  const dispatch = useContext(GameDispatchContext);
  if (!state || !dispatch) throw new Error('useGameContext must be used within GameProvider');
  return { state, dispatch };
}

export default GameProvider;
