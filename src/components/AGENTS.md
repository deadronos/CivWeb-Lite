# src/components — AGENTS

## Purpose

Reusable UI components and containers that compose the game's HUD, menus, and panels.

## Key files / folders

- `ui/` — Main UI pieces like `top-bar`, `left-panel`, `minimap`, `research-panel` and containers.
- `common/` — Utility components (spinners, error boundary, icons).

## Dependencies

- React and project-wide styles. Components may rely on `contexts/` for runtime data.

## Interactions

- Components consume game state via `contexts/` and dispatch actions to `game/` via `GameDispatchContext`.

## Important notes

- Keep components small and presentational where possible; move side effects into hooks or contexts.
