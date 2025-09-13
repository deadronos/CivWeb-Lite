# playwright — AGENTS

## Purpose

Holds Playwright tests and helpers used for end-to-end browser testing and visual/ARIA snapshots.

## Key files

- `tests/` — Playwright test suites (see repo `playwright.config.ts` for projects).

## Dependencies

- Playwright (dev dependency), Node.js test runner integration.

## Interactions

- Tests exercise the app's UI served by Vite; they help validate integration between `src` components and the browser environment.

## Important notes

- Follow Playwright best practices for reliable selectors (use role-based locators) and keep tests stable by avoiding brittle DOM queries.
