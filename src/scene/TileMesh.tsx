import React from 'react';

type TileMeshProps = {
  position: [number, number, number];
  color?: string;
  onPointerMove?: (e: any) => void;
};

// Memoized placeholder for a tile mesh; ready for future map rendering
export const TileMesh = React.memo(function TileMesh({ position, color = '#88c', onPointerMove }: TileMeshProps) {
  // Intentionally simple box geometry placeholder
  return (
    <mesh position={position} onPointerMove={onPointerMove as any}>
      <boxGeometry args={[0.9, 0.1, 0.9]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

export default TileMesh;

