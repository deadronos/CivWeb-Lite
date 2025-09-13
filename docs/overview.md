# CivWeb‑Lite Codebase Overview

This document summarizes the architecture, modules, and data flow of CivWeb‑Lite.

## What It Is

- Lightweight Civ‑like, turn‑based simulation built with React, TypeScript, Vite, and Three.js via @react-three/fiber.
- Goals: deterministic simulation (seedable RNG), modular systems (world gen, turn engine, tech/AI), and high testability.

## How It Runs

- Dev: `npm run dev` (Vite with HMR)
- Build: `npm run build`; preview: `npm run preview`
- Tests: `npm test` (Vitest + jsdom), `npm run test:watch`
- E2E: `npm run test:e2e` (Playwright)
- Benches: `npm run bench:world`, `npm run bench:turn`, `npm run bench:ai`
- Lint/format: `npm run lint`, `npm run format`

## Structure

```
src/
  main.tsx            # React bootstrap
  app.tsx             # App shell, providers, <Canvas/Scene/OverlayUI>
  components/         # UI overlays, panels, HUD, overlays
  contexts/           # GameProvider + other React contexts
  game/               # Simulation: actions, reducers, ai, world, pathfinder, save
  hooks/              # use-game and helpers
  scene/              # Three.js scene (tiles/units/camera/wrapping)
  types/, utils/      # Shared types and utilities
schema/               # Zod schemas, AJV save schema
tests/                # Vitest unit/integration suites
```

## Game State & Actions

- Provider: `src/contexts/game-provider.tsx`
  - Contexts for `GameState` and `Dispatch` using `useReducer(applyAction, initialState)`.
  - Validates actions with Zod; falls back to permissive schema when needed.
  - Subscribes to `globalGameBus` for lifecycle logging; optional AutoSim RAF loop.
  - `simulateAdvanceTurn` evaluates AI, records perf, dispatches `END_TURN`.
- Actions: `src/game/actions.ts` (uppercase discriminators) + `GAME_ACTION_TYPES` constant.
- Reducer: `src/game/reducer.ts` routes to sub‑reducers: `ui`, `player`, `turn`, `world`, `lifecycle`.
- Lifecycle: `src/game/reducers/lifecycle.ts` handles `INIT`/`NEW_GAME` world gen, players, extension population, unit spawn, logging, AutoSim toggle.
- UI: `src/game/reducers/ui.ts` handles selection, panel open/close, path/combat preview, and `ISSUE_MOVE` with confirm gating vs enemies.

## Content Extension (Cities/Units/Tech)

- Types: `src/game/content/types.ts` (Hextile, Unit, City, Technology, Civic).
- Engine: `src/game/content/engine.ts` creates empty extension state; can hydrate techs/civics from `src/data`.
- Rules: `src/game/content/rules.ts` — yields, movement, end‑turn reset/heal, production processing (units/improvements/buildings), research/culture progression and unlocks.
- Registry: `src/game/content/registry.ts` defines unit/improvement/building/tech metadata used by rules.

## World Generation & Pathfinding

- World gen: `src/game/world/generate.ts`
  - Seeded RNG; periodic cosine fractal noise for elevation/moisture; cylindrical wrapping horizontally.
  - Polar caps and biome classification; presets in `src/game/world/config.ts` (default: medium size).
- Pathfinding: `src/game/pathfinder.ts`
  - Dijkstra on hex neighbors, ceil movement costs, respects passability by unit type/abilities.
  - Produces `combatPreview` if entering enemy unit/city; exposes movement range API.

## Events & AI

- Event bus: `src/game/events.ts` — simple typed pub/sub (`globalGameBus`) for turns, actions, research, AI, production, combat.
- AI: `src/game/ai/ai.ts` — minimal heuristic to pick next tech based on leader focus and prerequisites; provider executes per turn.

## Rendering & 3D Scene

- Scene: `src/scene/scene.tsx`
  - Batches tiles into biome/variant buckets; instanced rendering via `src/scene/instanced-models.tsx`.
  - Cylindrical world wrapping duplicates; background texture plane sized to world bounds.
  - Renders units/markers/selected outline and overlays: movement range, path preview, combat preview.
- Assets: optional GLTF biome variants; fallback to hex cylinders.
- Camera: controls and world‑wrapping helpers; selection/hover wired to dispatch preview/move actions.

## UI Overlay

- `src/components/ui/overlay-ui.tsx` — top menu (with Dev toggle), stats, event log, HUD, lazy panels.
- `src/components/game-hud.tsx` — save/load (AJV‑validated), player summaries, AI perf, extension progress, SpecControls gated by Dev.

## State Validation & Save/Load

- Runtime action validation: `schema/action.schema.ts` (strict Zod union + permissive fallback).
- Save files: `src/game/save/*` using AJV compiled against `schema/save.schema.json` with typed errors and size checks.

## Testing

- Vitest + jsdom tests under `tests/` for reducers, provider behavior, overlays, pathfinding, events, data loaders, etc.
- Playwright E2E tests (`npm run test:e2e`) with optional axe accessibility checks writing artifacts to `test-results/`.

## Data Flow Summary

- UI dispatches `GameAction` → `GameProvider` validates → `applyAction` routes to sub‑reducer → Immer produces next frozen state.
- `globalGameBus` emits lifecycle/domain events for logging and hooks.
- AI decisions enqueue actions each turn via `simulateAdvanceTurn`.
- Scene/overlays read state via `useGame()` and render; interactions (hover/click) dispatch preview/move/selection actions.

## Diagrams

- See `docs/action-flows.md` for flowcharts of common action sequences (new game, init, selection→move, autosim, save/load, research/production).
