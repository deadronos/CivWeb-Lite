import { UnitCategory, UnitState } from '../types/unit';
import { GiAncientSword, GiArcher, GiScoutShip, GiSailboat, GiPerson, GiHourglass, GiFootsteps, GiShield, GiAnchor } from 'react-icons/gi';
import React from 'react';

/**
 * Maps UnitCategory to react-icons/gi component for category badges.
 * @param category - UnitCategory from src/types/unit.ts
 * @returns React.ComponentType | undefined - Icon for badge; undefined for invalid (safe for rendering)
 */
export const unitCategoryIconMap = (category: UnitCategory): React.ComponentType | undefined => {
  switch (category) {
    case UnitCategory.Melee: {
      return GiAncientSword;
    }
    case UnitCategory.Ranged: {
      return GiArcher;
    }
    case UnitCategory.Recon: {
      return GiScoutShip;
    }
    case UnitCategory.Naval: {
      return GiSailboat;
    }
    case UnitCategory.Civilian: {
      return GiPerson;
    }
    default: {
      return undefined;
    }
  }
};

/**
 * Maps UnitState to react-icons/gi component for state badges
 */
export const unitStateIconMap = (state: UnitState): React.ComponentType | undefined => {
  switch (state) {
    case UnitState.Idle: {
      return GiHourglass;
    }
    case UnitState.Moved: {
      return GiFootsteps;
    }
    case UnitState.Fortified: {
      return GiShield;
    }
    case UnitState.Embarked: {
      return GiAnchor;
    }
    case UnitState.Selected: {
      return undefined;
    }
    default: {
      return undefined;
    }
  }
};

export default unitCategoryIconMap;