import React from 'react';
import ResourceBadge from './ResourceBadge';

export type TopBarProps = {
  turn: number;
  resources: Record<string, number | { value: number; delta?: number }>;
  onOpenLoad?: () => void;
  onOpenLoadPaste?: () => void;
};

export default function TopBar({ turn, resources, onOpenLoad, onOpenLoadPaste }: TopBarProps) {
  return (
    <div className="hud-topbar" role="banner" aria-label="top bar">
      <div className="hud-turn" aria-label="turn">Turn: {turn}</div>
      <div className="hud-resources" role="list" aria-label="resources">
        {Object.entries(resources).map(([key, val]) => {
          const v = typeof val === 'number' ? { value: val } : val;
          return (
            <div role="listitem" key={key} className="hud-res-item">
              <ResourceBadge name={key} value={v.value} delta={v.delta} />
            </div>
          );
        })}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button aria-label="topbar load" onClick={onOpenLoad}>Load…</button>
        <button aria-label="topbar load paste" onClick={onOpenLoadPaste}>Paste JSON…</button>
      </div>
    </div>
  );
}
