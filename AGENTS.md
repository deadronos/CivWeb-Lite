# Repository Guidelines

This guide helps contributors work effectively in CivWeb‑Lite.

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