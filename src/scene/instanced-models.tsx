import React from 'react';
import { InstancedMesh, Matrix4, Object3D } from 'three';

/**
 * @file This file contains the InstancedModels component, which is a lightweight helper to render arbitrary geometry via InstancedMesh.
 */

/**
 * Represents the transform for a single instance.
 * @property position - The position of the instance.
 * @property scale - The scale of the instance.
 * @property rotationY - The rotation of the instance around the Y axis.
 */
export type InstanceTransform = {
  position: [number, number, number];
  scale?: number | [number, number, number];
  rotationY?: number; // radians
};

/**
 * Represents the properties for the InstancedModels component.
 * @property geometry - The geometry to render.
 * @property material - The material to use for rendering.
 * @property transforms - An array of transforms for each instance.
 * @property castShadow - Whether to cast shadows.
 * @property receiveShadow - Whether to receive shadows.
 * @property name - The name of the mesh.
 * @property frustumCulled - Whether to frustum cull the mesh.
 */
type Properties = {
  geometry: any; // THREE.BufferGeometry
  material: any; // THREE.Material | THREE.Material[]
  transforms: InstanceTransform[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  name?: string;
  frustumCulled?: boolean; // default false: instances can extend far due to wrapping
};

/**
 * A lightweight helper to render arbitrary geometry via InstancedMesh.
 * Accepts per-instance transforms and applies them to the instanceMatrix.
 * @param props - The component properties.
 * @returns The rendered component, or null if no geometry, material, or transforms are provided.
 */
export default function InstancedModels({
  geometry,
  material,
  transforms,
  castShadow,
  receiveShadow,
  name,
  frustumCulled = false,
}: Properties) {
  const meshRef = React.useRef<InstancedMesh>(null!);

  // Apply matrices whenever transforms change
  React.useEffect(() => {
    const mesh = meshRef.current as any;
    if (!mesh || typeof mesh.setMatrixAt !== 'function') return; // tests/jsdom may stub this
    const temp = new Object3D();
    const count = transforms.length;
    mesh.count = count;
    for (let i = 0; i < count; i++) {
      const t = transforms[i];
      const [x, y, z] = t.position;
      temp.position.set(x, y, z);
      const s = t.scale ?? 1;
      if (Array.isArray(s)) temp.scale.set(s[0], s[1], s[2]);
      else temp.scale.setScalar(s);
      temp.rotation.set(0, t.rotationY ?? 0, 0);
      temp.updateMatrix();
      mesh.setMatrixAt(i, temp.matrix as Matrix4);
    }
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  if (!geometry || !material || transforms.length === 0) return null;
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, Math.max(1, transforms.length)] as any}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      name={name}
      frustumCulled={frustumCulled}
    />
  );
}
