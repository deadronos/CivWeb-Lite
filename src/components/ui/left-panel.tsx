import React from 'react';

export type TechItem = { id: string; name: string; cost: number; unlocked?: boolean };

export type LeftPanelProps = {
  techs: TechItem[];
  currentTechId?: string | null;
  onSelect: (techId: string) => void;
};

export default function LeftPanel({ techs, currentTechId, onSelect }: LeftPanelProps) {
  return (
    <aside className="hud-leftpanel" aria-label="research panel">
      <h2 className="panel-title">Research</h2>
      <ul className="tech-list">
        {techs.map((t) => (
          <li key={t.id}>
            <button
              className={`tech-item ${currentTechId === t.id ? 'active' : ''}`}
              onClick={() => onSelect(t.id)}
              aria-pressed={currentTechId === t.id}
              aria-label={`select tech ${t.name}`}
            >
              <span className="tech-name">{t.name}</span>
              <span className="tech-cost">{t.cost}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
