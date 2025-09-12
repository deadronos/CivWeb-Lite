# src/contexts — AGENTS

## Purpose

React contexts and providers that expose game state and dispatch APIs to the UI and scene.

## Key files

- `game-provider.tsx` — Central provider that runs the autoSim loop, validates actions with `schema/`, and exposes `GameStateContext` and `GameDispatchContext`.
- `selection-context.tsx`, `hover-context.tsx` — Small contexts for UI selection/hover state.

## Dependencies

- `schema/action.schema.ts` for runtime validation and `src/game/actions.ts` for canonical action discriminators.

## Interactions

- Providers are consumed by `src/components` and `src/scene` to render state and dispatch actions. Avoid changing provider public API (contexts names/shape) without updating consumers.

## Important notes

- `game-provider` uses `requestAnimationFrame` for autoSim; memoize callbacks to prevent effect loops. See `AGENTS` root docs for caveats.
