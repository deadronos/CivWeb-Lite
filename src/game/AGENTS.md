# src/game — AGENTS

## Purpose

Core game engine: state shape, reducer, actions, pathfinding, AI routines and utilities for the turn/tile model.

## Key files

- `reducer.ts` — Reducer that applies game actions to state.
- `actions.ts` — Canonical action discriminators and types used across the app.
- `state.ts`, `types.ts` — Core state shapes and typings.
- `pathfinder.ts`, `rng.ts`, `ai.ts` — Important subsystems supporting gameplay.

## Dependencies

- Internal utilities in `src/utils` and `src/data` content files. Tests rely on `tests/` coverage.

## Interactions

- Consumed by `src/contexts/game-provider.tsx` which validates and dispatches actions. UI components render state from `GameStateContext`.

## Important notes

- Changing action shapes requires updating `schema/action.schema.ts` and relevant tests. This folder contains most of the game's deterministic logic and is heavily tested.
