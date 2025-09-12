import { UnitCategory, UnitState } from '../types/unit';
import { GiAncientSword, GiArcher, GiScoutShip, GiSailboat, GiPerson, GiHourglass, GiFootsteps, GiShield, GiAnchor } from 'react-icons/gi';
import React from 'react';

/**
 * Maps UnitCategory to react-icons/gi component for category badges.
 * @param category - UnitCategory from src/types/unit.ts
 * @returns React.ComponentType | undefined - Icon for badge; undefined for invalid (safe for rendering)
 * @example unitCategoryIconMap(UnitCategory.Melee) // Returns GiAncientSword
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
 * Maps UnitState to react-icons/gi component for state badges (Selected undefined for tile outline).
 * @param state - UnitState from src/types/unit.ts
 * @returns React.ComponentType | undefined - Icon for badge; undefined for Selected/invalid (safe for multi-state sets)
 * @example unitStateIconMap(UnitState.Moved) // Returns GiFootsteps; supports sets like new Set(['Moved', 'Fortified'])
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
      return undefined; // Tile outline per REQ-002
    }
    default: {
      return undefined;
    }
  }
};