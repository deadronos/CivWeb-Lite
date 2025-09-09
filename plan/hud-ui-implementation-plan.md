# HUD & UI Implementation Plan

This plan implements the `UI & HUD Requirements` from `spec/spec-architecture-civweb-lite-core.md`.
It breaks work into small, testable steps with owners, acceptance criteria, and deliverables.

## Goal

Ship a presentational, accessible HUD (TopBar, LeftPanel, NextTurnControl, Minimap, ContextPanel)
that integrates with `useGame()` and satisfies the acceptance criteria (AC-HUD-001..AC-HUD-005).

## Success Criteria

- All AC-HUD-* acceptance criteria pass via unit/integration/E2E tests.

- Components live under `src/components/ui/` and are presentational (no simulation side-effects).

- Accessibility: basic axe-core checks for the HUD layout pass with no critical violations.

- No import-time side-effects (heavy validators lazy-initialized when needed).

- Tests and linting pass in CI.

## High-level Milestones

1. Scaffolding (components + styles)

2. TopBar & ResourceBadge implementation + unit tests

3. NextTurnControl implementation + integration test for endTurn

4. LeftPanel (research) implementation + unit tests

5. Minimap + camera-centering integration + E2E test

6. ContextPanel implementation + integration tests

7. Accessibility scans + responsive tweaks

8. CI wiring and final verification

## Deliverables

- `src/components/ui/TopBar.tsx` (+ `TopBar.test.tsx`)

- `src/components/ui/ResourceBadge.tsx` (+ tests)

- `src/components/ui/NextTurnControl.tsx` (+ integration test `nextturn.integration.test.ts`)

- `src/components/ui/LeftPanel.tsx` (+ tests for changing research target)

- `src/components/ui/Minimap.tsx` (+ E2E test to assert camera-centering)

- `src/components/ui/ContextPanel.tsx` (+ tests)

- docs: short README describing HUD components and required hooks (`plan/hud-ui-implementation-plan.md`)

## Detailed Tasks

### 1. Scaffolding (1-2 hours)

- Create `src/components/ui/` directory if missing.

- Add component skeletons exporting small presentational props.

- Add basic CSS variables (design tokens) to `src/styles/hud.css` or integrate into `src/styles.css`.

- Add storybook entries (optional).

Acceptance: components compile; basic smoke tests mount each component.

### 2. TopBar + ResourceBadge (2-3 hours)

- Implement `TopBar` to accept `turn: number` and `resources: Record<string, number>` props and read from `useGame()` via a small wrapper `TopBarContainer` for production wiring.

- Implement `ResourceBadge` for per-resource display and delta.

- Unit tests: render TopBar with mocked `useGame()` and assert DOM contains turn and a resource badge.

Acceptance: AC-HUD-001 satisfied by unit test.

### 3. NextTurnControl (2 hours)

- Implement `NextTurnControl` with keyboard-focus, ARIA attributes, and callback prop `onNextTurn()`.

- Integration test: mount a small provider that exposes `endTurn()` and ensure clicking the control or pressing Enter when focused calls `endTurn()`.

Acceptance: AC-HUD-002 satisfied.

### 4. LeftPanel (research) (4 hours)

- Implement `LeftPanel` that lists tech nodes (a subset) and shows progress for the human player.

- Allow selecting a tech and call `dispatch({type: 'SET_RESEARCH', payload:{techId}})` via `useGame()`.

- Unit test: confirm selection updates the provider mock state.

Acceptance: AC-HUD-004 satisfied.

### 5. Minimap + Camera Centering (3-4 hours)

- Implement `Minimap` that renders a small canvas/svg overview of the map.

- Integrate with `useCamera()` or `window` camera controller hook (if not present, implement a minimal `useCamera()` that wraps a callback `centerOn(coord)` to leave rendering details in scene code).

- E2E Playwright test: open app, click minimap, assert camera moved to expected coordinates.

Acceptance: AC-HUD-003 satisfied.

### 6. ContextPanel (3 hours)

- Implement `ContextPanel` to show details for selected tile/city and render actions that call `useGame().dispatch()`.

- Integration tests: select a tile in mocked provider and assert the panel renders actions; simulate button click and assert dispatch was invoked.

Acceptance: AC-HUD-005 satisfied.

### 7. Accessibility & Responsiveness (2-3 hours)
- Run axe-core scans on rendered HUD components and fix any critical issues.
- Ensure color tokens meet contrast (use tokens in CSS variables: `--color-bg`, `--color-fg`, `--accent`).
- Add keyboard focus order tests for TopBar → LeftPanel toggle → NextTurnControl → Minimap → ContextPanel.

Acceptance: axe shows no critical violations; keyboard navigation test passes.

### 8. CI and Final Verification (1-2 hours)
- Add tests to `tests/` and ensure `npm test` passes locally and in CI.
- Confirm linting and typecheck pass.

Acceptance: All tests pass in CI; PR ready.

## Risks & Mitigations
- Risk: Import-time side-effects from third-party validators or heavy libs. Mitigation: use runtime/lazy helpers (already introduced for AJV in `src/game/save/validator.ts`).
- Risk: Tight coupling between HUD and scene. Mitigation: keep camera control abstracted in `useCamera()`.
- Risk: Performance — too many re-renders. Mitigation: memoize resource badges and use `React.memo` where needed.

## Estimated Timeline
Total: ~18-24 hours of focused development (spread across multiple days). Prioritize TopBar + NextTurnControl + LeftPanel as an MVP (first 2–3 days).

## Owner & Review
- Primary implementer: [you / team].
- Reviewer: repo owner (`deadronos`) or assigned reviewer.

## Next Steps (immediate)
- Create component skeleton files and minimal unit tests for `TopBar` and `NextTurnControl`.
- Open a small PR with the skeletons + tests.

---
Plan created on 2025-09-09.
