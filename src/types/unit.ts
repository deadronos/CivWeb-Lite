export enum UnitCategory {
  Melee = 'Melee',
  Ranged = 'Ranged',
  Recon = 'Recon',
  Naval = 'Naval',
  Civilian = 'Civilian',
}

export enum UnitState {
  Idle = 'Idle',
  Selected = 'Selected',
  Moved = 'Moved',
  Fortified = 'Fortified',
  Embarked = 'Embarked',
}

export type UnitActiveStates = Set<UnitState>; // Supports multiples, e.g., Moved + Fortified