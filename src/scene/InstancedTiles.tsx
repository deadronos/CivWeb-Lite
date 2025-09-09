import React, { useMemo } from 'react';
import { InstancedMesh } from 'three';

type InstancedTilesProps = {
  positions: Array<[number, number, number]>;
  color?: string;
};

// Lightweight instanced tiles component (not yet wired into Scene)
export function InstancedTiles({ positions, color = '#7ac' }: InstancedTilesProps) {
  const count = positions.length;
  const ref = React.useRef<InstancedMesh>(null);
  // Geometry/material memoization keeps re-renders cheap
  const materialColor = useMemo(() => color, [color]);

  // In a full implementation, we'd set matrix per instance here.
  // Kept minimal to avoid test environment coupling with Three.js internals.
  return (
    <instancedMesh ref={ref} args={[undefined as any, undefined as any, count]}>
      <boxGeometry args={[0.9, 0.1, 0.9]} />
      <meshStandardMaterial color={materialColor} />
    </instancedMesh>
  );
}

export default React.memo(InstancedTiles);

