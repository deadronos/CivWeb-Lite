import React from 'react';
import { InstancedMesh, Matrix4, Object3D } from 'three';

export type InstanceTransform = {
  position: [number, number, number];
  scale?: number | [number, number, number];
  rotationY?: number; // radians
};

type Properties = {
  geometry: any; // THREE.BufferGeometry
  material: any; // THREE.Material | THREE.Material[]
  transforms: InstanceTransform[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  name?: string;
  frustumCulled?: boolean; // default false: instances can extend far due to wrapping
};

// Lightweight helper to render arbitrary geometry via InstancedMesh.
// Accepts per-instance transforms and applies them to the instanceMatrix.
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
