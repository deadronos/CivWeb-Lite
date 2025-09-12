import React from 'react';
import { UnitCategory } from '../types/unit';
import { GiSword, GiArcher, GiBinoculars, GiSailboat, GiPerson } from 'react-icons/gi';

// Mock category icon map (expand in phase 2)
const categoryIconMap: Record<UnitCategory, React.ComponentType> = {
  [UnitCategory.Melee]: GiSword,
  [UnitCategory.Ranged]: GiArcher, // Assume
  [UnitCategory.Recon]: GiBinoculars, // Assume
  [UnitCategory.Naval]: GiSailboat, // Assume
  [UnitCategory.Civilian]: GiPerson, // Assume
};

interface UnitCategoryBadgeProps {
  category: UnitCategory;
}

export function UnitCategoryBadge({ category }: UnitCategoryBadgeProps) {
  const IconComponent = categoryIconMap[category];

  return (
    <span
      aria-label={`Category ${category}`}
      title={category}
      style={{ display: 'inline-block', marginRight: '4px', color: getCategoryColor(category) }}
    >
      <IconComponent size={14} />
    </span>
  );
}

// Mock color function
function getCategoryColor(category: UnitCategory): string {
  switch (category) {
    case UnitCategory.Melee: return 'red';
    case UnitCategory.Ranged: return 'green';
    case UnitCategory.Recon: return 'blue';
    case UnitCategory.Naval: return 'navy';
    case UnitCategory.Civilian: return 'gray';
    default: return 'gray';
  }
}