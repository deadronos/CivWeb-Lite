# UI Interactions Implementation Plan

This plan describes how to implement the UI interaction flows defined in `spec/ui-interactions.spec.md` for unit movement, city production selection, and research selection. It is organized into phases, with concrete file targets, tests, and rollout steps.

Goals
- Provide small, testable increments that connect UI components to the game state in `GameProvider`.
- Keep changes non-invasive: add components and hooks rather than refactor major systems.

Non-goals
- Full combat simulation, AI decision-making, or networking multiplayer. Keep single-player deterministic first.

Phases

Phase 1 — scaffolding & types (2–4 hours)
- Add TypeScript types and payload definitions used by UI events.
- Files to create/update:
  - `src/game/types/ui.ts` — new file with interfaces for UnitMovePayload, ProductionOrder, ResearchOrder.
  - `src/game/GameProvider.tsx` — add handlers to forward UI events to state reducers (stubs).
  - `src/components/UnitSelectionOverlay.tsx` — component scaffold.
  - `src/components/CityPanel.tsx` — empty panel scaffold.
  - `src/components/ResearchPanel.tsx` — empty panel scaffold.
- Tests:
  - `tests/ui.unit-selection.test.ts` — selection overlay uses types and can mount shallow.

Phase 2 — unit movement (4–8 hours)
- Implement path preview and issueMove handlers and wire to `GameProvider`.
- Files to edit/add:
  - `src/game/pathfinder.ts` — simple A* using tiles movement costs (create if not present).
  - `src/game/GameProvider.tsx` — implement `previewPath` and `issueMove` reducers, update unit state.
  - `src/components/UnitSelectionOverlay.tsx` — show range and path, emit events.
  - `tests/unitMovement.test.ts` — tests: selection, path preview, issueMove updates state.
- Acceptance:
  - MovementRemaining updates correctly, unit.location updated, and UI uses authoritative state.

Phase 3 — city production (4–8 hours)
- Implement city panel and production queue logic with tile-targeting for improvements.
- Files to edit/add:
  - `src/game/city.ts` — helper functions for production tick and queue management.
  - `src/components/CityPanel.tsx` — UI for choosing items, tile target selection overlay.
  - `tests/cityProduction.test.ts` — tests for queueing, target tile selection, and completion.
- Acceptance:
  - Queueing an improvement with targetTileId is stored; production consumes productionPerTurn and spawns improvements/units.

Phase 4 — research selection (2–4 hours)
- Implement ResearchPanel and connect research actions to playerState.
- Files to edit/add:
  - `src/game/research.ts` — research tick logic and queue handling.
  - `src/components/ResearchPanel.tsx` — UI showing tech tree simple list.
  - `tests/research.test.ts` — tests for starting/completing research and unlocks applying.

Phase 5 — polish, keyboard shortcuts, mobile touch (3–6 hours)
- Add keyboard handlers (Tab/WASD/Arrows/M), touch gestures, and HUD integration (topbar quick actions).
- Add integration tests or Playwright tests if needed.

Guidelines & coding patterns
- Keep UI components dumb where possible and push logic into `GameProvider` or small helper modules so testing is simple.
- Use TypeScript types from `src/game/types` and lean on existing `useGame()` hooks.
- Provide clear acceptance tests for each feature added.

Minimal data model additions (example `src/game/types/ui.ts`)

```ts
export interface UnitMovePayload { unitId: string; path: string[]; confirmCombat?: boolean }
export interface ProductionOrder { type: 'unit'|'improvement'|'building'; itemId: string; targetTileId?: string }
export interface ResearchOrder { techId: string }
```

Developer tasks checklist (one task per PR)

1. Create UI types and scaffolds (Phase 1)
2. Implement pathfinder + preview logic and unit movement (Phase 2)
3. Implement city production queue with target tile selection (Phase 3)
4. Implement research panel and wiring (Phase 4)
5. Add keyboard/touch handlers and polish (Phase 5)

Estimate summary
- Total estimated time for MVP: ~15–30 hours depending on scope and polishing.

Try it / quick run
- After Phase 1 & 2 you can run the dev server and click a unit to see the selection overlay. Use the existing `npm run dev` workflow.

Risks & mitigations
- Risk: Pathfinding complexity — mitigate by indexing tiles and caching movement costs.
- Risk: Many UI states to sync — mitigate by using single `GameProvider` authoritative state and emitting only intent events from UI.

Deliverables
- `spec/ui-interactions.spec.md` (created)
- `plan/ui-interactions-implementation-plan.md` (this file)
- Implementation PRs that follow the tasks checklist

End of plan
