**Biome Assets Integration**

- **Scope:** Wiring Blender tile variants (GLB) into instanced rendering; exporter + loader fixes.

**File Placement**

- **Where:** Place GLBs under `src/scene/assets/`.
- **Names:** For grass tiles: `grassland_v0.glb`, `grassland_v1.glb`, `grassland_v2.glb`.
- **Why:** Loader resolves URLs via `new URL('./file.glb', import.meta.url)` so Vite bundles them automatically.

**Runtime Loader**

- **Entry:** `src/scene/assets/biome-assets.ts`.
- **Behavior:**
  - Loads all meshes in the GLB, bakes world transforms, splits multi‑material geometry into sub‑geometries per group, and merges into one `BufferGeometry` with groups.
  - Produces a matching material array (one material per group) compatible with `InstancedMesh`.
  - Registers `{ geometry, material }` per biome variant in the registry.
  - Emits `civweblite:biomeAssetsLoaded` on each successful variant load to refresh the scene.
- **Logs:**
  - Success: `[biome-assets] Loaded grass <index> mesh: <name> tris: <N>`
  - Failure: `[biome-assets] Failed grass <index> Error: …`

**Registry & Scene Wiring**

- `src/scene/assets/biome-variants-registry.ts`
  - Keys match `BiomeType` values (e.g., `'grass'`).
  - Helpers: `setVariantAssets(biome, index, geometry, material)` and `getVariantAssets(biome, index)`.
- `src/scene/scene.tsx`
  - Buckets tiles by `biome + variantIndex`.
  - Renders with `InstancedModels` when assets exist; otherwise falls back to `InstancedTiles` (procedural cylinder).
  - Listens for `civweblite:biomeAssetsLoaded` to re-render when assets arrive.

**Instanced Models**

- `src/scene/instanced-models.tsx`
  - Instanced renderer for arbitrary `geometry` + `material | material[]`.
  - Applies per‑instance transforms consistent with `InstancedTiles` (hex radius and elevation → Y‑scale).

**Blender Export Script**

- `blenderpython/generate_grassland_tiles.py`
  - Adds `bl_info` for Add‑on install; registers UI panel/operator in Blender.
  - Headless CLI supports args: `--count N --export <path> --format GLB|OBJ`.
  - Fix: glTF export flag uses `use_selection` (Blender 4.5).
  - New: `export_collection(..., isolated=True)` creates a temporary scene with only the target collection before export. This avoids stray sibling collections in GLBs.
  - Default export location resolves relative to the script’s directory (e.g., `--export out/`).

**CLI Examples**

- Per‑variant export next to the script:
  - `blender --background --python blenderpython/generate_grassland_tiles.py -- --count 3 --export out/ --format GLB`
- Single file:
  - `blender --background --python blenderpython/generate_grassland_tiles.py -- --count 3 --export out.glb --format GLB`

**Troubleshooting**

- **Seeing cylinders only:**
  - Ensure registry key matches `BiomeType` (grass, not grassland).
  - Check logs for `[biome-assets] Loaded …` lines; the scene should re-render on the assets event.
- **Wrong meshes (e.g., tufts only):**
  - Loader now merges all meshes; previously selected a single child. Rebuild and reload.
- **Multi‑material artifacts:**
  - Loader splits geometry per material group before merging; verify exporter produced index/groups.
- **GLB contains sibling collections:**
  - Use the script’s isolated export to include only the desired variant collection.

**Touchpoints (Files)**

- `src/scene/assets/biome-assets.ts`
- `src/scene/assets/biome-variants-registry.ts`
- `src/scene/instanced-models.tsx`
- `src/scene/scene.tsx`
- `blenderpython/generate_grassland_tiles.py`

