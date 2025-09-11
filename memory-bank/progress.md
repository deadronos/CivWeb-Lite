# Progress

**What works:**

- `GameProvider` context, dispatch, and helper APIs are implemented (`src/contexts/game-provider.tsx`)
- Scene rendering with `@react-three/fiber` and a lazily-loaded `ConnectedScene` (`src/scene/scene.tsx`) is wired in `src/app.tsx`
- Basic UI and overlay exist; `MainMenu` and overlay UI are lazily loaded

**What's left to build:**

- Advanced HUD and UI interactions (TASK002)
- Polish and document the public GameProvider API and move test-only helpers to dedicated test utilities
- Performance optimizations and further content extension rules

**Current Status:**

- Refactor implemented in code; requires documentation updates and small polishing. See `memory-bank/tasks/TASK001-refactor-scene-and-game-provider.md`.

**Known Issues:**

- Some legacy code paths and test helpers exported from runtime modules should be rationalized to avoid bundle pollution
- HUD/UI not fully implemented
