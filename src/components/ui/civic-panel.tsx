import React from 'react';

export type CivicItem = { id: string; name: string; cost: number };

export type CivicPanelProps = {
  civics: CivicItem[];
  currentCivicId?: string;
  onSelect: (civicId: string) => void;
};

export default function CivicPanel({ civics, currentCivicId, onSelect }: CivicPanelProps) {
  return (
    <aside className="hud-leftpanel" aria-label="civic panel">
      <h2 className="panel-title">Civics</h2>
      <ul className="tech-list">
        {civics.map((c) => (
          <li key={c.id}>
            <button
              className={`tech-item ${currentCivicId === c.id ? 'active' : ''}`}
              onClick={() => onSelect(c.id)}
              aria-pressed={currentCivicId === c.id}
              aria-label={`select civic ${c.name}`}
            >
              <span className="tech-name">{c.name}</span>
              <span className="tech-cost">{c.cost}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
