## Project Progress

Recent development milestones and significant changes (updated 2025-09-14):

* **UI Refactor:** The user interface has undergone a refactor to improve component boundaries and make HUD code easier to test. See `src/components/ui/*` and `src/components/common/*` for new structure.

* **Unit States Implemented:** The project contains an enum and related utilities for unit states. Evidence in repository:
  - `src/types/unit.ts` defines `UnitState` (enum) and `UnitActiveStates` helper types.
  - `src/utils/unit-icons.ts` and `src/utils/unitIcons.ts` contain mappings from `UnitState` to UI icons (react-icons) used by HUD and unit markers.
  - Scene and UI components consume unit state via `useGame()` and props: `src/scene/unit-meshes.tsx`, `src/scene/unit-markers.tsx`, and HUD components reference `UnitState` to render appropriate badges.

* **Validation and Save:** An AJV-based save validator exists at `src/game/save/validator.ts`, with lazy initialization to avoid import-time side-effects.

* **Game Provider & Tests:** `GameProvider` remains central and has extensive test coverage in `tests/` that exercise `useGame` mounting, error branches, and provider behavior (see many `useGame_*.test.tsx` files). The test suite verifies the throw message `useGame must be used within GameProvider` and provider-scoped behaviors.

* **Scene Shims:** `src/scene/fiber-shims.ts` provides `Polyline` and `Svg` Object3D stubs to allow legacy primitives to exist in the scene without crashing rendering.

* **Build Optimizations:** `vite.config.ts` includes `ViteImageOptimizer` plugin and `manualChunks` for large libs (`three`, `@react-three/fiber`, `@react-three/drei`, and `react`), improving bundle split and caching.

## Next validation steps

- Add a small unit test that confirms `UnitState` icons render in HUD when a unit transitions to `Moved`/`Fortified` states.
- Add a follow-up refactor task to standardize hook exports (named exports preferred) to reduce churn and simplify imports.
