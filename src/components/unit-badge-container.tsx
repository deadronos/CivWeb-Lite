import React from 'react';
import { UnitCategory, UnitState, UnitActiveStates } from '../types/unit';
import UnitCategoryBadge from './unit-category-badge';
import UnitStateBadge from './unit-state-badge';
import { unitStateIconMap } from '../utils/unit-icons'; // Added import for filter

interface UnitBadgeContainerProperties {
  category: UnitCategory;
  activeStates: UnitActiveStates;
}

function UnitBadgeContainer({ category, activeStates }: UnitBadgeContainerProperties) {
  const validStates = [...activeStates ? activeStates[Symbol.iterator]() : []].filter((s): s is UnitState => s !== UnitState.Selected && unitStateIconMap(s) !== undefined); // Spread + import

  const stateBadges = validStates.map((state) => <UnitStateBadge key={state} state={state} />);

  const stateSummary = validStates.length > 0 ? ` with ${validStates.join(', ')}` : '';
  const ariaLabel = `Unit badges: ${category}${stateSummary}`;

  const containerStyle: React.CSSProperties = { // Typed style
    display: 'flex',
    flexDirection: 'row',
    gap: '2px', // 2-4px spacing
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    position: 'absolute',
    top: '0',
    right: '0', // Attached top-right for unit
  };

  return (
    <div
      data-testid="badge-container"
      className="unit-badge-container"
      style={containerStyle}
      aria-label={ariaLabel}
    >
      <UnitCategoryBadge category={category} />
      {stateBadges}
    </div>
  );
}

export default React.memo(UnitBadgeContainer);