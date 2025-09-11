import React, { useEffect, useMemo, useRef } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';

export default function InstancedProbe() {
  const reference = useRef<InstancedMesh>(null);
  const helper = useMemo(() => new Object3D(), []);

  useEffect(() => {
    const mesh = reference.current as any;
    if (!mesh || typeof mesh.setMatrixAt !== 'function') return;
    const positions: Array<[number, number, number]> = [
      [-1.5, 0.02, -1.5],
      [-1, 0.02, -1],
    ];
    for (const p of positions) {
      helper.position.set(p[0], p[1], p[2]);
      helper.rotation.set(0, 0, 0);
      helper.scale.set(1, 0.2 / 0.08, 1);
      helper.updateMatrix();
      mesh.setMatrixAt(positions.indexOf(p), helper.matrix);
    }
    const colors = [new Color('#ff0000'), new Color('#00ff00')];
    if (typeof mesh.setColorAt === 'function') {
      for (let index = 0; index < colors.length; index++) mesh.setColorAt(index, colors[index]);
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
  }, [helper]);

  return (
    <instancedMesh ref={reference} args={[undefined as any, undefined as any, 2]}
      position={[0, 0, 0]}
    >
      <cylinderGeometry args={[0.5, 0.5, 0.08, 6]} />
      <meshBasicMaterial color={new Color('#ffffff')} vertexColors={true} />
    </instancedMesh>
  );
}
