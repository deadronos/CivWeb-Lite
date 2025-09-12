# src — AGENTS

## Purpose

All application source code: React app entry points, game engine, rendering scene (Three.js), components, hooks, and utilities.

## Key files / folders

- `main.tsx`, `app.tsx` — Application bootstrap and root React tree.
- `components/` — Reusable UI components and containers.
- `contexts/` — React providers (notably `game-provider`) and contexts.
- `game/` — Game state, reducer, actions, pathfinding, AI and core engine logic.
- `scene/` — Three.js scene composition, model loading, instancing, and Three fiber shims.
- `test-utils/` — Helpers for unit tests.

## Dependencies

- React, @react-three/fiber, three, zod, and other runtime deps listed in `package.json`.

## Interactions

- `src` is the heart of the app; `components` render UI, `game` provides logic, and `scene` renders visuals. Contexts wire these areas together.

## Important notes

- When changing action types or game state shapes, update `schema/action.schema.ts` and related tests in `tests/`.
- Keep WebGL-specific logic inside `scene/` to keep DOM/UI components portable and testable.
