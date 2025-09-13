# TASK060 - Implement Research Selection UI

**Status:** Pending  
**Added:** 2025-09-13  
**Updated:** 2025-09-13

## Original Request

Implement research selection UI as outlined in plan-full-ui-logic.md, including opening panels, displaying tech tree, selection, queuing, and policy switching.

## Thought Process

Research drives progression. This task involves visualizing the tech tree with status indicators, handling prerequisites, and new policy actions for progress management. Ensure the UI is intuitive for tree navigation and queue operations. Integrate with existing player state and add validation for prerequisites.

## Implementation Plan

- Implement ResearchPanel component to display the tech tree and research controls.
- Enhance playerReducer to handle SWITCH_RESEARCH_POLICY action and implement the chosen policy.
- Implement logic within ResearchPanel to determine and display the status of each technology (available, researching, researched, locked).
- Add visual indicators for prerequisites and unlocks within the ResearchPanel.
- Modify src/components/ui/TopBar.tsx to include a button for dispatching OPEN_RESEARCH_PANEL.
- Add unit tests for ResearchPanel and its interaction with playerReducer.
- Add integration tests for opening the research panel, selecting research, and queue management.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 60.1 | Implement ResearchPanel component | Not Started |  |  |
| 60.2 | Enhance playerReducer for research policy | Not Started |  |  |
| 60.3 | Implement tech status logic | Not Started |  |  |
| 60.4 | Add visual indicators for prereqs/unlocks | Not Started |  |  |
| 60.5 | Modify TopBar.tsx for research button | Not Started |  |  |
| 60.6 | Add unit tests for ResearchPanel | Not Started |  |  |
| 60.7 | Add integration tests for research flows | Not Started |  |  |

## Progress Log

### 2025-09-13

- Task created based on plan-full-ui-logic.md
