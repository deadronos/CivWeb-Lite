import React, { useMemo, useEffect, useRef } from 'react';
import { InstancedMesh, Object3D, Color, InstancedBufferAttribute, DoubleSide } from 'three';

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
  // debug: ensure we only log the instanceColor presence once
  const didLogReference = useRef(false);
  // Geometry/material memoization keeps re-renders cheap
  const materialColor = useMemo(() => color, [color]);

  // temp object for building matrices
  const object = useMemo(() => new Object3D(), []);

  useEffect(() => {
    const mesh = reference.current;
    if (!mesh) return;
    // one-time debug log for diagnosing black tile rendering in instanced meshes
    if (!didLogReference.current) {
      console.log('[debug] InstancedTiles: mesh.instanceColor present?', !!(mesh as any).instanceColor);
      console.log('[debug] InstancedTiles: debug props', { count, colorsType: typeof colors, colorsLen: colors ? colors.length : undefined, sampleColors: colors ? colors.slice(0, 3) : undefined, geometryName: mesh.geometry?.constructor?.name, hasSetAttribute: typeof mesh.geometry?.setAttribute === 'function' });
      didLogReference.current = true;
    }
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

      // Per-instance colors: if provided, write a dedicated instanceColor attribute
      // and only enable material.vertexColors after the buffer has valid data. This
      // avoids a transient (or persistent) state where vertexColors=true but the
      // attribute is absent or contains zeros, which can render objects black.
  if (colors && colors.length === count) {
        // Build a packed Float32Array RGB buffer and attach as an attribute atomically
        let attached = false;
        try {
          const array = new Float32Array(count * 3);
          for (let index = 0; index < count; index++) {
            const c = new Color(colors[index] || materialColor);
            const off = index * 3;
            array[off + 0] = c.r;
            array[off + 1] = c.g;
            array[off + 2] = c.b;
          }
          const attribute = new InstancedBufferAttribute(array, 3);
          // Try attaching the attribute; if it fails (read-only geometry) clone and retry.
          try {
            if (mesh.geometry && typeof mesh.geometry.setAttribute === 'function') {
              mesh.geometry.setAttribute('instanceColor', attribute as any);
              attached = true;
            }
          } catch (error) {
            // Log and attempt to recover by cloning geometry (some GLTF geometries are shared/immutable)
            console.warn('[debug] InstancedTiles: setAttribute failed, attempting geometry clone', error);
            try {
              if (mesh.geometry && typeof (mesh.geometry as any).clone === 'function') {
                const cloned = (mesh.geometry as any).clone();
                if (typeof cloned.setAttribute === 'function') {
                  cloned.setAttribute('instanceColor', attribute as any);
                  mesh.geometry = cloned as any;
                  attached = true;
                  console.log('[debug] InstancedTiles: geometry cloned and attribute attached');
                }
              }
            } catch (error) {
              console.warn('[debug] InstancedTiles: geometry clone attempt failed', error);
            }
          }

          if (attached) {
            // Assign to mesh for compatibility with code that checks mesh.instanceColor
            (mesh as any).instanceColor = attribute;
            (mesh as any).instanceColor.needsUpdate = true;
            // Now that instanceColor exists, enable vertex colors on the material
            if (mesh.material) {
              (mesh.material as any).color = new Color('#ffffff');
              (mesh.material as any).vertexColors = true;
              try { (mesh.material as any).side = (mesh.material as any).side || DoubleSide; } catch {
                /* ignore */
              }
              (mesh.material as any).needsUpdate = true;
            }
          } else {
            // Attach failed; fallback to uniform color
            console.warn('[debug] InstancedTiles: failed to attach instanceColor attribute; using uniform color');
            if (mesh.material) {
              (mesh.material as any).color = new Color(materialColor);
              (mesh.material as any).vertexColors = false;
              (mesh.material as any).needsUpdate = true;
            }
          }
        } catch (error) {
          console.warn('[debug] InstancedTiles: error building instanceColor buffer', error);
          if (mesh.material) {
            (mesh.material as any).color = new Color(materialColor);
            (mesh.material as any).vertexColors = false;
            (mesh.material as any).needsUpdate = true;
          }
        }
      } else {
        // Explicit debug when colors are missing or length mismatches
        console.warn('[debug] InstancedTiles: colors missing or length mismatch', { colorsType: typeof colors, colorsLen: colors ? colors.length : undefined, expected: count });
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
    // Cleanup possible RAF scheduled above when effect re-runs or component unmounts
    return () => {
      try {
        const mesh2 = reference.current as any;
        if (mesh2 && mesh2.__instancedVertexColorRaf) {
          cancelAnimationFrame(mesh2.__instancedVertexColorRaf);
          delete mesh2.__instancedVertexColorRaf;
        }
      } catch {
        // ignore
      }
    };
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
