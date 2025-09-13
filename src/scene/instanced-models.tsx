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
  onClick?: (event: any) => void;
  onPointerMove?: (event: any) => void;
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
  onClick,
  onPointerMove,
}: Properties) {
  const meshReference = React.useRef<InstancedMesh | null>(null);

  // Apply matrices whenever transforms change
  React.useEffect(() => {
  const mesh = meshReference.current as any;
    if (!mesh || typeof mesh.setMatrixAt !== 'function') return; // tests/jsdom may stub this
    const temporary = new Object3D();
    const count = transforms.length;
    mesh.count = count;
    for (let index = 0; index < count; index++) {
      const t = transforms[index];
      const [x, y, z] = t.position;
      temporary.position.set(x, y, z);
      const s = t.scale ?? 1;
      if (Array.isArray(s)) temporary.scale.set(s[0], s[1], s[2]);
      else temporary.scale.setScalar(s);
      temporary.rotation.set(0, t.rotationY ?? 0, 0);
      temporary.updateMatrix();
      mesh.setMatrixAt(index, temporary.matrix as Matrix4);
    }
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  if (!geometry || !material || transforms.length === 0) return;
  return (
    <instancedMesh
      ref={meshReference}
      args={[geometry, material, Math.max(1, transforms.length)] as any}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      name={name}
      frustumCulled={frustumCulled}
      onClick={onClick}
      onPointerMove={onPointerMove}
    />
  );
}
