import React, { useMemo, useEffect, useRef } from 'react';
import { InstancedMesh, Object3D, Color } from 'three';

type InstancedTilesProperties = {
  positions: Array<[number, number, number]>;
  color?: string; // fallback uniform color
  colors?: string[]; // optional per-instance hex colors (length === positions.length)
  size?: number; // hex radius
  elevations?: number[]; // 0..1, same length as positions; used for slight height variation
  onPointerMove?: (event: any) => void;
};

// Instanced tiles component used by ConnectedScene to render the map
export function InstancedTiles({
  positions,
  color = '#7ac',
  colors,
  size = 0.5,
  elevations,
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
        // Height variation by elevation: map 0..1 -> 0.06..0.12 (geometry base height is 0.08)
  const elevation = elevations && elevations[index] != undefined ? elevations[index] : 0.5;
  const desiredHeight = 0.06 + (0.12 - 0.06) * Math.max(0, Math.min(1, elevation));
        const heightScale = desiredHeight / 0.08;
        object.scale.set(scaleFactor, heightScale, scaleFactor);
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
        // Ensure material is expecting vertex colors only if the instanceColor attribute exists
        if ((mesh as any).instanceColor && mesh.material) {
          // Use pure white so instance vertex colors are not tinted darker
          (mesh.material as any).color = new Color('#ffffff');
          (mesh.material as any).vertexColors = true;
          try { (mesh.material as any).side = (mesh.material as any).side || (require('three').DoubleSide); } catch { /* ignore in browser env */ }
          (mesh.material as any).needsUpdate = true;
        }
      } else {
        if (mesh.material) {
          (mesh.material as any).color = new Color(materialColor);
          (mesh.material as any).vertexColors = false;
          (mesh.material as any).needsUpdate = true;
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
      {/**
       * We default vertexColors to false here; the effect toggles it on when
       * instance colors are actually set via setColorAt. This avoids a state
       * where vertexColors=true but no instanceColor attribute exists yet,
       * which renders black on some three versions.
       */}
      {/**
       * Lambert is bright and view-independent enough while respecting lights.
       * Start with vertexColors disabled; effect enables it after instance colors are populated
       * to avoid black output on first frame.
       */}
      <meshLambertMaterial color={materialColor} vertexColors={false} />
    </instancedMesh>
  );
}

export default React.memo(InstancedTiles);
