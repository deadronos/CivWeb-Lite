# TASK001 - Define Types and Utilities for Categories and States

**Status:** Pending  
**Added:** 2025-09-12  
**Updated:** 2025-09-12

## Original Request

Implement Phase 1 from plan/plan-unit-states.md: Define types and utilities for unit categories and states.

## Thought Process

This phase establishes the foundational types and utilities needed for unit categories and multi-state support. Using enums for categories and states, and a Set for active states to allow multiples. Icon maps will reference react-icons/gi suggestions. Ensure TypeScript compliance and basic testing.

## Implementation Plan

- Define UnitCategory and UnitState enums in src/types/unit.ts
- Create icon maps in src/utils/unitIcons.ts
- Install react-icons if needed
- Update GameState interface
- Validate with TypeScript and Vitest

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Create/update src/types/unit.ts with UnitCategory enum and UnitState as enum; add type for `Set<UnitState>` or UnitActiveStates as array/set. | Not Started | | |
| 1.2 | Add unitCategoryIconMap and unitStateIconMap in src/utils/unitIcons.ts, using react-icons/gi (e.g., GiHourglass for Idle, GiFootsteps for Moved). Reference suggested-states-icons.md for icons. | Not Started | | |
| 1.3 | Install react-icons if not present: npm i react-icons. | Not Started | | |
| 1.4 | Update GameState interface in src/types/game.ts to include category: UnitCategory and activeStates: `Set<UnitState>` per unit. | Not Started | | |
| 1.5 | Validate: Run tsc and ensure no type errors; add basic Vitest for enum values and set operations. | Not Started | | |

## Progress Log

### 2025-09-12

- Task file created based on implementation plan.
