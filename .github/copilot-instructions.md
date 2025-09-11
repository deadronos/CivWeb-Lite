Why this file
----------------
This file tells GitHub Copilot and human contributors how this repository is organized, how to run the project locally, and provides example prompts and constraints that help produce higher-quality code suggestions. Keep it short, actionable, and repository-specific.

Repository summary
-------------------
- Name: civweb-lite
- Purpose: Lightweight React + Three.js demo app using @react-three/fiber. Contains a simple scene, a game provider, and minimal UI.
- Tech stack: React 18, TypeScript, Vite, three, @react-three/fiber, @react-three/drei.

What to assume (useful defaults)
---------------------------------
- Node >= 18, npm or yarn available.
# Copilot instructions — CivWeb‑Lite (concise)

This file gives AI agents and contributors the essential, repo‑specific knowledge to be productive quickly.

Summary
- Purpose: lightweight React + TypeScript demo using @react-three/fiber and a small game engine (tile/turn model).
- Stack: React 18, TypeScript, Vite, three, @react-three/fiber, Zod, Vitest, Playwright (dev).

Quick dev commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview prod build: `npm run preview`
- Tests: `npm test` (Vitest); watch: `npm run test:watch`
- Lint: `npm run lint`

What to read first (to understand architecture)
- `src/contexts/game-provider.tsx` — central state provider, autoSim loop, and validation wiring (GameStateContext / GameDispatchContext).
- `src/game/actions.ts` — canonical union of action discriminators (uppercase like `INIT`, `END_TURN`, `EXT_*`) — single source of truth for runtime action types.
- `schema/action.schema.ts` — runtime Zod schemas used to validate actions at dispatch time.
- `src/scene/Scene.tsx` and `src/scene/*` — all Three.js/@react-three/fiber scene composition and heavy WebGL logic.
- `src/App.tsx` / `src/main.tsx` — wiring of Canvas, provider, and HUD.

Project‑specific patterns and gotchas
- Action discriminators: the codebase uses UPPER_CASE strings for canonical engine actions (see `GAME_ACTION_TYPES` in `src/game/actions.ts`). When adding validation or tests, mirror those literals.
- Runtime validation: `schema/action.schema.ts` + `GameProvider` implement strict Zod validation with a permissive fallback for extension events (`AnyActionSchema`) — keep both behaviors in sync.
- Event bus: `globalGameBus` (in `src/game/events`) is used across modules to emit/listen to lifecycle events (`turn:start`, `turn:end`, `action:applied`). Use it to hook in diagnostics or integration tests.
- AutoSim loop: `GameProvider` uses requestAnimationFrame to advance turns when `state.autoSim` is enabled. Avoid side effects that change `dispatch` identity (memoize callbacks) — otherwise effects like `dispatch({type: 'INIT'})` can loop.
- Three.js isolation: keep WebGL code under `src/scene`. UI components must remain DOM-only; pass data via context/props.

Testing and CI notes
- Tests use Vitest (jsdom) — prefer unit tests for game logic under `tests/` or `src/game/__tests__` and lightweight component tests for UI.
- Playwright and `@vitest/browser` are available for visual tests; bench scripts use `tsx`.

When Copilot edits code
- Prefer small, focused changes. If changing action shapes, update `src/game/actions.ts`, `schema/action.schema.ts`, and any tests together.
- When adding dependencies, update `package.json` and keep versions conservative (many deps use loose ranges here).
- Avoid changing the public provider API (consumers rely on `GameStateContext` / `GameDispatchContext`).

Example prompts (repo‑specific)
- "Add a Zod schema for `EXT_QUEUE_PRODUCTION` matching `src/game/actions.ts` and add a Vitest that validates dispatch flows through `GameProvider`."
- "Extract a `Tile` component from `src/scene/Scene.tsx` that renders a single hex tile; keep Three.js details inside the new component."

Files to inspect when triaging issues
- `src/contexts/game-provider.tsx`, `src/game/actions.ts`, `schema/action.schema.ts`, `src/scene/Scene.tsx`, `tests/`, `package.json`, `vite.config.ts`.

If this misses anything important, tell me which area you'd like expanded (CI, benchmarks, Playwright setup, or action schemas) and I'll iterate.
