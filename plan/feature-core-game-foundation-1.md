---
goal: Implement core CivWeb-Lite game foundation (map, turn engine, tech, AI, save/load) per specification REQs
version: 1.0
date_created: 2025-09-08
last_updated: 2025-09-08
owner: deadronos
status: In Progress
tags: [feature, game, foundation, architecture, implementation-plan]
---

# Introduction

## Source File Structure (Authoritative)

The repository follows a canonical `src/` layout. All new source files should be placed according to this structure. If you need to diverge, open a short proposal and update this plan and the spec with the rationale.

```text
src/
├── assets/
│   └── # Images, sounds, and other media
├── components/
│   ├── ui/
│   │   └── # Reusable UI elements like Button.tsx, Modal.tsx, etc.
│   └── game/
│       └── # Game-specific components like CityInfo.tsx, UnitSprite.tsx
├── constants/
│   └── # Game constants, like technology costs or unit stats
├── contexts/
│   └── GameProvider.tsx  # Central state management
├── hooks/
│   └── # Custom hooks, e.g., useGame.ts to access game state
├── scenes/
│   ├── GameScene.tsx     # The main game view
│   └── MainMenu.tsx    # A main menu, for example
├── styles/
│   └── # Global and shared styles
├── types/
│   └── index.ts          # TypeScript interfaces for game objects (e.g., City, Unit)
├── game-logic/
│   ├── systems/
│   │   └── # Core game systems, e.g., technology.ts, combat.ts
│   └── utils/
│       └── # Helper functions
├── App.tsx
└── main.tsx
```


![Status: In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

This implementation plan operationalizes the requirements (REQ-001..REQ-020, SEC-001..SEC-003, PER-001..PER-003, CON/GUD/PAT) defined in `spec/spec-architecture-civweb-lite-core.md` into deterministic, atomic tasks with explicit dependencies, validation criteria, and deliverables. Execution order enforces foundational purity (state & RNG) before higher-level features (AI, persistence, UI). All tasks are designed for autonomous execution by an agent or human without further interpretation.

## 1. Requirements & Constraints

- **REQ-001** Map generation (configurable size/seed)
- **REQ-002** ≥ 6 biomes & assignment rules
- **REQ-003** Turn counter management
- **REQ-004** Human 0..1 + N AI players / AI-only mode
- **REQ-005** Leader personalities (weighted prefs)
- **REQ-006** Dual tech trees (science & culture)
- **REQ-007** JSON save & restore full state
- **REQ-008** Deterministic evolution
- **REQ-009** Read-only game state via `useGame()`
- **REQ-010** JSON validation on load
- **REQ-011** AI turn performance budget
- **REQ-012** Auto-sim advance
- **REQ-013** UI metrics panel
- **REQ-014** Pause auto-sim
- **REQ-015** Export save (file)
- **REQ-016** Import save (file/drag)
- **REQ-017** Schema versioning
- **REQ-018** Seed display/regeneration
- **REQ-019** Separation of simulation & rendering
- **REQ-020** Structured events/logs
- **SEC-001** Validate/sanitize save JSON
- **SEC-002** Pure data only
- **SEC-003** Save size guard
- **PER-001** Turn logic time constraints
- **PER-002** Rendering optimization (memo/instancing)
- **PER-003** 100x100 interaction target
- **CON-001..003**, **GUD-001..005**, **PAT-001..005** applied across tasks.

## 2. Implementation Steps

### Implementation Phase 1
- GOAL-001: Establish core types, immutable state model, seedable RNG, event bus, and basic GameProvider scaffolding (foundation for deterministic simulation). Covers REQ-008, REQ-009, REQ-019, PAT-001, PAT-003.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `src/game/types.ts` defining GameState, Tile, PlayerState, TechNode, enums (no logic) | ✅ | 2025-09-08 |
| TASK-002 | Implement `src/game/rng.ts` deterministic RNG wrapper (seed in, next() pure) | ✅ | 2025-09-08 |
| TASK-003 | Implement `src/game/events.ts` minimal typed event emitter (turn:start, turn:end, action:applied) | ✅ | 2025-09-08 |
| TASK-004 | Implement immutable state helper `produceNextState(current, mutator)` (shallow structural sharing) | ✅ | 2025-09-08 |
| TASK-005 | Scaffold `GameProvider` context returning `{ state, dispatch }` with initial empty state + seed placeholder | ✅ | 2025-09-08 |
| TASK-006 | Add `useGame()` hook exposing read-only state (Object.freeze) + dispatch wrapper | ✅ | 2025-09-08 |
| TASK-007 | Add unit tests for RNG determinism & event bus (Vitest) | ✅ | 2025-09-08 |
| TASK-008 | Add ESLint rule/config (if absent) to prevent direct Math.random() in `src/game` | ✅ | 2025-09-08 |

All tasks in Phase 1 are complete. No remaining items.

### Implementation Phase 2
- GOAL-002: World generation system (map + biome assignment) meeting REQ-001, REQ-002, PAT-005.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Create `src/game/world/config.ts` with biome definitions & thresholds | ✅ | 2025-09-08 |
| TASK-010 | Implement axial coordinate utilities `hex.ts` (distance, neighbors) | ✅ | 2025-09-08 |
| TASK-011 | Implement `generateWorld(seed, width, height)` producing tiles with biome/elevation/moisture | ✅ | 2025-09-08 |
| TASK-012 | Integrate world generation into initial GameState (GameProvider init) | ✅ | 2025-09-08 |
| TASK-013 | Add statistical test verifying ≥5 biome presence for 30x30 default | ✅ | 2025-09-08 |
| TASK-014 | Add performance benchmark capturing generation time (baseline log) | ✅ | 2025-09-08 |
| TASK-015 | Expose seed & map dimensions via UI stub (no styling) | ✅ | 2025-09-08 |

All tasks in Phase 2 are complete. Proceed to Phase 3 for turn engine work.

### Implementation Phase 3
- GOAL-003: Turn engine & action dispatch orchestration (REQ-003, REQ-012, REQ-019, PAT-002).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-016 | Define `GameAction` types in `actions.ts` (END_TURN, SET_RESEARCH, ADVANCE_RESEARCH, AUTO_SIM_TOGGLE) | ✅ | 2025-09-09 |
| TASK-017 | Implement reducer `applyAction(state, action, rng)` pure function | ✅ | 2025-09-09 |
| TASK-018 | Implement turn advancement pipeline (collect AI actions placeholder, then increment turn) | ✅ | 2025-09-09 |
| TASK-019 | Auto-sim loop (interval / requestAnimationFrame) gated by state.mode + pause flag | ✅ | 2025-09-09 |
| TASK-020 | Emit events turn:start, turn:end with payload | ✅ | 2025-09-09 |
| TASK-021 | Hook perf instrumentation measuring per-turn ms (console/log buffer) | ✅ | 2025-09-09 |
| TASK-022 | Add tests: turn increments & immutability verification | ✅ | 2025-09-09 |

### Implementation Phase 4
- GOAL-004: Tech trees & progression (REQ-006, PAT-001, data-driven config).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-023 | Create `src/game/tech/techCatalog.ts` static array for science + culture nodes | ✅ | 2025-09-08 |
| TASK-024 | Implement dependency validation (cycle detection) at init (throw/log error) | ✅ | 2025-09-08 |
| TASK-025 | Add research progress logic in reducer (ADVANCE_RESEARCH) | ✅ | 2025-09-08 |
| TASK-026 | Add auto progress accumulation per turn (e.g., points → tech progress) | ✅ | 2025-09-08 |
| TASK-027 | Event emission `tech:unlocked` | ✅ | 2025-09-08 |
| TASK-028 | Unit tests: unlock order, prerequisite enforcement, cycle detection | ✅ | 2025-09-08 |

### Implementation Phase 5
- GOAL-005: AI players & leader personalities (REQ-004, REQ-005, REQ-011, PAT-004, PER-001 baseline).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-029 | Define `LeaderPersonality` configs (default set: Scientist, Culturalist, Expansionist, Balanced) | ✅ | 2025-09-08 |
| TASK-030 | Implement AI decision evaluation function returning array of GameActions | ✅ | 2025-09-08 |
| TASK-031 | Integrate AI decision execution into turn pipeline (Phase 3 hook) | ✅ | 2025-09-09 |
| TASK-032 | Add micro-benchmark measuring average AI decision ms across 5 players |  |  |
| TASK-033 | Adjust heuristics to meet ≤50 ms requirement (optimize) |  |  |
| TASK-034 | Unit tests: AI selects valid actions; no mutation side-effects | ✅ | 2025-09-08 |

### Implementation Phase 6
- GOAL-006: Save/load JSON system + schema & validation (REQ-007, REQ-010, REQ-015, REQ-016, REQ-017, SEC-001..SEC-003).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-035 | Define JSON schema file `schema/save.schema.json` | ✅ | 2025-09-08 |
| TASK-036 | Implement `serializeState(state)` producing minimal JSON (exclude transient) | ✅ | 2025-09-08 |
| TASK-037 | Implement `deserializeState(json)` with validation & version compatibility check | ✅ | 2025-09-08 |
| TASK-038 | Implement load error types (VersionMismatch, ValidationError, SizeExceeded) | ✅ | 2025-09-08 |
| TASK-039 | Add file export utility (Blob & download) | ✅ | 2025-09-08 |
| TASK-040 | Add file import + drag-drop handler (UI component) | ✅ | 2025-09-08 |
| TASK-041 | Add size guard (2 MB) + rejection message | ✅ | 2025-09-08 |
| TASK-042 | Roundtrip tests (serialize → deserialize → deep compare) | ✅ | 2025-09-08 |
| TASK-043 | Malformed JSON tests (missing tiles, wrong version) | ✅ | 2025-09-08 |
| TASK-044 | Add schema version constant & compatibility strategy doc comment | ✅ | 2025-09-08 |

### Implementation Phase 7
- GOAL-007: UI controls & metrics (REQ-013, REQ-014, REQ-018, REQ-020, PER-002 instrumentation).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-045 | Implement `GameHUD` component (turn, seed, mode, pause toggle, save/load buttons) | ✅ | 2025-09-08 |
| TASK-046 | Implement seed regeneration action (rebuild world) confirming user prompt | ✅ | 2025-09-08 |
| TASK-047 | Display tech progress summary (current research + % ) |  |  |
| TASK-048 | Display AI performance average (ms) if instrumentation enabled |  |  |
| TASK-049 | Event log panel (last N events) |  |  |
| TASK-050 | Accessibility pass (labels, roles) baseline |  |  |

### Implementation Phase 8
- GOAL-008: Performance, determinism & quality gates (REQ-008, PER-001..PER-003, GUD enforcement).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-051 | Deterministic replay harness (record action list; re-run compare hash) |  |  |
| TASK-052 | Benchmark script (map sizes: 30x30, 50x50, 100x100) log turn ms |  |  |
| TASK-053 | Memoize map tile mesh components (React.memo) |  |  |
| TASK-054 | Introduce instanced mesh rendering for tiles |  |  |
| TASK-055 | Add CI workflow (install, typecheck, test, build) |  |  |
| TASK-056 | Add coverage threshold config (≥80% for `src/game`) |  |  |
| TASK-057 | Add Playwright smoke test (start game, advance 2 turns, save, load) |  |  |
| TASK-058 | Add axe-core accessibility scan integration |  |  |

### Implementation Phase 9
- GOAL-009: Future-ready scaffolding & documentation (REQ-020 logging depth, PAT extensibility).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-059 | Structured logging module (in-memory ring buffer) |  |  |
| TASK-060 | Developer doc `docs/state-architecture.md` summarizing patterns & invariants |  |  |
| TASK-061 | Add TODO registry for FUT-* placeholders |  |  |
| TASK-062 | Refactor any duplicated logic discovered in prior phases |  |  |
| TASK-063 | Post-implementation spec delta review; update spec if drift |  |  |

## 3. Alternatives

- **ALT-001**: Use mutable in-place state instead of immutable snapshots (rejected: harder deterministic replay & undo).
- **ALT-002**: Grid square tiles instead of hex (rejected: civ-like aesthetics & adjacency complexity not aligned).
- **ALT-003**: JSON diff log persistence vs full snapshot (rejected initial complexity; may revisit for large saves).
- **ALT-004**: WebWorker offloading early (deferred until performance proves insufficient).

## 4. Dependencies

- **DEP-001** Phase 1 must complete before any other phase.
- **DEP-002** Phase 2 depends on RNG (TASK-002) & types (TASK-001).
- **DEP-003** Phase 3 depends on Phase 1 & world existing (TASK-012) for turn actions referencing tiles.
- **DEP-004** Phase 4 depends on baseline turn engine (TASK-017/018).
- **DEP-005** Phase 5 depends on turn engine (TASK-018) & tech system (for informed AI decisions) optional.
- **DEP-006** Phase 6 depends on full state shape (Phases 1-5).
- **DEP-007** Phase 7 depends on prior phases exposing metrics & actions.
- **DEP-008** Phase 8 depends on systems implemented earlier for measurement.
- **DEP-009** Phase 9 depends on event/logging hooks from earlier phases.

## 5. Files

- **FILE-001** `src/game/types.ts` — Core TypeScript interfaces/enums
- **FILE-002** `src/game/rng.ts` — Seedable RNG
- **FILE-003** `src/game/events.ts` — Event emitter
- **FILE-004** `src/game/world/*` — World generation modules
- **FILE-005** `src/game/actions.ts` — Action definitions
- **FILE-006** `src/game/reducer.ts` — Pure state transition logic
- **FILE-007** `src/game/tech/*` — Tech catalog & progression logic
- **FILE-008** `src/game/ai/*` — AI heuristics
- **FILE-009** `src/game/save/*` — Serialize/deserialize & schema
- **FILE-010** `schema/save.schema.json` — JSON schema
- **FILE-011** `src/components/GameHUD.tsx` — UI panel
- **FILE-012** `tests/*` — Vitest unit/integration tests
- **FILE-013** `playwright/tests/*` — E2E tests
- **FILE-014** `docs/state-architecture.md` — Architecture summary

## 6. Testing

- **TEST-001** RNG determinism (same seed → identical sequence)
- **TEST-002** World biome coverage test (≥5 biomes) 
- **TEST-003** Turn increment & immutability test
- **TEST-004** Tech unlock order & dependency enforcement
- **TEST-005** AI decision validity & performance benchmark assertion
- **TEST-006** Save/load roundtrip deep equality
- **TEST-007** Malformed save rejection (schema violations)
- **TEST-008** Deterministic replay hash comparison
- **TEST-009** Performance: average turn ≤ 50 ms (benchmark harness)
- **TEST-010** Playwright smoke: start → advance → save → load
- **TEST-011** Accessibility scan baseline (axe)
- **TEST-012** Coverage threshold enforcement

## 7. Risks & Assumptions

- **RISK-001** Performance regression on large map due to React re-renders (Mitigate: instancing + memo tasks 053–054).
- **RISK-002** Non-determinism from external libs (Mitigate: wrap RNG + isolate side-effects).
- **RISK-003** JSON size growth (Mitigate: exclude transient fields; consider compression later).
- **RISK-004** AI complexity creep (Mitigate: weight-based heuristics only initially).
- **RISK-005** Tech tree cycle missed (Mitigate: TASK-024 validation fails fast).
- **ASSUMPTION-001** Single-thread performance sufficient; no WebWorkers needed initially.
- **ASSUMPTION-002** Users accept local-only persistence for MVP.
- **ASSUMPTION-003** Instanced rendering feasible for tile count (verify Phase 8).

## 8. Related Specifications / Further Reading

- `spec/spec-architecture-civweb-lite-core.md`
- Planned: `spec-design-ai-decision-engine.md`
- Planned: `spec-data-tech-tree-schema.md`
- Planned: `spec-process-testing-strategy.md`

## Review summary (autonomous review on 2025-09-08)

What I inspected

- Verified the implementation plan structure, task lists for Phases 1–9, and the explicit mapping of requirements (REQ-*) to phase goals.
- Cross-checked that Phase 1–6 tasks are marked completed in the plan and that the save schema and tests entries exist.

High-level status

- Core types, RNG, event bus, immutable helpers, GameProvider scaffold, world generation, basic turn engine, tech system, save/load, and many unit tests are documented as completed.
- Several engineering and UX items remain uncompleted or marked blank (noted as open below): AI micro-benchmarks and optimization (TASK-032/033), HUD detail panels (TASK-047..049), deterministic replay harness (TASK-051), larger performance and rendering optimizations (TASK-052..054), CI / coverage enforcement (TASK-055..056), E2E smoke (TASK-057), and documentation/logging tasks in Phase 9.

Quick risk re-evaluation

- AI performance (REQ-011) remains unverified: TASK-032 and TASK-033 are required to ensure AI meets the ≤50ms per-turn budget. This is a gating risk for larger maps and multi-AI games.
- Deterministic replay (TASK-051) is important for REQ-008 and debugging; without it, reproducing non-deterministic failures will be harder.
- Performance tasks (instancing/memoization) should be scheduled before increasing default map sizes to 100x100 (PER-003).

Open items and next steps (prioritized)

1. AI performance benchmark & optimizations (High priority)

- TASK-032: Add micro-benchmark harness for AI decision ms across representative leader counts (1, 3, 5) and map sizes (30x30, 50x50). Target: measure mean/median/95th percentile.
- TASK-033: If mean > 50ms, implement incremental optimizations: early-exit heuristics, cache evaluations, and limit number of considered actions per AI.

1. Deterministic replay & action recording (High priority)

- TASK-051: Implement action log recording (per-turn list) and a replay mode that replays actions against an isolated RNG to produce a deterministic final state. Add a small hash comparison test (e.g., JSON canonicalization + SHA-256) to assert equality between live run and replayed run.

1. HUD & UI metrics (Medium priority)

- TASK-047: Tech progress UI: expose current research and % progress in `GameHUD`.
- TASK-048: AI perf average: surface mean/median ms when instrumentation is enabled.
- TASK-049: Event log panel: simple in-memory ring buffer showing last N structured events.

1. Rendering & performance (Medium priority)

- TASK-052: Add benchmark script for map sizes (30x30, 50x50, 100x100) to log per-turn time and memory.
- TASK-053/TASK-054: Start with React.memo on tile components; if render still slows, implement instanced meshes for tiles (three.js / @react-three/fiber specific).

1. CI, tests, and E2E (Medium/low priority but important)

- TASK-055: Add a CI workflow (GitHub Actions) that runs install, typecheck, tests, and build. Include node version pinning (Node >= 18).
- TASK-056: Add coverage threshold for `src/game` once tests for all core features pass.
- TASK-057: Implement Playwright smoke test: start game, advance 2 turns, save, load, assert roundtrip.

1. Documentation & logging (Low priority)

- TASK-059/TASK-060: Add structured logging module and the `docs/state-architecture.md` file to document invariants and how deterministic RNG + immutable state are enforced.

Suggested owners and ETA (optional estimates)

- AI perf & replay: owner - core-engineer; ETA: 2–3 days to implement benchmarks and basic optimizations.
- HUD metrics & event log: owner - frontend; ETA: 1–2 days.
- Rendering/perf (instancing): owner - graphics engineer; ETA: 3–5 days depending on complexity.
- CI and E2E: owner - devops/tester; ETA: 1–2 days.

Acceptance checks before closing the plan

- AI: mean decision time ≤ 50ms for default 30x30 map with 4 AI players.
- Deterministic replay: replay-run hash matches live-run hash for randomized seeds tested (≥10 seeds).
- Save/load: roundtrip deep equality for canonicalized state JSON and schema validation.
- Performance: per-turn time for 30x30 ≤ 50ms, and reasonable scaling observed for 50x50.

Notes and caveats

- The plan intentionally defers WebWorker offload (ALT-004). If AI or turn processing fails to meet budgets even after heuristics, schedule Worker migration as an accelerated mitigation.
- The plan assumes tests and small harnesses run in CI on a machine comparable to dev environments; report CPU/time differences when benchmarking.

## Edits applied

- Added this "Review summary" and "Open items and next steps" to provide a developer-facing checklist for finishing Phase 5–9.

