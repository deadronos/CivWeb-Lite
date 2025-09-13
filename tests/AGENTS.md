# tests — AGENTS

## Purpose

Unit, integration, and component tests for the codebase. Mostly Vitest-based tests that validate game logic, reducers, and UI rendering.

## Key files / folders

- `setup.ts` — Test setup and global mocks.
- `scene/` — Scene-specific tests for Three.js and UI integration.
- `bench/` — Performance or benchmark-focused tests.

## Dependencies

- Vitest + jsdom, Playwright for E2E (in `playwright/`).

## Interactions

- Tests exercise `src/` code and validate behavior against `schema/` and `spec/` documents.

## Important notes

- Keep tests focused, deterministic and fast. Use `test-utils` helpers in `src/test-utils` to reduce duplication.
