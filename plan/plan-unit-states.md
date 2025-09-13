---
goal: Implement Unit Categories and States with Visual Badges and Highlights
version: 1.1
date_created: 2025-09-12
last_updated: 2025-09-12
owner: AI Assistant
status: Planned
tags: [units, states, ui, game-logic, three-js, react-icons]
---

# Introduction

This implementation plan details the addition of unit categories (Melee, Ranged, Recon, Naval, Civilian) and states (idle, selected, moved, fortified, embarked) to CivWeb-Lite. Categories will be represented by glyph badges, potentially linked to city production. States will use visual indicators like badges for most and a hextile outline highlight for selection. To support multiple concurrent states (e.g., moved and fortified), units will track a set of active states. Badges will be rendered in a small "container" attached to the unit, displaying active state icons side by side. Integration will occur via the GameProvider reducer to update states on actions, using existing simple models in the Three.js scene. Icons from react-icons/gi will be utilized for consistency.

## 1. Requirements & Constraints

- **REQ-001**: Define unit categories as an enum (Melee, Ranged, Recon, Naval, Civilian) with associated glyph icons from react-icons/gi (e.g., GiSword for Melee, GiArcher for Ranged).
  - Acceptance: Enum exported from src/types/unit.ts; icon map in a new utility file; badges render correctly in tests.
- **REQ-002**: Implement unit states as a set of flags (Idle, Selected, Moved, Fortified, Embarked) with state-specific badges (except Selected, which uses hextile outline). Support multiple active states per unit (e.g., Moved + Fortified).
  - Acceptance: GameState tracks `Set<UnitState>` per unit; updates correctly on actions (e.g., move adds Moved); visual badges appear for active states in HUD/scene.
- **REQ-003**: Create UnitCategoryBadge and a UnitBadgeContainer that renders multiple UnitStateBadge components side by side for active states, using react-icons, positioned as small overlays on unit models/sprites.
  - Acceptance: Container renders icons with colors/labels; supports multiple badges horizontally; accessible with aria-labels; integrated into unit rendering without performance impact.
- **REQ-004**: For selected state, highlight the occupied hextile with an outline (e.g., emissive material or edge highlight in Three.js).
  - Acceptance: Outline appears when Selected is active; disappears when inactive; no interference with other scene elements.
- **REQ-005**: Extend GameProvider and reducer to manage unit state sets: add Idle on init/turn start, add Selected on click, add Moved/Fortified/Embarked on respective actions; allow combinations like Moved + Fortified.
  - Acceptance: State additions trigger re-renders correctly; autosim loop respects active states (e.g., skip if Moved); validated via unit tests.
- **REQ-006**: Wire category glyphs to future production (e.g., city queues show category previews), but implement as static for MVP.
  - Acceptance: Badges display category based on unit data; placeholder for dynamic linking.
- **SEC-001**: Ensure state updates are validated with Zod schemas to prevent invalid transitions.
  - Acceptance: Action dispatch fails gracefully on invalid state changes; schema updated in schema/action.schema.ts.
- **CON-001**: Use existing low-poly models in src/scene; limit badges to 2D HUD overlays to avoid Three.js complexity.
  - Acceptance: No new 3D assets needed; performance benchmarks unchanged.
- **CON-002**: Maintain one unit per tile for MVP; no stacking visuals.
  - Acceptance: State visuals per-tile accurate.

## 2. Implementation Steps

### Implementation Phase 1 - GOAL-001: Define Types and Utilities for Categories and States

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create/update src/types/unit.ts with UnitCategory enum and UnitState as enum; add type for `Set<UnitState>` or UnitActiveStates as array/set. | | |
| TASK-002 | Add unitCategoryIconMap and unitStateIconMap in src/utils/unitIcons.ts, using react-icons/gi (e.g., GiHourglass for Idle, GiFootsteps for Moved). Reference suggested-states-icons.md for icons. | | |
| TASK-003 | Install react-icons if not present: npm i react-icons. | | |
| TASK-004 | Update GameState interface in src/types/game.ts to include category: UnitCategory and activeStates: `Set<UnitState>` per unit. | | |
| TASK-005 | Validate: Run tsc and ensure no type errors; add basic Vitest for enum values and set operations. | | |

### Implementation Phase 2 - GOAL-002: Implement Badge Components

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create src/components/UnitCategoryBadge.tsx: Render icon from map with category prop, styled as small pill (16-18px, rgba bg, colors per category e.g., red for Melee). | | |
| TASK-002 | Create src/components/UnitStateBadge.tsx: Render single state icon with color from map; no badge for Selected (return null). Use colors from suggested-states-icons.md (e.g., blue for Moved). | | |
| TASK-003 | Create src/components/UnitBadgeContainer.tsx: Accept activeStates set and category; render category badge followed by side-by-side state badges in a flex container (horizontal layout, attached to unit top-right). | | |
| TASK-004 | Add accessibility: aria-label and title props for container and individual badges based on maps. | | |
| TASK-005 | Style: Container as subtle background pill; badges spaced 2-4px apart; use CSS for overlay in HUD. | | |
| TASK-006 | Validate: Snapshot tests for components; render with multiple states (e.g., Moved + Fortified). | | |

### Implementation Phase 3 - GOAL-003: Update Game Logic and Provider

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Extend src/game/actions.ts with actions for state changes (e.g., SELECT_UNIT, ADD_UNIT_STATE, REMOVE_UNIT_STATE). | | |
| TASK-002 | Update reducer in src/contexts/game-provider.tsx: On turn start, add Idle to units; on move action, add Moved; on fortify, add Fortified (allow if not conflicting); on embark, add Embarked. Support multiples like Moved + Fortified. | | |
| TASK-003 | Add selection logic: On unit click (via scene event), dispatch ADD_UNIT_STATE('selected') to add Selected and highlight tile. Deselect by removing it on click elsewhere. | | |
| TASK-004 | Update Zod schemas in schema/action.schema.ts for new actions and state sets. | | |
| TASK-005 | Handle embarked: Allow land units to embark on coastal tiles, adding Embarked state (possibly with Moved). | | |
| TASK-006 | Validate: Add tests for reducer state additions/removals; ensure autosim skips units with Moved active. Test combinations like Moved + Fortified. | | |

### Implementation Phase 4 - GOAL-004: Integrate Visuals into Scene and HUD

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | In src/scene/Unit.tsx (or equivalent), render UnitBadgeContainer with unit's category and activeStates from context. | | |
| TASK-002 | For Selected: In src/scene/HexTile.tsx, add outline material (e.g., line segments or shader) when 'selected' in tile.unit?.activeStates. | | |
| TASK-003 | Position container: Use @react-three/drei for HTML overlays on unit meshes, attached top-right. | | |
| TASK-004 | Wire categories: Assign to units on creation (e.g., warrior: Melee); placeholder for production linking. | | |
| TASK-005 | Optimize: Memoize container and badges to avoid re-renders in RAF loop. | | |
| TASK-006 | Validate: E2E test with Playwright: Select unit, verify outline; fortify after move, verify multiple badges side by side. | | |

### Implementation Phase 5 - GOAL-005: Testing, Validation, and Polish

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add unit tests for new actions and state logic in tests/gameprovider_unit-states.test.tsx, including multiple state scenarios. | | |
| TASK-002 | Integration tests: Simulate turn with combined actions (e.g., move then fortify), assert multiple badges. | | |
| TASK-003 | Performance: Run bench scripts; ensure no FPS drop with multiple badges. | | |
| TASK-004 | Accessibility: Verify container and badges have labels; test with screen reader for multiple states. | | |
| TASK-005 | Documentation: Update README and src comments; add to todo-registry.md if extensions needed. | | |
| TASK-006 | Review: Run lint, build, and manual scene inspection for badge rendering. | | |
