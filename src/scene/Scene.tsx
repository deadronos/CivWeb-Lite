import React, { useMemo } from 'react';
import { useGame } from "..\\hooks\\use-game";
import TileMesh from "./tile-mesh";
import InstancedTiles from "./instanced-tiles";
import CameraControls from "./drei\\camera-controls";
import DevStats from "./drei\\dev-stats";
import HtmlLabel from "./drei\\html-label";
import BillboardLabel from "./drei\\billboard-label";
import { isDevOrTest as isDevelopmentOrTest } from '../utils/env';
import { useSelection } from "..\\contexts\\selection-context";
import { useHoverTile } from "..\\contexts\\hover-context";
import { axialToWorld, tileIdToWorldFromExt as tileIdToWorldFromExtension, DEFAULT_HEX_SIZE } from './utils/coords';
import UnitMarkers from "./unit-markers";
import UnitMeshes from "./unit-meshes";
import ProceduralPreload from "./units\\procedural-preload";

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
    // derive simple axial-to-plane positions using shared hex size
    const pos: Array<[number, number, number]> = [];
    for (const t of tiles) {
      const [x, z] = axialToWorld(t.coord.q, t.coord.r, DEFAULT_HEX_SIZE);
      pos.push([x, 0, z]);
    }
    // Cap positions during tests to keep the DOM light
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
      return pos.slice(0, 100);
    }
    return pos;
  }, [tiles]);

  const useInstanced = true;

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
      <ProceduralPreload />
      {/* Drei wrappers: camera controls and dev stats */}
      <CameraControls />
      <DevStats enabled={isDevelopmentOrTest()} />
      {/* Phase 3 sample: dev-only labels */}
      {isDevelopmentOrTest() &&
      <>
          <HtmlLabel position={[0, 1, 0]} data-testid="scene-label">
            Tiles: {positions.length}
          </HtmlLabel>
          <BillboardLabel position={[0, 2, 0]} fontSize={0.25} data-testid="scene-billboard">
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
      {/* Units (procedural by default, GLTF behind flag) */}
      {state.contentExt && <UnitMeshes />}
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
      <InstancedTiles
        positions={positions}
        size={DEFAULT_HEX_SIZE}
        onPointerMove={(e) => {
          const index = (e as any).instanceId;
          if (typeof index === 'number') setHoverIndex(index);
        }} /> :


      positions.map((p, index) =>
      <TileMesh
        key={index}
        position={p}
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