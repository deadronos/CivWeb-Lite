# Active Context

**Current Work Focus:**

- Overhaul branch: refactoring scene and game provider for modularity.
- Managing legacy shims and preparing for their removal where appropriate.
- Ongoing HUD and UI improvements.

**Recent Changes:**

- Cleaned up temp files and lint artifacts.
- `Polyline` and `Svg` shims are present in `src/scene/fiber-shims.ts` and registered as simple Object3D stubs so unknown R3F primitives don't crash the renderer.
- The `LazySpinner` component remains in the codebase at `src/components/common/lazy-spinner.tsx` (default export) and is used as a `React.Suspense` fallback in `src/app.tsx` and `src/components/ui/overlay-ui.tsx`.

**Next Steps:**

- Finalize scene refactor.
- Document new architecture and the migration plan for removing or replacing shims.
- Continue HUD/UI implementation and add tests where missing.

**Active Decisions / Notes:**

- Maintain strict separation of UI and scene logic.
- Hooks in `src/hooks/` are implemented as named exports (for example `useGame` in `src/hooks/use-game.ts`); there are not widespread default-exported hooks for compatibility. If a hook uses a default export it's an exception and should be noted in the task to standardize exports.
- The `GameProvider` pattern (contexts + `useGame` helper) remains the canonical way to access game state; tests reference `GameProvider` extensively.
- The `globalGameBus` event bus is actively used by scene and test utilities (see `src/game/events`), and the auto-sim loop is implemented inside the provider (requestAnimationFrame) when `autoSim` is enabled.
