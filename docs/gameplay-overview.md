# CivWeb-Lite Gameplay Systems Overview

This document summarizes the core gameplay loops implemented in CivWeb-Lite and highlights the practical assumptions the engine makes in order to deliver a lightweight Civilization-style experience in the browser.

## World & State Initialization

- **Seeded world generation:** `generateWorld` in `src/game/world/generate.ts` creates a wrapped hex grid using a deterministic cosine fractal noise stack. Elevation, moisture, and polar modifiers are combined to assign biomes while keeping the map reproducible for a given seed and size.【F:src/game/world/generate.ts†L1-L115】
- **Content extension bootstrapping:** The lifecycle reducer seeds the content extension with tiles and spawns an initial warrior/settler pair for every player. Spawn logic respects biome suitability and guarantees spacing between starting positions, mirroring modern Civ conventions.【F:src/game/reducers/lifecycle.ts†L1-L192】【F:src/game/utils/map.ts†L1-L93】

## Players, Cities, and Production

- **Player model:** Each player carries a leader personality with science/culture/expansion weights, research progress, and production queues. The reducer advances research each turn, unlocks tech, and automatically starts the next queued technology.【F:src/game/reducers/player.ts†L1-L120】【F:src/game/reducers/turn.ts†L1-L69】
- **City yields & production:** Cities compute yields from worked tiles, improvements, and constructed buildings. At the end of every turn the content engine consumes production, spawns units, applies improvements, and awards empire-wide science/culture based on the worked tiles.【F:src/game/content/rules.ts†L1-L173】

## Deterministic AI Planning

- **Deterministic sampling:** The AI no longer calls `Math.random()`. Instead it uses helper utilities in `src/game/utils/random.ts` to derive repeatable pseudo-random indices from the game seed, turn, player, and unit identifiers, guaranteeing the same decisions for identical states.【F:src/game/utils/random.ts†L1-L40】【F:src/game/ai.ts†L1-L205】
- **Research planning:** `generateAIDecisions` ranks available technologies via `scoreTech`, prioritising cheaper techs that align with a leader’s science/culture focus. When no research is active the AI immediately issues `SET_RESEARCH`, then deterministically refreshes its research queue to keep progress flowing.【F:src/game/ai.ts†L46-L104】【F:src/game/ai.ts†L148-L181】
- **City production:** For idle cities the AI constructs a blended queue featuring growth units (settlers/warriors), economic improvements, and unlocked buildings once the civics/tech prerequisites are satisfied.【F:src/game/ai.ts†L62-L116】【F:src/game/ai.ts†L182-L195】
- **Unit exploration:** Idle land units select neighbouring passable tiles owned or empty, sorted for determinism, and move towards them. Only two units move per turn to keep AI time bounded. The deterministic seed ensures reproducible exploration paths.【F:src/game/ai.ts†L18-L44】【F:src/game/ai.ts†L118-L166】
- **Performance tracking:** Every AI evaluation records a `RECORD_AI_PERF` action so higher layers can aggregate decision costs per turn.【F:src/game/ai.ts†L198-L205】

## Testing Coverage

- **AI decision tests:** `tests/ai.decisions.test.ts` verifies that the AI emits stable action sets for identical state snapshots, plans research/production, moves units into deterministic neighbouring tiles, and preserves the original game state.【F:tests/ai.decisions.test.ts†L1-L86】
- **End-to-end coverage:** Existing provider and reducer suites continue to exercise world initialization, turn progression, unit spawning, and UI wiring, ensuring the gameplay loop remains deterministic and spec-compliant.【F:tests/reducer_more.test.ts†L1-L81】【F:tests/gameProvider.effects.test.tsx†L1-L129】

## Practical Assumptions

- **Abstracted combat:** Combat resolution is still simplified to movement guards; advanced combat simulations remain future work. The AI respects ownership when moving units, preventing accidental aggression in the current milestone.【F:src/game/ai.ts†L118-L166】
- **Data-driven content:** Registries for units, improvements, and buildings are hydrated from `src/data/*.json` so balancing changes remain declarative. The AI queries these registries to ensure it only queues unlocked items.【F:src/game/content/registry.ts†L1-L104】【F:src/game/ai.ts†L62-L116】

These systems provide a modern Civ-style foundation—seeded maps, deterministic turns, leader-driven research priorities, and AI-controlled cities/units—that can be extended with diplomacy, combat, or UI refinements without rewriting the core simulation.
