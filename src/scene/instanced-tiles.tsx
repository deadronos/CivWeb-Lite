import React, { useMemo, useEffect, useRef } from 'react';
import { InstancedMesh, Object3D, Color, InstancedBufferAttribute, DoubleSide, DynamicDrawUsage, BufferGeometry, MeshBasicMaterial, BufferAttribute } from 'three';

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
  // Optional debug logging switch: set `window.__CWL_DEBUG = true` in devtools to enable
  const debugLogs = useMemo(() => {
    return (globalThis as any).window !== undefined && (globalThis as any).window.__CWL_DEBUG === true;
  }, []);

  // temp object for building matrices
  const object = useMemo(() => new Object3D(), []);

  useEffect(() => {
    const mesh = reference.current;
    if (!mesh) return;
    // one-time debug log for diagnosing black tile rendering in instanced meshes
    if (debugLogs && !didLogReference.current) {
      console.log('[debug] InstancedTiles: mesh.instanceColor present?', !!(mesh as any).instanceColor);
      console.log('[debug] InstancedTiles: debug props', { count, colorsType: typeof colors, colorsLen: colors ? colors.length : undefined, sampleColors: colors ? colors.slice(0, 3) : undefined, geometryName: mesh.geometry?.constructor?.name, hasSetAttribute: typeof mesh.geometry?.setAttribute === 'function' });
      didLogReference.current = true;
    }
    // Ensure the base geometry has a vertex color buffer. Some materials enable
    // vertex colors, which expects a `color` attribute; if it's missing, some
    // drivers feed (0,0,0) and the mesh appears black. A white buffer keeps the
    // base color intact while allowing per-instance tinting to multiply in.
    try {
      const g: any = mesh.geometry;
      const hasColorAttribute = !!(g && g.getAttribute && g.getAttribute('color'));
      const positionAttribute: any = g && g.getAttribute && g.getAttribute('position');
      if (!hasColorAttribute && positionAttribute && typeof positionAttribute.count === 'number') {
        const countVerts = positionAttribute.count;
        const array = new Float32Array(countVerts * 3);
        for (let index = 0; index < array.length; index++) array[index] = 1; // white
        g.setAttribute('color', new BufferAttribute(array, 3));
        try { (g.getAttribute('color') as any).needsUpdate = true; } catch {}
        if (debugLogs) console.log('[debug] InstancedTiles: added default white vertex color buffer to geometry');
      }
    } catch {}

    // Only operate if this ref is a real InstancedMesh with expected methods (r3f in test env may render DOM placeholders)
    if (typeof (mesh as any).setMatrixAt === 'function') {
      // Avoid instances popping due to conservative bounding volumes; we can
      // re-enable and compute a custom bounding box later if needed.
      try { (mesh as any).frustumCulled = false; } catch {}
      // Ensure instance count
      mesh.count = count;
      // Write instance matrices
      for (let index = 0; index < count; index++) {
        const p = positions[index];
  // nudge up slightly to avoid any z-fighting with ground (increase slightly for stubborn drivers)
  object.position.set(p[0], (p[1] ?? 0) + 0.015, p[2]);
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
        // Preferred path: use built-in InstancedMesh.setColorAt which ensures proper
        // defines (USE_INSTANCING_COLOR) and attribute wiring across three versions.
        if (typeof (mesh as any).setColorAt === 'function') {
          try {
            for (let index = 0; index < count; index++) {
              const c = new Color(colors[index] || materialColor);
              (mesh as any).setColorAt(index, c);
            }
            if ((mesh as any).instanceColor) {
              try { (mesh as any).instanceColor.needsUpdate = true; } catch {}
            }
            // Enable vertex colors on the material and use white base to avoid tinting down
            if (mesh.material) {
              (mesh.material as any).color = new Color('#ffffff');
              (mesh.material as any).vertexColors = true;
              try { (mesh.material as any).side = (mesh.material as any).side || DoubleSide; } catch {}
              // Inject per-instance color multiplication to be absolutely sure the shader uses it
              try {
                const mat: any = mesh.material;
                mat.onBeforeCompile = (shader: any) => {
                  try {
                    const vs0 = shader.vertexShader;
                    const fs0 = shader.fragmentShader;
                    let vs = vs0
                      .replace('#include <color_pars_vertex>', `#include <color_pars_vertex>\nattribute vec3 instanceColor;\nvarying vec3 vInstanceColor;`)
                      .replace('#include <begin_vertex>', `#include <begin_vertex>\n vInstanceColor = instanceColor;`);
                    let fs = fs0
                      .replace('#include <color_pars_fragment>', `#include <color_pars_fragment>\nvarying vec3 vInstanceColor;`)
                      .replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb *= vInstanceColor;`);
                    if (vs === vs0) {
                      const insertPoint = vs0.indexOf('void main()');
                      if (insertPoint !== -1) {
                        const braceIndex = vs0.indexOf('{', insertPoint);
                        if (braceIndex !== -1) {
                          vs = `attribute vec3 instanceColor;\nvarying vec3 vInstanceColor;\n` +
                               vs0.slice(0, braceIndex + 1) +
                               `\n vInstanceColor = instanceColor;\n` +
                               vs0.slice(braceIndex + 1);
                        }
                      }
                    }
                    if (fs === fs0) {
                      const lastBrace = fs0.lastIndexOf('}');
                      if (lastBrace > 0) {
                        fs = `varying vec3 vInstanceColor;\n` +
                             fs0.slice(0, lastBrace) +
                             `\n gl_FragColor.rgb *= vInstanceColor;\n` +
                             fs0.slice(lastBrace);
                      }
                    }
                    shader.vertexShader = vs;
                    shader.fragmentShader = fs;
                  } catch {}
                };
              } catch {}
              try { (mesh.material as any).needsUpdate = true; } catch {}
            }
            if (debugLogs) console.log('[debug] InstancedTiles: set per-instance colors via setColorAt()', { count, hasInstanceColor: !!(mesh as any).instanceColor });
            // As an extra safeguard against lighting/material issues rendering black,
            // temporarily replace with MeshBasicMaterial that honors vertexColors.
            try {
              const already = !!(mesh as any).__replacedWithBasic;
              if (!already) {
                mesh.material = new MeshBasicMaterial({ color: new Color('#ffffff'), vertexColors: true, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }) as any;
                try { (mesh.material as any).flatShading = true; } catch {}
                (mesh as any).__replacedWithBasic = true;
                if (debugLogs) console.log('[debug] InstancedTiles: (setColorAt path) replaced material with MeshBasicMaterial for debug');
                try { (mesh.material as any).needsUpdate = true; } catch {}
              }
            } catch {}
            // Early return: we've set up colors via the official API; skip manual attribute path
            return;
          } catch {
            if (debugLogs) console.warn('[debug] InstancedTiles: setColorAt path failed, will try manual attribute path');
          }
        }
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
          // Ensure the attribute is marked dynamic so Three uploads it properly
          try {
            attribute.setUsage && attribute.setUsage(DynamicDrawUsage);
          } catch {
            // ignore if not supported
          }
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
            try { (mesh as any).instanceColor.needsUpdate = true; } catch { /* ignore */ }
            // Also mark the geometry attribute and material for update to force a GPU upload
            try {
              const gattr = mesh.geometry && mesh.geometry.getAttribute && mesh.geometry.getAttribute('instanceColor');
              if (gattr) {
                try { (gattr as any).needsUpdate = true; } catch {}
                try { (gattr as any).setUsage && (gattr as any).setUsage(DynamicDrawUsage); } catch {}
              }
            } catch {}
            // Post-attach verification: log the attribute and first few values to ensure data uploaded
            try {
              const geomAttribute = mesh.geometry?.getAttribute && mesh.geometry.getAttribute('instanceColor');
              const sample = geomAttribute && geomAttribute.array ? (geomAttribute.array as any).slice(0, Math.min(9, geomAttribute.array.length)) : undefined;
              if (debugLogs) console.log('[debug] InstancedTiles: post-attach attribute', { geomAttribute, meshInstanceColor: (mesh as any).instanceColor, sample, material: mesh.material?.constructor?.name });
            } catch (error) {
              if (debugLogs) console.warn('[debug] InstancedTiles: post-attach verify failed', error);
            }

            // Inject instanceColor into whatever material is active (r3f may re-attach
            // the JSX-declared material, so don't rely on replacing the material pointer).
            try {
              const mat: any = mesh.material;
              if (mat) {
                mat.onBeforeCompile = (shader: any) => {
                  try {
                    const vs0 = shader.vertexShader;
                    const fs0 = shader.fragmentShader;
                    let vs = vs0
                      .replace('#include <color_pars_vertex>', `#include <color_pars_vertex>\nattribute vec3 instanceColor;\nvarying vec3 vInstanceColor;`)
                      .replace('#include <begin_vertex>', `#include <begin_vertex>\n vInstanceColor = instanceColor;`);
                    let fs = fs0
                      .replace('#include <color_pars_fragment>', `#include <color_pars_fragment>\nvarying vec3 vInstanceColor;`)
                      .replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb *= vInstanceColor;`);
                    if (vs === vs0) {
                      const insertPoint = vs0.indexOf('void main()');
                      if (insertPoint !== -1) {
                        const braceIndex = vs0.indexOf('{', insertPoint);
                        if (braceIndex !== -1) {
                          vs = `attribute vec3 instanceColor;\nvarying vec3 vInstanceColor;\n` +
                               vs0.slice(0, braceIndex + 1) +
                               `\n vInstanceColor = instanceColor;\n` +
                               vs0.slice(braceIndex + 1);
                        }
                      }
                    }
                    if (fs === fs0) {
                      const lastBrace = fs0.lastIndexOf('}');
                      if (lastBrace > 0) {
                        fs = `varying vec3 vInstanceColor;\n` +
                             fs0.slice(0, lastBrace) +
                             `\n gl_FragColor.rgb *= vInstanceColor;\n` +
                             fs0.slice(lastBrace);
                      }
                    }
                    shader.vertexShader = vs;
                    shader.fragmentShader = fs;
                  } catch {}
                };
                mat.color = new Color('#ffffff');
                mat.vertexColors = true;
                try { mat.side = mat.side || DoubleSide; } catch {}
                try { mat.needsUpdate = true; } catch {}
              }
            } catch {}
            // Attempt a stronger fallback for specialized geometries: create a fresh
            // BufferGeometry with copied attributes and attach the instanceColor to
            // ensure the renderer binds the attribute locations. This can fix cases
            // where shared or non-buffer-backed geometries don't pick up newly
            // attached attributes in some WebGL drivers.
            try {
              const geomName = mesh.geometry?.constructor?.name;
              if (geomName && geomName !== 'BufferGeometry') {
                try {
                  const oldGeom: any = mesh.geometry;
                  const copiedGeometry = new BufferGeometry();
                  // copy attributes
                  if (oldGeom && oldGeom.attributes) {
                    for (const key of Object.keys(oldGeom.attributes)) {
                      const a = oldGeom.getAttribute(key);
                      if (a && typeof a.clone === 'function') {
                        copiedGeometry.setAttribute(key, a.clone());
                      } else if (a) {
                        // fallback: create a new InstancedBufferAttribute from a copy of the array
                        const arrayCopy = [...(a.array as any)];
                        copiedGeometry.setAttribute(key, new InstancedBufferAttribute(arrayCopy as any, a.itemSize));
                      }
                    }
                  }
                  if (oldGeom.index) {
                    try { copiedGeometry.setIndex(oldGeom.index.clone()); } catch (error) { console.warn('index clone failed', error); }
                  }
                  // attach the instanceColor attribute we built earlier
                  try { copiedGeometry.setAttribute('instanceColor', attribute.clone()); } catch { try { copiedGeometry.setAttribute('instanceColor', attribute as any); } catch (error_) { console.warn('attach copied attribute failed', error_); } }
                  mesh.geometry = copiedGeometry as any;
                  // mark updates
                  try { mesh.geometry.getAttribute('instanceColor').needsUpdate = true; } catch { /* ignore */ }
                  if (debugLogs) console.log('[debug] InstancedTiles: replaced geometry with fresh BufferGeometry and attached instanceColor');
                } catch (error) {
                  if (debugLogs) console.warn('[debug] InstancedTiles: fresh BufferGeometry fallback failed', error);
                }
              }
            } catch {
              // swallow fallback errors
            }

            // Now that instanceColor exists, enable vertex colors on the material.
            // TEMPORARY DEBUG: replace material with MeshBasicMaterial which
            // ignores lighting. If colors suddenly show up, it's a lighting/material
            // interaction; if still black, the attribute is not being consumed.
            try {
              const replaced = !!(mesh as any).__replacedWithBasic;
              if (replaced) {
                try { (mesh.material as any).needsUpdate = true; } catch {}
              } else {
                try {
                  mesh.material = new MeshBasicMaterial({ color: new Color('#ffffff'), vertexColors: true, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }) as any;
                  try { (mesh.material as any).flatShading = true; } catch {}
                  try {
                    (mesh.material as any).onBeforeCompile = (shader: any) => {
                      try {
                        const vs0 = shader.vertexShader;
                        const fs0 = shader.fragmentShader;
                        let vs = vs0
                          .replace('#include <color_pars_vertex>', `#include <color_pars_vertex>\nattribute vec3 instanceColor;\nvarying vec3 vInstanceColor;`)
                          .replace('#include <begin_vertex>', `#include <begin_vertex>\n vInstanceColor = instanceColor;`);
                        let fs = fs0
                          .replace('#include <color_pars_fragment>', `#include <color_pars_fragment>\nvarying vec3 vInstanceColor;`)
                          .replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb *= vInstanceColor;`);
                        // Fallback if include markers not found
                        if (vs === vs0) {
                          const insertPoint = vs0.indexOf('void main()');
                          if (insertPoint !== -1) {
                            const braceIndex = vs0.indexOf('{', insertPoint);
                            if (braceIndex !== -1) {
                              vs = `attribute vec3 instanceColor;\nvarying vec3 vInstanceColor;\n` +
                                   vs0.slice(0, braceIndex + 1) +
                                   `\n vInstanceColor = instanceColor;\n` +
                                   vs0.slice(braceIndex + 1);
                            }
                          }
                        }
                        if (fs === fs0) {
                          const lastBrace = fs0.lastIndexOf('}');
                          if (lastBrace > 0) {
                            fs = `varying vec3 vInstanceColor;\n` +
                                 fs0.slice(0, lastBrace) +
                                 `\n gl_FragColor.rgb *= vInstanceColor;\n` +
                                 fs0.slice(lastBrace);
                          }
                        }
                        shader.vertexShader = vs;
                        shader.fragmentShader = fs;
                      } catch {}
                    };
                  } catch {}
                  (mesh as any).__replacedWithBasic = true;
                  if (debugLogs) console.log('[debug] InstancedTiles: replaced material with MeshBasicMaterial for debug');
                  try { (mesh.material as any).needsUpdate = true; } catch {}
                } catch {
                  // fallback to toggling existing material
                    if (mesh.material) {
                      (mesh.material as any).color = new Color('#ffffff');
                      (mesh.material as any).vertexColors = true;
                      try { (mesh.material as any).side = (mesh.material as any).side || DoubleSide; } catch {}
                      try { (mesh.material as any).polygonOffset = true; (mesh.material as any).polygonOffsetFactor = -2; (mesh.material as any).polygonOffsetUnits = -2; } catch {}
                      try { (mesh.material as any).flatShading = true; } catch {}
                      try { (mesh.material as any).needsUpdate = true; } catch {}
                    }
                }
              }
            } catch {
              // ignore
            }
          } else {
            // Attach failed; fallback to uniform color
            if (debugLogs) console.warn('[debug] InstancedTiles: failed to attach instanceColor attribute; using uniform color');
            if (mesh.material) {
              (mesh.material as any).color = new Color(materialColor);
              (mesh.material as any).vertexColors = false;
              (mesh.material as any).needsUpdate = true;
            }
          }
        } catch (error) {
          if (debugLogs) console.warn('[debug] InstancedTiles: error building instanceColor buffer', error);
          if (mesh.material) {
            (mesh.material as any).color = new Color(materialColor);
            (mesh.material as any).vertexColors = false;
            (mesh.material as any).needsUpdate = true;
          }
        }
      } else {
        // If colors provided but length mismatched, warn; if intentionally omitted,
        // stay quiet and fall back to uniform per-biome color.
        if (colors && colors.length !== count && debugLogs) console.warn('[debug] InstancedTiles: colors length mismatch', { colorsType: typeof colors, colorsLen: colors ? colors.length : undefined, expected: count });
        if (mesh.material) {
          (mesh.material as any).color = new Color(materialColor);
          (mesh.material as any).vertexColors = false;
          try { (mesh.material as any).side = DoubleSide; } catch {}
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
       * Use MeshBasicMaterial to avoid dependency on scene lighting. The effect will
       * enable vertexColors once per-instance colors are ready. This guarantees tiles
       * are visible even without lights.
       */}
      <meshBasicMaterial color={materialColor} vertexColors={false} />
    </instancedMesh>
  );
}

export default React.memo(InstancedTiles);
