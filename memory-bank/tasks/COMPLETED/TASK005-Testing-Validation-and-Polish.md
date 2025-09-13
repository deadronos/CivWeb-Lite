# TASK005 - Testing, Validation, and Polish

**Status:** Pending  
**Added:** 2025-09-12  
**Updated:** 2025-09-12

## Original Request

Implement Phase 5 from plan/plan-unit-states.md: Comprehensive testing, validation, and final polish for unit states feature.

## Thought Process

Ensure full coverage with unit, integration, and E2E tests. Check performance, accessibility, and documentation. This phase confirms the feature meets all requirements.

## Implementation Plan

- Add unit tests for actions and states
- Integration tests for combined actions
- Performance benchmarks
- Accessibility verification
- Documentation updates
- Final review

## Progress Tracking

**Overall Status:** Completed Testing (5.1-5.2); Starting 5.3

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 5.1 | Add unit tests for new actions and state logic in tests/gameprovider_unit-states.test.tsx, including multiple state scenarios. | Completed | 2025-09-12 | Red/Green complete for four tests (Idle, Moved, multi, Fortified). Covers REQ-005 logic. |
| 5.2 | Integration tests: Simulate turn with combined actions (e.g., move then fortify), assert multiple badges. | Completed | 2025-09-12 | Red/Green complete: Created UnitBadgeContainer, UnitStateBadge, UnitCategoryBadge (icons from react-icons, flex for multiples). Integration test renders provider + container, dispatches multi-states, asserts 2+ badges (verified pass; REQ-003 visuals). |
| 5.3 | Performance: Run bench scripts; ensure no FPS drop with multiple badges. | In Progress | 2025-09-12 | Run existing benchWorld.ts; assert FPS stable with badges. |
| 5.4 | Accessibility: Verify container and badges have labels; test with screen reader for multiple states. | Not Started | | |
| 5.5 | Documentation: Update README and src comments; add to todo-registry.md if extensions needed. | Not Started | | |
| 5.6 | Review: Run lint, build, and manual scene inspection for badge rendering. | Not Started | | |

## Progress Log

### 2025-09-12

- Task file created based on implementation plan.
- Red Phase (TDD): Created initial failing test in tests/gameprovider_unit-states.test.tsx for adding Idle state on INIT action (basic REQ-005 validation). Test expects activeStates to contain 'idle' after dispatch but will fail until reducer implementation.
- Green Phase: Fixed test for contentExt.units (codebase structure). Updated src/game/reducers/lifecycle.ts with 'INIT' logic to add 'idle' to all units' activeStates Sets. Test now passes (verified via runTests tool). Ready for next test (e.g., Moved on move action).
- Red Phase Next: Added second test for 'ISSUE_MOVE' action adding 'moved' to unit activeStates. Mocked contentExt with unit/tile/path; expects 'moved' but fails on empty Set (correct Red for move state addition).
- Green Phase Next: Updated src/game/reducers/ui.ts 'ISSUE_MOVE' case to add UnitState.Moved to unit.activeStates after move execution. Second test now passes (verified). Ready for multi-state or fortify test.
- Red Phase Third: Added third test for multi-state support (ISSUE_MOVE then ADD_UNIT_STATE for 'fortified'; assert both in Set, length 2). Fails on missing 'fortified' addition (verified; correct Red for REQ-005 combinations).
- Green Phase Third: Added 'ADD_UNIT_STATE' case in src/game/reducers/world.ts to append state to unit.activeStates Set (no removal, supports multiples). Third test now passes (verified). All three tests green. Ready for more (e.g., fortify/embarked actions) or integration (5.2).
- Red Phase Fourth: Added fourth test for 'FORTIFY_UNIT' action adding 'fortified' to unit activeStates. Expects 'fortified' but fails on empty Set (correct Red for fortify state addition, REQ-005).
- Green Phase Fourth: Added 'FORTIFY_UNIT' case in src/game/reducers/world.ts to append UnitState.Fortified to activeStates. Added mapping in src/game/reducer.ts actionReducerMap. Fourth test now passes (verified). Subtask 5.1 complete—all unit tests for core states green. Proceeding to 5.2 integration tests (render + assert badges).
- Green Phase 5.2: Created basic UnitStateBadge, UnitCategoryBadge (icons/colors per plan), and UnitBadgeContainer (flex for multiples, aria-labels). Updated integration test to dispatch ISSUE_MOVE + ADD_UNIT_STATE, render container, assert getAllByRole('img').length >=2 (multi badges). Test passes (verified). Subtask 5.2 complete—end-to-end state to visuals. Overall testing done; starting 5.3 perf benchmarks.
