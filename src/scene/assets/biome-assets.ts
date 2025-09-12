// Runtime loader that attaches GLTF-based geometry/material to biome variant registry.
// It looks for GLB files placed under `src/scene/assets/` and loads them once.

import type { BufferAttribute, BufferGeometry, Material, Mesh, Object3D } from 'three';
import { DoubleSide } from 'three';
import { setVariantAssets } from './biome-variants-registry';

/**
 * @file This file contains functions for loading biome assets.
 */

/**
 * The name of the event that is dispatched when biome assets are loaded.
 */
export const BIOME_ASSETS_EVENT = 'civweblite:biomeAssetsLoaded';

/**
 * Resolves a URL relative to this module.
 * @param name - The name of the file.
 * @returns The resolved URL.
 */
function urlFor(name: string): string {
  return new URL(`./${name}`, import.meta.url).toString();
}

/**
 * Finds all meshes in an Object3D.
 * @param root - The root Object3D.
 * @returns An array of meshes.
 */
function findMeshes(root: Object3D): Mesh[] {
  const out: Mesh[] = [] as any;
  root.traverse((o: any) => {
    if (o && (o as any).isMesh) out.push(o as Mesh);
  });
  return out;
}

/**
 * Picks the best mesh from an array of meshes.
 * @param meshes - The array of meshes.
 * @returns The best mesh, or undefined if the array is empty.
 */
function pickBestMesh(meshes: Mesh[]): Mesh | undefined {
  if (meshes.length === 0) return undefined;
  // 1) Prefer name hints
  const preferred = meshes.find((m) => /tile|base|hex/i.test(m.name));
  if (preferred) return preferred;
  // 2) Fallback: largest triangle count
  let best = meshes[0];
  let bestTris = -1;
  for (const m of meshes) {
    const g: any = m.geometry;
    const tri = g?.index
      ? g.index.count / 3
      : g?.attributes?.position?.count
        ? g.attributes.position.count / 3
        : 0;
    if (tri > bestTris) {
      bestTris = tri;
      best = m;
    }
  }
  return best;
}

/**
 * Clones a subset of a buffer geometry.
 * @param source - The source geometry.
 * @param indices - The indices to clone.
 * @returns The cloned geometry.
 */
function cloneSubsetGeometry(source: BufferGeometry, indices: number[]): BufferGeometry {
  const dst = new (source.constructor as any)() as BufferGeometry;
  const attributeNames = Object.keys(source.attributes) as (keyof typeof source.attributes)[];
  // Build unique vertex set and remap
  const unique = new Map<number, number>();
  const remappedIndices: number[] = [];
  for (const index of indices) {
    let ni = unique.get(index);
    if (ni === undefined) {
      ni = unique.size;
      unique.set(index, ni);
    }
    remappedIndices.push(ni);
  }
  const used = [...unique.keys()];
  for (const name of attributeNames) {
    const attribute: any = (source.attributes as any)[name];
    if (!attribute) continue;
    const itemSize = attribute.itemSize;
    const array = attribute.array as ArrayLike<number>;
    const Typed = (array as any).constructor as any;
    const out = new Typed(used.length * itemSize);
    for (const [index, vi] of used.entries()) {
      const sourceOffset = vi * itemSize;
      const dstOffset = index * itemSize;
      for (let k = 0; k < itemSize; k++) out[dstOffset + k] = (array as any)[sourceOffset + k];
    }
    (dst as any).setAttribute(name as string, new (attribute.constructor as any)(out, itemSize));
  }
  const IndexTyped = (source.index!.array as any).constructor as any;
  dst.setIndex(new IndexTyped(remappedIndices));
  dst.computeBoundingSphere();
  dst.computeBoundingBox();
  return dst;
}

/**
 * Splits a geometry by material.
 * @param geometry - The geometry to split.
 * @param material - The material or array of materials.
 * @returns An object containing the split geometries and materials.
 */
function splitGeometryByMaterial(
  geometry: BufferGeometry,
  material: Material | Material[]
): { geos: BufferGeometry[]; mats: Material[] } {
  if (!Array.isArray(material) || !geometry.index || !geometry.groups?.length) {
    return { geos: [geometry], mats: [Array.isArray(material) ? material[0] : material] };
  }
  const indexArray = [...(geometry.index!.array as any as number[])];
  const geos: BufferGeometry[] = [];
  const mats: Material[] = [];
  for (const g of geometry.groups) {
    const slice = indexArray.slice(g.start, g.start + g.count);
    const sub = cloneSubsetGeometry(geometry, slice);
    geos.push(sub);
    mats.push(material[g.materialIndex] as Material);
  }
  return { geos, mats };
}

/**
 * Loads a GLTF file once.
 * @param url - The URL of the GLTF file.
 * @returns A promise that resolves to an object containing the geometry, material, chosen mesh name, and triangle count.
 */
async function loadGLTFOnce(
  url: string
): Promise<{
  geometry: BufferGeometry;
  material: Material | Material[];
  chosen: string;
  tris: number;
}> {
  // Dynamic import to avoid bundling loader in tests/SSR unnecessarily
  const [{ GLTFLoader }, BufferGeometryUtilities] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js' as any),
    import('three/examples/jsm/utils/BufferGeometryUtils.js' as any),
  ]);
  const loader = new GLTFLoader();
  const gltf: any = await new Promise((resolve, reject) =>
    loader.load(url, resolve, undefined, reject)
  );
  const scene = gltf.scene || gltf.scenes?.[0];
  if (!scene) throw new Error('GLTF has no scene: ' + url);
  const meshes = findMeshes(scene);
  if (meshes.length === 0) throw new Error('GLTF has no mesh: ' + url);

  // Merge all meshes under the scene so each variant becomes a single instanced geometry.
  const geos: BufferGeometry[] = [];
  const mats: Material[] = [];
  let totalTris = 0;
  for (const m of meshes) {
    try {
      m.updateWorldMatrix(true, true);
      const base = (m.geometry as BufferGeometry).clone();
      base.applyMatrix4(m.matrixWorld);
      const { geos: parts, mats: partMats } = splitGeometryByMaterial(base, m.material as any);
      for (const [p, g] of parts.entries()) {
        geos.push(g);
        mats.push((partMats[p] as Material).clone());
        const tri = g.index ? g.index.count / 3 : (g.attributes as any)?.position?.count / 3 || 0;
        totalTris += tri;
      }
    } catch (error) {
      console.warn('[biome-assets] Skip submesh due to error', m?.name, error);
    }
  }
  if (geos.length === 0) throw new Error('No geometries to merge: ' + url);
  // Merge geometries; useGroups=true keeps one group per input sub-geometry so we can pass a matching materials array
  const geometry: BufferGeometry = (BufferGeometryUtilities as any).mergeGeometries(geos, true);
  // Ensure we have vertex normals for lighting; some exported assets may omit them
  try {
    if (!(geometry as any).attributes || !(geometry as any).attributes.normal) {
      geometry.computeVertexNormals();
    }
  } catch (error) {
    // Swallow; computeVertexNormals may fail on malformed geometry but we still return what we have
    console.warn('[biome-assets] computeVertexNormals failed', error);
  }
  const chosen = meshes[0]?.parent?.name || meshes[0]?.name || '(merged)';
  // Ensure materials are render-ready: prefer double-sided for thin tile meshes and trigger update
  try {
    for (const m of mats) {
      if (m && (m as any).side === undefined) (m as any).side = DoubleSide;
      // Ensure materials don't require vertex colors unless the geometry provides them
      try {
        if ((m as any).vertexColors === undefined) (m as any).vertexColors = false;
      } catch {}
      try {
        (m as any).needsUpdate = true;
      } catch {}
    }
  } catch (error) {
    console.warn('[biome-assets] material postprocess failed', error);
  }

  return { geometry, material: mats, chosen, tris: Math.floor(totalTris) };
}

/**
 * Loads the biome variants for a given biome.
 * @param biome - The name of the biome.
 */
export async function loadBiomeVariants(biome: string): Promise<void> {
  if (globalThis.window === undefined) return; // no-op in tests/SSR
  if (biome === 'grass') {
    const files = ['grass_v0.glb', 'grass_v1.glb', 'grass_v2.glb'];
    for (const [index, file] of files.entries()) {
      try {
        const url = urlFor(file);
        console.info('[biome-assets] Loading', biome, index, url);
        const { geometry, material, chosen, tris } = await loadGLTFOnce(url);
        setVariantAssets('grass', index, geometry, material);
        console.info(
          '[biome-assets] Loaded',
          biome,
          index,
          'mesh:',
          chosen,
          'tris:',
          Math.floor(tris)
        );
        // Notify listeners (scene) so it can re-render using assets
        try {
          globalThis.dispatchEvent(
            new CustomEvent(BIOME_ASSETS_EVENT, { detail: { biome, index: index } })
          );
        } catch {}
      } catch (error) {
        // Swallow per-variant errors so others can still load

        console.warn('[biome-assets] Failed', biome, index, error);
      }
    }
  }
}
