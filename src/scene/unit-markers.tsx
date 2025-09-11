 
import React from 'react';
import HtmlLabel from "./drei/html-label";
import { useUnitPositions } from './hooks/use-unit-positions';

export const UnitMarkers: React.FC = () => {
  const positions = useUnitPositions({ y: 1 });
  return (
    <group>
      {positions.map((u) =>
      <HtmlLabel key={u.id} position={u.position} data-testid={`unit-marker-${u.id}`}>
          {u.type}
        </HtmlLabel>
      )}
    </group>);

};

export default UnitMarkers;