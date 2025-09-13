# Plan: Full UI Interaction Logic Implementation

## 1. Introduction

This plan outlines the implementation of the full UI interaction logic for CivWeb-Lite, building upon the existing `spec/ui-interactions.spec.md` and integrating with the established `GameProvider` and reducer architecture. The goal is to bring the advanced UI interactions (unit movement, city production, research selection) from their "planned but not yet implemented" status to a functional and testable state.

## 2. Scope

This plan covers the implementation of:
*   **Unit Movement:** Selection, range display, path preview, movement execution, combat confirmation, and associated UI feedback.
*   **City Production Selection:** Opening city panels, displaying available production items, selecting items, managing production queues, and handling target tile selection for improvements.
*   **Research Selection:** Opening research panels, displaying available technologies, selecting research targets, and managing research queues.

## 3. General Requirements

*   All UI components must be presentational and interact with the game state exclusively via the `useGame()` hook and dispatched actions.
*   Actions dispatched from the UI must conform to the `GameActionSchema` and be validated by the `GameProvider`.
*   UI must provide clear visual feedback for all interactions (e.g., selected units, valid movement paths, queued production).
*   Error conditions (e.g., invalid moves, insufficient resources) must be communicated clearly to the user.
*   Adherence to existing project conventions (TypeScript, React, CSS styling, file structure).

## 4. Unit Movement

### 4.1 Requirements

*   **Selection:** Users can select a unit by clicking on it.
*   **Movement Range Display:** Upon selection, valid movement tiles within the unit's `movementRemaining` should be highlighted.
*   **Path Preview:** Hovering over a valid destination tile should display the computed path and its total movement cost.
*   **Combat Preview:** If a path ends on a tile with an enemy unit/city, a combat preview (e.g., damage estimates, outcome) should be shown.
*   **Movement Execution:** Clicking on a valid destination tile (or confirming combat) should dispatch an `ISSUE_MOVE` action.
*   **Cancellation:** Users can cancel unit selection and path preview.
*   **Visual Feedback:** Units should visually move along the path.

### 4.2 Acceptance Criteria

*   **AC-UM-001:** When a unit is selected, tiles within its movement range are visually highlighted.
*   **AC-UM-002:** Hovering over a highlighted tile displays a visual path from the selected unit to that tile, along with the movement cost.
*   **AC-UM-003:** If the hovered tile contains an enemy, a combat preview is displayed.
*   **AC-UM-004:** Dispatching `ISSUE_MOVE` with a valid path moves the unit to the destination, updates `movementRemaining`, and clears selection/preview.
*   **AC-UM-005:** Dispatching `ISSUE_MOVE` to an enemy-occupied tile without `confirmCombat: true` results in the move being aborted.
*   **AC-UM-006:** Clicking outside the map or pressing ESC cancels unit selection and clears any path preview.

### 4.3 Actionable Tasks

*   **Task-UM-001:** Enhance `uiReducer` to manage `UnitState.Selected` and `UnitState.Moved` more robustly, ensuring proper visual feedback.
*   **Task-UM-002:** Implement `MovementRangeOverlay` component (e.g., in `src/components/game/unit/`) to render highlighted tiles based on `unit.movementRemaining` and `computePath` results.
*   **Task-UM-003:** Implement `PathPreviewOverlay` component to render the computed path (e.g., arrows, colored tiles).
*   **Task-UM-004:** Implement `CombatPreviewOverlay` component to display combat details when applicable.
*   **Task-UM-005:** Modify `src/scene/scene.tsx` to handle click and hover events for units and tiles, dispatching `SELECT_UNIT` and `PREVIEW_PATH` actions.
*   **Task-UM-006:** Update `ISSUE_MOVE` action payload to include `confirmCombat` flag and ensure `uiReducer` correctly handles it.
*   **Task-UM-007:** Add unit tests for `MovementRangeOverlay`, `PathPreviewOverlay`, and `CombatPreviewOverlay` components.
*   **Task-UM-008:** Add integration tests (Vitest/Playwright) for unit selection, path preview, and movement execution, including combat scenarios.

## 5. City Production Selection

### 5.1 Requirements

*   **Open City Panel:** Users can open a city's production panel (e.g., by clicking on a city).
*   **Display Available Items:** The city panel should list all units, buildings, and improvements available for production, based on researched technologies.
*   **Item Details:** Each item should display its cost, turns remaining (if in queue), and any special requirements (e.g., target tile).
*   **Select Production Item:** Users can select an item to add it to the city's production queue.
*   **Target Tile Selection:** If an improvement requires a target tile, the UI should prompt the user to select a valid tile on the map.
*   **Queue Management:** Users can view, reorder, and cancel items in the production queue.

### 5.2 Acceptance Criteria

*   **AC-CPS-001:** Clicking a city dispatches `OPEN_CITY_PANEL` and displays the city production panel.
*   **AC-CPS-002:** The city panel correctly lists only production items available to the player (based on `playerState.researchedTechs`).
*   **AC-CPS-003:** Selecting a production item dispatches `CHOOSE_PRODUCTION_ITEM` and adds it to the city's `productionQueue`.
*   **AC-CPS-004:** If a selected improvement requires a target tile, the UI enters a "target selection mode" and stores the chosen tile in the `CHOOSE_PRODUCTION_ITEM` payload.
*   **AC-CPS-005:** Reordering items in the UI dispatches `REORDER_PRODUCTION_QUEUE` (new action) and updates the `productionQueue`.
*   **AC-CPS-006:** Canceling an item in the UI dispatches `CANCEL_PRODUCTION_ORDER` (new action) and removes it from the `productionQueue`.

### 5.3 Actionable Tasks

*   **Task-CPS-001:** Implement `CityPanel` component (e.g., in `src/components/ui/city-panel/`) to display production items and queue.
*   **Task-CPS-002:** Enhance `playerReducer` to handle `REORDER_PRODUCTION_QUEUE` and `CANCEL_PRODUCTION_ORDER` actions.
*   **Task-CPS-003:** Implement logic within `CityPanel` to filter available production items based on `playerState.researchedTechs` and `techCatalog`.
*   **Task-CPS-004:** Develop a "target tile selection mode" (e.g., a new UI state in `draft.ui`) that activates when an improvement requiring a tile is chosen.
*   **Task-CPS-005:** Modify `src/scene/scene.tsx` to handle clicks on cities to dispatch `OPEN_CITY_PANEL`.
*   **Task-CPS-006:** Add unit tests for `CityPanel` and its interaction with `playerReducer`.
*   **Task-CPS-007:** Add integration tests for opening the city panel, selecting production, and queue management.

## 6. Research Selection

### 6.1 Requirements

*   **Open Research Panel:** Users can open the research panel (e.g., via a button in the TopBar).
*   **Display Available Technologies:** The research panel should display the technology tree, highlighting available, researching, and researched technologies.
*   **Tech Details:** Each technology should display its cost, prerequisites, unlocks, and current progress (if researching).
*   **Select Research Target:** Users can select an available technology to begin researching it.
*   **Queue Research:** Users can queue multiple technologies for research.
*   **Switch Research Policy:** Users can define how research progress is handled when switching technologies (e.g., `preserveProgress` or `discardProgress`).

### 6.2 Acceptance Criteria

*   **AC-RS-001:** Clicking the research button dispatches `OPEN_RESEARCH_PANEL` and displays the research panel.
*   **AC-RS-002:** The research panel visually distinguishes between available, researching, and researched technologies.
*   **AC-RS-003:** Selecting an available technology dispatches `SET_RESEARCH` and updates `playerState.researching`.
*   **AC-RS-004:** Queuing a technology dispatches `QUEUE_RESEARCH` and adds it to `playerState.researchQueue`.
*   **AC-RS-005:** Switching research policy dispatches `SWITCH_RESEARCH_POLICY` (new action) and updates `playerState.researchPolicy`.
*   **AC-RS-006:** Attempting to research a technology with unmet prerequisites displays a clear error or tooltip.

### 6.3 Actionable Tasks

*   **Task-RS-001:** Implement `ResearchPanel` component (e.g., in `src/components/ui/research-panel/`) to display the tech tree and research controls.
*   **Task-RS-002:** Enhance `playerReducer` to handle `SWITCH_RESEARCH_POLICY` action and implement the chosen policy.
*   **Task-RS-003:** Implement logic within `ResearchPanel` to determine and display the status of each technology (available, researching, researched, locked).
*   **Task-RS-004:** Add visual indicators for prerequisites and unlocks within the `ResearchPanel`.
*   **Task-RS-005:** Modify `src/components/ui/TopBar.tsx` to include a button for dispatching `OPEN_RESEARCH_PANEL`.
*   **Task-RS-006:** Add unit tests for `ResearchPanel` and its interaction with `playerReducer`.
*   **Task-RS-007:** Add integration tests for opening the research panel, selecting research, and queue management.

## 7. New Actions and Schema Updates

The following new actions will be required:

*   `REORDER_PRODUCTION_QUEUE`: `{ cityId: string, newQueue: ProductionOrder[] }`
*   `CANCEL_PRODUCTION_ORDER`: `{ cityId: string, orderIndex: number }`
*   `SWITCH_RESEARCH_POLICY`: `{ playerId: string, policy: 'preserveProgress' | 'discardProgress' }`

These new actions will need to be added to `schema/action.schema.ts` and integrated into the `GameActionSchema` discriminated union.

## 8. Testing Strategy

*   **Unit Tests:** For all new React components (e.g., `MovementRangeOverlay`, `CityPanel`, `ResearchPanel`) to verify rendering, state mapping, and event dispatching.
*   **Integration Tests:** Using Vitest to simulate user interactions (clicks, hovers) and assert state changes and dispatched actions.
*   **End-to-End (E2E) Tests:** Using Playwright to cover critical user flows (e.g., select unit -> move -> confirm combat; open city panel -> queue production -> advance turn -> assert production completion).

## 9. Dependencies

*   Existing `GameProvider`, `useGame` hook, and `applyAction` reducer.
*   `computePath` from `src/game/pathfinder.ts`.
*   `extensionMoveUnit`, `foundCity`, `getItemCost`, `getCityYield` from `src/game/content/rules.ts`.
*   `UNIT_TYPES` from `src/game/content/registry.ts`.
*   `leadersCatalog` from `src/data/leaders.json`.
*   `globalGameBus` for event emission.
*   Zod for action schema validation.

## 10. Future Considerations

*   More complex combat resolution UI.
*   Advanced pathfinding options (e.g., "move to here and fortify").
*   Visual feedback for city growth and resource yields.
*   Accessibility enhancements for all new UI elements.
