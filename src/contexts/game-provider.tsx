import React, { createContext, useReducer, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { RNGState } from '../game/rng';
import { globalGameBus } from '../game/events';
import { GameState, Tile, PlayerState } from '../game/types';
import { createEmptyState as createContentExtension } from '../game/content/engine';
import { GameAction } from '../game/actions';
import { GameActionSchema, AnyActionSchema } from '../../schema/action.schema';
import { ZodError } from 'zod';
import { applyAction } from '../game/reducer';
import { DEFAULT_MAP_SIZE } from '../game/world/config';
import { techCatalog } from '../game/tech/tech-catalog';
import { evaluateAI } from '../game/ai/ai';

export type Dispatch = (action: GameAction) => void;

export const GameStateContext = createContext<GameState | undefined>(undefined);
export const GameDispatchContext = createContext<Dispatch | undefined>(undefined);

export const initialState = (): GameState => ({
  schemaVersion: 1,
  seed: 'default',
  turn: 0,
  map: { width: DEFAULT_MAP_SIZE.width, height: DEFAULT_MAP_SIZE.height, tiles: [] as Tile[] },
  players: [] as PlayerState[],
  techCatalog: techCatalog,
  rngState: undefined as RNGState | undefined,
  log: [],
  aiPerf: { total: 0, count: 0 },
  mode: 'standard',
  autoSim: false,
  ui: {
    openPanels: {},
  },
  contentExt: createContentExtension(),
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatchBase] = useReducer(applyAction, undefined, initialState);

  // validated dispatch wraps the reducer dispatch and validates payloads at runtime
  const dispatch = useCallback<Dispatch>((action) => {
    try {
      // Try strict validation first
      GameActionSchema.parse(action as any);
    } catch (error) {
      if (error instanceof ZodError) {
        const first = error.issues && error.issues[0];
        if (first && first.code === 'invalid_union_discriminator') {
          // discriminator unknown to strict schema — try permissive schema that accepts any type/payload
          try {
            AnyActionSchema.parse(action as any);
            // accepted by permissive schema — forward but avoid noisy repeated debug lines
            // use console.info so it's visible when debugging but not spammy
            console.info('[GameProvider] permissive action accepted', action.type);
            dispatchBase(action as any);
            return;
          } catch (_error) {
            // explicitly consume variable to satisfy lint
            void _error;
            // fall through to warn below
          }
        }
      }
      // validation failed for another reason - log and reject the action
      console.warn('[GameProvider] action validation failed', error);
      return;
    }
    // if valid, forward to the reducer
    dispatchBase(action as any);
  }, [dispatchBase]);

  const advanceTurn = useCallback(() => simulateAdvanceTurn(state, dispatch), [state, dispatch]);

  useEffect(() => {
  dispatch({ type: 'INIT' });
  }, [dispatch]);

  useEffect(() => {
    const subs = [
      globalGameBus.on('turn:start', (p) =>
        dispatch({
          type: 'LOG_EVENT',
          payload: { entry: { timestamp: Date.now(), turn: p.turn, type: 'turn:start' } },
        })
      ),
      globalGameBus.on('turn:end', (p) =>
        dispatch({
          type: 'LOG_EVENT',
          payload: { entry: { timestamp: Date.now(), turn: p.turn, type: 'turn:end' } },
        })
      ),
      globalGameBus.on('tech:unlocked', (p) =>
        dispatch({
          type: 'LOG_EVENT',
          payload: {
            entry: { timestamp: Date.now(), turn: state.turn, type: 'tech:unlocked', payload: p },
          },
        })
      ),
      globalGameBus.on('action:applied', ({ action }) => {
        if (action.type === 'LOG_EVENT' || action.type === 'RECORD_AI_PERF') return;
        dispatch({
          type: 'LOG_EVENT',
          payload: { entry: { timestamp: Date.now(), turn: state.turn, type: action.type } },
        });
      }),
    ];

    return () => {
      for (const u of subs) u();
    };
  }, [dispatch, state.turn]);

  useEffect(() => {
    if (!state.autoSim) return;
    let id: number | undefined;
    let running = false;
    const loop = () => {
      if (running) return; // guard re-entrancy when tests synchronously invoke RAF
      try {
        running = true;
        advanceTurn();
      } finally {
        running = false;
      }
      // schedule next frame if available
      try {
        id = requestAnimationFrame(loop) as unknown as number;
      } catch {
        // ignore if environment doesn't support RAF
      }
    };
    try {
      id = requestAnimationFrame(loop) as unknown as number;
    } catch {
      // ignore
    }
    return () => {
      try {
        if (typeof cancelAnimationFrame === 'function' && id !== undefined)
          cancelAnimationFrame(id);
      } catch {
        // ignore
      }
    };
  }, [state.autoSim, advanceTurn]);

  const frozen = useMemo(() => Object.freeze(state), [state]);
  // Expose a tiny test-only helper for E2E tests so they can reliably select units
  // without relying on DOM interactions that are flaky in headless environments.
  // Only attach in test or non-production environments.
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    // Attach a tiny test-only helper to globalThis. Tests can call
    // `globalThis.__civweblite_test_helpers.selectUnit(id)` to programmatically
    // select a unit without using fragile DOM interactions.
    // This intentionally exists only in non-production builds.
    // @ts-ignore - test-only global
    globalThis.__civweblite_test_helpers = {
      selectUnit: (id: string) => {
        try {
          dispatch({ type: 'SELECT_UNIT', payload: { unitId: id } } as any);
          return true;
        } catch {
          return false;
        }
      },
      // Programmatically request a preview for a given unit -> target tile
      // This lets E2E tests short-circuit hover interactions and deterministically
      // set previewPath in the app during tests.
      requestPreview: (unitId: string, targetTileId: string) => {
        try {
          dispatch({ type: 'PREVIEW_PATH', payload: { unitId, targetTileId } } as any);
          return true;
        } catch {
          return false;
        }
      },
      // Directly set the UI preview path (test-only). Accepts an array of tile ids.
      setPreviewPath: (path: string[]) => {
        try {
          dispatch({ type: 'EXT_SET_PREVIEW', payload: { path } } as any);
          return true;
        } catch {
          return false;
        }
      },
      getState: () => frozen,
    } as any;
  }
  return (
    <GameStateContext.Provider value={frozen}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

// Essential test utilities - minimal exports for production usage
export function simulateAdvanceTurn(s: GameState, dispatch: Dispatch) {
  const start = performance.now();
  globalGameBus.emit('turn:start', { turn: s.turn });
  const aiPlayers = s.players.filter((p) => !p.isHuman);
  const aiStart = performance.now();
  for (const p of aiPlayers) {
    const acts = evaluateAI(p, s);
    for (const a of acts) dispatch(a);
  }
  const aiDuration = aiPlayers.length > 0 ? (performance.now() - aiStart) / aiPlayers.length : 0;
  dispatch({ type: 'RECORD_AI_PERF', payload: { duration: aiDuration } });
  dispatch({ type: 'END_TURN' });
  const duration = performance.now() - start;
  console.debug(
    `turn ${s.turn + 1} took ${duration.toFixed(2)}ms (AI avg ${aiDuration.toFixed(2)}ms)`
  );
}

// Export initialState for tests
export function initialStateForTests(): GameState {
  return initialState();
}

// Provide a default export for compatibility shims that expect a default
// export (PascalCase -> kebab-case migration). Default forwards to the
// named GameProvider so consumers using default imports still work.
export default GameProvider;
