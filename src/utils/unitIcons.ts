import { UnitCategory, UnitState } from '../types/unit';
import { GiSword, GiArcher, GiCompass, GiSailboat, GiPerson, GiHourglass, GiFootsteps, GiShield, GiAnchor } from 'react-icons/gi';
import React from 'react';

export const unitCategoryIconMap = (category: UnitCategory): React.ComponentType | null => {
  switch (category) {
    case UnitCategory.Melee: return GiSword;
    case UnitCategory.Ranged: return GiArcher;
    case UnitCategory.Recon: return GiCompass; // Scout-like; closest real export
    case UnitCategory.Naval: return GiSailboat;
    case UnitCategory.Civilian: return GiPerson; // Worker stand-in
    default: return null;
  }
};

export const unitStateIconMap = (state: UnitState): React.ComponentType | null => {
  switch (state) {
    case UnitState.Idle: return GiHourglass;
    case UnitState.Moved: return GiFootsteps;
    case UnitState.Fortified: return GiShield;
    case UnitState.Embarked: return GiAnchor;
    case UnitState.Selected: return null; // Handled as tile outline (REQ-002)
    default: return null; // Safe for invalid/multi-state sets
  }
};