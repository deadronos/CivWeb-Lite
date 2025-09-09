import React from 'react';
import Icon from './Icon';
import { MdScience, MdTheaterComedy } from 'react-icons/md';

export type TopBarProps = {
  turn: number;
  resources: Record<string, number | { value: number; delta?: number }>;
  onOpenLoad?: () => void;
  onOpenLoadPaste?: () => void;
};

export default function TopBar({ turn, resources, onOpenLoad, onOpenLoadPaste }: TopBarProps) {
  const getVal = (v: number | { value: number; delta?: number } | undefined) => {
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
            <span style={{ marginLeft: 6 }}>{getVal(resources?.science)}</span>
          </div>
        {/* culture */}
          <div className="resource culture" aria-label="resource culture">
            <Icon icon={MdTheaterComedy} size={18} title="Culture" />
            <span style={{ marginLeft: 6 }}>{getVal(resources?.culture)}</span>
          </div>
      </div>
      <div>
        <button aria-label="topbar load" onClick={onOpenLoad}>Load…</button>
        <button aria-label="topbar load paste" onClick={onOpenLoadPaste}>Paste JSON…</button>
      </div>
    </div>
  );
}
