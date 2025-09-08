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
- Typescript is configured (see `tsconfig.json`).
- Entry point: `index.html` -> `src/main.tsx` -> `src/App.tsx`.
- High-level structure:
  - `src/App.tsx` — top-level app, Canvas and UI
  - `src/main.tsx` — React bootstrap
  - `src/game/GameProvider.tsx` — game state context and hooks
  - `src/scene/Scene.tsx` — three/fiber scene components

How to run (developer quick-start)
----------------------------------
1. Install dependencies:

   npm install

2. Run dev server:

   npm run dev

3. Build for production:

   npm run build

4. Preview a production build:

   npm run preview

Testing and verification
-------------------------
- This repo currently has no test runner configured. If you add tests, prefer Vitest or React Testing Library for components and small unit tests for game logic in `src/game`.

Coding conventions and style
----------------------------
- Prefer functional React components with hooks.
- Keep Three.js logic inside `src/scene` and UI in `src/*` (avoid mixing DOM and heavy WebGL math in the same file).
- Use named exports for hooks from `GameProvider` (for example `useGame`).
- Keep components small and focused. Extract reusable hooks and small helper modules under `src/lib` or `src/utils`.
- Type strictly in public APIs (props, context values). Use `unknown`/`any` sparingly and add comments when used.

Performance and play-mode guidance
----------------------------------
- Use <Stats /> from `@react-three/drei` during development to monitor FPS (already included).
- Keep heavy computations out of render paths. Use useMemo/useCallback where appropriate.
- For large scenes, consider using instanced meshes, LOD, or baked textures.

What Copilot should do by default
----------------------------------
- Propose changes that follow the repo's structure: prefer edits under `src/scene` for visuals and `src/game` for game state.
- Use TypeScript types and add types when missing for function signatures and exported hooks.
- Add unit tests for non-visual logic when adding or modifying game rules.
- When adding new dependencies, update `package.json` and keep versions conservative.

Example prompts to get good suggestions
--------------------------------------
- "Add a unit test for GameProvider.endTurn that verifies turn increments and side effects. Use Vitest and place test in src/game/__tests__/GameProvider.test.tsx." 
- "Refactor Scene.tsx to extract a reusable Tile component that receives position and terrain props. Keep Three.js specifics inside the Tile component." 
- "Improve performance: debounce expensive state updates in GameProvider and memoize derived values used by Scene." 
- "Implement keyboard shortcuts: W/A/S/D to move the camera and Q/E to rotate. Put input handling into a custom hook under src/hooks/useCameraControls.ts." 

Edge-cases and constraints to consider
-------------------------------------
- Don't break the public context API from `GameProvider` — consumers like `App.tsx` rely on `useGame()`.
- UI components must remain DOM-only (no direct WebGL calls). Pass data via props or context.
- Keep bundle size reasonable: avoid adding large packages without justification.
## Copilot instructions (concise & repo-specific)

Purpose: short, actionable guidance to make AI agents immediately productive in CivWeb‑Lite.

Quick facts
- Stack: React 18 + TypeScript, Vite, three, @react-three/fiber, @react-three/drei
- Entry: `index.html` -> `src/main.tsx` -> `src/App.tsx`

Developer commands (use exact npm scripts)
- Install: `npm install`
- Dev server: `npm run dev` (vite)
- Build: `npm run build`
- Preview build: `npm run preview`
- Tests: `npm test` (runs Vitest), watch: `npm run test:watch`
- Lint: `npm run lint`
- Benchmarks: `npm run bench:world` and `npm run bench:ai` (uses `tsx` to run scripts/)

High-level architecture (what to read first)
- `src/game/GameProvider.tsx` — central game state + hooks (public API: `useGame()`)
- `src/scene/Scene.tsx` — Three.js / @react-three/fiber scene composition
- `src/App.tsx` — how Canvas, HUD and provider are wired together
- `scripts/` and `schema/save.schema.json` — small tooling/bench scripts and AJV schema usage

Project-specific patterns and rules
- Keep WebGL/Three-specific code inside `src/scene` and related components. DOM UI lives under `src/components`/`src/*`.
- The `GameProvider` exposes a stable public API — avoid breaking `useGame()` consumers.
- Tests are present and use Vitest + jsdom. There are many targeted tests under `tests/` — run the suite locally before PRs.
- Dependencies in package.json use loose versions (`*`) in many places — be conservative when adding or upgrading deps and update `package.json` accordingly.

Integration & tooling notes
- Bench scripts use `tsx` to run TypeScript scripts (see `scripts/benchWorld.ts`).
- Playwright and @vitest/browser are available in devDependencies for browser/visual tests.

How Copilot should prioritize edits
- Prefer small, focused changes: add types, small tests (Vitest), and keep visual-only edits inside `src/scene`.
- When adding features that affect game rules, add unit tests under `tests/` or `src/game/__tests__` and update types.

Example prompts (good starting points)
- "Refactor Scene.tsx: extract a Tile component (position, terrain) and keep Three.js details inside it." 
- "Add a Vitest unit test for GameProvider.endTurn to assert turn increments and side effects." 

Files to inspect for context: `src-file-structure.md`, `src/game/GameProvider.tsx`, `src/scene/Scene.tsx`, `vitest.config.ts`, `package.json`.

Before opening a PR: run `npm test` and `npm run lint` locally and keep PRs small and focused.

If anything here is unclear or you'd like more examples (tests, component refactors, or CI hints), tell me which area to expand.