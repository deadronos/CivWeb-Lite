# schema — AGENTS

## Purpose

Schema definitions for runtime validation and save/load formats. Schemas are used to validate game actions and persisted state.

## Key files

- `action.schema.ts` — Zod schemas used to validate dispatched actions at runtime.
- `save.schema.json` — JSON schema for persisted save files.

## Dependencies

- `zod` is used at runtime for schema validation (see `package.json` dev/runtime deps).

## Interactions

- `src/contexts/game-provider.tsx` uses these schemas to validate actions before applying them.

## Important notes

- Keep these schemas in sync with `src/game/actions.ts` and any action type changes to avoid runtime validation failures.
