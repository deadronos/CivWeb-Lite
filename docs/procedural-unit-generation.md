# Procedurally Generated Units

This document outlines the steps, considerations, and best practices for creating game units procedurally at runtime instead of using pre-made 3D models (like `.gltf` files). This is a highly effective strategy for rapid prototyping and achieving a minimalist art style.

## Core Concept

The fundamental idea is to construct units by combining and grouping primitive 3D shapes. In the context of this project (using React Three Fiber), this means creating a React component for each unit type that renders a collection of basic meshes (`<boxGeometry>`, `<sphereGeometry>`, `<cylinderGeometry>`, etc.).

---

## Implementation Steps

1.  **Component per Unit:** Create a separate component for each unit type (e.g., `Warrior.tsx`, `Settler.tsx`). This keeps the definitions clean and reusable.

2.  **Build with Primitives:** Inside each component, use basic Three.js geometries to build the unit's shape. A `Group` should be the root element to ensure all parts move together as a single entity.

3.  **Use Materials for Distinction:** Apply different `meshStandardMaterial` or `meshBasicMaterial` components to different parts of the model. The unit's `teamColor` can be passed in as a prop to color the torso or other key parts, making ownership clear.

4.  **Preload Geometries:** To avoid any in-game performance stutters, it's best to "preload" the units. This means creating one of each unit type during the initial game loading screen and caching the geometries. When a new unit is needed in-game, you can efficiently clone these pre-generated models instead of calculating them from scratch.

### Feature Flag: GLTF vs Procedural

- Procedural models are the default.
- To enable GLTF models (when assets are available), set `VITE_ENABLE_GLTF=true` in your env. Without this flag, the renderer uses procedural stick figures.
- Code entry points:
  - `src/scene/units/UnitModelSwitch.tsx` – selects GLTF or procedural per unit type.
  - Procedural components live in `src/scene/units/procedural/`.
  - Scene wiring: `src/scene/UnitMeshes.tsx` and `src/scene/Scene.tsx`.

### Visual Schema (data-driven)

- Each unit in `src/data/units.json` can define a `visual` object:
  - `model`: string label to pick a procedural component (e.g., `"warrior"`, `"archer"`, `"galley"`). Labels are registered in `src/scene/units/modelRegistry.tsx`.
  - `scale`: number or `[x, y, z]` to scale the model.
  - `offsetY`: number to nudge the model vertically (e.g., ships above waterline).
  - `anim`: `{ bobAmp?: number; bobSpeed?: number }` to tweak idle bob animation.
  - `gltf`: optional GLTF label or path. When `VITE_ENABLE_GLTF=true`, the renderer will try to resolve this via `src/scene/units/gltfRegistry.ts` and load that URL. If absent or resolution fails, it falls back to the procedural `model`.

Example:
```
{
  "id": "archer",
  "visual": { "model": "archer", "anim": { "bobAmp": 0.05, "bobSpeed": 0.4 }, "gltf": "archer" }
}
```

See `src/game/content/registry.ts` for how `visual` is parsed and exposed to the scene.

### Conceptual Code Example

```jsx
// src/components/units/WarriorModel.tsx

import React from 'react';
import { Group } from 'three';

// A conceptual component for a procedurally generated Warrior
export function WarriorModel({ teamColor = 'red' }) {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="peachpuff" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial color={teamColor} />
      </mesh>

      {/* Spear (as a sub-group) */}
      <group position={[0.3, 0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="saddlebrown" />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[0.1, 0.3]} />
          <meshStandardMaterial color="slategray" />
        </mesh>
      </group>
    </group>
  );
}
```

In this codebase, see the live components under `src/scene/units/procedural/` (e.g., `WarriorModel.tsx`, `SettlerModel.tsx`, `WorkerModel.tsx`), and the runtime switcher in `src/scene/units/UnitModelSwitch.tsx`.

---

## Key Considerations & Trade-offs

### Pros

*   **Development Speed:** Drastically reduces asset creation time. No external 3D modeling software is required.
*   **Flexibility:** Unit designs can be tweaked and iterated on by changing a few lines of code.
*   **Minimal File Size:** The game loads faster as there are no large model files to download.
*   **Unique Style:** Enforces a clean, minimalist aesthetic that can be very stylish.

### Cons

*   **Visual Fidelity:** You are limited to simple, geometric shapes. Complex, organic, or realistic models are not feasible.
*   **Animation Complexity:** **This is the biggest challenge.**
    *   Animating pre-made GLTF models with internal skeletons is straightforward (you play named animation clips).
    *   Animating a procedural model requires you to manually calculate the position and rotation of each individual part (`<mesh>`) for every frame of the animation. This involves complex trigonometry and is significantly more difficult than playing a pre-baked animation.

## Recommended Workflow

1.  **Prototype with Procedural Models:** Implement all core game features using simple, static (or minimally animated) procedural units. This allows you to focus entirely on gameplay.
2.  **Evaluate Visual Needs:** Once the game is functional and fun, assess the visual requirements. The simple procedural look may be sufficient for the final product.
3.  **Replace as Needed:** If high-fidelity models and complex animations become necessary, you can replace the procedural components with components that load and render GLTF models. Because the visual representation is encapsulated within a component, this swap can be done with minimal changes to your core game logic.
