# TASK004 - Integrate Visuals into Scene and HUD

**Status:** Completed
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

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 4.1 | In src/scene/Unit.tsx (or equivalent), render UnitBadgeContainer with unit's category and activeStates from context. | Completed | 2025-09-12 | Rendered badges in `unit-markers.tsx` overlaying units. |
| 4.2 | For Selected: In src/scene/HexTile.tsx, add outline material (e.g., line segments or shader) when 'selected' in tile.unit?.activeStates. | Completed | 2025-09-12 | Added `SelectedHexOutline` component with Line overlay. |
| 4.3 | Position container: Use @react-three/drei for HTML overlays on unit meshes, attached top-right. | Completed | 2025-09-12 | Used `HtmlLabel` with absolute-position container. |
| 4.4 | Wire categories: Assign to units on creation (e.g., warrior: Melee); placeholder for production linking. | Completed | 2025-09-12 | Categories wired via registry and reducers. |
| 4.5 | Optimize: Memoize container and badges to avoid re-renders in RAF loop. | Completed | 2025-09-12 | Memoized badge components. |
| 4.6 | Validate: E2E test with Playwright: Select unit, verify outline; fortify after move, verify multiple badges side by side. | Completed | 2025-09-12 | Added Playwright test validating multi-badge rendering. |

## Progress Log

### 2025-09-12

- Task file created based on implementation plan.

### 2025-09-12

- Implemented badge overlays, selected tile outline, category wiring, and memoization.
