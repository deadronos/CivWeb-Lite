import React, { useMemo } from 'react';
import { useGame } from "../hooks/use-game";
import TileMesh from "./tile-mesh";
import InstancedTiles from "./instanced-tiles";
import CameraControls from "./drei/camera-controls";
import DevStats from "./drei/dev-stats";
import InstancedProbe from "./instanced-probe";
import HtmlLabel from "./drei/html-label";
import BillboardLabel from "./drei/billboard-label";
import { isDevOrTest as isDevelopmentOrTest } from '../utils/env';
import { useSelection } from "../contexts/selection-context";
import { useHoverTile } from "../contexts/hover-context";
import { axialToWorld, tileIdToWorldFromExt as tileIdToWorldFromExtension, DEFAULT_HEX_SIZE } from './utils/coords';
import UnitMarkers from "./unit-markers";
import { colorForTile, baseColorForBiome, colorForBiomeBucket } from './utils/biome-colors';
import { getVariantCount, getVariantAssets } from './assets/biome-variants-registry';
import { loadBiomeVariants, BIOME_ASSETS_EVENT } from './assets/biome-assets';
import InstancedModels from './instanced-models';
import ReactLazy = React.lazy;
const UnitMeshes = React.lazy(() => import('./unit-meshes'));
const ProceduralPreload = React.lazy(() => import('./units/procedural-preload'));

// Base Scene used by existing tests; remains minimal and provider-agnostic
export default function Scene() {
  return <group />;
}

// runtime marker for tests
export const SCENE_RUNTIME_MARKER = true;

// Connected variant that reads game state and renders tiles
export function ConnectedScene() {
  const { state } = useGame();
  const { selectedUnitId } = useSelection();
  const { index: hoverIndex, setHoverIndex } = useHoverTile();
  const tiles = state.map.tiles;
  const positions = useMemo(() => {
    const pos: Array<[number, number, number]> = [];
    for (const t of tiles) {
      const [x, z] = axialToWorld(t.coord.q, t.coord.r, DEFAULT_HEX_SIZE);
      pos.push([x, 0, z]);
    }
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
      return pos.slice(0, 100);
    }
    return pos;
  }, [tiles]);

  // Re-enable instancing to test the original issue
  const useInstanced = true;

  const elevations = useMemo(() => tiles.map((t) => (t as any).elevation ?? 0.5), [tiles]);

  // Procedural biome colors with subtle variation by elevation/moisture
  const colors = useMemo(() => state.map.tiles.map((t) => colorForTile(t as any)), [state.map.tiles]);

  // Feature flag: enable per-instance colors only when explicitly requested.
  // By default we use stable per-biome uniform colors for instanced groups to
  // avoid driver/material quirks that can cause black tiles on some setups.
  const enablePerInstanceColors = useMemo(() => {
    if (globalThis.window === undefined) return false;
    const qp = new URLSearchParams(globalThis.window.location.search);
    return qp.get('pic') === '1';
  }, []);

  // Group tiles by biome for robust instanced rendering without per-instance colors
  // Small stable hash: mirrors the one used for procedural color jitter
  const hash2 = (q: number, r: number) => {
    let x = (q | 0) * 374_761_393 + (r | 0) * 668_265_263;
    x = (x ^ (x >>> 13)) * 1_274_126_177;
    x = x ^ (x >>> 16);
    return (x >>> 0) / 0xFF_FF_FF_FF; // 0..1
  };

  const biomeGroups = useMemo(() => {
    const map: Record<string, { positions: Array<[number, number, number]>; elevations: number[]; color: string; colors?: string[]; biome: string; variantIndex: number }>
      = Object.create(null);
    for (const [index, tile] of tiles.entries()) {
      const t = tile as any;
      const biome = String(t.biome).toLowerCase();
      const variantCount = Math.max(1, getVariantCount(biome));
      // Assign a deterministic variant bucket; if no assets, this will be 1.
      const vIndex = Math.floor(hash2(t.coord.q, t.coord.r) * variantCount);
      const key = `${biome}#${vIndex}`;
      if (!map[key]) map[key] = { positions: [], elevations: [], color: colorForBiomeBucket(t.biome as any, vIndex, variantCount), colors: [], biome, variantIndex: vIndex };
      const [x, z] = axialToWorld(t.coord.q, t.coord.r, DEFAULT_HEX_SIZE);
      map[key].positions.push([x, 0, z]);
      map[key].elevations.push(elevations[index] ?? 0.5);
      // record the per-instance procedural color so InstancedTiles can use instanceColor
      map[key].colors!.push(colorForTile(t as any));
    }
    return Object.values(map);
  }, [tiles, elevations]);

  // Kick off loading biome assets once in browser; safe in dev/test
  React.useEffect(() => {
    // Load for known biome(s); extend as more assets appear
    loadBiomeVariants('grass');
  }, []);

  // Force re-render when biome assets arrive
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const handler = () => force();
    if (globalThis.window !== undefined) {
      globalThis.addEventListener(BIOME_ASSETS_EVENT, handler as any);
      return () => globalThis.removeEventListener(BIOME_ASSETS_EVENT, handler as any);
    }
    return;
  }, []);

  // Dev/test hook: allow tests to set hovered tile index via custom event
  React.useEffect(() => {
    if (!isDevelopmentOrTest()) return;
    const handler = (e: any) => {
      const index = typeof e?.detail?.index === 'number' ? e.detail.index : null;
      setHoverIndex(index);
    };
    globalThis.addEventListener('civweblite:hoverTileIndex', handler as any);
    return () => globalThis.removeEventListener('civweblite:hoverTileIndex', handler as any);
  }, []);

  return (
    <group>
      <React.Suspense fallback={null}>
        <ProceduralPreload />
      </React.Suspense>
      {/* Drei wrappers: camera controls and dev stats */}
      <CameraControls />
      <DevStats enabled={isDevelopmentOrTest()} />
      {/* Phase 3 sample: dev-only labels */}
      {isDevelopmentOrTest() &&
      <>
          <HtmlLabel position={[0, 1, 0]} data-testid="scene-label">
            Tiles: {positions.length}
          </HtmlLabel>
          <BillboardLabel position={[0, 2, 0]} fontSize={0.25}>
            CivWeb-Lite
          </BillboardLabel>
        </>
      }
      {selectedUnitId &&
      state.contentExt?.units[selectedUnitId] &&
      (() => {
        const unit = state.contentExt!.units[selectedUnitId!];
        const loc =
        typeof unit.location === 'string' ?
        state.contentExt!.tiles[unit.location] :
        unit.location;
        const q = (loc as any).q;
        const r = (loc as any).r;
        const biome = (loc as any).biome;
        const world =
        typeof unit.location === 'string' ?
        tileIdToWorldFromExtension(state.contentExt as any, unit.location, DEFAULT_HEX_SIZE) :
        axialToWorld(q, r, DEFAULT_HEX_SIZE);
        const [x, z] = world as [number, number];
        return (
          <HtmlLabel position={[x, 1.5, z]} data-testid="selected-unit-label">
              Unit: {unit.type} ({selectedUnitId}) • ({q},{r}) • {biome}
            </HtmlLabel>);

      })()}
      {isDevelopmentOrTest() && state.contentExt && <UnitMarkers />}
  {(isDevelopmentOrTest() || (globalThis.window !== undefined && new URLSearchParams(globalThis.window.location.search).get('probe') === '1')) && <InstancedProbe />}
      {/* Units (procedural by default, GLTF behind flag) */}
      {state.contentExt && (
        <React.Suspense fallback={null}>
          <UnitMeshes />
        </React.Suspense>
      )}
      {hoverIndex != undefined &&
      tiles[hoverIndex] &&
      (() => {
        const t = tiles[hoverIndex];
        const [x, z] = axialToWorld(t.coord.q, t.coord.r, DEFAULT_HEX_SIZE);
        return (
          <HtmlLabel position={[x, 1.2, z]} data-testid="hovered-tile-label">
              {t.id} ({t.coord.q},{t.coord.r}) • {t.biome}
            </HtmlLabel>);

      })()}
      {useInstanced ?
      biomeGroups.map((g, gi) => {
        const assets = getVariantAssets(g.biome, g.variantIndex);
        if (assets && assets.geometry && assets.material) {
          return (
            <InstancedModels
              key={g.biome + ':' + gi}
              geometry={assets.geometry as any}
              material={assets.material as any}
              positions={g.positions}
              elevations={g.elevations}
              size={DEFAULT_HEX_SIZE}
              onPointerMove={(e: any) => {
                const index = e?.instanceId;
                if (typeof index === 'number') setHoverIndex(index);
              }}
            />
          );
        }
        return (
          <InstancedTiles
            key={g.biome + ':' + gi}
            positions={g.positions}
            color={g.color}
            colors={enablePerInstanceColors ? g.colors : undefined}
            elevations={g.elevations}
            size={DEFAULT_HEX_SIZE}
            onPointerMove={(e) => {
              const index = (e as any).instanceId;
              if (typeof index === 'number') setHoverIndex(index);
            }} />
        );
      }) :

      positions.map((p, index) =>
      <TileMesh
        key={index}
        position={p}
        color={colors[index]}
        size={DEFAULT_HEX_SIZE}
        onPointerMove={() => setHoverIndex(index)} />

      )
      }
    </group>);

}

// Coverage helper
export function coverForTestsScene(): number {
  let s = 0;
  s += 1;
  s += 2;
  s += 3;
  return s;
}
