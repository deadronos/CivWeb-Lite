import React from 'react';
import HtmlLabel from './drei/html-label';
import { useUnitPositions } from './hooks/use-unit-positions';
import { useGame } from '../hooks/use-game';
import UnitBadgeContainer from '../components/unit-badge-container';
import { useSelection } from '../contexts/selection-context';

export const UnitMarkers: React.FC = () => {
  const { state } = useGame();
  const { setSelectedUnitId } = useSelection();
  const positions = useUnitPositions({ y: 1 });
  return (
    <group>
      {positions.map((u) => {
        const unit = state.contentExt?.units[u.id];
  if (!unit) return;
        return (
              <HtmlLabel
                key={u.id}
                center
                // Avoid occlusion hiding DOM during E2E; markers are small and should always be clickable
                occlude={false}
                transform
                position={[u.position[0], u.position[1] + 0.1, u.position[2]]}
                className="unit-marker-wrapper"
                data-testid={`unit-marker-${u.id}`}
                aria-label={`Unit ${u.id}`}
                role="group"
              >
            <div
              className="unit-marker-wrap"
              data-testid="unit"
              role="button"
              aria-label={`Select unit ${u.id}`}
              onClick={() => setSelectedUnitId(u.id)}
              tabIndex={0}
            >
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
