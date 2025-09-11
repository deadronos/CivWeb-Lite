# Active Context

**Current Work Focus:**

- Refactor and finalize scene changes (Scene is now lazily loaded as `ConnectedScene` in `src/scene/scene.tsx` and `app.tsx` wires Canvas, CameraProvider and overlay UI)
- Ensure GameProvider public API remains stable (`GameStateContext`, `GameDispatchContext`, `useGame` hook)
- Move or document test-only helpers exported from `game-provider.tsx` (many `cover*` helpers present)
- Document architecture and update memory bank entries to match repo
- Maintain strict separation of UI and scene logic
- Use only named exports for hooks where possible

**Notes:**
- The refactor is implemented in code but still needs small polish and documentation updates. See `memory-bank/tasks/TASK001-refactor-scene-and-game-provider.md` for details.
