 
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

// TileMesh: renders a flat-top hex using a short cylinder with 6 radial segments.
// Size is the hex radius (distance center->corner). Orientation: flat-top.
export const TileMesh = React.memo(function TileMesh({
  position,
  color = '#88c',
  onPointerMove,
  size = 0.5,
  hexCoord,
}: TileMeshProperties) {
  const hexRadius = size;
  const hexThickness = 0.08; // small height for slight elevation
  
  // Calculate alternating rotation based on hex coordinates
  let rotationY = 0;
  if (hexCoord) {
    const { q, r } = hexCoord;
    // Alternate tiles based on the sum of hex coordinates
    if ((q + r) % 2 === 1) {
      rotationY = Math.PI / 6; // 30 degrees
    }
  }
  
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} onPointerMove={onPointerMove}>
      {/* cylinderGeometry(topRadius, bottomRadius, height, radialSegments) */}
      <cylinderGeometry args={[hexRadius, hexRadius, hexThickness, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

export default TileMesh;
