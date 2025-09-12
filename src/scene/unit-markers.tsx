import React from 'react';
import HtmlLabel from './drei/html-label';
import { useUnitPositions } from './hooks/use-unit-positions';
import { useGame } from '../hooks/use-game';
import UnitBadgeContainer from '../components/unit-badge-container';

export const UnitMarkers: React.FC = () => {
  const { state } = useGame();
  const positions = useUnitPositions({ y: 1 });
  return (
    <group>
      {positions.map((u) => {
        const unit = state.contentExt?.units[u.id];
        if (!unit) return null;
        return (
          <HtmlLabel key={u.id} position={u.position} data-testid={`unit-marker-${u.id}`}>
            <div style={{ position: 'relative' }}>
              <UnitBadgeContainer
                category={unit.category}
                activeStates={unit.activeStates}
              />
            </div>
          </HtmlLabel>
        );
      })}
    </group>
  );
};

export default UnitMarkers;
