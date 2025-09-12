import React from 'react';
import HtmlLabel from './drei/html-label';
import { useUnitPositions } from './hooks/use-unit-positions';

/**
 * @file This file contains the UnitMarkers component, which displays markers for each unit on the map.
 */

/**
 * A component that displays markers for each unit on the map.
 * @returns The rendered component.
 */
export const UnitMarkers: React.FC = () => {
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
};

export default UnitMarkers;
