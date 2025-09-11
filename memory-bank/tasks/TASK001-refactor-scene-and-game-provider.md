```markdown
# [TASK001] - Refactor scene and game provider

**Status:** In Progress
**Added:** 2025-09-11
**Updated:** 2025-09-11

## Original Request
Refactor the Three.js scene code and the GameProvider to improve modularity, separate WebGL logic from DOM UI, and provide stable hooks for consumers.

## Current Implementation (observed)
- `src/contexts/game-provider.tsx` exports `GameProvider`, `GameStateContext`, `GameDispatchContext` and a number of test helper functions. It initializes state via `useReducer(applyAction, undefined, initialState)` and dispatches an `INIT` action on mount.
- The GameProvider contains auto-sim loop logic (RAF) guarded by `state.autoSim` and exposes `simulateAdvanceTurn` for tests. It also subscribes to `globalGameBus` events to append log entries.
- `src/game/reducer.ts` implements action handling including `INIT`, `NEW_GAME`, `END_TURN`, and many `EXT_` prefixed extension actions. It contains helper functions for spawn placement.
- Scene composition is provided by `src/scene/scene.tsx` with a `ConnectedScene` default export (loaded lazily by `src/app.tsx`).

## Findings / Discrepancies vs Memory Bank
- Memory entries correctly say a GameProvider exists and `useGame()` is the public hook, but the memory didn't call out the presence of many test helper functions and coverage helpers in `game-provider.tsx` (e.g., `coverGameProvider*`, `simulateAdvanceTurn`, `triggerAutoSimOnce`). Add note.
- `activeContext.md` mentioned "Finalizing scene refactor" — the refactor is largely present: `app.tsx` lazily loads `ConnectedScene`, uses `Canvas`, `CameraProvider`, selection/hover contexts and new overlay UI. Update status to "refactor implemented / needs polish".
- `tasks/_index.md` referenced `TASK001` but the task file was missing. Added it.

## Recommended Next Steps
1. Finish small refactor items: ensure all client-only logic is inside client components (verify `scene/fiber-shims` usage).  
2. Add unit tests for the GameProvider public API (`useGame`, dispatch behavior, autoSim toggle).  
3. Document public context API in `memory-bank/` for new contributors (functions, events).  
4. Consider moving heavy test-only helpers into a `testUtils` file to reduce runtime bundle pollution (they are currently exported from the provider module).

## Progress Log
### 2025-09-11
- Created task file after verifying repo contents. Noted present helpers and auto-sim behavior. Updated memory-bank summaries.

```
