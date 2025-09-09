export * from './tile-mesh';
export { default } from './tile-mesh';
/* eslint-disable unicorn/filename-case -- filename chosen to mirror component name; see note above */
// TileMesh filename intentionally uses PascalCase to match React component default export.
// Renaming the file to kebab-case would require updating many imports across the codebase
// and will be done in a dedicated refactor PR.
import React from 'react';
type TileMeshProperties = {
  position: [number, number, number];
  color?: string;
  onPointerMove?: (event: React.PointerEvent) => void;
  size?: number; // hex radius (default: 0.5)
};

// TileMesh: renders a flat-top hex using a short cylinder with 6 radial segments.
// Size is the hex radius (distance center->corner). Orientation: flat-top.
export const TileMesh = React.memo(function TileMesh({
  position,
  color = '#88c',
  onPointerMove,
  size = 0.5,
}: TileMeshProperties) {
  const hexRadius = size;
  const hexThickness = 0.08; // small height for slight elevation
  return (
    <mesh position={position} onPointerMove={onPointerMove}>
      {/* cylinderGeometry(topRadius, bottomRadius, height, radialSegments) */}
      <cylinderGeometry args={[hexRadius, hexRadius, hexThickness, 6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

export default TileMesh;
