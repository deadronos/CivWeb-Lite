# Active Context

**Current Work Focus:**
- Overhaul branch: refactoring scene and game provider for modularity.
- Managing legacy shims and preparing for their removal.
- Ongoing HUD and UI improvements.

**Recent Changes:**
- Cleaned up temp files and lint artifacts.
- `Polyline` and `Svg` shims are present in `src/scene/fiber-shims.ts`.
- The `LazySpinner` component is still in use and has not been removed.

**Next Steps:**
- Finalize scene refactor.
- Document new architecture.
- Continue HUD/UI implementation.

**Active Decisions:**
- Maintain strict separation of UI and scene logic.
- Prefer named exports for hooks, although some hooks still have default exports for compatibility reasons (e.g., `use-game.ts`).
