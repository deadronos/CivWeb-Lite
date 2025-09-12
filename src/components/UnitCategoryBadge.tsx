import React from 'react';
import { UnitCategory } from '../types/unit';
import { unitCategoryIconMap } from '../utils/unit-icons';

interface UnitCategoryBadgeProps {
  category: UnitCategory;
}

const getCategoryColor = (category: UnitCategory): string => {
  switch (category) {
    case UnitCategory.Melee: return 'red';
    case UnitCategory.Ranged: return 'green';
    case UnitCategory.Recon: return 'blue';
    case UnitCategory.Naval: return 'navy';
    case UnitCategory.Civilian: return 'gray';
    default: return 'gray';
  }
};

export default function UnitCategoryBadge({ category }: UnitCategoryBadgeProps) {
  const IconComponent = unitCategoryIconMap(category);
  if (!IconComponent) return null;

  const color = getCategoryColor(category);
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
      data-testid="category-badge"
      className="unit-category-badge pill"
      style={pillStyle}
      aria-label={`${category} unit category`}
    >
      {/* IconComponent typing may not accept size/style props in this project setup; cast to any to render with props */}
      {(IconComponent as any)({ size: 12, 'data-testid': 'category-icon' })}
    </div>
  );
}