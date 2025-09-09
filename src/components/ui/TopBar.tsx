import React from 'react';
import ResourceBadge from './ResourceBadge';

export type TopBarProps = {
  turn: number;
  resources: Record<string, number | { value: number; delta?: number }>;
};

export default function TopBar({ turn, resources }: TopBarProps) {
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
    </div>
  );
}

