# src/scene — AGENTS

## Purpose

Three.js and @react-three/fiber scene composition: model loading, instancing, camera controls, and visual helpers for rendering the game world.

## Key files / folders

- `scene.tsx` — Main scene composition and Canvas wiring.
- `units/` — Unit rendering components and procedural models.
- `drei/` — Local Drei helpers and wrappers (GLTF loaders, camera controls).
- `utils/` — World-wrapping, coords, color helpers required by rendering.

## Dependencies

- `three`, `@react-three/fiber`, `@react-three/drei` (project may vend small helpers under `drei/`).

## Interactions

- Scene consumes `GameStateContext` to position/animate objects and emits UI events via `globalGameBus` or contexts.

## Important notes

- Keep heavy WebGL logic isolated; avoid coupling rendering code with business logic. Use `procedural` unit models for small, testable visuals.
