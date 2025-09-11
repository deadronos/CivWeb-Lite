# Visuals: Data-Driven Models

Units can declare their visuals in `src/data/units.json` using the `visual` object. This lets you swap procedural models for GLTF with minimal code changes.

## Schema

- `visual.model` (string): Procedural model label, registered in `src/scene/units/modelRegistry.tsx`.
- `visual.scale` (number | [x, y, z]): Optional scale override.
- `visual.offsetY` (number): Optional vertical offset.
- `visual.anim` ({ bobAmp?: number; bobSpeed?: number }): Idle bob animation parameters.
- `visual.gltf` (string): Optional GLTF label or path. With `VITE_ENABLE_GLTF=true`, resolved to a URL via `src/scene/units/gltfRegistry.ts` and loaded.

Example entry:

```
{
  "id": "galley",
  "visual": {
    "model": "galley",
    "offsetY": 0.06,
    "anim": { "bobAmp": 0.02, "bobSpeed": 0.25 },
    "gltf": "galley" // or "/assets/galley.glb"
  }
}
```

## Resolution Order

1. If `VITE_ENABLE_GLTF=true` and `visual.gltf` resolves to a URL, load GLTF.
2. Else use `visual.model` label to pick a procedural component.
3. Else fall back to a minimal placeholder cube.

## Extending

- Add new procedural models under `src/scene/units/procedural/` and export `MODEL_LABEL`.
- Register new labels in `src/scene/units/modelRegistry.tsx`.
- Add/override GLTF URLs in `src/scene/units/gltfRegistry.ts`.
