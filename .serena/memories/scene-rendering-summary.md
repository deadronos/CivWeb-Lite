# Scene Rendering Summary

This document summarizes the rendering strategy for the main game scene.

## Tiling and Terrain

- The terrain is composed of hexagonal tiles.
- The `HexBucketsInstanced` component in `src/scene/scene.tsx` is responsible for rendering the tiles.
- It uses instanced rendering for performance, bucketing tiles by biome and visual variant.

## Biomes and Visual Variants

- Each tile has a biome type (e.g., 'grass', 'desert').
- Each biome can have multiple visual variants, determined by a hash of the tile's coordinates.
- The system attempts to load and render 3D models (GLTF) for each biome variant using `getVariantAssets`.
- If 3D models are not available, it falls back to rendering procedural hexagonal prisms (`FALLBACK_GEOMETRY`) with colors determined by the biome and variant (`materialForBiomeBucket`).

## World Wrapping

- The game world is cylindrically wrapped.
- The `generateWrappedBiomeGroups` utility function and the `useCameraWrapping` hook in `src/scene/scene.tsx` handle the logic for duplicating geometry at the edges of the world to create a seamless wrapping effect.

## Background

- A background image, `dragonmap.png`, is used as a texture on a large plane geometry positioned below the hexagonal tiles.
- The `dragonTexture` is loaded using `useTexture` from `@react-three/drei`.
- The texture's `wrapS` and `wrapT` properties are set to `RepeatWrapping` to tile the image across the entire map area.

## Asset Loading

- Biome variant assets are loaded asynchronously. For example, `loadBiomeVariants('grass')` is called to load the assets for the grass biome.
- An event (`BIOME_ASSETS_EVENT`) is used to notify the scene when assets are loaded, triggering a re-render.

## State Management

- The `ConnectedScene` component uses the `useGame` hook to access the game state, which includes the map, tiles, and units.

## Units

- `UnitMeshes` and `UnitMarkers` are the components responsible for rendering the game units and their markers on the map.
