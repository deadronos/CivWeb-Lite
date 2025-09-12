import React from 'react';
import Icon from './icon';
import { MdScience, MdTheaterComedy } from 'react-icons/md';

/**
 * @file This file contains the TopBar component, which displays the top bar of the HUD.
 */

/**
 * Represents the properties for the TopBar component.
 * @property turn - The current turn number.
 * @property resources - A record of resources to display.
 * @property onOpenLoad - A callback function to open the load modal.
 * @property onOpenLoadPaste - A callback function to open the load modal with the text area focused.
 */
export type TopBarProps = {
  turn: number;
  resources: Record<string, number | { value: number; delta?: number }>;
  onOpenLoad?: () => void;
  onOpenLoadPaste?: () => void;
};

/**
 * A component that displays the top bar of the HUD.
 * @param props - The component properties.
 * @returns The rendered component.
 */
export default function TopBar({ turn, resources, onOpenLoad, onOpenLoadPaste }: TopBarProps) {
  const getValue = (v: number | { value: number; delta?: number } | undefined) => {
    if (v === undefined) return 0;
    return typeof v === 'number' ? v : v.value;
  };

  return (
    <div className="hud-topbar" role="banner" aria-label="top bar">
      <div aria-label="turn">Turn: {turn}</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* science */}
        <div className="resource science" aria-label="resource science">
          <Icon icon={MdScience} size={18} title="Science" />
          <span style={{ marginLeft: 6 }}>{getValue(resources?.science)}</span>
        </div>
        {/* culture */}
        <div className="resource culture" aria-label="resource culture">
          <Icon icon={MdTheaterComedy} size={18} title="Culture" />
          <span style={{ marginLeft: 6 }}>{getValue(resources?.culture)}</span>
        </div>
      </div>
      <div>
        <button aria-label="topbar load" onClick={onOpenLoad}>
          Load…
        </button>
        <button aria-label="topbar load paste" onClick={onOpenLoadPaste}>
          Paste JSON…
        </button>
      </div>
    </div>
  );
}
