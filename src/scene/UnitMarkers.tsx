export * from './unit-markers';
export { default } from './unit-markers';
/* eslint-disable unicorn/filename-case -- defer filename renames to a dedicated codemod PR that updates imports */
import React from 'react';
import HtmlLabel from './drei/HtmlLabel';
import { useUnitPositions } from './hooks/useUnitPositions';

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
