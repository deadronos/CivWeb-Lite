# Progress

**What works:**

- `GameProvider` context, dispatch, and helper APIs are implemented (`src/contexts/game-provider.tsx`)
- Scene rendering with `@react-three/fiber` and a lazily-loaded `ConnectedScene` (`src/scene/scene.tsx`) is wired in `src/app.tsx`
- Basic UI and overlay exist; `MainMenu` and overlay UI are lazily loaded

**What's left to build:**

- Advanced HUD and UI interactions (TASK002)
- Polish and document the public GameProvider API and move test-only helpers to dedicated test utilities
- Performance optimizations and further content extension rules

**Current Status:**

- Refactor implemented in code; requires documentation updates and small polishing. See `memory-bank/tasks/TASK001-refactor-scene-and-game-provider.md`.

**Known Issues:**

- Some legacy code paths and test helpers exported from runtime modules should be rationalized to avoid bundle pollution
- HUD/UI not fully implemented

---

## Reconciliation summary (auto-generated 2025-09-12)

Purpose: align the authoritative plan (`plan/feature-core-game-foundation-1.md`) with the memory bank and record the small number of items that remain open and require follow-up.

Verified-complete (no action required unless regression found):

- Core types, RNG, event bus, immutable helpers, and `GameProvider` scaffolding (Phase 1)
- World generation & seed exposure (Phase 2)
- Turn engine, actions, reducer, and basic autosim instrumentation (Phase 3)
- Tech tree, dependency validation, and research progression (Phase 4)
- Save/load JSON schema, serialize/deserialize, and roundtrip tests (Phase 6)
- Most HUD elements and basic GameHUD wiring (Phase 7)

Needs follow-up (authoritative open items):

1. TASK-032 / TASK-033 — AI micro-benchmarks & optimizations
   - Why: AI decision function exists but micro-benchmarks across representative seeds/map-sizes have not been measured.

   - Next step: Add `scripts/ai-bench.ts` to run AI decision across seeds/map-sizes and emit mean/median/95th percentile metrics. If mean > 50ms, follow up with targeted optimizations (heuristic pruning, memoization).

2. TASK-051 — Deterministic replay harness verification
   - Why: replay is implemented in plan but needs automated verification against random seeds and CI.

   - Next step: Add a Vitest that runs N seeds, records actions, replays them against isolated RNG, and asserts final canonical hash equality.

3. TASK-052..054 — Performance benchmarks and rendering optimizations
   - Why: benchmarks and instancing are listed as complete, but we must confirm results and that instancing is wired for large maps.

   - Next step: Run `scripts/benchWorld.ts` for map sizes 30/50/100, record results to `docs/perf-bench-results.md`, and gate instancing behind a feature flag if needed.

4. TASK-047..049 & accessibility checks (HUD polish)
   - Why: UI is implemented but accessibility scans (axe), keyboard-focus tests, and small UX flows (city production targeting) need finishing.

   - Next step: Add axe-core scans in Playwright or Vitest, add keyboard focus tests for TopBar & NextTurnControl, and implement `targetTileId` internal format in `src/components/ui/city-panel-container.tsx` with unit tests.

5. TASK-055..057 — CI, coverage, and E2E stability
   - Why: CI/workflows exist but require validation for flaky tests and optional dependency issues.

   - Next step: Run CI workflow locally, fix install/test/build failures, and harden Playwright locators for stability.

How to mark items resolved

- For each "Needs follow-up" item, create a small PR that includes: (1) tests or benchmark harness, (2) a short doc summarizing results, and (3) a follow-up note in `plan/feature-core-game-foundation-1.md` referencing the PR.

Suggested owners & ETAs (rough)

- AI perf & replay: core-engineer — 2–3 days
- HUD metrics & accessibility: frontend — 1–2 days
- Rendering/instancing: graphics engineer — 3–5 days
- CI/E2E: devops/tester — 1–2 days

---

This file is authoritative for short-term progress notes and should be updated when the above follow-ups are completed (add PR links and dates).
