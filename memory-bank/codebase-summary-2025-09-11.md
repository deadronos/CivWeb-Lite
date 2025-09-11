```markdown
# Repository snapshot observations (2025-09-11)

- GameProvider implementation: `src/contexts/game-provider.tsx` provides `GameStateContext`, `GameDispatchContext`, `GameProvider` and test helpers (simulateAdvanceTurn, cover* helpers). It initializes state via a reducer (`applyAction`) and dispatches `INIT` on mount. An autoSim RAF loop exists which runs when `state.autoSim` is true.

- Reducer and content model: `src/game/reducer.ts` handles core actions (`INIT`, `NEW_GAME`, `END_TURN`) and extension actions (`EXT_ADD_UNIT`, `EXT_ADD_CITY`, `EXT_QUEUE_PRODUCTION`, etc.). There are helper functions for spawn placement and a content extension used to store units/cities per-tile.

- Scene and app wiring: `src/app.tsx` lazily loads `ConnectedScene` from `src/scene/scene.tsx` and uses `@react-three/fiber` `Canvas`. The overlay UI is lazily loaded and `MainMenu` controls starting state. The app guards rendering for tests and includes an ErrorBoundary to reload the 3D scene.

- Testing helpers: Several modules export small helpers used to exercise branches during unit tests. These helpers are sometimes exported from runtime modules (e.g., `game-provider.tsx`). Consider moving them to `tests/test-utils` or similar to avoid runtime bundle surface area.

- Tasks: TASK001 (refactor scene & GameProvider) was missing in memory bank; created `memory-bank/tasks/TASK001-refactor-scene-and-game-provider.md` and updated `memory-bank/tasks/_index.md` and `memory-bank/progress.md`.

- Recommendations:
  - Document GameProvider public API in `memory-bank/` and add a small reference README for new contributors.
  - Move test-only helpers out of runtime modules or guard their exports behind `process.env.NODE_ENV === 'test'`.
  - Add unit tests for GameProvider's public behaviors (INIT, NEW_GAME, autoSim toggle, simulateAdvanceTurn) if not present.

```
