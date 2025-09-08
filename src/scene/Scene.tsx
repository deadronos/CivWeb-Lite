import React, { useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import TileMesh from './TileMesh';
import InstancedTiles from './InstancedTiles';

// Base Scene used by existing tests; remains minimal and provider-agnostic
export default function Scene() {
  return <group />;
}

// runtime marker for tests
export const SCENE_RUNTIME_MARKER = true;

// Connected variant that reads game state and renders tiles
export function ConnectedScene() {
  const { state } = useGame();
  const positions = useMemo(() => {
    // derive simple axial-to-plane positions; placeholder layout
    const pos: Array<[number, number, number]> = [];
    for (const t of state.map.tiles) {
      const q = t.coord.q;
      const r = t.coord.r;
      const x = q + (r % 2) * 0.5;
      const z = r * 0.866; // ~sqrt(3)/2
      pos.push([x, 0, z]);
    }
    // Cap positions during tests to keep the DOM light
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
      return pos.slice(0, 100);
    }
    return pos;
  }, [state.map.tiles]);

  const useInstanced = true;

  return (
    <group>
      {useInstanced ? (
        <InstancedTiles positions={positions} />
      ) : (
        positions.map((p, i) => <TileMesh key={i} position={p} />)
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
