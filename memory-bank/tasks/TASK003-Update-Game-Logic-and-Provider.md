# TASK003 - Update Game Logic and Provider

**Status:** Completed
**Added:** 2025-09-12
**Updated:** 2025-09-12

## Original Request

Implement Phase 3 from plan/plan-unit-states.md: Extend game logic and provider to manage unit state sets.

## Thought Process

Focus on reducer updates to handle state additions/removals, new actions, and validation. Ensure compatibility with autosim loop and Zod. Test for state combinations to prevent conflicts.

## Implementation Plan

- Extend actions.ts with state change actions
- Update game-provider reducer for state management
- Add selection logic
- Update Zod schemas
- Handle specific state like embarked
- Validate with tests

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 3.1 | Extend src/game/actions.ts with actions for state changes (e.g., SELECT_UNIT, ADD_UNIT_STATE, REMOVE_UNIT_STATE). | Completed | 2025-09-12 | Actions added |
| 3.2 | Update reducer in src/contexts/game-provider.tsx: On turn start, add Idle to units; on move action, add Moved; on fortify, add Fortified (allow if not conflicting); on embark, add Embarked. Support multiples like Moved + Fortified. | Completed | 2025-09-12 | States managed via reducers |
| 3.3 | Add selection logic: On unit click (via scene event), dispatch ADD_UNIT_STATE('selected') to add Selected and highlight tile. Deselect by removing it on click elsewhere. | Completed | 2025-09-12 | Selection adds/removes state |
| 3.4 | Update Zod schemas in schema/action.schema.ts for new actions and state sets. | Completed | 2025-09-12 | Schemas synced |
| 3.5 | Handle embarked: Allow land units to embark on coastal tiles, adding Embarked state (possibly with Moved). | Completed | 2025-09-12 | Embarked state toggled on coast |
| 3.6 | Validate: Add tests for reducer state additions/removals; ensure autosim skips units with Moved active. Test combinations like Moved + Fortified. | Completed | 2025-09-12 | Tests cover add/remove and combos |

## Progress Log

### 2025-09-12

- Task file created based on implementation plan.
