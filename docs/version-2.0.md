# CivWeb-Lite 2.0 Mechanics

Version 2.0 focuses on closing the gameplay loop so the HUD + SpecControls can drive a functioning city/research/unit flow. This document highlights the systems that changed and how to exercise them during development.

## Research lifecycle

- `START_RESEARCH` now validates prerequisites, honours the player's research policy, and emits `researchStarted` once a technology is selected.
- Extension hooks (`EXT_BEGIN_RESEARCH`, `EXT_BEGIN_CULTURE_RESEARCH`) forward to the content engine so SpecControls and automated scripts can kick off tech/civic progress without touching the core player reducer.
- End-of-turn processing (`END_TURN`) still awards progress based on the player's per-turn yields; no additional wiring is required.

### Testing tips

- Use the Research Panel or dispatch `START_RESEARCH` via `GameDispatchContext` to begin Pottery/Mining.
- Queue a technology and then start it manually to confirm the queue entry is pruned.
- Run `npm test -- world_extension_actions` to verify the extension cases, or `npm test -- ui-interactions` to exercise the research action in isolation.

## City production

- `EXT_QUEUE_PRODUCTION` derives `turnsRemaining` from city production output and registry costs when the caller does not supply a turn count.
- Orders keep their `targetTileId` so worker improvements/buildings can target specific tiles later.
- The reducer appends new orders, leaving `CHOOSE_PRODUCTION_ITEM` free to manage the active slot for UI-driven flows.

### Testing tips

- Spawn a demo city via SpecControls and queue a Warrior using the "Queue Production" button.
- Each end turn decrements the head order until the unit spawns; the occupant is placed on the city tile.
- The `world_extension_actions.test.ts` suite covers queuing logic at the reducer level.

## Unit and city interactions

- `EXT_MOVE_UNIT` pipes directly into the content engine's `moveUnit`, updating movement points and tile occupants.
- `EXT_FOUND_CITY` (existing) now works end-to-end with settlers spawned during `INIT` — their tiles become occupied by the new city and the settler is removed.
- `EXT_ADD_TILE`, `EXT_ADD_UNIT`, and `EXT_ADD_CITY` remain useful for deterministic test setups.

### Testing tips

- Use SpecControls to add neighbour tiles and move units between them. Confirm occupants flip in the developer overlay.
- Found a city with a spawned settler to ensure the tile becomes occupied by the city and the unit disappears.

## Regression coverage

- Added `world_extension_actions.test.ts` for production queue, research, civic, and move actions.
- Strengthened `ui-interactions.test.ts` to assert that `START_RESEARCH` populates the player's `researching` slot.

Run the full suite with `npm run lint && npm test` after making changes. The new tests execute quickly (< 2s locally) and cover the happy paths described above.
