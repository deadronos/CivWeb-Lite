 
// TileMesh filename intentionally uses PascalCase to match React component default export.
// Renaming the file to kebab-case would require updating many imports across the codebase
// and will be done in a dedicated refactor PR.
import React from 'react';
type TileMeshProperties = {
  position: [number, number, number];
  color?: string;
  onPointerMove?: (event: React.PointerEvent) => void;
  size?: number; // hex radius (default: 0.5)
  hexCoord?: { q: number; r: number }; // hex coordinates for alternating rotation
};

// TileMesh: renders a pointy-top hex using a short cylinder with 6 radial segments.
// Size is the hex radius (distance center->corner). Orientation: pointy-top.
export const TileMesh = React.memo(function TileMesh({
  position,
  color = '#88c',
  onPointerMove,
  size = 0.5,
  hexCoord,
}: TileMeshProperties) {
  const hexRadius = size;
  const hexThickness = 0.08; // small height for slight elevation
  
  // All tiles are rotated by 30 degrees for pointy-top orientation
  const rotationY = -Math.PI / 6; // -30 degrees
  
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} onPointerMove={onPointerMove}>
      {/* cylinderGeometry(topRadius, bottomRadius, height, radialSegments) */}
      <cylinderGeometry args={[hexRadius, hexRadius, hexThickness, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

export default TileMesh;
