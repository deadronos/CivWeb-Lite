# src/game — AGENTS

## Purpose

Core game engine: state shape, action definitions, pathfinding, AI routines and utilities for the turn/tile model. The folder now uses a small reducer router (`reducer.ts`) that delegates work to focused reducer modules under `reducers/`.

## Key files

- `reducer.ts` — Entrypoint that maps action types to handler functions and exposes `applyAction` used by `GameProvider`.
- `reducers/` — Directory containing focused reducer modules (single-responsibility handlers):
  - `lifecycle.ts` — INIT / NEW_GAME / AUTO_SIM_TOGGLE / LOG_EVENT and world generation/startup logic.
  - `player.ts` — Player-scoped actions (research, production, scores).
  - `turn.ts` — End-of-turn processing, AI decision application and bookkeeping.
  - `ui.ts` — UI-related actions (selection, preview, issue move, panels).
  - `world.ts` — Tile/unit/city mutation actions and extension helpers.
- `actions.ts` — Canonical action discriminators and types used across the app.
- `state.ts`, `types.ts` — Core state shapes and typings; `state.ts` contains helpers like `produceNextState`.
- `pathfinder.ts`, `rng.ts`, `ai.ts` — Important subsystems supporting gameplay.

## Dependencies

- Internal utilities in `src/utils` and `src/data` content files. Reducers frequently interact with `content/` extension helpers under `src/game/content`. Tests rely on `tests/` coverage.

## Interactions

- `src/contexts/game-provider.tsx` uses `applyAction` (from `reducer.ts`) as the reducer entrypoint; it validates actions against `schema/action.schema.ts` before dispatching.
- UI components and `src/scene` read state from `GameStateContext` and dispatch actions using `GameDispatchContext`.

## Important notes

- The reducer was refactored into `src/game/reducers/*` to make handlers smaller and easier to test. When adding a new action:
  1. Add the action discriminator to `actions.ts`.
  2. Add a handler in an appropriate `reducers/*.ts` file.
  3. Register the action type in the mapping inside `reducer.ts` so `applyAction` forwards it to the handler.
  4. Add/update runtime validations in `schema/action.schema.ts` and update unit tests in `tests/`.
- Keep WebGL/rendering logic out of reducers; reducers should operate only on serializable state and content extension helpers.
- The `reducers/` modules take an Immer `Draft<GameState>` and a `GameAction` to keep changes localized and testable.
