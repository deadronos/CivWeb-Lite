# [TASK-047..049] HUD accessibility, keyboard focus tests & city targetTileId

**Status:** Not Started

**Added:** 2025-09-12

**Owner suggestion:** frontend

## Original request

UI elements exist but accessibility scans, keyboard-focus tests, and some UX flows (city production targeting using `targetTileId`) need finishing and tests.

## Goal

- Add automated accessibility scans (axe) into Playwright smoke or Vitest.
- Add keyboard-focus tests for TopBar, NextTurnControl, and GameHUD interactions.
- Implement and test `targetTileId` internal format in `src/components/ui/city-panel-container.tsx` so city production targeting behaves consistently.

## Acceptance criteria

- A Playwright or Vitest that runs axe-core accessibility scan for the HUD page/panel and asserts no severe violations.
- Keyboard-focus tests that cover tab order and focus states for TopBar & NextTurnControl.
- `src/components/ui/city-panel-container.tsx` implements `targetTileId` internal format (documented in code) and unit tests cover the target selection flow.

## Implementation notes

- Prefer Playwright for full-page accessibility snapshot; Vitest + @testing-library/react can validate component-level focus behavior.
- Respect existing aria roles and use role-based selectors in Playwright.

## Tasks

- [ ] Add `playwright/tests/hud-accessibility.spec.ts` or `tests/hud-accessibility.test.tsx` (Vitest) with axe scans.
- [ ] Add keyboard-focus tests for TopBar & NextTurnControl.
- [ ] Implement `targetTileId` storage format in `src/components/ui/city-panel-container.tsx` and unit tests.

## ETA

- 1–2 days depending on Playwright setup.
