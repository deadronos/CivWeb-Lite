# Biomes, Units, Cities, and Technologies Specification

This specification adds world content and gameplay entities to CivWeb‑Lite: biome-varied hextiles, units, cities, and a simple technology tree.

Goals

- Provide data shapes and serialization for hextiles with biome types and contained features.
- Define unit and city models, behaviors, and lifecycle (movement, combat placeholders, ownership).
- Define a minimal technology system that unlocks unit/city types and map improvements.
- Provide acceptance criteria and examples so the implementation can be tested and unit‑tested.

Scope and constraints

- Keep the spec small and incremental. The goal is to enable gameplay prototyping, not a full Civ clone.
- All new models are TypeScript-friendly (plain JSON-serializable objects). No network or database-specific APIs.
- Focus on deterministic rules so tests are reproducible.

Contents

- Data shapes (JSON Schemas) for: Biome, Hextile, Unit, City, Technology, GameState extensions.
- Rules: movement costs, vision, production, unit actions, city growth (simple), tech unlocks.
- Examples and sample JSON objects.
- Acceptance criteria and tests to implement.

## Biomes & Hextiles

### Biome types

Enum of biome types (string):

- ocean
- coast
- plains
- grassland

### Biome types

There are two related sets of biome names used in the codebase:

- The core game enum `BiomeType` (defined in `src/game/types.ts`) uses conservative keys used by the engine: `grass`, `desert`, `forest`, `mountain`, `ocean`, `tundra`, `ice`.
- The content extension (`src/game/content/types.ts`) defines a broader `Biome` union used by content and the scene code. Its values include: `ocean`, `coast`, `plains`, `grassland`, `desert`, `tundra`, `snow`, `forest`, `jungle`, `hills`, `mountain`.

When writing acceptance tests or content fixtures prefer the `content` biomes (the broader union). The core engine will continue to use the `BiomeType` enum where appropriate.

- id: string (unique tile id)
- q,r: number (axial hex coordinates) or x,y
- biome: Biome (enum)

```json
{
  "id": "hex_12_5",
  "q": 12,
  "r": 5,
  "biome": "grassland",
  "elevation": 0.12,
  "features": ["river"],
  "improvements": [],
  "occupantUnitId": null,
  "occupantCityId": null,
  "passable": true
}
```

### Rules — Hextiles

### Hextile data shape

## Biomes, Units, Cities, and Technologies Specification

This specification describes a small, testable content model for CivWeb‑Lite: biome-varied hextiles, units, cities, and a minimal technology system. The goal is to keep things small, deterministic, and directly mappable to the repository's TypeScript types.

### Goals

- Provide JSON-serializable data shapes for tiles, units, cities, and tech nodes.
- Define simple, deterministic rules for movement, production, and research so unit tests are reliable.
- Provide acceptance criteria and example test skeletons for Vitest.

### Scope and constraints

- Keep the model minimal and incremental (prototype-quality, not a full game).
- Use the TypeScript interfaces already present in the codebase (see `src/game/types.ts` and `src/game/content/types.ts`).
- Prefer deterministic computations for tests (avoid randomness where possible).

### Contents

- Data shapes (types/interfaces) aligned to code.
- Rules: movement costs, vision, production, unit actions, city growth, tech unlocks.
- Example fixtures and deterministic acceptance tests.

## Biomes & Hextiles

### Biome types

The repository uses two related biome sets:

- `BiomeType` (core engine enum in `src/game/types.ts`) — conservative keys used by engine logic: `grass`, `desert`, `forest`, `mountain`, `ocean`, `tundra`, `ice`.
- `Biome` (content union in `src/game/content/types.ts`) — broader content names used by fixtures and scene code: `ocean`, `coast`, `plains`, `grassland`, `desert`, `tundra`, `snow`, `forest`, `jungle`, `hills`, `mountain`.

When authoring fixtures or tests against content APIs use the `Biome` union values. Engine-level code that imports `BiomeType` will continue to use the smaller enum.

### Hextile data shape

The content extension exports a `Hextile` interface (see `src/game/content/types.ts`). Informal shape:

- `id: string`
- `q: number`, `r: number` — axial coordinates
- `biome: Biome`
- `elevation?: number` (0..1)
- `features: string[]`
- `improvements: string[]`
- `occupantUnitId: string | null`
- `occupantCityId: string | null`
- `passable: boolean`

Example fixture:

```json
{
  "id": "hex_12_5",
  "q": 12,
  "r": 5,
  "biome": "grassland",
  "elevation": 0.12,
  "features": ["river"],
  "improvements": [],
  "occupantUnitId": null,
  "occupantCityId": null,
  "passable": true
}
```

### Rules — Hextiles (recommended minimal mapping)

The spec intentionally keeps movement and yields small so tests are easy to implement.

Movement cost base per biome (example mapping for land units):

- plains: 1
- grassland: 1
- forest: 2
- jungle: 2
- desert: 1.5
- tundra: 1.5
- snow: 2
- hills: 2 (+ elevation modifier)
- mountain: impassable (unless unit ability permits traversal)
- ocean: impassable for land units; passable for naval units (naval cost 1)
- coast: 1 for coastal land movement

Visibility: a unit's sight radius is `Unit.sight` (see `src/game/content/types.ts`). Terrain like `forest`/`jungle` may be treated as -1 when viewing outwards.

Features/resources: represent these as strings in `Hextile.features`. Tests should assert that higher-level game rules translate features into yields or behavior.

## Units

### Unit data shape

The `Unit` interface is defined in `src/game/content/types.ts`. Key fields:

- `id: string`
- `type: string` (e.g., `worker`, `warrior`, `scout`)
- `ownerId: string`
- `location: string | { q:number; r:number }`
- `hp: number` (0..100)
- `movement: number`
- `movementRemaining: number`
- `attack: number`
- `defense: number`
- `sight: number`
- `state: 'idle' | 'moving' | 'fortify' | 'building' | 'exploring'`
- `abilities?: string[]`

Example fixture:

```json
{
  "id": "unit_7",
  "type": "warrior",
  "ownerId": "player_1",
  "location": "hex_12_5",
  "hp": 100,
  "movement": 2,
  "movementRemaining": 2,
  "attack": 6,
  "defense": 4,
  "sight": 2,
  "state": "idle",
  "abilities": []
}
```

### Unit rules (deterministic defaults for tests)

- Movement consumes `movementRemaining` equal to the movement cost of the destination tile (fractional costs rounded up).
- Respect `Hextile.passable` and unit `abilities` when deciding movement legality.
- Entering a tile with enemy units triggers combat. For deterministic tests use: damage = Math.max(1, attacker.attack - defender.defense).
- Units in a friendly city regain a small fixed HP per turn (e.g., +10 up to 100).
- Worker units build improvements by occupying a tile and spending N turns; tests should assert the improvement appears after the expected turns.

## Cities

### City data shape

The `City` and `CityProductionOrder` interfaces live in `src/game/content/types.ts`. Important fields:

- `id`, `name`, `ownerId`
- `location: string` (tile id)
- `population: number`
- `productionQueue: CityProductionOrder[]`
- `tilesWorked: string[]`
- `garrisonUnitIds: string[]`
- `happiness: number`

Example fixture:

```json
{
  "id": "city_1",
  "name": "New Hope",
  "ownerId": "player_1",
  "location": "hex_13_5",
  "population": 3,
  "productionQueue": [{ "type": "unit", "item": "warrior", "turnsRemaining": 2 }],
  "tilesWorked": ["hex_13_5", "hex_12_5"],
  "garrisonUnitIds": [],
  "happiness": 10
}
```

### City rules (minimal model)

- City yields = base city yield + sum(tile yields for `tilesWorked`.

Suggested minimal yields for tests (no improvements):

- base city yield: { food: 2, production: 1, gold: 0 }
- plains/grassland: { food: 2, prod: 1 }
- forest: { food: 1, prod: 2 }
- desert: { food: 0, prod: 1 }
- hills: { food: 0, prod: 2 }
- mountain: { food: 0, prod: 0 }

- Improvements: farm +1 food, mine +2 production (tests may use these values).
- Growth: if netFood >= population \* 2 then population increases by 1 that turn.
- Production: each turn the city applies production to the head of `productionQueue`; when `turnsRemaining` reaches 0 spawn the unit or add improvement.

## Technologies

### Technology data shape

The `Technology` interface in `src/game/content/types.ts` uses:

- `id`, `name`, `description`, `cost`, `prerequisites`, `unlocks` (units/improvements/abilities).

Example:

```json
{
  "id": "agriculture",
  "name": "Agriculture",
  "description": "Enables farms and improves food yields.",
  "cost": 6,
  "prerequisites": [],
  "unlocks": { "improvements": ["farm"] }
}
```

### Tech rules (minimal)

- Players have `PlayerState.sciencePoints` (see `src/game/types.ts`) — tests may credit fixed points per turn.
- When a player's research progress reaches a tech's `cost`, add the tech id to `playerState.researchedTechs` and include unlocks in `playerState.availableImprovements`/`availableUnits` as appropriate.

## API / GameState extensions

The codebase exposes an optional content extension type (`GameStateExtension`) in `src/game/content/types.ts`. The root `GameState` in `src/game/types.ts` includes an optional `contentExt` to hold this data.

Informal content extension shape:

- `tiles: Record<string, Hextile>`
- `units: Record<string, Unit>`
- `cities: Record<string, City>`
- `techs: Record<string, Technology>`
- `playerState: { researchedTechs: string[]; availableUnits: string[]; availableImprovements: string[]; science: number; ... }`

## Deterministic test cases and acceptance criteria

Add Vitest unit tests that exercise the small deterministic rules above. Suggested tests:

- Tile serialization: create a `Hextile` fixture (biome `forest`), persist it into a `GameStateExtension.tiles` map, load it back and assert fields are preserved.
- Movement cost: create a `Unit` with `movement: 2` and assert it cannot move into a tile whose cost exceeds 2 in a single turn.
- Unit production: create a `City` with a `productionQueue` head that produces a unit in N turns; tick production and assert the `Unit` appears in `GameStateExtension.units`.
- Tech unlock: simulate research progress for `agriculture` and assert `playerState.researchedTechs` and `playerState.availableImprovements` update.
- Improvement yields: simulate a worker building a `farm` on a grassland `Hextile` and assert the city's yields increase when the tile is `tilesWorked`.

Example test skeleton (TypeScript pseudocode):

```ts
import { Hextile, Unit, City } from '../src/game/content/types';

test('city produces unit after correct turns', () => {
  // create a minimal GameStateExtension with one city whose productionQueue will produce a warrior
  // call the small production tick function twice
  // assert GameStateExtension.units contains the new unit and productionQueue advanced
});
```

### Edge cases

- Mountain and ocean passability must be respected by units lacking abilities.
- Multiple units attempting to occupy the same tile: tests should assert the chosen behavior (disallow, stack with cap, or force combat).

### Implementation notes and incremental rollout

- Phase 1: Add tile biome types and minimal `Hextile`/`Unit`/`City` shapes + tests for serialization and movement.
- Phase 2: Add worker improvements, yields, and the simple tech unlock flow.
- Phase 3: Add combat mechanics, AI hooks, and UI bindings.

### Backwards compatibility

- New fields in the content extension should be optional on load; default sensible values (e.g., `biome: 'plains'`, `passable: true`).

### Open questions / future work

- AI behavior: prioritization for tech and production.
- Naval units, trading, and city happiness mechanics.

---

End of spec
