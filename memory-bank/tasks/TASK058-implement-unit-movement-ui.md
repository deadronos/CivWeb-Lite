# TASK058 - Implement Unit Movement UI

**Status:** Pending  
**Added:** 2025-09-13  
**Updated:** 2025-09-13

## Original Request

Implement full unit movement UI logic as outlined in plan-full-ui-logic.md, including selection, range display, path preview, combat preview, movement execution, and cancellation.

## Thought Process

This task focuses on the unit movement interactions, which are core to gameplay. It builds on existing scene components and game state. Key challenges include accurate path computation integration, visual feedback for selections and previews, and handling combat confirmations. Ensure all dispatches validate against schemas. Sub-tasks are derived directly from the plan to ensure comprehensive coverage.

## Implementation Plan


- Enhance uiReducer to manage UnitState.Selected and UnitState.Moved more robustly, ensuring proper visual feedback.
- Implement MovementRangeOverlay component to render highlighted tiles based on unit.movementRemaining and computePath results.
- Implement PathPreviewOverlay component to render the computed path (e.g., arrows, colored tiles).
- Implement CombatPreviewOverlay component to display combat details when applicable.
- Modify src/scene/scene.tsx to handle click and hover events for units and tiles, dispatching SELECT_UNIT and PREVIEW_PATH actions.
- Update ISSUE_MOVE action payload to include confirmCombat flag and ensure uiReducer correctly handles it.
- Add unit tests for MovementRangeOverlay, PathPreviewOverlay, and CombatPreviewOverlay components.
- Add integration tests (Vitest/Playwright) for unit selection, path preview, and movement execution, including combat scenarios.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks


| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 58.1 | Enhance uiReducer for unit states | Not Started |  |  |
| 58.2 | Implement MovementRangeOverlay component | Not Started |  |  |
| 58.3 | Implement PathPreviewOverlay component | Not Started |  |  |
| 58.4 | Implement CombatPreviewOverlay component | Not Started |  |  |
| 58.5 | Modify src/scene/scene.tsx for events | Not Started |  |  |
| 58.6 | Update ISSUE_MOVE action and uiReducer | Not Started |  |  |
| 58.7 | Add unit tests for overlays | Not Started |  |  |
| 58.8 | Add integration tests for movement flows | Not Started |  |  |


## Progress Log


### 2025-09-13


- Task created based on plan-full-ui-logic.md
