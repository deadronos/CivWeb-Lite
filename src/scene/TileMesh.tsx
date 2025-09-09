import React from 'react';

type TileMeshProps = {
  position: [number, number, number];
  color?: string;
  onPointerMove?: (e: any) => void;
  size?: number; // hex radius (default: 0.5)
};

// TileMesh: renders a flat-top hex using a short cylinder with 6 radial segments.
// Size is the hex radius (distance center->corner). Orientation: flat-top.
export const TileMesh = React.memo(function TileMesh({ position, color = '#88c', onPointerMove, size = 0.5 }: TileMeshProps) {
  const radius = size;
  const thickness = 0.08; // small height for slight elevation
  return (
    <mesh position={position} onPointerMove={onPointerMove as any}>
      {/* cylinderGeometry(topRadius, bottomRadius, height, radialSegments) */}
      <cylinderGeometry args={[radius, radius, thickness, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

export default TileMesh;

