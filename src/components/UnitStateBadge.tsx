import React from 'react';
import { UnitState } from '../types/unit';
import { GiHourglass } from 'react-icons/gi'; // Example for Idle; add others per suggested-states-icons.md

// Mock icon map (expand in phase 2)
const stateIconMap: Record<UnitState, React.ComponentType> = {
  [UnitState.Idle]: GiHourglass,
  [UnitState.Moved]: GiFootsteps, // Assume import
  [UnitState.Fortified]: GiShield, // Assume
  [UnitState.Embarked]: GiSailboat, // Assume
  [UnitState.Selected]: null, // No badge for selected
};

interface UnitStateBadgeProps {
  state: UnitState;
}

export function UnitStateBadge({ state }: UnitStateBadgeProps) {
  const IconComponent = stateIconMap[state];
  if (!IconComponent) return null; // No badge for selected

  return (
    <span 
      aria-label={`Unit ${state}`} 
      title={state} 
      style={{ display: 'inline-block', margin: '0 2px', color: getStateColor(state) }}
    >
      <IconComponent size={12} />
    </span>
  );
}

// Mock color function (from plan)
function getStateColor(state: UnitState): string {
  switch (state) {
    case UnitState.Moved: return 'blue';
    case UnitState.Fortified: return 'green';
    default: return 'gray';
  }
}
