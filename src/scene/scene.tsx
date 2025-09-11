import React from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  Color,
  BufferGeometry,
  Material,
  RepeatWrapping,
} from 'three';
import { useGame } from '../hooks/use-game';
import { useSelection } from '../contexts/selection-context';
import CameraControls from './drei/camera-controls';
import HtmlLabel from './drei/html-label';
import UnitMeshes from './unit-meshes';
import UnitMarkers from './unit-markers';
import { useTexture } from '@react-three/drei';
import dragonMapUrl from './background/dragonmap.png';
import InstancedModels, { InstanceTransform } from './instanced-models';
import { axialToWorld, DEFAULT_HEX_SIZE } from './utils/coords';
import { baseColorForBiome, colorForBiomeBucket } from './utils/biome-colors';
import { BiomeType, Tile } from '../game/types';
import { getVariantCount, getVariantAssets } from './assets/biome-variants-registry';
import { BIOME_ASSETS_EVENT, loadBiomeVariants } from './assets/biome-assets';
import { DEFAULT_WRAPPING_CONFIG, generateWrappedBiomeGroups } from './utils/world-wrapping';
import { useCameraWrapping } from './hooks/use-camera-wrapping';

// Public runtime marker used by tests
export const SCENE_RUNTIME_MARKER = true;

// Simple stable hash for variant selection from axial coords
function variantIndexFor(q: number, r: number, count: number): number {
  if (count <= 1) return 0;
  let x = (q | 0) * 374_761_393 + (r | 0) * 668_265_263;
  x = (x ^ (x >>> 13)) * 1_274_126_177;
  x = x ^ (x >>> 16);
  const f = (x >>> 0) / 0xff_ff_ff_ff; // 0..1
  return Math.floor(f * count) % count;
}

// Fallback hex tile geometry (slightly oversized radius to avoid micro gaps)
const FALLBACK_HEX_RADIUS = DEFAULT_HEX_SIZE;
const FALLBACK_GEOMETRY = new CylinderGeometry(
  FALLBACK_HEX_RADIUS,
  FALLBACK_HEX_RADIUS,
  1, // unit height, scaled per instance
  6,
  1,
  false
);
// CylinderGeometry with 6 radial segments is already pointy-top oriented by default

// Prepare simple materials cache per biome bucket to keep GPU state changes minimal
const materialCache = new Map<string, MeshStandardMaterial>();
function materialForBiomeBucket(biome: BiomeType, bucket: number, total: number) {
  const key = `${biome}:${bucket}/${total}`;
  let m = materialCache.get(key);
  if (!m) {
    const color = colorForBiomeBucket(biome, bucket, total);
    m = new MeshStandardMaterial({ color: new Color(color), roughness: 0.9, metalness: 0.02 });
    materialCache.set(key, m);
  }
  return m;
}

type Bucket = {
  biome: BiomeType;
  variantIndex: number;
  positions: Array<[number, number, number]>;
  elevations: number[];
  hexCoords: Array<{ q: number; r: number }>; // for debug/wrapping helpers
};

function buildBuckets(tiles: Tile[]): Bucket[] {
  const buckets: Record<string, Bucket> = {};
  for (const t of tiles) {
    const count = Math.max(1, getVariantCount(t.biome));
    const variantIndex = variantIndexFor(t.coord.q, t.coord.r, count);
    const key = `${t.biome}:${variantIndex}`;
    let b = buckets[key];
    if (!b) {
      b = buckets[key] = {
        biome: t.biome,
        variantIndex,
        positions: [],
        elevations: [],
        hexCoords: [],
      };
    }
    const [x, z] = axialToWorld(t.coord.q, t.coord.r, DEFAULT_HEX_SIZE);
    b.positions.push([x, 0, z]);
    b.elevations.push(t.elevation);
    b.hexCoords.push({ q: t.coord.q, r: t.coord.r });
  }
  return Object.values(buckets);
}

// Convert bucket positions/elevations into instanced transforms, scaling Y by elevation
function transformsForBucket(bucket: Bucket): InstanceTransform[] {
  const out: InstanceTransform[] = [];
  const base = 0.06; // base tile height
  const amp = 0.22; // elevation scale
  for (let i = 0; i < bucket.positions.length; i++) {
    const [x, , z] = bucket.positions[i];
    const yScale = base + amp * bucket.elevations[i];
    // position Y so tile rests on ground plane
    const posY = yScale * 0.5;
    out.push({ position: [x, posY, z], scale: [1, yScale, 1], rotationY: 0 });
  }
  return out;
}

function HexBucketsInstanced({ buckets }: { buckets: Bucket[] }) {
  // Attempt to render GLTF assets when available per variant; fallback to hex cylinders otherwise
  return (
    <group name="hex-buckets">
      {buckets.map((b) => {
        const assets = getVariantAssets(b.biome, b.variantIndex);
        const transforms = transformsForBucket(b);
        if (assets && assets.geometry && assets.material) {
          const geometry = assets.geometry as BufferGeometry;
          const material = assets.material as Material | Material[];
          return (
            <InstancedModels
              key={`${b.biome}:${b.variantIndex}:asset`}
              geometry={geometry}
              material={material}
              transforms={transforms}
              receiveShadow
              castShadow
              name={`bucket-${b.biome}-${b.variantIndex}`}
            />
          );
        }
        // Fallback — procedural hex prism with per-bucket tinted material
        const mat = materialForBiomeBucket(
          b.biome,
          b.variantIndex,
          Math.max(1, getVariantCount(b.biome))
        );
        return (
          <InstancedModels
            key={`${b.biome}:${b.variantIndex}:fallback`}
            geometry={FALLBACK_GEOMETRY}
            material={mat}
            transforms={transforms}
            receiveShadow
            castShadow
            name={`bucket-fallback-${b.biome}-${b.variantIndex}`}
          />
        );
      })}
    </group>
  );
}

// Main scene component
export function ConnectedScene() {
  const { state } = useGame();
  const { selectedUnitId } = useSelection();
  // Enable cylindrical camera wrapping
  useCameraWrapping({
    ...DEFAULT_WRAPPING_CONFIG,
    worldWidth: state.map.width,
    worldHeight: state.map.height,
  });

  // Kick off loading for known assets (grassland variants)
  const [assetVersion, setAssetVersion] = React.useState(0);
  React.useEffect(() => {
    // Only on client
    if (typeof window === 'undefined') return;
    loadBiomeVariants('grass').catch(() => {});
    const handler = () => setAssetVersion((v) => v + 1);
    window.addEventListener(BIOME_ASSETS_EVENT, handler as any);
    return () => window.removeEventListener(BIOME_ASSETS_EVENT, handler as any);
  }, []);

  // Load background texture via hook (must be unconditionally called to keep hook order stable)
  const dragonTexture = useTexture(dragonMapUrl) as any;

  // When texture and bounds are available, configure repeating so the image tiles across the plane

  // Compute background bounds from tiles (memoized)
  const backgroundBounds = React.useMemo(() => {
    const positions = state.map.tiles.map((t) =>
      axialToWorld(t.coord.q, t.coord.r, DEFAULT_HEX_SIZE)
    );
    if (positions.length === 0) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const [x, z] of positions) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const pad = DEFAULT_HEX_SIZE * 10;
    const width = Math.max(1, maxX - minX + pad * 2) * 64;
    const height = Math.max(1, maxZ - minZ + pad * 2) * 64;
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    return { width, height, centerX, centerZ };
  }, [state.map.tiles]);

  // When texture and bounds are available, configure repeating so the image tiles across the plane
  React.useEffect(() => {
    if (!dragonTexture || !backgroundBounds) return;
    try {
      dragonTexture.wrapS = dragonTexture.wrapT = RepeatWrapping;
      // Repeat across the map so there is roughly one texture tile per map column/row
      const repeatX = Math.max(1, Math.round(state.map.width));
      const repeatY = Math.max(1, Math.round(state.map.height));
      dragonTexture.repeat.set(repeatX, repeatY);
      dragonTexture.needsUpdate = true;
    } catch {
      // ignore
    }
  }, [dragonTexture, backgroundBounds, state.map.width, state.map.height]);

  // Build buckets and apply cylindrical wrapping duplicates
  const buckets = React.useMemo(() => {
    const baseBuckets = buildBuckets(state.map.tiles);
    const config = {
      ...DEFAULT_WRAPPING_CONFIG,
      worldWidth: state.map.width,
      worldHeight: state.map.height,
    };
    const wrapped = generateWrappedBiomeGroups(
      baseBuckets.map((b) => ({
        positions: b.positions,
        elevations: b.elevations,
        color: baseColorForBiome(b.biome),
        biome: String(b.biome),
        variantIndex: b.variantIndex,
        hexCoords: b.hexCoords,
      })),
      state.map.tiles as any,
      config,
      DEFAULT_HEX_SIZE
    );
    // Map back into Bucket type
    return wrapped.map((g) => ({
      biome: g.biome as BiomeType,
      variantIndex: g.variantIndex,
      positions: g.positions,
      elevations: g.elevations,
      hexCoords: g.hexCoords,
    }));
  }, [state.map.tiles, state.map.width, state.map.height, assetVersion]);

  // Hovered tile label via custom event (dev/test convenience)
  const [hoverPos, setHoverPos] = React.useState<[number, number, number] | undefined>();
  React.useEffect(() => {
    const onHover = (event: any) => {
      const index = event?.detail?.index ?? -1;
      const t = state.map.tiles[index];
      if (!t) {
        setHoverPos(undefined);
        return;
      }
      const [x, z] = axialToWorld(t.coord.q, t.coord.r, DEFAULT_HEX_SIZE);
      setHoverPos([x, 0.9, z]);
    };
    globalThis.addEventListener('civweblite:hoverTileIndex', onHover);
    return () => globalThis.removeEventListener('civweblite:hoverTileIndex', onHover);
  }, [state.map.tiles]);

  // Selected unit label position
  const [selectedUnitLabel, setSelectedUnitLabel] = React.useState<
    { pos: [number, number, number]; id: string } | undefined
  >();
  React.useEffect(() => {
    if (!state.contentExt || !selectedUnitId) {
      setSelectedUnitLabel(undefined);
      return;
    }
    const u = state.contentExt.units[selectedUnitId];
    if (!u) {
      setSelectedUnitLabel(undefined);
      return;
    }
    let xz: [number, number] | undefined;
    if (typeof u.location === 'string') {
      const tile = state.contentExt.tiles[u.location];
      if (tile) xz = axialToWorld(tile.q, tile.r, DEFAULT_HEX_SIZE);
    } else if (u.location && typeof (u.location as any).q === 'number') {
      xz = axialToWorld((u.location as any).q, (u.location as any).r, DEFAULT_HEX_SIZE);
    }
    const [x, z] = (xz ?? [0, 0]) as [number, number];
    setSelectedUnitLabel({ id: selectedUnitId, pos: [x, 1.2, z] });
  }, [state.contentExt, selectedUnitId]);

  return (
    <group name="scene-root">
      {/* Controls and lights are managed at App-level; this exposes movement */}
      <CameraControls />

      {/* Background map plane (stretched to cover the map extents). Placed slightly below tiles */}
      {/**
       * Strategy:
       * - Compute approximate world bounds from tiles
       * - Create a single Plane geometry sized to cover bounds + padding
       * - Apply the dragonmap texture and place the plane slightly below the tile geometry so it appears under the map
       */}
      {dragonTexture && backgroundBounds ? (
        <mesh
          key="background-dragonmap"
          position={[backgroundBounds.centerX, -0.05, backgroundBounds.centerZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          name="background-map"
          receiveShadow={false}
          castShadow={false}
        >
          <planeGeometry args={[backgroundBounds.width, backgroundBounds.height]} />
          <meshStandardMaterial
            map={dragonTexture}
            toneMapped={false}
            transparent={false}
            depthWrite={true}
          />
        </mesh>
      ) : undefined}

      {/* Terrain */}
      <HexBucketsInstanced buckets={buckets} />

      {/* Units & labels */}
      <UnitMeshes />
      <UnitMarkers />

      {/* Hovered tile */}
      {hoverPos ? (
        <HtmlLabel position={hoverPos} data-testid="hovered-tile-label" center>
          hovered
        </HtmlLabel>
      ) : undefined}

      {/* Selected unit label */}
      {selectedUnitLabel ? (
        <HtmlLabel position={selectedUnitLabel.pos} data-testid="selected-unit-label" center>
          {selectedUnitLabel.id}
        </HtmlLabel>
      ) : undefined}
    </group>
  );
}

// Default export for convenience
// Default export is a safe stub for tests that render the Scene without
// providers. App imports ConnectedScene explicitly via dynamic import.
export default function Scene() {
  return <group name="scene-stub" />;
}
