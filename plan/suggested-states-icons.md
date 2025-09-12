# Suggested States & Icons

This plan proposes status badges and selection affordances for units, using `react-icons/gi` for visually consistent, gamey SVGs.

## Plan
- Define state-to-icon map
- Create `UnitStateBadge` component
- Add selected hextile outline style
- Wire badges into unit render
- Add colors, sizing, and a11y labels
- Optional: theme + hover tooltips

## Icon Suggestions (react-icons/gi)
- Idle: `GiHourglass` or `GiSandsOfTime` (alt: `GiCampfire`)
- Selected: prefer hex outline highlight; optional badge `GiCrosshair` or `GiTargeting`
- Moved: `GiFootsteps` or `GiBoots` (alt: `GiSprint`)
- Fortified: `GiShield` or `GiTowerShield` (alt: `GiFortress`, `GiCastle`)
- Embarked: `GiSailboat` or `GiWoodenBoat` (alt: `GiAnchor`)

Useful general symbols to keep handy:
- Turn/status: `GiHourglassEnd`, `GiSandsOfTime`
- Defense: `GiShield`, `GiArmorVest`
- Movement: `GiFootsteps`, `GiWingfoot`
- Naval: `GiSailboat`, `GiAnchor`, `GiShipWheel`
- Attention: `GiTargeted`, `GiEyeTarget`, `GiRadialBalance`
- Archer class example: `GiArcher` (alt: `GiArrowhead`)

## Colors & Style
- Idle: neutral gray `#9ca3af`
- Selected (outline): accent stroke + glow (e.g., 2px + drop-shadow)
- Moved: blue `#3b82f6`
- Fortified: green `#10b981`
- Embarked: teal `#14b8a6`
- Badge size: `16–18px` icon inside a subtle pill bg `rgba(0,0,0,0.55)` with ~2px padding

## Install
```sh
npm i react-icons
```

## State-to-Icon Map (TypeScript)
```tsx
// src/ui/unitStateIcons.tsx
import {
  GiHourglass,
  GiSandsOfTime,
  GiFootsteps,
  GiBoots,
  GiShield,
  GiTowerShield,
  GiSailboat,
  GiWoodenBoat,
  GiCrosshair,
} from 'react-icons/gi';

export enum UnitState {
  Idle = 'idle',
  Selected = 'selected',
  Moved = 'moved',
  Fortified = 'fortified',
  Embarked = 'embarked',
}

export const unitStateIconMap: Record<UnitState, { Icon: React.ComponentType; color: string; label: string }> = {
  [UnitState.Idle]:       { Icon: GiHourglass,   color: '#9ca3af', label: 'Idle' },
  [UnitState.Selected]:   { Icon: GiCrosshair,   color: '#f59e0b', label: 'Selected' }, // optional badge
  [UnitState.Moved]:      { Icon: GiFootsteps,   color: '#3b82f6', label: 'Moved' },
  [UnitState.Fortified]:  { Icon: GiShield,      color: '#10b981', label: 'Fortified' },
  [UnitState.Embarked]:   { Icon: GiSailboat,    color: '#14b8a6', label: 'Embarked' },
};
```

## Badge Component
```tsx
// src/ui/UnitStateBadge.tsx
import React from 'react';
import { unitStateIconMap, UnitState } from './unitStateIcons';

export const UnitStateBadge: React.FC<{ state: UnitState; size?: number; className?: string }> = ({
  state,
  size = 18,
  className,
}) => {
  const entry = unitStateIconMap[state];
  if (!entry) return null;
  const { Icon, color, label } = entry;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 6,
        height: size + 6,
        borderRadius: 6,
        background: 'rgba(0,0,0,0.55)',
      }}
    >
      <Icon size={size} color={color} />
    </span>
  );
};
```

## Selected Outline (Hextile)
- Prefer an outline highlight over a badge when `selected` is true.
- Three.js: add an outline pass or duplicate mesh slightly scaled with emissive color.
- SVG/Canvas/DOM: apply `outline: 2px solid var(--accent)` and `filter: drop-shadow(0 0 4px var(--accent))`.

## Integration Notes
- Position badges at the top-right of the unit sprite/mesh anchor in the HUD overlay.
- Keep `GameProvider` loop side-effect free; compute derived display state from canonical `GameState`.
- Use `aria-label`/`title` for quick a11y + developer clarity.

