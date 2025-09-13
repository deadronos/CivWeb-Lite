# TASK059 - Implement City Production Selection UI

**Status:** Pending  
**Added:** 2025-09-13  
**Updated:** 2025-09-13

## Original Request

Implement city production selection UI as outlined in plan-full-ui-logic.md, including opening panels, displaying items, selection, target tile selection, and queue management.

## Thought Process

City production is a key economic mechanic. This task requires integrating with player state for available items based on techs, handling queue operations, and a special mode for tile selection. New actions like REORDER_PRODUCTION_QUEUE and CANCEL_PRODUCTION_ORDER need to be defined and validated. Focus on user-friendly queue visualization and error handling for invalid selections.

## Implementation Plan

- Implement CityPanel component to display production items and queue.
- Enhance playerReducer to handle REORDER_PRODUCTION_QUEUE and CANCEL_PRODUCTION_ORDER actions.
- Implement logic within CityPanel to filter available production items based on playerState.researchedTechs and techCatalog.
- Develop a "target tile selection mode" that activates when an improvement requiring a tile is chosen.
- Modify src/scene/scene.tsx to handle clicks on cities to dispatch OPEN_CITY_PANEL.
- Add unit tests for CityPanel and its interaction with playerReducer.
- Add integration tests for opening the city panel, selecting production, and queue management.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 59.1 | Implement CityPanel component | Not Started |  |  |
| 59.2 | Enhance playerReducer for new queue actions | Not Started |  |  |
| 59.3 | Implement production item filtering logic | Not Started |  |  |
| 59.4 | Develop target tile selection mode | Not Started |  |  |
| 59.5 | Modify src/scene/scene.tsx for city clicks | Not Started |  |  |
| 59.6 | Add unit tests for CityPanel | Not Started |  |  |
| 59.7 | Add integration tests for production flows | Not Started |  |  |

## Progress Log

### 2025-09-13

- Task created based on plan-full-ui-logic.md
