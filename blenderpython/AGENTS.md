# blenderpython — AGENTS

## Purpose

High-level Blender assets and generation scripts used to produce 3D models and tile assets consumed by the app's scene renderer.

## Key files

- `generate_grassland_tiles.py` — Python script to procedurally generate tile assets.
- `warrior.glb` — Example exported GLB model used for in-scene unit testing.
- `civweb.blend*` / `generate_grassland.blend*` — Blender project and backups.

## Dependencies

- Blender (for opening `.blend` files).
- Python for any generation scripts (Blender embedded Python environment may be required).

## Interactions

- Generated GLB assets are consumed by `src/scene` (model loading and instancing).
- Scripts are relatively standalone; outputs should be checked into `public` or copied into the app's asset pipeline.

## Important notes

- These files are binary and large; treat with care in git history. Use LFS if file size becomes an issue.
- Keep generation scripts and their inputs together to allow reproducible asset builds.
