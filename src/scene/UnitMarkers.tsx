import React from 'react';
import HtmlLabel from './drei/HtmlLabel';
import { useUnitPositions } from './hooks/useUnitPositions';

export default function UnitMarkers() {
  const positions = useUnitPositions({ y: 1 });
  return (
    <group>
      {positions.map((u) => (
        <HtmlLabel key={u.id} position={u.position} data-testid={`unit-marker-${u.id}`}>
          {u.type}
        </HtmlLabel>
      ))}
    </group>
  );
}
