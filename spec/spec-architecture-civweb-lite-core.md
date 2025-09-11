---
title: CivWeb-Lite Core Architecture & Product Vision Specification
version: 1.0
date_created: 2025-09-08
last_updated: 2025-09-08
owner: deadronos
tags: [architecture, design, game, turn-based, react, threejs]
---

## Source File Structure (Authoritative)

The project follows a single canonical source file structure which should guide where new code and features are placed. Any proposed deviation from this layout must be documented and approved by the repository owner; if you must deviate, update this spec and the active implementation plan with the rationale.

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

Policy: This structure is the recommended default and should inform `src` layout for all new work. If a feature requires a different organization, open a short proposal, and upon approval, update this file and the relevant plan file to reflect the change.

# Introduction

This specification defines the high-level architecture, scope, requirements, data contracts, and testability expectations for "CivWeb-Lite" — a lightweight, Civilization‑inspired, turn‑based strategy web game built with TypeScript, React, @react-three/fiber (Three.js), and Vite. It focuses on clarity, determinism, modularity, and extensibility while remaining small enough for rapid iteration.

## 1. Purpose & Scope

The purpose of this document is to establish a shared, unambiguous foundation for implementing the core game loop, world representation, AI systems, technology progression, and persistence (save/load). Scope includes:

- Procedurally (or seed) generated hex tile world with multiple biomes.
- Turn-based progression with deterministic state advancement.
- Player vs AI and AI-only simulation modes.
- Leader personalities influencing AI decisions.
- Dual-path technology system (e.g., Science and Culture tracks) with unlock trees.
- JSON save/load system (localStorage or downloadable file).
- Lightweight rendering of a 3D hex map (isometric or free camera) using react-three-fiber.
- Extensible modular systems for future features (resources, diplomacy, cities, fog of war, combat).

Out of scope (initial version): networking/multiplayer, complex animations, full UI theming system, robust modding pipeline (may be future enhancements).

Assumptions:

- Single-process browser execution; no server authority initially.
- Deterministic pseudo-randomness achievable via seedable RNG.
- Performance target: smooth interaction on mid‑range laptop (≤ 5 ms average logic tick for standard map size: 50x50 hexes).

Audience: engineers, testers, AI assistance agents, technical stakeholders.

## 2. Definitions

| Term               | Definition                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Hex Tile           | Single cell in axial or offset coordinate hex grid representing terrain & biome.                |
| Biome              | Categorization of terrain (e.g., Grassland, Desert, Forest, Mountain, Ocean, Tundra).           |
| Game State         | Canonical immutable snapshot of entire simulation at a turn boundary.                           |
| Turn               | Atomic game phase in which each active entity (player/AI) resolves actions.                     |
| Leader Personality | Parameter set influencing AI priorities (expansion, science, culture, aggression).              |
| Tech Tree          | Directed acyclic dependency graph of technology nodes unlocking effects.                        |
| Save Slot          | Serialized JSON blob persisted to localStorage or downloaded file.                              |
| Seed               | Initial numeric/string value used to drive procedural generation and deterministic RNG streams. |
| Fog of War (FoW)   | Visibility masking mechanic (future/optional).                                                  |
| Deterministic      | Same input state + action sequence => same resulting state.                                     |
| Action             | Declarative intent by a player/AI processed by the engine to produce new state.                 |
| Simulation Tick    | Single advancement operation (in this design = one turn).                                       |

## 3. Requirements, Constraints & Guidelines

Functional Requirements:

- **REQ-001**: The system SHALL generate a hex map with configurable width, height, and seed.
- **REQ-002**: The system SHALL support at least 6 base biomes with biome assignment rules.
- **REQ-003**: The system SHALL maintain a turn counter starting at 0 and incrementing after all actors resolve.
- **REQ-004**: The system SHALL allow 0..1 human players and 1..N AI players (AI-only mode supported).
- **REQ-005**: The system SHALL model leader personalities with weighted strategic preferences.
- **REQ-006**: The system SHALL implement two distinct progression trees: Science and Culture.
- **REQ-007**: The system SHALL persist complete game state to JSON (save) and restore from JSON (load) without loss of fidelity.
- **REQ-008**: The system SHALL ensure deterministic state evolution given identical seed + action series.
- **REQ-009**: The system SHALL expose a read-only game state via a context hook (`useGame()`).
- **REQ-010**: The system SHALL validate loaded JSON conforming to the published schema, rejecting invalid saves.
- **REQ-011**: The system SHALL support AI turn execution within ≤ 50 ms aggregate for 5 AI players (baseline map 30x30) on mid-range hardware.
- **REQ-012**: The system SHALL provide a mechanism to advance turn even if no human player exists (auto-sim mode).
- **REQ-013**: The system SHOULD provide a lightweight UI panel showing current turn, active player, and key metrics (tech progress, culture score, etc.).
- **REQ-014**: The system SHALL allow pausing auto-simulation when AI-only mode is active.
- **REQ-015**: The system SHOULD support exporting save JSON as a downloadable file.
- **REQ-016**: The system SHOULD support importing JSON via file select / drag-and-drop.
- **REQ-017**: The system SHALL version saves with `schemaVersion` to enable forward compatibility.
- **REQ-018**: The system SHOULD provide seed display and regeneration controls.
- **REQ-019**: The system SHALL separate pure simulation logic from rendering (no Three.js objects within core state structures).
- **REQ-020**: The system SHOULD emit structured events/logs for debugging (turn start, turn end, action resolution, tech unlocked).

Security & Integrity:

- **SEC-001**: The system SHALL sanitize and validate imported JSON (schema + unknown property stripping or rejection).
- **SEC-002**: The system SHALL avoid executing code embedded in save data (pure data only).
- **SEC-003**: The system SHOULD defend against excessively large save imports (size limit e.g., 2 MB) to prevent memory abuse.

Performance & Scalability:

- **PER-001**: Logic tick (turn resolution) target ≤ 16 ms for baseline; hard cap 50 ms.
- **PER-002**: Rendering SHALL avoid re-rendering entire map each React commit—use memorization / instancing.
- **PER-003**: Map size up to 100x100 tiles SHOULD remain interactive (camera pan/zoom) at ≥ 30 FPS.

Constraints:

- **CON-001**: Frontend-only (no backend). Persistence limited to in-browser or file export/import.
- **CON-002**: Technology stack limited to React, TypeScript, Vite, @react-three/fiber, minimal additional deps.
- **CON-003**: Must remain readable and approachable (educational/demonstration quality > feature saturation).

Guidelines:

- **GUD-001**: Keep simulation pure and stateless (functions returning new state) where feasible.
- **GUD-002**: Use seed-based RNG wrappers; avoid direct `Math.random()` in core logic.
- **GUD-003**: Introduce new biome or tech types via declarative config objects rather than scattered constants.
- **GUD-004**: Prefer data-driven AI goal evaluation (weights) over hard-coded branching logic.
- **GUD-005**: Keep React components presentational; delegate decisions to simulation/services.

Patterns:

- **PAT-001**: Entity-Component-Lite: Keep Player/Tile/Tech as simple data objects; extend via registries.
- **PAT-002**: Command / Action pattern for turn actions enabling logging and undo (future).
- **PAT-003**: Observer (event bus) for state change notifications (UI instrumentation).
- **PAT-004**: Strategy pattern for AI decision heuristics per leader personality.
- **PAT-005**: Factory for world generation (seed → map).

Future / Optional Features (Non-binding recommendations):

- **FUT-001**: Fog of War (visibility map per player).
- **FUT-002**: Resource system (food, production, science, culture yields per tile).
- **FUT-003**: City founding & growth mechanics.
- **FUT-004**: Diplomacy stances (ally, neutral, hostile).
- **FUT-005**: Combat / unit movement with pathfinding (A\* on hex grid).
- **FUT-006**: Achievements / milestones.
- **FUT-007**: Procedural naming (cities/leaders/events).
- **FUT-008**: Replay / timeline viewer.

## 4. Interfaces & Data Contracts

### 4.1 Core TypeScript Interfaces (Conceptual)

```ts
type HexCoord = { q: number; r: number }; // Axial coordinates

enum BiomeType {
  Grassland = 'grass',
  Desert = 'desert',
  Forest = 'forest',
  Mountain = 'mountain',
  Ocean = 'ocean',
  Tundra = 'tundra',
}

interface Tile {
  id: string; // stable
  coord: HexCoord;
  biome: BiomeType;
  elevation: number; // normalized 0..1
  moisture: number; // normalized 0..1
  exploredBy: string[]; // player IDs (future fog-of-war)
}

interface LeaderPersonality {
  id: string;
  name: string;
  aggression: number; // 0..1
  scienceFocus: number; // 0..1
  cultureFocus: number; // 0..1
  expansionism: number; // 0..1
}

interface TechNode {
  id: string;
  tree: 'science' | 'culture';
  name: string;
  cost: number; // base cost
  prerequisites: string[]; // TechNode ids
  effects: string[]; // semantic effect descriptors
}

interface PlayerState {
  id: string;
  isHuman: boolean;
  leader: LeaderPersonality;
  sciencePoints: number;
  culturePoints: number;
  researchedTechIds: string[];
  researching?: { techId: string; progress: number };
}

interface GameState {
  schemaVersion: number; // increment when schema changes
  seed: string; // RNG seed
  turn: number;
  map: { width: number; height: number; tiles: Tile[] };
  players: PlayerState[];
  techCatalog: TechNode[]; // static during session
  rngState?: unknown; // optional internal RNG snapshot
  log: GameLogEntry[]; // recent events
  mode: 'standard' | 'ai-sim';
}

interface GameLogEntry {
  timestamp: number;
  turn: number;
  type: string;
  payload?: any;
}
```

### 4.2 Save File JSON Schema (Draft)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CivWebLiteSave",
  "type": "object",
  "required": ["schemaVersion", "seed", "turn", "map", "players", "techCatalog"],
  "properties": {
    "schemaVersion": { "type": "integer", "minimum": 1 },
    "seed": { "type": "string", "minLength": 1 },
    "turn": { "type": "integer", "minimum": 0 },
    "mode": { "type": "string", "enum": ["standard", "ai-sim"] },
    "map": {
      "type": "object",
      "required": ["width", "height", "tiles"],
      "properties": {
        "width": { "type": "integer", "minimum": 1 },
        "height": { "type": "integer", "minimum": 1 },
        "tiles": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "coord", "biome"],
            "properties": {
              "id": { "type": "string" },
              "coord": {
                "type": "object",
                "required": ["q", "r"],
                "properties": { "q": { "type": "integer" }, "r": { "type": "integer" } }
              },
              "biome": { "type": "string" },
              "elevation": { "type": "number" },
              "moisture": { "type": "number" },
              "exploredBy": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      }
    },
    "players": { "type": "array", "items": { "type": "object" } },
    "techCatalog": { "type": "array", "items": { "type": "object" } },
    "log": { "type": "array", "items": { "type": "object" } },
    "rngState": { "type": ["object", "string", "null"] }
  }
}
```

### 4.3 Public Hook Contract

`useGame(): { state: GameState; dispatch(action: GameAction): void; save(): string; load(json: string): LoadResult; }`

### 4.4 Action Interface (Conceptual)

```ts
interface GameAction {
  type: string; // e.g., 'END_TURN','SET_RESEARCH','ADVANCE_RESEARCH'
  playerId?: string;
  payload?: any;
  clientTimestamp?: number;
}
```

## 5. Acceptance Criteria

- **AC-001 (REQ-001)**: Given a seed and map dimensions, when world generation runs, then the map contains exactly width\*height unique tile IDs with valid axial coordinates.
- **AC-002 (REQ-002)**: Given generation defaults, when the map is created, then at least 5 of the 6 defined biomes appear unless constrained by size (< 5 tiles).
- **AC-003 (REQ-003)**: Given turn N, when all players resolve and end turn, then turn becomes N+1.
- **AC-004 (REQ-007)**: Given a running game, when save() is invoked, then the returned JSON validates against schema and reloads to an equivalent state (deep structural equality ignoring transient fields like timestamps).
- **AC-005 (REQ-008)**: Given a fixed seed and identical action list, when simulation is replayed, then resulting serialized state hashes are identical.
- **AC-006 (REQ-010)**: Given malformed JSON missing required field (e.g., `map.tiles`), when load is invoked, then it returns an error and does not mutate current state.
- **AC-007 (REQ-011)**: Given 5 AI players on a 30x30 map, when a turn resolves, then average resolution time over 20 turns is ≤ 50 ms.
- **AC-008 (REQ-009)**: Given a React component using `useGame()`, when state changes each turn, then the hook returns a new immutable reference (previous references not mutated).
- **AC-009 (REQ-017)**: Given a save file with mismatched `schemaVersion` > supported, when load is invoked, then it returns a structured incompatibility error.
- **AC-010 (REQ-015)**: Given a save export action, when user confirms download, then a file named `civweblite-save-<turn>.json` is provided.

## 6. Test Automation Strategy

- **Test Levels**: Unit (world gen, tech unlock logic, AI decisions), Integration (turn loop, save ↔ load roundtrip), E2E (Playwright: start game, advance turns, save, reload).
- **Frameworks**: Vitest for unit/integration; Playwright for E2E; Potential property-based tests via `fast-check` (optional) for deterministic replay.
- **RNG Determinism**: Provide injectable RNG; test harness seeds with known value, captures state diff.
- **Performance Tests**: Simple benchmark harness measuring average turn resolution time for varying map sizes (CI threshold checks).
- **Coverage Requirements**: ≥ 80% lines for core simulation modules (`src/game/*`).
- **CI Integration**: GitHub Actions workflow: install, typecheck, test, build, (optional) performance smoke.
- **Static Validation**: JSON schema validation tests for each save produced in tests.
- **Accessibility Pass**: Playwright + axe-core scan for top-level UI (turn indicator, save/load controls).

## 7. Rationale & Context

- Deterministic design simplifies debugging, replay, and potential future multiplayer lockstep.
- Dual tech tracks create tension and strategic differentiation with minimal complexity.
- JSON persistence chosen for transparency, portability, and tooling synergy.
- Hook-based state access aligns with React idioms; immutable snapshots ease memoization.
- Action pattern enables later undo/redo and event sourcing without architectural overhaul.

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: (Optional future) Cloud storage or share service (not in initial scope).

### Third-Party Services

- **SVC-001**: None required initially.

### Infrastructure Dependencies

- **INF-001**: Browser localStorage API for persistence (fallback to download when size > quota or disabled).

### Data Dependencies

- **DAT-001**: Procedural noise (simplex/perlin) library (optional) for biome distribution — else fallback to deterministic pseudo distribution.

### Technology Platform Dependencies

- **PLT-001**: Node 18+/ES2022 for build tooling; browser ES2020+ environment.

### Compliance Dependencies

- **COM-001**: None (no PII stored). If user-generated naming introduced later, sanitize input.

## 9. Examples & Edge Cases

```jsonc
// Minimal 2x2 map save example (partial)
{
  "schemaVersion": 1,
  "seed": "ABC123",
  "turn": 5,
  "mode": "standard",
  "map": {
    "width": 2,
    "height": 2,
    "tiles": [
      { "id": "t0", "coord": { "q": 0, "r": 0 }, "biome": "grass" },
      { "id": "t1", "coord": { "q": 1, "r": 0 }, "biome": "forest" },
      { "id": "t2", "coord": { "q": 0, "r": 1 }, "biome": "ocean" },
      { "id": "t3", "coord": { "q": 1, "r": 1 }, "biome": "desert" },
    ],
  },
  "players": [
    {
      "id": "P1",
      "isHuman": true,
      "leader": {
        "id": "L1",
        "name": "Ada",
        "aggression": 0.2,
        "scienceFocus": 0.9,
        "cultureFocus": 0.4,
        "expansionism": 0.5,
      },
      "sciencePoints": 42,
      "culturePoints": 12,
      "researchedTechIds": ["wheel"],
      "researching": { "techId": "writing", "progress": 10 },
    },
  ],
  "techCatalog": [
    {
      "id": "wheel",
      "tree": "science",
      "name": "Wheel",
      "cost": 30,
      "prerequisites": [],
      "effects": ["unlock:movement+1"],
    },
    {
      "id": "writing",
      "tree": "science",
      "name": "Writing",
      "cost": 40,
      "prerequisites": ["wheel"],
      "effects": ["unlock:library"],
    },
  ],
  "log": [],
}
```

Edge Cases:

- Empty map request (width=0) → reject (CON-001, schema constraint).
- Loading save with unknown biome string → reject with validation error.
- Player ID collision in save → reject.
- Large map (100x100) with single AI — confirm performance (PER-001) still met.
- All AI mode with 0 human players — auto-advance enabled until paused.
- Tech dependency cycle introduced erroneously → detect and report at catalog load.

## 10. Validation Criteria

| Criterion            | Method                        | Pass Condition                        |
| -------------------- | ----------------------------- | ------------------------------------- |
| Deterministic replay | Unit test w/ recorded actions | Hash(state) stable across runs        |
| Save/load fidelity   | Roundtrip test                | Deep equality (excluding transient)   |
| Performance baseline | Benchmark harness             | Avg turn ≤ 50 ms (30x30, 5 AI)        |
| Schema validation    | JSON schema test              | 100% valid samples pass; invalid fail |
| Hook immutability    | Unit test (object identity)   | Previous state refs unchanged         |
| Biome coverage       | World gen statistical test    | ≥ 5 biomes appear (standard size)     |

## 11. Related Specifications / Further Reading

- (Planned) `spec-design-ai-decision-engine.md` — AI heuristic scoring.
- (Planned) `spec-data-tech-tree-schema.md` — Tech tree declarative format.
- (Planned) `spec-process-testing-strategy.md` — Extended test/perf plan.

---

END OF SPEC

## UI & HUD Requirements

The application SHALL provide a compact, accessible, and testable Heads-Up Display (HUD)
inspired by classic 4X strategy game layouts (for example: Civilization series). The HUD is a
presentational layer only and MUST not contain simulation logic; all actions dispatched from the
HUD should use the public `useGame()` hook or provided action dispatchers.

Goals:

- Surface essential game status and controls without obscuring the main 3D map view.
- Be keyboard- and screen-reader friendly (WCAG AA where practical).
- Use design tokens for colors, spacing, and typography to enable theming.

Placement and Components:

- `TopBar` (component: `src/components/ui/TopBar.tsx`)
  - Shows current `turn`, per-player primary resource totals (e.g., science, culture, production), and per-turn deltas.
  - Contains a compact settings/menu affordance and a save/export button.
- `LeftPanel` (component: `src/components/ui/LeftPanel.tsx`)
  - Collapsible panel for research/tech tree and active quests.
  - Shows currently researching tech with progress and allows selecting a new research target for the human player.
- `NextTurnControl` (component: `src/components/ui/NextTurnControl.tsx`)
  - Primary call-to-action to end the current player's turn and advance the simulation.
  - Displays a turn badge and visual confirmation of queued actions.
  - Must be reachable by keyboard (tab focus) and have an ARIA name and role.
- `Minimap` (component: `src/components/ui/Minimap.tsx`)
  - Small overview map in a corner (default bottom-right) with click-to-center behavior.
  - Optional toggle to show/hide.
- `ContextPanel` (component: `src/components/ui/ContextPanel.tsx`)
  - Displays contextual information for the currently selected tile or city (yields, population, improvements).
  - Displays action buttons relevant to the selection (e.g., Found City, Build Improvement) and delegates commands to `useGame()`.

Design & Accessibility Requirements:

- All components must be presentational and use `useGame()` or dispatchers to perform actions. No direct simulation mutations.
- Keyboard navigation: tab order must move through TopBar → LeftPanel toggle → NextTurnControl → Minimap → ContextPanel.
- ARIA: interactive elements must have clear ARIA labels/roles; tooltips should be accessible.
- Color contrast: all text and important UI elements must meet WCAG AA contrast ratios.
- Responsive: HUD components should collapse gracefully on small viewports; Minimap may hide under a threshold.

Acceptance Criteria (additional to those in section 5):

- **AC-HUD-001**: The TopBar renders and displays current `turn` and at least one resource total when `useGame()` provides state.
- **AC-HUD-002**: The NextTurnControl triggers the same state transition as calling the programmatic `endTurn()` dispatch (integration test required).
- **AC-HUD-003**: The Minimap centers the main camera on click and is keyboard-focusable.
- **AC-HUD-004**: The LeftPanel allows changing the human player's research target and reflects changes in `useGame()` state.
- **AC-HUD-005**: The ContextPanel displays city or tile details when a city/tile is selected and correctly issues actions to the simulation.

Testing Notes and Implementation Guidance:

- Place presentational components under `src/components/ui/` and prefer small, testable units (e.g., `TopBar`, `ResourceBadge`, `NextTurnControl`).
- Unit tests: mount components with mocked `useGame()` provider state and assert DOM output and dispatched actions.
- Integration tests: use Vitest + jsdom to assert keyboard navigation and basic click flows. Use Playwright for an end-to-end scenario that opens a saved game, selects a city, issues an action, and advances a turn.
- Accessibility tests: run axe-core scans on the top-level HUD layout and ensure no critical violations.

Notes:

- The HUD SHOULD be decoupled from Three.js rendering. Interactions that require camera control should use a camera controller utility exposed from the scene layer (for example, `useCamera()` hook) instead of manipulating renderer internals directly.
- The HUD components must avoid import-time side-effects (do not import AJV or other heavy validators directly at module top-level). If validation/helpers are required, call runtime helpers that lazily initialize heavy dependencies.

END OF SPEC
