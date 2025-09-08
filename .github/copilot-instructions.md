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

Commit messages and PR advice
-----------------------------
- Small focused PRs are preferred. Keep changes tied to a single goal.
- Use conventional commits briefly: feat:, fix:, refactor:, style:, docs:, test:.

Files to read first when contributing
------------------------------------
- `src-file-structure.md` — the recommended project structure.
- `src/App.tsx` — how the app wires Canvas and UI
- `src/game/GameProvider.tsx` — game rules and context
- `src/scene/Scene.tsx` — 3D scene composition and objects

Useful prompts for Copilot when editing code here
--------------------------------------------------
- "Generate a TypeScript type for the game state used in GameProvider and use it in the provider and hook definitions. Keep fields minimal: turn: number, players: string[], selected: {x:number,y:number}|null." 
- "Add inline JSDoc comments to exported functions in src/game/* describing inputs, outputs, and side effects." 
- "Create a small smoke test that mounts `App` with `@testing-library/react` and asserts that the Turn label renders." 

Follow-up improvements (low-risk)
---------------------------------
- Add a lightweight test runner (Vitest) and one smoke test.
- Add linting (ESLint + TypeScript plugin) and a basic config.
- Add CONTRIBUTING.md to document how to run and make PRs.

Where to ask for help
----------------------
- Open an issue on this repo with reproduction steps and what you expected vs observed.

Maintenance rules for Copilot-style edits
---------------------------------------
- When Copilot suggests code, prefer suggestions that add types and tests.
- Keep diffs focused; avoid large unrelated refactors in the same PR.

Thank you
--------
Thanks for helping make this project better — keep changes small and tested, and prefer clarity over cleverness.