# TASK004 - Integrate Visuals into Scene and HUD

**Status:** Pending  
**Added:** 2025-09-12  
**Updated:** 2025-09-12

## Original Request

Implement Phase 4 from plan/plan-unit-states.md: Integrate badge components and selection highlights into the Three.js scene and HUD.

## Thought Process

Leverage @react-three/drei for overlays to keep 2D badges performant. Ensure memoization in the RAF loop. Focus on correct positioning and state-driven rendering.

## Implementation Plan

- Render badges in Unit component
- Add outline for selected state in HexTile
- Position using drei
- Wire categories
- Optimize rendering
- Validate with E2E tests

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 4.1 | In src/scene/Unit.tsx (or equivalent), render UnitBadgeContainer with unit's category and activeStates from context. | Not Started | | |
| 4.2 | For Selected: In src/scene/HexTile.tsx, add outline material (e.g., line segments or shader) when 'selected' in tile.unit?.activeStates. | Not Started | | |
| 4.3 | Position container: Use @react-three/drei for HTML overlays on unit meshes, attached top-right. | Not Started | | |
| 4.4 | Wire categories: Assign to units on creation (e.g., warrior: Melee); placeholder for production linking. | Not Started | | |
| 4.5 | Optimize: Memoize container and badges to avoid re-renders in RAF loop. | Not Started | | |
| 4.6 | Validate: E2E test with Playwright: Select unit, verify outline; fortify after move, verify multiple badges side by side. | Not Started | | |

## Progress Log

### 2025-09-12

- Task file created based on implementation plan.
