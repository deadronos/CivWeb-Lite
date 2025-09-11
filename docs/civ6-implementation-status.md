# Civ VI–Inspired Implementation Status

This document summarizes the CivWeb‑Lite implementation progress toward the goals in `docs/civ6-inspired-design-goals.md`, and proposes concrete next steps.

## Implemented

### Data‑Driven Content

- JSON catalogs added under `src/data/`:
  - `src/data/techs.json` — science/culture techs (15 nodes, Ancient focus) with unlocks.
  - `src/data/civics.json` — culture track nodes with unlocks.
  - `src/data/units.json` — 9 units with categories, movement, costs, upgrade_to.
  - `src/data/improvements.json` — farm/mine/road with yields and build times.
  - `src/data/buildings.json` — 5 buildings with yields and `requires`.
  - `src/data/leaders.json` — 3 leaders with personality weights.
- Loader utility: `src/data/loader.ts` (typed JSON imports + DAG validation for techs).

### Registries From JSON

- Content registries now build from JSON at load time:
  - `src/game/content/registry.ts` — constructs `UNIT_TYPES`, `IMPROVEMENTS`, `BUILDINGS` from JSON.
  - Derives unit `domain`, base stats and coarse `cost` turns estimate.

### Research Systems (Parallel Tracks)

- Science techs (content‑ext):
  - `src/game/content/engine.ts` — `createStateWithLoadedData()` loads techs/civics.
  - `src/game/content/rules.ts` — `beginResearch`, `tickResearch` consume `playerState.science`.
  - UI: `src/components/ui/ExtTechPanelContainer.tsx` uses `LeftPanel` to select available content‑ext techs.
- Culture civics:
  - `src/game/content/types.ts` — added `Civic`, `civics`, `researchedCivics`, `cultureResearch`.
  - `src/game/content/engine.ts` — loads civics (`loadCivics`).
  - `src/game/content/rules.ts` — `beginCultureResearch`, `tickCultureResearch` driven by `playerState.culture`.
  - Reducer action: `EXT_BEGIN_CULTURE_RESEARCH` in `src/game/reducer.ts` and `src/game/actions.ts`.
  - UI: `src/components/ui/CivicPanelContainer.tsx` + `src/components/ui/CivicPanel.tsx`.

### Cities, Production, Buildings

- City model: `src/game/content/types.ts` — `City.buildings?: string[]`.
- Production: `src/game/content/rules.ts` — `tickCityProduction` now handles `type: 'building'` orders.
- Yields: `getCityYield` applies building yields (food/production/gold/science/culture).
- Per‑turn rollup: `endTurn` sums city `science`/`culture` to `playerState`.

### UI Extensions

- HUD: `src/components/GameHUD.tsx`
  - Shows Science/turn and Culture/turn; shows tech and civic research progress.
  - Minimal read‑only catalogs for Units and Buildings using loader data.
  - Debug: spawn any unit from catalog; queue buildings; start civic research.
  - Gating: catalogs and pickers filter to unlocked or prerequisite‑satisfied items.

### Validation / Health Check

- Script: `scripts/validate-content.mjs`
  - Validates tech DAG, cross‑references unlocks, flags orphans (units/buildings/improvements not unlocked), and prints unlocked counts.
  - Run via `npm run validate:data`.

### Core Tech Catalog (non‑ext)

- `src/game/tech/techCatalog.ts` expanded to include 6+ science and 6+ culture nodes for the base model used by existing tests/LeftPanel UI.

## Open Items / Ideas / TODOs

### Data & Balance

- Balance yields: tune `buildings.json` `science`/`culture` and production costs.
- Add more eras and nodes (Classical → Information) with representative unlocks.
- Introduce resources/requirements on units (e.g., horses, iron) and map improvements to resources.
- Expand leaders and wire weights to AI heuristics (aggression, expansion, science/culture bias).

### Systems & Rules

- Promotions/Upgrades: implement upgrade action using `upgrade_to` chains.
- Combat resolution: add basic combat outcome calculator and integrate with movement preview.
- Districts/Dedications (optional): extend buildings into districts with adjacency effects.
- City growth/food: connect food surplus to population growth (and production scaling).

### UI/UX

- Add availability indicators and tooltips (requirements, yields) in Unit/Building catalogs.
- Separate sidebars for Techs and Civics with search/filter and progress bars.
- City screen: per‑city panel to manage queue, see yields and built buildings.
- Tech tree view: simple DAG renderer highlighting prerequisites and unlocks.

### Validation & Tooling

- Extend validator to:
  - Check era coverage and monotonic prereq eras.
  - Validate resource references (once added).
  - Print diff of unlocked vs. required to help content authors.
- Add unit tests:
  - `beginCultureResearch`/`tickCultureResearch` success and prereq guards.
  - Building queue completes and yields apply to empire totals.
  - Catalog gating renders only unlocked items.

### Integration

- Default to JSON‑loaded content in init path (replace hardcoded `TECHS` fallback) once tests and fixtures are updated.
- Persist/reload content‑ext state in save/load.

## How to Run / Verify

- Install and test: `npm install` then `npm test` (see README for environment caveats).
- Validate data: `npm run validate:data`.
- Dev UI: `npm run dev`, open the HUD to view Tech/Civic panels, catalogs, and debug controls.

---

Status updated: 2025‑09‑09
