import React from 'react';
import { UnitState } from '../types/unit';
import { unitStateIconMap } from '../utils/unit-icons';

interface UnitStateBadgeProperties {
  state: UnitState;
}

const getStateColor = (state: UnitState): string => {
  switch (state) {
    case UnitState.Idle: {
      return 'yellow';
    }
    case UnitState.Moved: {
      return 'blue';
    }
    case UnitState.Fortified: {
      return 'green';
    }
    case UnitState.Embarked: {
      return 'purple';
    }
    case UnitState.Selected: {
      return 'gray'; // Not used (null return)
    }
    default: {
      return 'gray';
    }
  }
};

export default function UnitStateBadge({ state }: UnitStateBadgeProperties) {
  if (state === UnitState.Selected) return null; // Tile outline per REQ-002
  const IconComponent = unitStateIconMap(state);
  if (!IconComponent) return null;

  const color = getStateColor(state);
  const pillStyle = {
    width: '18px',
    height: '18px',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '4px',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      data-testid="state-badge"
      className="unit-state-badge pill"
      style={pillStyle}
      aria-label={`${state} unit state`}
      title={`${state} state`}
    >
      {React.createElement(IconComponent as any, { style: { fontSize: '12px' }, 'data-testid': 'state-icon' })}
    </div>
  );
}