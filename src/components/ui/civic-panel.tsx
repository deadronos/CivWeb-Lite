import React from 'react';

/**
 * @file This file contains the CivicPanel component, which displays the available civics to research.
 */

/**
 * Represents a single civic item.
 * @property id - The unique ID of the civic.
 * @property name - The name of the civic.
 * @property cost - The cost of the civic.
 */
export type CivicItem = { id: string; name: string; cost: number };

/**
 * Represents the properties for the CivicPanel component.
 * @property civics - An array of available civics.
 * @property currentCivicId - The ID of the civic that is currently being researched.
 * @property onSelect - A callback function to select a civic to research.
 */
export type CivicPanelProps = {
  civics: CivicItem[];
  currentCivicId?: string;
  onSelect: (civicId: string) => void;
};

/**
 * A component that displays the available civics to research.
 * @param props - The component properties.
 * @returns The rendered component.
 */
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
