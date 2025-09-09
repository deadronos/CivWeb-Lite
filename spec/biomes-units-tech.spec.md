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
- desert
- tundra
- snow
- forest
- jungle
- hills
- mountain

### Hextile data shape

JSON schema (informal):

- id: string (unique tile id)
- q,r: number (axial hex coordinates) or x,y
- biome: Biome (enum)
- elevation: number (0..1) optional — higher values increase movement cost and may become mountain when >0.9
- features: array of strings — e.g., ["river","resource_coal"]
- improvements: array of strings — e.g., ["farm","mine"]
- occupantUnitId: string | null — id of unit standing on tile
- occupantCityId: string | null — id of city located on tile
- passable: boolean — derived; ocean may be non-passable to some units

Example:

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

Movement cost base per biome (walkable units):

- plains: 1
- grassland: 1
- forest: 2
- jungle: 2
- desert: 1.5
- tundra: 1.5
- snow: 2
- hills: 2 (plus terrain elevation modifier)
- mountain: INF (impassable by standard land units unless unit has mountain pass ability)
- ocean: INF for land units; passable for naval units (naval movement costs 1)
- coast: 1 for land units (entering from adjacent land), 1 for naval units when moving along coast

- Visibility/vision: base vision provided by unit types; terrain like forest/jungle reduces visible range by 1 when looking out from the tile (fog-of-war rules left to implementers).
- Resource & features: features can grant yields (food/production/gold) and may require specific improvements to harvest.

## Units

### Unit data shape

- id: string
- type: string (e.g., "worker", "warrior", "settler", "scout")
- ownerId: string (player id)
- location: tile id or {q,r}
- hp: number (0..100)
- movement: number (movement points max)
- movementRemaining: number (reset each turn to movement)
- attack: number (attack strength)
- defense: number (defense strength)
- sight: number (vision radius)
- state: string enum (idle, moving, fortify, building, exploring)
- abilities: string[] (optional flags like "canTraverseMountains", "naval")

Example:

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

### Unit rules

- Movement consumes movementRemaining according to target tile movement cost (rounded up). Movement must be allowed by passable flag and abilities.
- Units that enter tiles with enemy units trigger combat resolution (simple deterministic or probabilistic combat model left to implementation — for testing, provide a toggle to use deterministic math: attackerDamage = max(1, attack - defense)).
- Units on a tile with a city belonging to the same owner may be healed a small amount per turn (e.g., +10 hp), up to max hp.
- Units with "worker" type can build improvements on tiles they occupy; building an improvement consumes a number of build actions/turns (e.g., farm: 2 turns).

## Cities

### City data shape

- id: string
- name: string
- ownerId: string
- location: tile id
- population: number (integer)
- productionQueue: array of production orders { type: "unit" | "improvement", item: string, turnsRemaining: number }
- tilesWorked: string[] — list of hextile ids being worked (for yield calculation)
- garrisonUnitIds: string[] — units assigned to garrison
- happiness: number (affects growth, simple positive/negative scale)

Example:

```json
{
  "id": "city_1",
  "name": "New Hope",
  "ownerId": "player_1",
  "location": "hex_13_5",
  "population": 3,
  "productionQueue": [{"type":"unit","item":"warrior","turnsRemaining":2}],
  "tilesWorked": ["hex_13_5","hex_12_5"],
  "garrisonUnitIds": [],
  "happiness": 10
}
```

### City rules

- Yield model (per-turn city yields): Sum of tile yields for tilesWorked + city base yields. Tile yields depend on biome, features, and improvements. Example small yield table:

- base city yield: { food: 2, production: 1, gold: 0 }
- tile yields by biome (no improvements): plains {food:2, prod:1}, grassland {food:2, prod:1}, forest {food:1, prod:2}, desert {food:0, prod:1}, hills {food:0, prod:2}, mountain {food:0, prod:0}
- improvements modify yields: farm +1 food, mine +2 production, road +0.1 gold

- Growth: simplified rule: if netFood >= population * 2 then population increases by 1 that turn.
- Production: city consumes production per-turn to reduce turnsRemaining for head of productionQueue. When an order completes, it spawns a unit or adds an improvement to the city tile.

## Technologies

### Technology data shape

- id: string (e.g., "pottery")
- name: string
- description: string
- cost: number (research turns required)
- prerequisites: string[] (ids)
- unlocks: { units?: string[], improvements?: string[], abilities?: string[] }

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

### Tech rules

- Players accumulate science (global or per-city; for simplicity start as global points per turn equal to number of cities) and spend them on tech in progress.
- When research completes, apply unlocks to the player's available options.
- Technologies control which items can be produced in cities and which improvements/buildings are available.


## API / GameState extensions

Extend existing GameState (informal):

- tiles: Record<string, Hextile>
- units: Record<string, Unit>
- cities: Record<string, City>
- techs: Record<string, Technology> (global library)
- playerState: { researchedTechs: string[], availableUnits: string[], availableImprovements: string[], science: number }

## Deterministic test cases and acceptance criteria

Acceptance tests to add to the test-suite (Vitest recommended):

- Tile serialization: create a hextile with biome 'forest', save and load; fields preserved.
- Movement cost: worker with movement 2 cannot move from plains to forest+hill in one turn if cost >2.
- Unit production: city with production 1 and queue to build "warrior" with cost 2 completes after 2 turns and the unit appears at city's tile.
- Tech unlock: researching "agriculture" unlocks "farm" improvement in playerState.availableImprovements.
- Improvement yields: worker builds "farm" on grassland tile; tile yields reflect farm bonus and city that works the tile shows increased food.

Example unit test pseudocode:

```ts
test('city produces unit after correct turns', () => {
  // setup game with one city with production 1 and queue warrior cost 2
  // tick two turns
  // assert unit spawned and production queue advanced
})
```

### Edge cases

- Mountain and ocean tile passability must be respected by units lacking abilities.
- Multiple units attempting to occupy same tile: either disallow or queue combat/resolution. Spec recommends: moving into tile with enemy triggers combat; moving into tile with friendly unit stacks are allowed up to a small cap (e.g., 3 units) or placed in adjacent tile — implementer choice, tests should assert chosen behavior.

### Implementation notes and incremental rollout

- Phase 1: Add tile biome and unit/city data shapes plus basic movement and city production. Add unit tests for serialization and movement.
- Phase 2: Add worker improvements, yields, and a simple tech unlock system.
- Phase 3: Add combat, advanced techs, and UI hooks to display unit/city info in HUD.

### Backwards compatibility

- New fields should be optional on load; existing saved games without fields should default sensibly (e.g., biome: plains, passable: true).

### Open questions / future work

- AI behavior: how AI uses techs and production priorities.
- Naval units, resource trade, and city happiness mechanics.

--

End of spec
