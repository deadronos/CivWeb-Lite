# TASK061 - Update Schemas and Add New Actions

**Status:** Pending  
**Added:** 2025-09-13  
**Updated:** 2025-09-13

## Original Request

Update action schemas and add new actions as required for UI logic in plan-full-ui-logic.md, including REORDER_PRODUCTION_QUEUE, CANCEL_PRODUCTION_ORDER, SWITCH_RESEARCH_POLICY, and updates to ISSUE_MOVE.

## Thought Process

Schemas ensure runtime validation. This task centralizes new action definitions to prevent dispatch failures. Define payloads precisely, integrate into discriminated union, and update any dependent reducers. Test schema validation thoroughly to catch type mismatches early.

## Implementation Plan

- Define new actions: REORDER_PRODUCTION_QUEUE { cityId: string, newQueue: ProductionOrder[] }, CANCEL_PRODUCTION_ORDER { cityId: string, orderIndex: number }, SWITCH_RESEARCH_POLICY { playerId: string, policy: 'preserveProgress' | 'discardProgress' }.
- Update ISSUE_MOVE payload to include confirmCombat flag.
- Add these to schema/action.schema.ts and integrate into GameActionSchema discriminated union.
- Update playerReducer and uiReducer to handle the new actions.
- Add unit tests for schema validation of new actions.
- Update existing tests that dispatch related actions to include new fields where applicable.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 61.1 | Define new action payloads | Not Started |  |  |
| 61.2 | Update ISSUE_MOVE schema | Not Started |  |  |
| 61.3 | Integrate new actions into GameActionSchema | Not Started |  |  |
| 61.4 | Update reducers for new actions | Not Started |  |  |
| 61.5 | Add schema validation tests | Not Started |  |  |
| 61.6 | Update existing action tests | Not Started |  |  |

## Progress Log

### 2025-09-13

- Task created based on plan-full-ui-logic.md
