# Repository Guidelines

This guide helps contributors work effectively in CivWeb‑Lite.

## Using AI Tools Hint for Copilot/Codex:

Invoke gemini ai for a peer review or alternate opinion at any time, rate limit is 60 requests a second (https://github.com/google-gemini/gemini-cli - gemini)

## When to Use Gemini CLI

Use gemini -p when:

Analyzing entire codebases or large directories

Comparing multiple large files

Need to understand project-wide patterns or architecture

Current context window is insufficient for the task

Working with files totaling more than 100KB

Verifying if specific features, patterns, or security measures are implemented

Checking for the presence of certain coding patterns across the entire codebase

Gemini's context window can handle entire codebases that would overflow Claude's context

No need for --yolo flag for read-only analysis

When checking implementations, be specific about what you're looking for to get accurate results

## Project Structure & Module Organization

- See `src-file-structure.md` for the recommended project structure.
- `src/` – application source (components, pages, utilities).
- `public/` – static assets served as‑is (icons, manifest, index.html).
- `tests/` – unit/integration tests mirroring `src/` paths.
- `scripts/` – local dev/build scripts.
- `package.json` – scripts and tooling config; check also `.editorconfig`/linters if present.

## Build, Test, and Development Commands

- `npm install` – install dependencies.
- `npm run dev` – start local dev server with hot reload.
- `npm run build` – create production build in `dist/`.
- `npm test` – run test suite once.
- `npm run test:watch` – re-run tests on change (if configured).
- `npm run lint` / `npm run format` – check/format codebase.

Project quick commands (repo-specific)

- `npm run preview` — preview a production build locally (uses `vite preview`).
- `npm run bench:world` / `npm run bench:ai` — run benchmark scripts under `scripts/` using `tsx`.

## Coding Style & Naming Conventions

- Indentation: 2 spaces; UTF‑8, LF where possible.
- JavaScript/TypeScript: prefer ES modules; `camelCase` for vars/functions, `PascalCase` for components/types, `kebab-case` for files.
- React/Vue components (if applicable) live under `src/components/` with one component per file.
- Keep functions small; avoid side effects; prefer composable utilities.
- Use tooling: ESLint for linting, Prettier for formatting (run via scripts above).

## Testing Guidelines

- Framework: Jest/Vitest (whichever is configured). Place specs under `tests/` or alongside code as `*.test.ts(x)`.
- Name tests after the module: `button.test.ts` mirrors `src/components/Button.tsx`.
- Aim for meaningful coverage of logic and critical UI paths; add regression tests for bugs.
- Run locally with `npm test`; use `test:watch` during development.

Project testing notes

- Tests use Vitest + jsdom. Many existing tests live under `tests/` and target game logic and provider behavior. Prefer adding small, focused unit tests for `src/game` changes.
- Visual/Playwright tests are available for UI checks — see `playwright.config.ts` when adding browser tests.

## Commit & Pull Request Guidelines

- Commits: concise imperative subject (≤72 chars), descriptive body when needed. Example: `fix(router): handle base path in prod`.
- Scope commits logically; avoid mixing unrelated changes.
- PRs: include summary, rationale, screenshots for UI, reproduction/verification steps, and link related issues (e.g., `Closes #123`).
- Ensure CI passes: build, tests, and lint must be green.

## Security & Configuration Tips

- Do not commit secrets; use environment files like `.env.local` (gitignored). Example keys: API endpoints, tokens.
- Validate external inputs and sanitize user‑provided content.

## Architecture Overview

- Modular `src/` with clear separation of UI, state, and services. Prefer dependency‑injected utilities and pure functions to keep modules testable.

Project architecture highlights

- `src/contexts/game-provider.tsx` is the central state provider — it exposes `GameStateContext` and `GameDispatchContext`. Avoid breaking its public API.
- `src/game/actions.ts` defines the canonical `GameAction` union and `GAME_ACTION_TYPES` (uppercase discriminators). When adding validations or tests, use these exact literals.
- `schema/action.schema.ts` contains Zod schemas used at runtime to validate dispatched actions; keep it aligned with `src/game/actions.ts` (there's also an `AnyActionSchema` permissive fallback used by `GameProvider`).
- `src/game/events` provides a `globalGameBus` used across modules for lifecycle events (`turn:start`, `turn:end`, `action:applied`). Use it for integration/diagnostic hooks.

Developer tips

- Keep Three.js code under `src/scene` and DOM UI under `src/components` or top-level `src/*`.
- The `GameProvider` uses `requestAnimationFrame` to implement the autoSim loop — be careful with side effects and memoize callbacks (e.g., `dispatch`) to avoid infinite update loops.
- When adding or changing action shapes, update `src/game/actions.ts`, `schema/action.schema.ts`, and any tests simultaneously to avoid runtime validation failures.
