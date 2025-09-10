# Biome Variant Instancing Pipeline

This document describes how to extend the current per‑biome instancing to support multiple mesh variants per biome (e.g., 3 grassland tiles, 3 forest tiles with different trees) and keep rendering fast and reliable without per‑instance vertex colors.

## Goals

- Keep GPU instancing for performance.
- Allow N variants per biome (geometry + material per variant).
- Deterministically assign a variant to each tile (stable across loads).
- Avoid per‑instance vertex color reliance (previously caused black tiles on some engines).

## High‑Level Design

- Assets: Export 2–3 GLTF variants per biome (e.g., `grass_v1/v2/v3`, `forest_v1/v2/v3`). Each variant provides a hex‑aligned tile mesh; foliage can be part of the mesh or separate small meshes.
- Buckets: Group tiles by `biome + variant` into separate instanced batches. Each bucket uses one geometry and one material (a "shader bucket").
- Assignment: Choose a variant per tile via a small stable hash of axial coords `(q,r)`.
- Rendering: Render one InstancedMesh per bucket with per‑tile transforms. No per‑instance colors needed.

## Modules & APIs

- `src/scene/instanced-models.tsx`
  - Generic renderer for arbitrary instanced geometry.
  - Props: `geometry`, `material`, `transforms: Array<{ position:[x,y,z]; scale:[sx,sy,sz]; rotationY:number }>`
  - Internally sets matrices from `transforms` and draws a single `InstancedMesh`.

- `src/scene/assets/biome-assets.ts`
  - Lazy GLTF loader returning `{ geometry, material }[]` per biome.
  - Example: `loadBiomeVariants('forest'): Promise<Variant[]>` where `Variant = { geometry, material }`.

- `src/scene/utils/variant-assign.ts`
  - `variantIndexFor(q, r, count): number` — stable, deterministic assignment using a coord hash.

## Scene Wiring

1. Build buckets in `ConnectedScene`:
   - For each tile, compute variant index via `variantIndexFor(q, r, variants.length)`.
   - Push a transform `{ position, scale, rotationY }` into `buckets[biome][variant]`.
2. Render each bucket as `<InstancedModels geometry material transforms />`.
3. Keep existing elevation→height scaling by adjusting the Y scale in each transform.

## Materials (Shader Buckets)

- One material per biome variant (no vertex colors):
  - Grassland: bright green tint, low roughness; optional mild emissive for readability.
  - Forest: darker green tint; slightly higher roughness; small emissive to lift tree silhouettes.
  - Desert: warm tint; higher roughness.
  - Mountain/Ice: gray/white tint; snow cap can be a distinct variant.

## Foliage (Optional)

- Scatter 1–2 small foliage instances per forest/grass tile:
  - Either included in the main tile variants or as separate tiny InstancedMeshes (cones/low‑poly trees/billboards).
  - Use the same variant assignment hash with minor jitter for position/rotation/scale.

## Migration Plan

1. Phase 1 — Scaffolding:
   - Implement `InstancedModels` and wire scene bucketing by `biome+variant` using the existing hex cylinder geometry duplicated per variant.
   - Confirms the plumbing without asset dependencies.
2. Phase 2 — Swap Assets:
   - Add `biome-assets.ts` and replace cylinder geometry with GLTF meshes per variant.
3. Phase 3 — Foliage:
   - Add optional foliage buckets (1–2 per tile) with extremely low‑poly meshes.

## Notes

- This approach avoids per‑instance vertex colors entirely, preventing the black‑tile issue seen with `instanceColor` on some Three builds.
- If we later want subtle intra‑biome variation without extra GLTFs, we can split each biome into 2–3 shade buckets (different material tints) and keep a small number of instanced meshes.

---

Ask me when you're ready for Blender: I can provide Python scripts to batch‑export GLTF variants, automatically align hex pivots, and generate LODs with naming conventions (e.g., `biome_variant_LOD0/1`).

