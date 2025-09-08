import React, { createContext, useReducer, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { RNGState } from '../game/rng';
import { globalGameBus } from '../game/events';
import { GameState, Tile, PlayerState, TechNode } from '../game/types';
import { GameAction } from '../game/actions';
import { applyAction } from '../game/reducer';
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
  autoSim: false,
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(applyAction, undefined, initialState);

  const advanceTurn = useCallback(() => {
    const start = performance.now();
    globalGameBus.emit('turn:start', { turn: state.turn });
    // TODO: collect AI actions here in future phases
    dispatch({ type: 'END_TURN' });
    const duration = performance.now() - start;
    console.debug(`turn ${state.turn + 1} took ${duration.toFixed(2)}ms`);
  }, [state.turn, dispatch]);

  useEffect(() => {
    dispatch({ type: 'INIT' });
  }, [dispatch]);

  useEffect(() => {
    if (!state.autoSim) return;
    let id: number;
    const loop = () => {
      advanceTurn();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [state.autoSim, advanceTurn]);

  const frozen = useMemo(() => Object.freeze(state), [state]);
  return (
    <GameStateContext.Provider value={frozen}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}
