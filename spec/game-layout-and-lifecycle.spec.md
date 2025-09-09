---
title: Game Layout & Lifecycle Specification (CivWeb‑Lite)
version: 1.0
date_created: 2025-09-09
last_updated: 2025-09-09
owner: deadronos
tags: [spec, gameplay, lifecycle, ui, save-load, 4x]
related:
- docs/civ6-inspired-design-goals.md
- docs/civ6-implementation-status.md
- docs/state-architecture.md
- spec/spec-architecture-civweb-lite-core.md
- spec/biomes-units-tech.spec.md
- spec/ui-interactions.spec.md
- plan/feature-core-game-foundation-1.md
- plan/hud-ui-implementation-plan.md
- plan/ui-interactions-implementation-plan.md
---

# 1. Purpose

Define the end‑to‑end player experience and simulation lifecycle for CivWeb‑Lite, from website load → main menu → new game setup or load → turn loop → victory/defeat → save/export. This spec consolidates requirements and references from existing architecture, content, and UI specs into a single, game‑flow oriented document.

Non‑goals: deep balance math, final art direction, or multiplayer; keep scope pragmatic and aligned with existing code and JSON catalogs.


# 2. Entry Flow (Website → Main Menu)

On initial load, the app lands in a lightweight “Main Menu” view layered over or separate from the 3D scene.

Mandatory menu actions
- New Game: opens Game Setup wizard (see Section 3).
- Load Game: open file dialog or paste JSON to import save (see Section 7).
- Continue (optional): resume last autosave from localStorage if present and schema‑compatible.

UI requirements
- Keyboard accessible; focus starts on New Game, Tab order cycles New → Load → Continue.
- Provide small footer: build version, schema version, and a link to docs.

Acceptance criteria
- From a fresh tab, the user can create a new game with defaults in ≤3 clicks.
- Load flow rejects malformed/oversized or incompatible saves with a clear error.


# 3. Game Setup (New Game Wizard)

The setup configures world, players, and starting conditions. Defaults mirror a compact Civ‑style experience and current implementation status.

3.1 Map & World
- Map size: Small (30x30), Standard (50x50, default), Large (70x70).
- Seed: text input (default random); seed is persisted in save.
- Terrain/climate: slider or presets affecting biome diversity (Low/Medium/High). Maps to existing world gen config.
- Resources: density preset (Low/Standard/High) — wire to improvements/resources when enabled.

3.2 Players
- Player count: 2–6 total.
- Humans: 1 (default) or 0 for AI‑sim.
- AI count: derived from total − humans.
- Leaders: for each slot choose specific or Random; initial set leverages `src/data/leaders.json`.
- Difficulty: placeholder for AI biases (Easy/Standard/Hard).

3.3 Starting Conditions
- Starting era: Ancient (default).
- Starting units per player: 1 Settler + 1 Warrior.
- Starting tech/civic: none; progress 0.
- Starting visibility: reveal only around start tiles (FoW optional later).

3.4 Start Game
- Creates initial `GameState` using existing world gen and content loaders.
- Spawns starting units for each player near valid start locations (rules: avoid impassable; bias to fresh water/green biomes when available).
- Assigns leaders and initializes per‑player research queues as empty.

Acceptance criteria
- Changing map size/seed produces distinct deterministic worlds.
- Each player begins with exactly one Settler and one Warrior on valid tiles.


# 4. In‑Game Lifecycle (Turn Loop)

Overview: Classic 4X loop (Explore, Expand, Exploit, Exterminate). One global turn counter; within a turn, each active player resolves actions. Deterministic order: human first (if present), then AIs by player id.

Turn phases
1) Begin Turn
   - Increment `turn` after the prior End Turn completed.
   - Refill unit movement points; apply per‑turn healing in friendly territory.
   - UI updates research/production progress indicators.
2) Player Action Phase (per player)
   - Human: select units/cities, issue moves/builds, choose research, manage production.
   - AI: evaluate via leader personality weights; enqueue actions (move, settle, research, produce).
   - Movement & Combat: pathfinding on hex grid; entering enemy tile triggers combat resolution (deterministic or minimal probabilistic; current project keeps it deterministic when practical).
3) End Player Phase
   - City production tick: consume production, complete orders (units/buildings/improvements).
   - Research tick: apply science/culture per turn to active tech/civic; unlock on completion.
   - Empire yields: roll up science/culture from cities (and improvements when applicable).
4) End Turn
   - Process global events, check victory/defeat, push structured log entries.
   - Optionally autosave every N turns.

Actions & UI contracts
- See `spec/ui-interactions.spec.md` for event payloads and acceptance tests.
- Core reducer/actions: select unit, preview path, issue move, open city panel, choose production, start/switch research, end turn.

Determinism
- Seeded RNG governs any random choices (start loc tiebreakers, AI exploration choices).
- Same seed + same action list ⇒ identical state and save hash (see replay harness).

Performance
- Average per‑turn resolution must meet budget from core spec (≤ 50 ms for 5 AI on 30x30 baseline).


# 5. Systems In Play (Summary & Cross‑Refs)

This section summarizes involved systems and points to their detailed specs/impl.

- World/Map & Biomes: hex map generation, biome diversity, passability, movement costs.
  - Spec: `spec/biomes-units-tech.spec.md`
  - Code: `src/game/world/*`, `src/game/content/biomes.ts`
- Units: movement, sight, combat placeholder, abilities.
  - Data: `src/data/units.json` (category, stats, upgrade_to)
  - Code: `src/game/types.ts`, `src/game/pathfinder.ts`, `src/game/reducer.ts`
- Cities & Production: build queues, yields, completion events.
  - Data: `src/data/buildings.json`, `src/data/improvements.json`
  - Code: `src/game/content/rules.ts`, `src/components/ui/CityPanel*.tsx`
- Research (Science & Culture): parallel tracks; unlocks for units/buildings/policies.
  - Data: `src/data/techs.json`, `src/data/civics.json`
  - Code: `src/game/content/engine.ts`, `src/game/content/rules.ts`, `src/components/ui/*Tech*/Civic*`
- Leaders & AI: weighted preferences for victory vectors.
  - Data: `src/data/leaders.json`
  - Code: `src/game/ai/*`
- Save/Load: JSON schema, versioning, validation, export/import.
  - Spec: `spec/spec-architecture-civweb-lite-core.md` (Section 4.2, 5)
  - Code: `src/game/save/*`, `schema/save.schema.json`


# 6. Victory & Game End

Provide multiple clear win vectors inspired by Civ‑style games. For MVP, track progress and trigger an end screen when conditions met. Exact thresholds are tunable.

6.1 Domination Victory
- Condition (MVP): eliminate all rival capitals or all rival units/cities.
- Detection: check city ownership each End Turn.

6.2 Science Victory
- Condition (MVP): complete all Science techs in current era plan or reach a designated “final” tech.
- Detection: research catalog completion for science tree.

6.3 Culture Victory
- Condition (MVP): complete a set number of Civics or unlock a special “Cultural Hegemony” civic.
- Detection: culture tree milestone completion.

6.4 Diplomatic Victory (Simple)
- Condition (MVP): maintain positive relations with all remaining civs for X consecutive turns and hold majority of “delegations” (abstracted score derived from leader preferences and trade agreements; can initially be a simple score).
- Detection: rolling window of diplomacy score.

6.5 Score/Time Victory
- Condition: after T turns, highest composite score (cities + techs + civics + wonders) wins.

End screen
- Show victory type, turn achieved, summary stats, and buttons: View Map, Save Replay (future), Return to Menu.


# 7. Save/Load UX & Data Contracts

Save (Export)
- Action: from TopBar menu or main menu overlay.
- Produces `civweblite-save-<turn>.json`, validated against `schema/save.schema.json`.
- Include `schemaVersion`, `seed`, `turn`, `map`, `players`, `techCatalog`, and ring buffer log.

Load (Import)
- File dialog or paste JSON into a textbox; parse and validate.
- On success: replace current state; on failure: show type (ValidationError, VersionMismatch, SizeExceeded) with reason.
- Optionally store a last‑used save in localStorage for Continue.

Acceptance criteria
- Round‑trip equality: serialize → deserialize → deep equal (minus transient fields).
- Large files > size guard are rejected with a descriptive message.


# 8. Visual Assets & Presentation Outline

Art direction: lightweight, readable, system‑driven visuals that highlight state. Prefer generated/parameterized assets over heavy textures.

Tiles (hexes)
- Geometry: flat hexes (instanced) with subtle elevation offset for hills/mountains.
- Biome palette: distinct but accessible colors; ensure WCAG AA contrast vs. overlays.
- Overlays: icons/layers for rivers, resources, roads; soft edge transitions optional.
- Selection/Path: highlight ring + breadcrumb arrows for path preview; colorblind‑safe hues.

Units
- Representation: simple icon sprites or low‑poly meshes; category glyphs (Melee, Ranged, Recon, Naval).
- States: idle, selected, moved, fortified, embarked (naval) — indicated by tint or small badges.
- Footprint: one unit per tile for MVP; stacking rules optional later.

Cities
- Marker: city pin with nameplate and population dot ticks; city radius ring (worked tiles) optional.
- Buildings: small icon row in city panel; on‑map district/wonder markers later.

Improvements
- Farm, Mine, Quarry, Road: overlaid mesh/decals on tile; small, consistent iconography in UI.

UI theming
- Use CSS variables for colors/spacing; responsive layout; keyboard focus outlines visible.

Performance
- Use instanced rendering for tiles; memoize unit/city markers; frustum‑culled overlays.


# 9. Default Content & Starting Kit

Starting kit per player
- Units: 1 Settler, 1 Warrior.
- Research: none in progress; player chooses first tech and civic.
- Production: city is founded on first Settler action (Found City). Until founded, player has empire‑level yields only from starting rules.

Default catalogs (already present)
- Units: ≥ 8 baseline units with simple upgrade chains.
- Techs/Civics: early era nodes for both tracks with unlocks.
- Buildings/Improvements: small set with food/production/science/culture yields.


# 10. Acceptance Criteria (Lifecycle)

- From main menu, a user can: New Game → accept defaults → enter the map with starting units placed and UI visible.
- From main menu, a user can: Load Game → pick file → validated → resume at correct turn with entities intact.
- Each End Turn applies: research progress, production completion, yield rollup, and logging.
- Victory condition check runs each End Turn and transitions to an end screen when satisfied.
- Deterministic replay with fixed seed and action list yields identical hash/state.


# 11. Open Questions / Future Enhancements

- Diplomacy system details (treaties, trades) and how it feeds a Diplomatic Victory score.
- Fog of War and visibility persistence per player.
- Advanced combat (ranged, zone of control, flanking), naval/air domains.
- Districts and adjacency bonuses; wonders and unique improvements.
- Multi‑city management UI and governors/policies.


# 12. Implementation Notes

- Reuse existing HUD elements (TopBar, LeftPanel, NextTurnControl, ContextPanel, Minimap). See `plan/hud-ui-implementation-plan.md`.
- Prefer data‑driven unlocks (JSON catalogs) and keep reducer logic pure; see `docs/state-architecture.md`.
- Keep all new UI components presentational; wire via `useGame()` and action dispatchers.
- Add small Playwright smoke: New Game → place Settler (Found City) → End Turn x3 → Save → Load → assert city present.


# 13. References

- Civ franchise overview for inspiration
  - https://civilization.fandom.com/wiki/Civilizations_(Civ6)
  - https://civilization.fandom.com/wiki/Civilization_Games_Wiki#Civilization_V
- Internal
  - `docs/civ6-inspired-design-goals.md`
  - `docs/civ6-implementation-status.md`
  - `spec/spec-architecture-civweb-lite-core.md`
  - `spec/biomes-units-tech.spec.md`
  - `spec/ui-interactions.spec.md`
  - `plan/feature-core-game-foundation-1.md`
  - `plan/hud-ui-implementation-plan.md`
  - `plan/ui-interactions-implementation-plan.md`

---
END OF SPEC

