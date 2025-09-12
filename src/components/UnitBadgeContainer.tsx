import React from 'react';
import { UnitBadgeContainerProps } from './types'; // Assume prop types
import { UnitCategoryBadge } from './UnitCategoryBadge';
import { UnitStateBadge } from './UnitStateBadge';

interface UnitBadgeContainerProps {
  unit: {
    category: UnitCategory;
    activeStates: Set<UnitState>;
  };
}

export function UnitBadgeContainer({ unit }: UnitBadgeContainerProps) {
  const stateBadges = Array.from(unit.activeStates).map(state => (
    <UnitStateBadge key={state} state={state} />
  )).filter(Boolean); // Filter null (no badge for selected)

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(0,0,0,0.5)', 
        borderRadius: '4px', 
        padding: '2px' 
      }} 
      aria-label={`Unit badges: category ${unit.category}, states ${Array.from(unit.activeStates).join(', ')}`}
      title="Unit status badges"
    >
      <UnitCategoryBadge category={unit.category} />
      {stateBadges}
    </div>
  );
}
