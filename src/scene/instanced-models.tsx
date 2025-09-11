import React, { useEffect, useMemo, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';

type InstancedModelsProperties = {
  geometry: any; // THREE.BufferGeometry
  material: any; // THREE.Material
  positions: Array<[number, number, number]>;
  size?: number; // hex radius baseline (to scale geometry uniformly)
  elevations?: number[]; // 0..1 per instance -> Y scale
  onPointerMove?: (e: any) => void;
};

export default function InstancedModels({ geometry, material, positions, size = 0.5, elevations, onPointerMove }: InstancedModelsProperties) {
  const count = positions.length;
  const reference = useRef<InstancedMesh>(null);
  const object = useMemo(() => new Object3D(), []);

  useEffect(() => {
    const mesh = reference.current;
    if (!mesh) return;
    if (typeof (mesh as any).setMatrixAt !== 'function') return;
    mesh.count = count;
    for (let index = 0; index < count; index++) {
      const p = positions[index];
      object.position.set(p[0], p[1], p[2]);
      const scaleFactor = size / 0.5; // assume source geometry matches 0.5 radius baseline
      const e = elevations && elevations[index] != undefined ? elevations[index] : 0.5;
      const desiredHeight = 0.06 + (0.12 - 0.06) * Math.max(0, Math.min(1, e));
      const heightScale = desiredHeight / 0.08;
      object.scale.set(scaleFactor, heightScale, scaleFactor);
      object.rotation.set(0, -Math.PI / 6, 0);
      object.updateMatrix();
      (mesh as any).setMatrixAt(index, object.matrix);
    }
    if ((mesh as any).instanceMatrix) (mesh as any).instanceMatrix.needsUpdate = true;
  }, [positions, elevations, size, object, count]);

  return (
    <instancedMesh ref={reference} args={[geometry as any, material as any, count]} onPointerMove={onPointerMove as any} />
  );
}

