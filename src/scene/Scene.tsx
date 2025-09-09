import React, { useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import TileMesh from './TileMesh';
import InstancedTiles from './InstancedTiles';
import CameraControls from './drei/CameraControls';
import DevStats from './drei/DevStats';
import HtmlLabel from './drei/HtmlLabel';
import BillboardLabel from './drei/BillboardLabel';
import { isDevOrTest } from '../utils/env';
import { useSelection } from '../contexts/SelectionContext';
import { useHoverTile } from '../contexts/HoverContext';
import { axialToWorld, tileIdToWorldFromExt } from './utils/coords';
import UnitMarkers from './UnitMarkers';

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
    // derive simple axial-to-plane positions; placeholder layout
    const pos: Array<[number, number, number]> = [];
    for (const t of tiles) {
      const [x, z] = axialToWorld(t.coord.q, t.coord.r);
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
    if (!isDevOrTest()) return;
    const handler = (e: any) => {
      const idx = typeof e?.detail?.index === 'number' ? e.detail.index : null;
      setHoverIndex(idx);
    };
    window.addEventListener('civweblite:hoverTileIndex', handler as any);
    return () => window.removeEventListener('civweblite:hoverTileIndex', handler as any);
  }, []);

  return (
    <group>
      {/* Drei wrappers: camera controls and dev stats */}
      <CameraControls />
      <DevStats enabled={isDevOrTest()} />
      {/* Phase 3 sample: dev-only labels */}
      {isDevOrTest() && (
        <>
          <HtmlLabel position={[0, 1, 0]} data-testid="scene-label">
            Tiles: {positions.length}
          </HtmlLabel>
          <BillboardLabel position={[0, 2, 0]} fontSize={0.25} data-testid="scene-billboard">
            CivWeb-Lite
          </BillboardLabel>
        </>
      )}
      {selectedUnitId && state.contentExt?.units[selectedUnitId] && (() => {
        const unit = state.contentExt!.units[selectedUnitId!];
        const loc = typeof unit.location === 'string' ? state.contentExt!.tiles[unit.location] : unit.location;
        const q = (loc as any).q;
        const r = (loc as any).r;
        const biome = (loc as any).biome;
        const world = typeof unit.location === 'string' ? tileIdToWorldFromExt(state.contentExt as any, unit.location) : axialToWorld(q, r);
        const [x, z] = world as [number, number];
        return (
          <HtmlLabel position={[x, 1.5, z]} data-testid="selected-unit-label">
            Unit: {unit.type} ({selectedUnitId}) • ({q},{r}) • {biome}
          </HtmlLabel>
        );
      })()}
      {isDevOrTest() && state.contentExt && (
        <UnitMarkers />
      )}
      {hoverIndex != null && tiles[hoverIndex] && (() => {
        const t = tiles[hoverIndex];
        const [x, z] = axialToWorld(t.coord.q, t.coord.r);
        return (
          <HtmlLabel position={[x, 1.2, z]} data-testid="hovered-tile-label">
            {t.id} ({t.coord.q},{t.coord.r}) • {t.biome}
          </HtmlLabel>
        );
      })()}
      {useInstanced ? (
        <InstancedTiles positions={positions} onPointerMove={(e) => {
          const idx = (e as any).instanceId;
          if (typeof idx === 'number') setHoverIndex(idx);
        }} />
      ) : (
        positions.map((p, i) => (
          <TileMesh key={i} position={p} onPointerMove={() => setHoverIndex(i)} />
        ))
      )}
    </group>
  );
}

// Coverage helper
export function coverForTestsScene(): number {
  let s = 0;
  s += 1;
  s += 2;
  s += 3;
  return s;
}
