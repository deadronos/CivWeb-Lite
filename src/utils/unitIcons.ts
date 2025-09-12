import { UnitCategory, UnitState } from '../types/unit';
import React from 'react';
import * as GiIcons from 'react-icons/gi';

// Return the icon component for a unit category, or undefined when not found.
export const unitCategoryIconMap = (category: UnitCategory): React.ComponentType<any> | undefined => {
  const icons = GiIcons as Record<string, React.ComponentType<any>>;
  switch (category) {
    case UnitCategory.Melee: {
      return icons.GiSword || icons.GiWorld;
    }
    case UnitCategory.Ranged: {
      return icons.GiArcher || icons.GiBowArrow || icons.GiWorld;
    }
    case UnitCategory.Recon: {
      return icons.GiCompass || icons.GiWorld; // Scout-like; closest real export
    }
    case UnitCategory.Naval: {
      return icons.GiSailboat || icons.GiWorld;
    }
    case UnitCategory.Civilian: {
      return icons.GiPerson || icons.GiWorld; // Worker stand-in
    }
    default: {
      return undefined;
    }
  }
};

export const unitStateIconMap = (state: UnitState): React.ComponentType<any> | undefined => {
  const icons = GiIcons as Record<string, React.ComponentType<any>>;
  switch (state) {
    case UnitState.Idle: {
      return icons.GiHourglass || icons.GiWorld;
    }
    case UnitState.Moved: {
      return icons.GiFootprint || icons.GiFootsteps || icons.GiWorld;
    }
    case UnitState.Fortified: {
      return icons.GiShield || icons.GiWorld;
    }
    case UnitState.Embarked: {
      return icons.GiAnchor || icons.GiWorld;
    }
    case UnitState.Selected: {
      return undefined; // Handled as tile outline (REQ-002)
    }
    default: {
      return undefined; // Safe for invalid/multi-state sets
    }
  }
};