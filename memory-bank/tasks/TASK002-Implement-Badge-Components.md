# TASK002 - Implement Badge Components

**Status:** Pending  
**Added:** 2025-09-12  
**Updated:** 2025-09-12

## Original Request

Implement Phase 2 from plan/plan-unit-states.md: Create badge components for categories and states, including a container for multiple states.

## Thought Process

Components should be reusable React elements with proper styling, accessibility, and support for multiple state badges in a horizontal container. Use CSS for positioning and react-icons for visuals. Snapshot testing to ensure rendering correctness.

## Implementation Plan

- Create UnitCategoryBadge component
- Create UnitStateBadge component
- Create UnitBadgeContainer for multiple badges
- Add accessibility features
- Style the components
- Validate with tests

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 2.1 | Create src/components/UnitCategoryBadge.tsx: Render icon from map with category prop, styled as small pill (16-18px, rgba bg, colors per category e.g., red for Melee). | Not Started | | |
| 2.2 | Create src/components/UnitStateBadge.tsx: Render single state icon with color from map; no badge for Selected (return null). Use colors from suggested-states-icons.md (e.g., blue for Moved). | Not Started | | |
| 2.3 | Create src/components/UnitBadgeContainer.tsx: Accept activeStates set and category; render category badge followed by side-by-side state badges in a flex container (horizontal layout, attached to unit top-right). | Not Started | | |
| 2.4 | Add accessibility: aria-label and title props for container and individual badges based on maps. | Not Started | | |
| 2.5 | Style: Container as subtle background pill; badges spaced 2-4px apart; use CSS for overlay in HUD. | Not Started | | |
| 2.6 | Validate: Snapshot tests for components; render with multiple states (e.g., Moved + Fortified). | Not Started | | |

## Progress Log

### 2025-09-12

- Task file created based on implementation plan.
