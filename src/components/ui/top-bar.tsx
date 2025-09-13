import React from 'react';
import Icon from './icon';
import { MdScience, MdTheaterComedy } from 'react-icons/md';

export type TopBarProps = {
  turn: number;
  resources: Record<string, number | { value: number; delta?: number }>;
  onOpenLoad?: () => void;
  onOpenLoadPaste?: () => void;
  onOpenResearch?: () => void;
};

export default function TopBar({ turn, resources, onOpenLoad, onOpenLoadPaste, onOpenResearch }: TopBarProps) {
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
        <button aria-label="topbar research" onClick={onOpenResearch}>
          Research…
        </button>
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
