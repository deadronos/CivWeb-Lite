// Runtime loader that attaches GLTF-based geometry/material to biome variant registry.
// It looks for GLB files placed under `src/scene/assets/` and loads them once.

import type { BufferAttribute, BufferGeometry, Material, Mesh, Object3D } from 'three';
import { setVariantAssets } from './biome-variants-registry';

export const BIOME_ASSETS_EVENT = 'civweblite:biomeAssetsLoaded';

// Resolve URLs relative to this module; Vite will bundle/copy these.
function urlFor(name: string): string {
  return new URL(`./${name}`, import.meta.url).toString();
}

function findMeshes(root: Object3D): Mesh[] {
  const out: Mesh[] = [] as any;
  root.traverse((o: any) => { if (o && (o as any).isMesh) out.push(o as Mesh); });
  return out;
}

function pickBestMesh(meshes: Mesh[]): Mesh | undefined {
  if (!meshes.length) return undefined;
  // 1) Prefer name hints
  const preferred = meshes.find(m => /tile|base|hex/i.test(m.name));
  if (preferred) return preferred;
  // 2) Fallback: largest triangle count
  let best = meshes[0];
  let bestTris = -1;
  for (const m of meshes) {
    const g: any = m.geometry;
    const tri = g?.index ? (g.index.count / 3) : (g?.attributes?.position?.count ? g.attributes.position.count / 3 : 0);
    if (tri > bestTris) { bestTris = tri; best = m; }
  }
  return best;
}

function cloneSubsetGeometry(src: BufferGeometry, indices: number[]): BufferGeometry {
  const dst = new (src.constructor as any)() as BufferGeometry;
  const attrNames = Object.keys(src.attributes) as (keyof typeof src.attributes)[];
  // Build unique vertex set and remap
  const unique = new Map<number, number>();
  const remappedIndices: number[] = [];
  for (const i of indices) {
    let ni = unique.get(i);
    if (ni === undefined) {
      ni = unique.size;
      unique.set(i, ni);
    }
    remappedIndices.push(ni);
  }
  const used = [...unique.keys()];
  for (const name of attrNames) {
    const attr: any = (src.attributes as any)[name];
    if (!attr) continue;
    const itemSize = attr.itemSize;
    const array = attr.array as ArrayLike<number>;
    const Typed = (array as any).constructor as any;
    const out = new Typed(used.length * itemSize);
    for (let j = 0; j < used.length; j++) {
      const vi = used[j];
      const srcOffset = vi * itemSize;
      const dstOffset = j * itemSize;
      for (let k = 0; k < itemSize; k++) out[dstOffset + k] = (array as any)[srcOffset + k];
    }
    (dst as any).setAttribute(name as string, new (attr.constructor as any)(out, itemSize));
  }
  const IndexTyped = (src.index!.array as any).constructor as any;
  dst.setIndex(new (IndexTyped)(remappedIndices));
  dst.computeBoundingSphere();
  dst.computeBoundingBox();
  return dst;
}

function splitGeometryByMaterial(geometry: BufferGeometry, material: Material | Material[]): { geos: BufferGeometry[]; mats: Material[] } {
  if (!Array.isArray(material) || !geometry.index || !geometry.groups?.length) {
    return { geos: [geometry], mats: [Array.isArray(material) ? material[0] : material] };
  }
  const indexArray = Array.from((geometry.index!.array as any) as number[]);
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

async function loadGLTFOnce(url: string): Promise<{ geometry: BufferGeometry; material: Material | Material[]; chosen: string; tris: number }> {
  // Dynamic import to avoid bundling loader in tests/SSR unnecessarily
  const [{ GLTFLoader }, BufferGeometryUtils] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js' as any),
    import('three/examples/jsm/utils/BufferGeometryUtils.js' as any),
  ]);
  const loader = new GLTFLoader();
  const gltf: any = await new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
  const scene = gltf.scene || gltf.scenes?.[0];
  if (!scene) throw new Error('GLTF has no scene: ' + url);
  const meshes = findMeshes(scene);
  if (!meshes.length) throw new Error('GLTF has no mesh: ' + url);

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
      for (let p = 0; p < parts.length; p++) {
        const g = parts[p];
        geos.push(g);
        mats.push((partMats[p] as Material).clone());
        const tri = g.index ? g.index.count / 3 : (g.attributes as any)?.position?.count / 3 || 0;
        totalTris += tri;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[biome-assets] Skip submesh due to error', m?.name, e);
    }
  }
  if (!geos.length) throw new Error('No geometries to merge: ' + url);
  // Merge geometries; useGroups=true keeps one group per input sub-geometry so we can pass a matching materials array
  const geometry: BufferGeometry = (BufferGeometryUtils as any).mergeGeometries(geos, true);
  const chosen = meshes[0]?.parent?.name || meshes[0]?.name || '(merged)';
  return { geometry, material: mats, chosen, tris: Math.floor(totalTris) };
}

export async function loadBiomeVariants(biome: string): Promise<void> {
  if (typeof window === 'undefined') return; // no-op in tests/SSR
  if (biome === 'grass') {
    const files = ['grassland_v0.glb', 'grassland_v1.glb', 'grassland_v2.glb'];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = urlFor(files[i]);
        console.info('[biome-assets] Loading', biome, i, url);
        const { geometry, material, chosen, tris } = await loadGLTFOnce(url);
        setVariantAssets('grass', i, geometry, material);
        console.info('[biome-assets] Loaded', biome, i, 'mesh:', chosen, 'tris:', Math.floor(tris));
        // Notify listeners (scene) so it can re-render using assets
        try {
          window.dispatchEvent(new CustomEvent(BIOME_ASSETS_EVENT, { detail: { biome, index: i } }));
        } catch {}
      } catch (e) {
        // Swallow per-variant errors so others can still load
        // eslint-disable-next-line no-console
        console.warn('[biome-assets] Failed', biome, i, e);
      }
    }
  }
}
