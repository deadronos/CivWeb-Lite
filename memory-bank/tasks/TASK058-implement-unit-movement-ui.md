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

**Overall Status:** In Progress - 50%

### Subtasks


| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 58.1 | Enhance uiReducer for unit states | Completed | 2025-09-13 | Enhanced SELECT_UNIT to prevent selecting moved units and ensured Selected state is cleared after ISSUE_MOVE. |
| 58.2 | Implement MovementRangeOverlay component | Completed | 2025-09-13 | Created movement-range-overlay.tsx with proper hex overlay rendering for reachable tiles. |
| 58.3 | Implement PathPreviewOverlay component | Completed | 2025-09-13 | Created path-preview-overlay.tsx with arrow visualization for path. |
| 58.4 | Implement CombatPreviewOverlay component | Completed | 2025-09-13 | Created combat-preview-overlay.tsx with HTML overlay for combat details. |
| 58.5 | Modify src/scene/scene.tsx for events | Not Started |  |  |
| 58.6 | Update ISSUE_MOVE action and uiReducer | Completed | 2025-09-13 | Added confirmCombat flag to action payload and schema, updated reducer to handle it. |
| 58.7 | Add unit tests for overlays | Completed | 2025-09-13 | Added Vitest unit tests for all three overlay components. |
| 58.8 | Add integration tests for movement flows | Not Started |  |  |


## Progress Log


### 2025-09-13


- Task created based on plan-full-ui-logic.md
- Completed subtask 58.1: Enhanced uiReducer for better unit state management (prevent select moved units, clear selection after move).
- Completed subtask 58.2: Implemented MovementRangeOverlay component with visual feedback for unit movement range.
- Completed subtask 58.3: Implemented PathPreviewOverlay with path arrows.
- Completed subtask 58.4: Implemented CombatPreviewOverlay with combat info display.
- Completed subtask 58.6: Updated ISSUE_MOVE to include confirmCombat and handled in reducer.
- Completed subtask 58.7: Added unit tests for the overlay components.
