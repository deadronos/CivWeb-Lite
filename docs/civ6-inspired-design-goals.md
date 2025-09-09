# Civ VI–Inspired Design Goals

This document records high-level design goals for implementing Civ VI–inspired gameplay systems in CivWeb‑Lite. It is intentionally compact and actionable so it can guide data modeling, UI, and AI behavior.

## Goals summary

- Create a familiar Civilization-style experience: distinct units, parallel technology and culture trees, buildable city improvements, and leader personalities grounded in historical themes.
- Keep systems small, modular, and data-driven so they can be extended, tested, and serialized easily.

## Scope

This guidance covers:

- Units: unit categories, roles, upgrade chains, movement/combat stats, and required resources.
- Tech & Culture trees: separate research tracks for Science (Technologies) and Culture (Civics), with per-node unlocks.
- Buildings & City Improvements: what a city can build to provide yields and enable units/abilities.
- Leaders & AI personalities: leader definitions with historical grounding, playstyle flags, and simple AI decision weights.

## References (inspiration)

- Civilization Games Wiki — Civilization VI overview: [Civilization Games Wiki (Civ VI)](https://civilization.fandom.com/wiki/Civilization_Games_Wiki#Civilization_VI)
- Units list (Civ VI): [List of units in Civ6](https://civilization.fandom.com/wiki/List_of_units_in_Civ6)
- Technologies (Science tree): [List of technologies in Civ6](https://civilization.fandom.com/wiki/List_of_technologies_in_Civ6)
- Civics (Culture tree): [List of civics in Civ6](https://civilization.fandom.com/wiki/List_of_civics_in_Civ6)
- Buildings (city improvements): [List of buildings in Civ6](https://civilization.fandom.com/wiki/List_of_buildings_in_Civ6)
- Leaders and personalities: [Leaders (Civ6)](https://civilization.fandom.com/wiki/Leaders_(Civ6))

## Design principles

1. Data-driven definitions
   - Define units, techs, civics, buildings, and leaders as JSON-like data files. Game code should read definitions and provide generic systems (e.g., combat resolver, city build queue, research progression).
   - Keep each definition small and focused. Use references (ids) instead of embedding large nested objects.

2. Parallel research tracks
   - Implement two independent research tracks: Science (Technologies) and Culture (Civics). Each track is a directed acyclic graph of nodes.
   - Nodes unlock game features: unit unlocks, building unlocks, policy cards, or global bonuses.

3. Units and upgrades
   - Units belong to categories (Melee, Ranged, Siege, Naval, Recon, Support, Air — tailored to project scope).
   - Each unit definition includes: id, name, category, era, movement, strength/offense/defense, ranged (bool) with range, cost, required technology id, upgrade_to (optional), and special abilities (array of ability ids).
   - Keep upgrade chains explicit to make promotion/upgrade UI simple.

4. Buildings & city production
   - Buildings are city-level constructs that provide yields (food/production/gold/science/culture/faith) and may unlock units or district effects.
   - Cities have a build queue; build times and production cost derive from city production yield and unit/building base cost.

5. Leaders & AI
   - Leaders are defined with: id, name, historical descriptor, preferred victory vectors (science, culture, domination, expansion), and personality weights (aggression, expansionism, tech-focus, culture-focus, trade, diplomacy).
   - AI behavior should read leader personality weights to bias decisions (unit production, research priority, city expansion, diplomacy choices). Keep the system simple (weights + heuristics) and testable.

6. Balance & eras
   - Use discrete eras to gate content (Ancient, Classical, Medieval, Renaissance, Industrial, Modern, Atomic, Information — trim as needed).
   - Era progression can be tied to technology milestones or turn counters depending on design.

## Suggested data shapes

Below are compact examples that capture the essential fields. These are suggestions — adapt to existing project types and patterns.

### Unit (example)

```json
{
  "id": "warrior",
  "name": "Warrior",
  "category": "melee",
  "era": "ancient",
  "movement": 2,
  "strength": 10,
  "ranged": false,
  "cost": 40,
  "requires": "bronze-working",
  "upgrade_to": "swordsman",
  "abilities": ["heal-on-stand"]
}
```

### Technology / Civic node (example)

```json
{
  "id": "bronze-working",
  "name": "Bronze Working",
  "era": "ancient",
  "science_cost": 20,
  "prereqs": [],
  "unlocks": { "units": ["spearman"], "buildings": [] }
}
```

### Building (example)

```json
{
  "id": "granary",
  "name": "Granary",
  "cost": 60,
  "requires": "pottery",
  "yields": { "food": 1 },
  "effects": ["increase-city-growth"]
}
```

### Leader (example)

```json
{
  "id": "pericles",
  "name": "Pericles",
  "historical_note": "Athenian statesman; focused on culture and democracy",
  "preferred_victory": ["culture"],
  "weights": { "aggression": 0.2, "expansion": 0.3, "science": 0.2, "culture": 0.7 }
}
```

## Acceptance criteria

- A JSON-backed set of definitions for units, techs, civics, buildings, and leaders exists in `src/data/` or `data/` and can be loaded by the game core.
- Two independent research trees (science and culture) exist with at least 6-8 nodes each (sample nodes covering early game eras).
- At least 8 unit definitions across different categories with a simple upgrade chain for 2-3 units.
- At least 5 building definitions with varied yields/effects.
- At least 3 leader definitions demonstrating different personality weights and playstyles.

## Next steps (low-risk additions)

1. Create data folder and add minimal JSON files for units, techs, civics, buildings, leaders.
2. Implement small loader utility (TypeScript) to import and validate data shapes at runtime.
3. Add Vitest unit tests for loader and a few game logic functions (e.g., tech unlocks a unit, city production calculation).
4. Wire minimal UI: a simple list to view units and techs. Keep it optional for the first iteration.

## Notes

- This document is a lightweight design goal file intended to guide initial implementation. It intentionally avoids prescribing detailed rule math (combat formulas, exact yields) so teams can iterate on balance.
- Copyright: inspired by Civilization VI (Firaxis). This repo must not copy proprietary assets (art, text from game) or licensed mechanics verbatim. Use these links and high-level structures as inspiration only.

---
Document created: 2025-09-09
