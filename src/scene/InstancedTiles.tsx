import React, { useMemo, useEffect, useRef } from 'react';
import { InstancedMesh, Object3D, Color } from 'three';

type InstancedTilesProperties = {
  positions: Array<[number, number, number]>;
  color?: string; // fallback uniform color
  colors?: string[]; // optional per-instance hex colors (length === positions.length)
  size?: number; // hex radius
  onPointerMove?: (e: any) => void;
};

// Lightweight instanced tiles component (not yet wired into Scene)
export function InstancedTiles({
  positions,
  color = '#7ac',
  colors,
  size = 0.5,
  onPointerMove,
}: InstancedTilesProperties) {
  const count = positions.length;
  const reference = useRef<InstancedMesh>(null);
  // Geometry/material memoization keeps re-renders cheap
  const materialColor = useMemo(() => color, [color]);

  // temp object for building matrices
  const object = useMemo(() => new Object3D(), []);

  useEffect(() => {
    const mesh = reference.current;
    if (!mesh) return;
    // Only operate if this ref is a real InstancedMesh with expected methods (r3f in test env may render DOM placeholders)
    if (typeof (mesh as any).setMatrixAt === 'function') {
      // Ensure instance count
      mesh.count = count;
      // Write instance matrices
      for (let index = 0; index < count; index++) {
        const p = positions[index];
        object.position.set(p[0], p[1], p[2]);
        // scale so cylinder radius matches requested size (cylinder base args use 0.5 radius)
        const scaleFactor = size / 0.5;
        object.scale.set(scaleFactor, 1, scaleFactor);
        object.rotation.set(0, 0, 0);
        object.updateMatrix();
        (mesh as any).setMatrixAt(index, object.matrix);
      }
      if ((mesh as any).instanceMatrix) {
        (mesh as any).instanceMatrix.needsUpdate = true;
      }

      // Per-instance colors: if provided, use InstancedMesh.setColorAt (three supports instanceColor)
      if (colors && colors.length === count && typeof (mesh as any).setColorAt === 'function') {
        for (let index = 0; index < count; index++) {
          const c = new Color(colors[index] || materialColor);
          try {
            (mesh as any).setColorAt(index, c);
          } catch {
            // setColorAt may not be present in older three versions; swallow and fallback to uniform color
          }
        }
        if ((mesh as any).instanceColor) (mesh as any).instanceColor.needsUpdate = true;
        if (mesh.material) (mesh.material as any).vertexColors = true;
      } else {
        if (mesh.material) {
          (mesh.material as any).color = new Color(materialColor);
          (mesh.material as any).vertexColors = false;
        }
      }
    } else {
      // Not an InstancedMesh implementation in this environment (likely test DOM placeholder)
      // Skip instance setup to avoid runtime errors.
      // Optionally, we could set up a fallback non-instanced rendering path for tests.
    }
  }, [positions, count, materialColor, object, size, colors]);

  // Build a simple hex cylinder geometry: cylinderGeometry(radius, radius, thickness, radialSegments)
  // We'll let the mesh create geometry from JSX children; provide proper args below.
  return (
    <instancedMesh
      ref={reference}
      args={[undefined as any, undefined as any, count]}
      onPointerMove={onPointerMove as any}
    >
      <cylinderGeometry args={[0.5, 0.5, 0.08, 6]} />
      <meshStandardMaterial
        color={materialColor}
        vertexColors={colors && colors.length === count ? true : false}
      />
    </instancedMesh>
  );
}

export default React.memo(InstancedTiles);
